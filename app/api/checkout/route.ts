import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { applyDiscount } from "@/lib/discount";
import { getCoupon } from "@/lib/coupons";

// Descuento del recurso cuando se compra junto con un curso por Mercado
// Pago (5%, más chico que el 15% de transferencia porque ahí el curso no
// tiene ningún descuento). Tiene que coincidir con MP_BUNDLE_DISCOUNT_PERCENT
// de components/CoursePaymentActions.tsx y con /api/manual-purchase-bundle.
const MP_BUNDLE_DISCOUNT_PERCENT = 5;

// Requiere la variable de entorno MP_ACCESS_TOKEN (Access Token de
// Mercado Pago, modo Checkout Pro), configurada en Vercel. Sin esa
// variable, este endpoint devuelve 501 y el botón de compra muestra el
// mensaje de contacto en vez de romperse.
//
// Cursos: cobra el precio de lista, o el de lista con el cupón aplicado
// (validado acá, nunca se confía en el monto del navegador). Con cupón se
// cobra en un solo pago: las cuotas sin interés son solo para el precio de
// lista. Los recursos pagos no llevan cupón en Mercado Pago.
export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  // kind "bundle" = combo curso + recurso pago (slug = curso, addonSlug =
  // recurso): un solo cobro por el total, con dos filas en `compras` que
  // comparten bundle_group_id (mismo esquema que /api/manual-purchase-bundle);
  // el webhook / la sincronización aprueban y entregan las dos juntas.
  const { kind, slug, buyerEmail, buyerName, addonSlug, couponCode } = await req.json();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";

  let title = "";
  let unitPrice = 0;
  let successUrl = `${siteUrl}/dashboard?compra=exitosa`;
  let failureUrl = `${siteUrl}?compra=fallida`;
  let purchaseId: string | null = null;
  let bundleIds: string[] = [];
  let appliedCouponCode: string | null = null;

  // Registramos la intención de compra como "pending" en cuanto alguien
  // toca "Comprar/Inscribirme", ANTES de chequear si Mercado Pago está
  // configurado. Así, aunque MP_ACCESS_TOKEN todavía no esté cargado y el
  // botón caiga al link fijo de MP, ya queda un registro de quién quiso
  // comprar qué (antes esos casos se perdían por completo).
  if (kind === "resource") {
    const resource = getPaidResourceBySlug(slug);
    if (!resource) {
      return NextResponse.json({ error: "resource_not_found" }, { status: 404 });
    }
    title = resource.title;
    unitPrice = resource.priceARS;
    successUrl = `${siteUrl}/dashboard?compra=exitosa`;
    failureUrl = `${siteUrl}/ebooks?compra=fallida`;

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
          payment_method: "mercadopago",
          buyer_email: buyerEmail || null,
          buyer_name: buyerName || null,
        })
        .select("id")
        .single();
      if (!error && purchase) {
        purchaseId = purchase.id;
      }
    }
  } else if (kind === "bundle") {
    const course = getCourseBySlug(slug);
    const resource = getPaidResourceBySlug(addonSlug);
    if (!course || !resource) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    // Los montos se calculan SIEMPRE acá (nunca se confía en lo que
    // mande el navegador): el curso a precio de lista (con el cupón, si
    // es válido) y el recurso con el 5% del combo.
    const coupon = getCoupon(couponCode, { courseSlug: course.slug });
    appliedCouponCode = coupon?.code ?? null;
    const courseAmount = applyDiscount(course.priceARS ?? 0, coupon?.percentOff);
    const resourceAmount = applyDiscount(resource.priceARS, MP_BUNDLE_DISCOUNT_PERCENT);
    title = `${course.title} + ${resource.title}`;
    unitPrice = courseAmount + resourceAmount;
    failureUrl = `${siteUrl}/cursos/${course.slug}?compra=fallida`;

    if (supabaseAdmin) {
      const bundleGroupId = crypto.randomUUID();
      const base = {
        currency: "ARS",
        status: "pending",
        payment_method: "mercadopago",
        buyer_email: buyerEmail || null,
        buyer_name: buyerName || null,
        bundle_group_id: bundleGroupId,
        discount_code: appliedCouponCode,
      };
      const { data: rows, error } = await supabaseAdmin
        .from("compras")
        .insert([
          {
            ...base,
            kind: "course",
            resource_slug: course.slug,
            title: `${course.title} (combo)`,
            amount: courseAmount,
          },
          {
            ...base,
            kind: "resource",
            resource_slug: resource.slug,
            title: `${resource.title} (combo)`,
            amount: resourceAmount,
          },
        ])
        .select("id, kind");
      if (!error && rows) {
        bundleIds = rows.map((r) => r.id);
        purchaseId = rows.find((r) => r.kind === "course")?.id ?? null;
      }
    }
  } else {
    const course = getCourseBySlug(slug);
    if (!course) {
      return NextResponse.json({ error: "course_not_found" }, { status: 404 });
    }
    const coupon = getCoupon(couponCode, { courseSlug: course.slug });
    appliedCouponCode = coupon?.code ?? null;
    title = course.title;
    unitPrice = applyDiscount(course.priceARS ?? 0, coupon?.percentOff);
    failureUrl = `${siteUrl}/cursos/${course.slug}?compra=fallida`;

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
          payment_method: "mercadopago",
          buyer_email: buyerEmail || null,
          buyer_name: buyerName || null,
          discount_code: appliedCouponCode,
        })
        .select("id")
        .single();
      if (!error && purchase) {
        purchaseId = purchase.id;
      }
    }
  }

  // El external_reference (purchaseId) es lo que el webhook usa para
  // encontrar esta fila cuando MP confirma el pago, así que el registro
  // arriba tiene que existir aunque después no podamos armar la
  // preferencia real por falta de configuración.
  if (!accessToken) {
    return NextResponse.json(
      { error: "mercado_pago_not_configured" },
      { status: 501 }
    );
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
  // Con cupón, un solo pago: las cuotas sin interés son solo para el
  // precio de lista.
  if (appliedCouponCode) {
    preference.payment_methods = { installments: 1 };
  }
  if (purchaseId) {
    preference.external_reference = purchaseId;
  }
  if (buyerEmail) {
    preference.payer = { email: buyerEmail, ...(buyerName ? { name: buyerName } : {}) };
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
    // Guardamos el motivo real que da Mercado Pago (antes se descartaba
    // por completo, así que un 502 no decía nada más que "falló"). Se
    // devuelve en la respuesta a propósito, para poder diagnosticar sin
    // acceso a los logs de Vercel — no expone el token ni nada sensible,
    // solo el mensaje de validación de MP.
    const detail = await res.text().catch(() => null);
    console.error("MP checkout/preferences error", res.status, detail);
    return NextResponse.json(
      { error: "mp_error", mpStatus: res.status, mpDetail: detail },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (purchaseId && supabaseAdmin) {
    await supabaseAdmin
      .from("compras")
      .update({ mp_preference_id: data.id })
      .in("id", bundleIds.length ? bundleIds : [purchaseId]);
  }

  return NextResponse.json({ init_point: data.init_point });
}
