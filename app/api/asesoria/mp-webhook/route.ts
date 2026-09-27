import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { processAsesoriaMpPayment } from "@/lib/asesoriaPayments";

// Webhook dedicado a los pedidos de Asesoría de Carrera (asesoria_pedidos),
// separado de /api/mp-webhook (HR Academy / compras) para no mezclar los
// dos flujos de pago. Hay que configurar esta URL como notification_url en
// la preferencia (ya lo hace /api/asesoria/checkout).

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

  const result = await processAsesoriaMpPayment(payment);
  return NextResponse.json({ ok: true, result });
}
