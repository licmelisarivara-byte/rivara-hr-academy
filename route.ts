import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";

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

  const { kind, slug } = await req.json();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";

  let title = "";
  let unitPrice = 0;
  let successUrl = `${siteUrl}/dashboard?compra=exitosa`;
  let failureUrl = `${siteUrl}?compra=fallida`;

  if (kind === "resource") {
    const resource = getPaidResourceBySlug(slug);
    if (!resource) {
      return NextResponse.json({ error: "resource_not_found" }, { status: 404 });
    }
    title = resource.title;
    unitPrice = resource.priceARS;
    successUrl = `${siteUrl}/recursos?compra=exitosa`;
    failureUrl = `${siteUrl}/recursos?compra=fallida`;
  } else {
    const course = getCourseBySlug(slug);
    if (!course) {
      return NextResponse.json({ error: "course_not_found" }, { status: 404 });
    }
    title = course.title;
    unitPrice = 0; // TODO: precio real en ARS del curso, todavía no confirmado
    failureUrl = `${siteUrl}/cursos/${course.slug}?compra=fallida`;
  }

  const preference = {
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
  };

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
  return NextResponse.json({ init_point: data.init_point });
}
