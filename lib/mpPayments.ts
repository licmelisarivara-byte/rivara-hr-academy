import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deliverCourseAccess, deliverResource } from "@/lib/deliverPurchase";

// Procesamiento de un pago de Mercado Pago, compartido por el webhook
// (app/api/mp-webhook, cuando MP avisa) y por la sincronización activa
// (app/api/admin/mp-sync, que le pregunta a MP qué pagos entraron — sirve
// para los pagos del link fijo, por los que MP no le avisa al sitio).

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Busca la compra a la que corresponde un pago que llegó SIN
// external_reference (link fijo de MP). Orden: (1) una compra que ya
// tiene este mismo mp_payment_id (pago ya procesado), (2) la compra de
// Mercado Pago más reciente, pendiente o ya aprobada a mano pero sin
// mp_payment_id, con el mismo mail que pagó, (3) si el mail no coincide,
// la única compra pendiente de MP con ese monto exacto creada en las
// últimas 6 horas. Si hay ambigüedad, devuelve null (mejor avisar a
// Melisa que aprobar la compra equivocada).
async function matchPurchaseWithoutReference(payment: any) {
  if (!supabaseAdmin) return null;

  const { data: yaProcesado } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("mp_payment_id", String(payment.id))
    .limit(1)
    .maybeSingle();
  if (yaProcesado) return yaProcesado;

  const email: string | undefined = payment.payer?.email?.trim().toLowerCase();
  if (email) {
    const escaped = email.replace(/[\\%_]/g, (c) => `\\${c}`);
    const { data: porMail } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("payment_method", "mercadopago")
      .in("status", ["pending", "approved"])
      .is("mp_payment_id", null)
      .ilike("buyer_email", escaped)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (porMail) return porMail;
  }

  const monto = Number(payment.transaction_amount);
  if (monto > 0) {
    const desde = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: porMonto } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("payment_method", "mercadopago")
      .eq("status", "pending")
      .is("mp_payment_id", null)
      .eq("amount", monto)
      .gte("created_at", desde)
      .limit(2);
    if (porMonto?.length === 1) return porMonto[0];
  }

  return null;
}

// Aviso a Melisa de un pago aprobado que no se pudo asociar a ninguna
// compra. mp_pagos_sin_asociar evita repetir el aviso (MP manda varias
// notificaciones por el mismo pago, y la sincronización revisa los mismos
// pagos una y otra vez).
async function alertUnmatchedPayment(payment: any) {
  if (!supabaseAdmin) return;
  const neto = Number(payment.transaction_details?.net_received_amount) || null;
  const nombre =
    [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ") || null;

  const { error } = await supabaseAdmin.from("mp_pagos_sin_asociar").insert({
    payment_id: String(payment.id),
    payer_email: payment.payer?.email ?? null,
    payer_name: nombre,
    amount: Number(payment.transaction_amount) || null,
    net_amount: neto,
  });
  if (error) return; // ya se avisó antes

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
      reply_to: "hola@rivaraconsultora.com.ar",
      to: ["licmelisarivara@gmail.com"],
      subject: `💰 Entró un pago por Mercado Pago sin asociar — ${payment.payer?.email ?? "sin mail"}`,
      html: `
        <p>Entró un pago aprobado por Mercado Pago que no pude asociar a ninguna compra del sitio, así que <strong>no se habilitó ningún acceso</strong>.</p>
        <ul>
          <li><strong>Mail del pagador:</strong> ${payment.payer?.email ?? "(no informado)"}</li>
          ${nombre ? `<li><strong>Nombre:</strong> ${nombre}</li>` : ""}
          <li><strong>Monto:</strong> $${payment.transaction_amount}${neto ? ` (neto: $${neto})` : ""}</li>
          <li><strong>ID de pago MP:</strong> ${payment.id}</li>
        </ul>
        <p>Si es una venta de un curso, buscá su compra en Supabase (tabla <code>compras</code>) y aprobala con /api/admin/approve-purchase, o pedile ayuda a Claude con este mail. Si no tiene que ver con la academia (por ejemplo, un cobro de Rivara Recruiter), ignoralo.</p>
      `,
    }),
  }).catch(() => {});
}

// Procesa un pago ya traído de la API de MP. Devuelve una etiqueta con lo
// que pasó (para el resumen de la sincronización y para los logs).
export async function processMpPayment(payment: any): Promise<string> {
  if (!supabaseAdmin) return "not_configured";

  const ref: string | undefined = payment.external_reference || undefined;
  // Los pagos de otros productos (ej. Rivara Recruiter usa
  // "userId:plan:cupón" como referencia) no son de la academia.
  if (ref && !UUID_RE.test(ref)) return "ignored_other_product";

  let purchase: any = null;
  if (ref) {
    const { data } = await supabaseAdmin.from("compras").select("*").eq("id", ref).single();
    purchase = data;
  } else {
    // Sin referencia solo actuamos sobre pagos aprobados: asociar por
    // mail/monto un pago rechazado o pendiente sería adivinar de más.
    if (payment.status !== "approved") return "ignored_not_approved";
    purchase = await matchPurchaseWithoutReference(payment);
  }
  if (!purchase) {
    if (!ref && payment.status === "approved") {
      await alertUnmatchedPayment(payment);
      return "unmatched";
    }
    return "purchase_not_found";
  }

  const status: string = payment.status; // approved | rejected | pending | in_process | cancelled
  // El mail ya suele estar guardado desde que la persona arrancó la compra;
  // si MP nos manda uno, lo preferimos por ser el que efectivamente pagó,
  // pero nunca lo dejamos en blanco.
  const buyerEmail: string | null = payment.payer?.email ?? purchase.buyer_email ?? null;
  const buyerName: string | null =
    [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ") || null;

  await supabaseAdmin
    .from("compras")
    .update({
      status,
      mp_payment_id: String(payment.id),
      buyer_email: buyerEmail,
      // No pisar el nombre que la persona escribió en el formulario del
      // sitio con un null si Mercado Pago no informa nombre.
      buyer_name: buyerName ?? purchase.buyer_name ?? null,
      raw_payment: payment,
      paid_at:
        status === "approved" ? purchase.paid_at ?? new Date().toISOString() : purchase.paid_at,
    })
    .eq("id", purchase.id);

  if (status === "approved" && !purchase.delivered_at && buyerEmail) {
    const entregado =
      purchase.kind === "course"
        ? await deliverCourseAccess(purchase.resource_slug, buyerEmail)
        : await deliverResource(purchase.resource_slug, buyerEmail);
    // Si falló, no marcamos delivered_at — queda pendiente y visible en la
    // tabla `compras` (aprobada pero sin entregar). deliverPurchase.ts ya le
    // manda un aviso aparte a Melisa; para reintentar, usar
    // /api/admin/approve-purchase con el mismo id.
    if (entregado) {
      await supabaseAdmin
        .from("compras")
        .update({ delivered_at: new Date().toISOString() })
        .eq("id", purchase.id);
      return "delivered";
    }
    return "delivery_failed";
  }

  return purchase.delivered_at ? "already_delivered" : status;
}
