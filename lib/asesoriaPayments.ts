import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SITE_URL = "https://carrera.rivaraconsultora.com.ar";
const MELISA_EMAIL = "licmelisarivara@gmail.com";

// Procesa una notificación de Mercado Pago ya confirmada contra la API de MP
// (nunca se confía en el body del webhook solo, ver app/api/asesoria/mp-webhook).
// Espejo de lib/mpPayments.ts pero para asesoria_pedidos, que tiene su propio
// ciclo de vida (pending -> paid -> en_proceso -> entregado -> agendado ->
// completado) separado del de `compras`.
export async function processAsesoriaMpPayment(payment: any) {
  if (!supabaseAdmin) return { skipped: "not_configured" as const };

  const externalReference = payment.external_reference;
  if (!externalReference) return { skipped: "no_external_reference" as const };

  const { data: pedido } = await supabaseAdmin
    .from("asesoria_pedidos")
    .select("*")
    .eq("id", externalReference)
    .single();
  if (!pedido) return { skipped: "not_found" as const };

  if (payment.status !== "approved") {
    // Guardamos el estado crudo igual, para poder diagnosticar pagos
    // rechazados/pendientes, pero sin marcar el pedido como pagado.
    await supabaseAdmin
      .from("asesoria_pedidos")
      .update({ mp_payment_id: String(payment.id), raw_payment: payment })
      .eq("id", pedido.id);
    return { skipped: `mp_status_${payment.status}` as const };
  }

  if (pedido.status !== "pending") {
    return { skipped: "already_processed" as const };
  }

  await supabaseAdmin
    .from("asesoria_pedidos")
    .update({
      status: "paid",
      mp_payment_id: String(payment.id),
      raw_payment: payment,
      paid_at: new Date().toISOString(),
    })
    .eq("id", pedido.id);

  await notifyMelisaNuevoPago(pedido);

  return { ok: true as const, pedidoId: pedido.id };
}

async function notifyMelisaNuevoPago(pedido: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const formUrl = `${SITE_URL}/gracias?pedido=${pedido.id}`;
  const packLabel = pedido.addon_traduccion
    ? `${pedido.pack_title} + Traducción al inglés`
    : pedido.pack_title;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RIVARA Consultora <hola@mailhr.rivaraconsultora.com.ar>",
      to: [MELISA_EMAIL],
      subject: `💰 Nuevo pago: ${packLabel} — ${pedido.buyer_name || pedido.buyer_email}`,
      html: `
        <p>Nuevo pago confirmado en Asesoría de Carrera.</p>
        <ul>
          <li><strong>Pack:</strong> ${packLabel}</li>
          <li><strong>Monto:</strong> $${Number(pedido.amount).toLocaleString("es-AR")} ARS</li>
          <li><strong>Nombre:</strong> ${pedido.buyer_name || "-"}</li>
          <li><strong>Email:</strong> ${pedido.buyer_email || "-"}</li>
          <li><strong>WhatsApp:</strong> ${pedido.buyer_phone || "-"}</li>
        </ul>
        <p>Todavía falta que complete el formulario con el CV, LinkedIn y objetivo — te avisamos apenas lo haga.</p>
        <p><a href="${formUrl}">${formUrl}</a></p>
      `,
    }),
  }).catch(() => {
    // No bloqueamos el webhook si el mail falla.
  });
}
