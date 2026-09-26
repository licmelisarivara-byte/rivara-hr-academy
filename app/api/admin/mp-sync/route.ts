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

  // Diagnóstico de credenciales (body { "diagnostico": true }): devuelve
  // solo el prefijo del token (APP_USR- = producción, TEST- = pruebas; el
  // prefijo no es secreto) y a qué cuenta de MP pertenece, sin exponer el
  // token. Sirve para chequear que el sitio no mezcle entornos.
  if (body?.diagnostico) {
    const me = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await me.json().catch(() => null);
    return NextResponse.json({
      tokenPrefix: `${accessToken.split("-")[0]}-`,
      tokenLength: accessToken.length,
      // Forma del token con los caracteres enmascarados (9 = dígito, x =
      // otro carácter): permite distinguir un Access Token (largo, con
      // números) de una Public Key (APP_USR- + uuid de 36 caracteres)
      // sin exponer nada del valor real.
      tokenShape: accessToken.replace(/[0-9]/g, "9").replace(/[a-zA-Z]/g, "x"),
      usersMe: {
        status: me.status,
        id: meData?.id,
        nickname: meData?.nickname,
        site_id: meData?.site_id,
        mensaje: me.ok ? undefined : meData?.message,
      },
    });
  }

  const days = Math.min(Math.max(Number(body?.days) || 3, 1), 30);

  // Modo solo lectura (body { "solo_ver": true }): lista los movimientos
  // recientes tal como los devuelve MP, sin filtrar por estado y SIN
  // procesar nada (no aprueba compras, no manda mails). Sirve para ver si
  // un ingreso (por ejemplo una transferencia a la cuenta de MP) aparece
  // en la API. Prueba además la API de movimientos de cuenta.
  if (body?.solo_ver) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    // Con { "payment_id": ... } devuelve el pago completo tal cual lo da MP
    // (para ver qué datos trae quien transfiere).
    if (body?.payment_id) {
      const one = await fetch(`https://api.mercadopago.com/v1/payments/${body.payment_id}`, { headers });
      return NextResponse.json({ status: one.status, pago: await one.json().catch(() => null) });
    }
    const q = new URLSearchParams({
      sort: "date_created",
      criteria: "desc",
      range: "date_created",
      begin_date: `NOW-${days}DAYS`,
      end_date: "NOW",
      limit: "30",
    });
    const pRes = await fetch(`https://api.mercadopago.com/v1/payments/search?${q}`, { headers });
    const pData = await pRes.json().catch(() => null);
    const pagos = (pData?.results ?? []).map((p: any) => ({
      id: p.id,
      status: p.status,
      operation_type: p.operation_type,
      payment_type_id: p.payment_type_id,
      payment_method_id: p.payment_method_id,
      monto: p.transaction_amount,
      fecha: p.date_created,
      payer_email: p.payer?.email ?? null,
      descripcion: p.description ?? null,
      external_reference: p.external_reference ?? null,
    }));
    const mRes = await fetch(
      `https://api.mercadopago.com/v1/account/movements/search?limit=30&sort=date_created&criteria=desc`,
      { headers }
    );
    const mText = await mRes.text().catch(() => "");
    return NextResponse.json({
      payments: { status: pRes.status, total: pData?.paging?.total, pagos },
      movements: { status: mRes.status, cuerpo: mText.slice(0, 3000) },
    });
  }

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
