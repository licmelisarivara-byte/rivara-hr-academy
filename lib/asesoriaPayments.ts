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
  await notifyCompradoraPagoConfirmado(pedido);

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

// Mercado Pago redirige sola a /gracias apenas se aprueba el pago (auto_return),
// pero si la clienta cierra la pestaña antes de que eso pase, este mail es el
// único lugar donde le queda el link para completar el formulario con el CV,
// LinkedIn y objetivo laboral.
async function notifyCompradoraPagoConfirmado(pedido: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !pedido.buyer_email) return;

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
      bcc: [MELISA_EMAIL],
      to: [pedido.buyer_email],
      subject: "¡Pago confirmado! Un último paso para arrancar",
      html: `
        <p>Hola${pedido.buyer_name ? ` ${pedido.buyer_name}` : ""},</p>
        <p>Recibimos tu pago de <strong>${packLabel}</strong>. Antes de empezar a armar tu material necesito que completes un formulario cortito: tu CV, tu LinkedIn (o que me cuentes que todavía no tenés perfil armado) y hacia dónde apunta tu búsqueda.</p>
        <p><a href="${formUrl}">${formUrl}</a></p>
        <p>Si ya lo completaste después de pagar, ignorá este mail.</p>
        <p>Cualquier duda, escribime por WhatsApp: <a href="https://wa.me/5491123912820">https://wa.me/5491123912820</a></p>
      `,
    }),
  }).catch(() => {
    // No bloqueamos el webhook si el mail falla.
  });
}
