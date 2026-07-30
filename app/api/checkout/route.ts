import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Requiere la variable de entorno MP_ACCESS_TOKEN (Access Token de
// Mercado Pago, modo Checkout Pro), configurada en Vercel. Sin esa
// variable, este endpoint devuelve 501 y el botón de compra muestra el
// mensaje de contacto en vez de romperse.
export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "mercado_pago_not_configured" },
      { status: 501 }
    );
  }

  const { kind, slug, buyerEmail } = await req.json();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";

  let title = "";
  let unitPrice = 0;
  let successUrl = `${siteUrl}/dashboard?compra=exitosa`;
  let failureUrl = `${siteUrl}?compra=fallida`;
  let purchaseId: string | null = null;

  if (kind === "resource") {
    const resource = getPaidResourceBySlug(slug);
    if (!resource) {
      return NextResponse.json({ error: "resource_not_found" }, { status: 404 });
    }
    title = resource.title;
    unitPrice = resource.priceARS;
    successUrl = `${siteUrl}/dashboard?compra=exitosa`;
    failureUrl = `${siteUrl}/recursos?compra=fallida`;

    // Registramos la compra como "pending" antes de mandar a Mercado Pago.
    // El webhook (/api/mp-webhook) la busca por este id (external_reference)
    // cuando MP confirma el pago, y ahí decide si entregar el PDF.
    if (supabaseAdmin) {
      const { data: purchase, error } = await supabaseAdmin
        .from("compras")
        .insert({
          kind: "resource",
          resource_slug: resource.slug,
          title: resource.title,
          amount: unitPrice,
          currency: "ARS",
          status: "pending",
          buyer_email: buyerEmail || null,
        })
        .select("id")
        .single();
      if (!error && purchase) {
        purchaseId = purchase.id;
      }
    }
  } else {
    const course = getCourseBySlug(slug);
    if (!course) {
      return NextResponse.json({ error: "course_not_found" }, { status: 404 });
    }
    title = course.title;
    unitPrice = course.priceARS ?? 0;
    failureUrl = `${siteUrl}/cursos/${course.slug}?compra=fallida`;

    // Igual que los recursos: se registra "pending" y el webhook la marca
    // aprobada. Los pagos manuales (transferencia/Payoneer) no pasan por
    // acá, así que esos se siguen habilitando a mano en la base.
    if (supabaseAdmin) {
      const { data: purchase, error } = await supabaseAdmin
        .from("compras")
        .insert({
          kind: "course",
          resource_slug: course.slug,
          title: course.title,
          amount: unitPrice,
          currency: "ARS",
          status: "pending",
          buyer_email: buyerEmail || null,
        })
        .select("id")
        .single();
      if (!error && purchase) {
        purchaseId = purchase.id;
      }
    }
  }

  const preference: Record<string, unknown> = {
    items: [
      {
        title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: unitPrice,
      },
    ],
    back_urls: {
      success: successUrl,
      failure: failureUrl,
      pending: failureUrl,
    },
    auto_return: "approved",
    notification_url: `${siteUrl}/api/mp-webhook`,
  };
  if (purchaseId) {
    preference.external_reference = purchaseId;
  }
  if (buyerEmail) {
    preference.payer = { email: buyerEmail };
  }

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preference),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "mp_error" }, { status: 502 });
  }

  const data = await res.json();

  if (purchaseId && supabaseAdmin) {
    await supabaseAdmin
      .from("compras")
      .update({ mp_preference_id: data.id })
      .eq("id", purchaseId);
  }

  return NextResponse.json({ init_point: data.init_point });
}
