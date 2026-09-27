import { NextRequest, NextResponse } from "next/server";
import { getAsesoriaPack, ASESORIA_ADDON_TRADUCCION } from "@/lib/asesoriaPacks";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SITE_URL = "https://carrera.rivaraconsultora.com.ar";

// Checkout Pro de Mercado Pago para los packs de Asesoría de Carrera. Cobra
// el 100% al inicio (no hay entrega parcial que justifique dividir el
// cobro) y habilita hasta 3 cuotas — que salgan "sin interés" depende de
// las promociones activas en la cuenta de MP de Melisa, no de este código.
//
// Requiere MP_ACCESS_TOKEN (ya configurado en Vercel para HR Academy, se
// reusa la misma cuenta de Mercado Pago). Sin esa variable, devuelve 501 y
// el botón de compra cae al aviso de WhatsApp.
export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  const { packSlug, addonTraduccion, buyerName, buyerEmail, buyerPhone } = await req.json();

  const pack = getAsesoriaPack(packSlug);
  if (!pack) {
    return NextResponse.json({ error: "pack_not_found" }, { status: 404 });
  }
  if (!buyerEmail) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const amount = pack.priceARS + (addonTraduccion ? ASESORIA_ADDON_TRADUCCION.priceARS : 0);
  const title = addonTraduccion
    ? `${pack.title} + ${ASESORIA_ADDON_TRADUCCION.title}`
    : pack.title;

  // Se registra el pedido como "pending" ANTES de chequear si Mercado Pago
  // está configurado, para no perder la intención de compra si falta esa
  // variable de entorno.
  const { data: pedido, error } = await supabaseAdmin
    .from("asesoria_pedidos")
    .insert({
      pack_slug: pack.slug,
      pack_title: pack.title,
      addon_traduccion: Boolean(addonTraduccion),
      amount,
      currency: "ARS",
      status: "pending",
      payment_method: "mercadopago",
      buyer_name: buyerName || null,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone || null,
    })
    .select("id")
    .single();

  if (error || !pedido) {
    console.error("asesoria_pedidos insert error", error);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: "mercado_pago_not_configured" }, { status: 501 });
  }

  const successUrl = `${SITE_URL}/gracias?pedido=${pedido.id}`;
  const failureUrl = `${SITE_URL}/?compra=fallida`;

  const preference: Record<string, unknown> = {
    items: [
      {
        title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: amount,
      },
    ],
    back_urls: {
      success: successUrl,
      failure: failureUrl,
      pending: failureUrl,
    },
    auto_return: "approved",
    notification_url: `${SITE_URL}/api/asesoria/mp-webhook`,
    external_reference: pedido.id,
    payment_methods: { installments: 3 },
    payer: { email: buyerEmail, ...(buyerName ? { name: buyerName } : {}) },
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
    const detail = await res.text().catch(() => null);
    console.error("MP asesoria checkout/preferences error", res.status, detail);
    return NextResponse.json(
      { error: "mp_error", mpStatus: res.status, mpDetail: detail },
      { status: 502 }
    );
  }

  const data = await res.json();

  await supabaseAdmin
    .from("asesoria_pedidos")
    .update({ mp_preference_id: data.id })
    .eq("id", pedido.id);

  return NextResponse.json({ init_point: data.init_point });
}
