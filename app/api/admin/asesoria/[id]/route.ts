import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MELISA_EMAIL = "licmelisarivara@gmail.com";
const VALID_STATES = ["en_proceso", "entregado", "agendado", "completado"] as const;
type Estado = (typeof VALID_STATES)[number];

const STATE_TIMESTAMP_FIELD: Record<Estado, string | null> = {
  en_proceso: null,
  entregado: "delivered_at",
  agendado: "scheduled_at",
  completado: "completed_at",
};

// Cambia el estado de un pedido desde la mini pantalla de admin
// (app/admin/asesoria). Al pasar a "entregado" manda automáticamente el
// mail con el link para agendar la sesión de seguimiento (ASESORIA_AGENDA_URL).
// El paso a "agendado" es manual: como se usa un link directo de Google
// Calendar (sin webhook), Melisa lo marca ella misma cuando le llega el
// aviso de reserva de Calendar.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { id } = params;
  const { estado } = await req.json();
  if (!VALID_STATES.includes(estado)) {
    return NextResponse.json({ error: "invalid_estado" }, { status: 400 });
  }

  const { data: pedido } = await supabaseAdmin
    .from("asesoria_pedidos")
    .select("*")
    .eq("id", id)
    .single();
  if (!pedido) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const timestampField = STATE_TIMESTAMP_FIELD[estado as Estado];
  const updates: Record<string, unknown> = { status: estado };
  if (timestampField) {
    updates[timestampField] = new Date().toISOString();
  }

  await supabaseAdmin.from("asesoria_pedidos").update(updates).eq("id", id);

  if (estado === "entregado" && !pedido.calcom_notified_at) {
    await notifyClienteEntregado(pedido);
    await supabaseAdmin
      .from("asesoria_pedidos")
      .update({ calcom_notified_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({ ok: true });
}

async function notifyClienteEntregado(pedido: any) {
  const apiKey = process.env.RESEND_API_KEY;
  const agendaUrl = process.env.ASESORIA_AGENDA_URL;
  if (!apiKey || !pedido.buyer_email) return;

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
      subject: "Ya tenés tu material listo 🎉 — coordinemos tu sesión",
      html: `
        <p>Hola${pedido.buyer_name ? ` ${pedido.buyer_name}` : ""},</p>
        <p>Ya te armé tu CV, tu LinkedIn${
          pedido.pack_slug === "inicio" ? "" : " y tu Informe de Estrategia"
        } — revisá tu mail/WhatsApp donde te mandé los archivos.</p>
        ${
          agendaUrl
            ? `<p>Para coordinar tu sesión de seguimiento (incluida en tu pack), elegí un horario acá:</p>
        <p><a href="${agendaUrl}">${agendaUrl}</a></p>`
            : `<p>Para coordinar tu sesión de seguimiento, escribime por WhatsApp: https://wa.me/5491123912820</p>`
        }
        <p>Cualquier duda, escribime por WhatsApp: <a href="https://wa.me/5491123912820">https://wa.me/5491123912820</a></p>
      `,
    }),
  }).catch(() => {
    // No bloqueamos el cambio de estado si el mail falla.
  });
}
