import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Mercado Pago llama a esta URL (configurada como `notification_url` al
// crear la preferencia en /api/checkout) cada vez que cambia el estado de
// un pago. Acá confirmamos el pago contra la API de MP (nunca confiamos en
// el body de la notificación solo), marcamos la compra como aprobada en
// Supabase y mandamos el PDF por mail automáticamente.

function paymentIdFrom(req: NextRequest, body: any): string | null {
  const { searchParams } = new URL(req.url);
  return (
    searchParams.get("data.id") ||
    searchParams.get("id") ||
    body?.data?.id ||
    (body?.type === "payment" ? body?.data?.id : null) ||
    null
  );
}

// Valida la firma que manda MP si configuraste una "clave secreta" para
// este webhook en el panel de Mercado Pago (Tu negocio > Webhooks). Si no
// configuraste MP_WEBHOOK_SECRET todavía, no se valida (igual el paso
// siguiente re-confirma el pago contra la API de MP con el access token,
// así que un request falso no puede marcar nada como pagado).
function signatureIsValid(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const hash = parts.v1;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return expected === hash;
}

export async function POST(req: NextRequest) {
  return handleNotification(req);
}

// Mercado Pago a veces manda la notificación como GET con query params.
export async function GET(req: NextRequest) {
  return handleNotification(req);
}

async function handleNotification(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken || !supabaseAdmin) {
    // Nada configurado del lado del servidor: confirmamos igual con 200
    // para que MP no reintente indefinidamente un webhook que no vamos a
    // poder procesar.
    return NextResponse.json({ ok: true, skipped: "not_configured" });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const paymentId = paymentIdFrom(req, body);
  if (!paymentId) {
    return NextResponse.json({ ok: true, skipped: "no_payment_id" });
  }

  if (!signatureIsValid(req, paymentId)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!mpRes.ok) {
    return NextResponse.json({ ok: true, skipped: "mp_lookup_failed" });
  }
  const payment = await mpRes.json();

  const purchaseId: string | undefined = payment.external_reference;
  if (!purchaseId) {
    return NextResponse.json({ ok: true, skipped: "no_external_reference" });
  }

  const { data: purchase } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("id", purchaseId)
    .single();
  if (!purchase) {
    return NextResponse.json({ ok: true, skipped: "purchase_not_found" });
  }

  const status: string = payment.status; // approved | rejected | pending | in_process | cancelled
  // El mail ya suele estar guardado desde que la persona arrancó la compra
  // (login previo); si MP nos manda uno, lo preferimos por ser el que
  // efectivamente pagó, pero nunca lo dejamos en blanco.
  const buyerEmail: string | null = payment.payer?.email ?? purchase.buyer_email ?? null;
  const buyerName: string | null =
    [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ") || null;

  await supabaseAdmin
    .from("compras")
    .update({
      status,
      mp_payment_id: String(payment.id),
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      raw_payment: payment,
      paid_at: status === "approved" ? new Date().toISOString() : purchase.paid_at,
    })
    .eq("id", purchaseId);

  if (status === "approved" && !purchase.delivered_at && buyerEmail) {
    await deliverResource(purchase.resource_slug, buyerEmail);
    await supabaseAdmin
      .from("compras")
      .update({ delivered_at: new Date().toISOString() })
      .eq("id", purchaseId);
  }

  return NextResponse.json({ ok: true });
}

async function deliverResource(resourceSlug: string, buyerEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const resource = getPaidResourceBySlug(resourceSlug);
  if (!apiKey || !resource) return;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
  const fileLinks = resource.fileUrls?.length
    ? resource.fileUrls.map((f) => `${siteUrl}${f}`)
    : resource.fileUrl
    ? [`${siteUrl}${resource.fileUrl}`]
    : [];

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RIVARA HR Academy <onboarding@resend.dev>",
      to: [buyerEmail],
      bcc: ["licmelisarivara@gmail.com"],
      subject: `Tu compra: ${resource.title}`,
      html: `
        <p>¡Gracias por tu compra!</p>
        <p>Acá tenés tu descarga de <strong>${resource.title}</strong>:</p>
        ${
          fileLinks.length
            ? `<ul>${fileLinks.map((l) => `<li><a href="${l}">${l}</a></li>`).join("")}</ul>`
            : `<p>Ya estamos preparando tu archivo, te lo mandamos en las próximas horas.</p>`
        }
        <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
      `,
    }),
  });
}
