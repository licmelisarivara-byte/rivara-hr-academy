import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { processMpPayment } from "@/lib/mpPayments";

// Sincronización activa con Mercado Pago: en vez de esperar a que MP avise
// (no avisa por los pagos del link fijo), le pregunta a la API qué pagos
// aprobados entraron en los últimos días y procesa cada uno igual que el
// webhook: lo asocia a su compra (por referencia, o por mail/monto si no
// tiene), habilita el acceso y manda el mail; si no puede asociarlo, le avisa
// a Melisa. Es idempotente: correrlo varias veces no reenvía nada.
//
// Uso: POST con header "x-admin-secret" = ADMIN_SECRET y body opcional
//   { "days": 3 }   // cuántos días para atrás mirar (1 a 30, default 3)
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || req.headers.get("x-admin-secret") !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken || !supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const body = await req.json().catch(() => ({}));
  const days = Math.min(Math.max(Number(body?.days) || 3, 1), 30);

  const params = new URLSearchParams({
    status: "approved",
    sort: "date_created",
    criteria: "desc",
    range: "date_created",
    begin_date: `NOW-${days}DAYS`,
    end_date: "NOW",
    limit: "50",
  });
  const res = await fetch(`https://api.mercadopago.com/v1/payments/search?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => null);
    console.error("MP payments/search error", res.status, detail);
    return NextResponse.json({ error: "mp_error", mpStatus: res.status, mpDetail: detail }, { status: 502 });
  }

  const data = await res.json();
  const pagos: any[] = data.results ?? [];
  const resumen: Record<string, number> = {};
  const detalle: { id: string; email: string | null; monto: number; resultado: string }[] = [];

  for (const pago of pagos) {
    const resultado = await processMpPayment(pago);
    resumen[resultado] = (resumen[resultado] ?? 0) + 1;
    detalle.push({
      id: String(pago.id),
      email: pago.payer?.email ?? null,
      monto: pago.transaction_amount,
      resultado,
    });
  }

  return NextResponse.json({ ok: true, revisados: pagos.length, resumen, detalle });
}
