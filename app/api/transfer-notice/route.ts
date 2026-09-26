import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signConfirmToken } from "@/lib/confirmToken";

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Se llama cuando alguien toca "Confirmar inscripción/compra" después de
// elegir transferencia o Payoneer (es decir: dice que ya pagó / va a mandar
// el comprobante). Le manda a Melisa un mail con un botón "Confirmar pago":
// cuando ve la plata en su cuenta lo toca y se habilita el acceso solo (ver
// app/api/confirmar-pago). Una sola vez por compra (aviso_transferencia_at),
// y solo para compras que ya existen como pendientes — no se puede usar para
// mandarle mails arbitrarios.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ ok: true, skipped: "not_configured" });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !process.env.ADMIN_SECRET) {
    return NextResponse.json({ ok: true, skipped: "not_configured" });
  }

  const { slug, buyerEmail, method } = await req.json().catch(() => ({}));
  if (!slug || !buyerEmail || (method !== "transferencia" && method !== "payoneer")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { data: row } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("resource_slug", slug)
    .eq("payment_method", method)
    .eq("status", "pending")
    .ilike("buyer_email", String(buyerEmail).replace(/[\\%_]/g, (c) => `\\${c}`))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) return NextResponse.json({ ok: true, skipped: "no_pending_purchase" });
  if (row.aviso_transferencia_at) return NextResponse.json({ ok: true, skipped: "already_notified" });

  let filas = [row];
  if (row.bundle_group_id) {
    const { data: hermanas } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("bundle_group_id", row.bundle_group_id)
      .neq("id", row.id);
    if (hermanas) filas = [...filas, ...hermanas];
  }
  const moneda = row.currency === "USD" ? "USD " : "$";
  const total = filas.reduce((s, f) => s + Number(f.amount || 0), 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
  const link = `${siteUrl}/api/confirmar-pago?id=${row.id}&t=${signConfirmToken(row.id)}`;
  const metodo = method === "transferencia" ? "transferencia" : "Payoneer";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
      to: ["licmelisarivara@gmail.com"],
      subject: `💸 ${row.buyer_name || row.buyer_email} avisa que pagó por ${metodo} (${moneda}${total.toLocaleString("es-AR")})`,
      html: `
        <p><strong>${esc(row.buyer_name || "Alguien")}</strong> avisó que pagó por ${metodo}. Revisá tu cuenta y, cuando veas la plata, confirmá el pago para que se le habilite el acceso solo.</p>
        <ul>
          ${filas.map((f) => `<li>${esc(f.title)} — ${moneda}${Number(f.amount).toLocaleString("es-AR")}</li>`).join("")}
          <li><strong>Total a recibir:</strong> ${moneda}${total.toLocaleString("es-AR")}</li>
          <li><strong>Mail:</strong> ${esc(row.buyer_email)}</li>
          ${row.buyer_phone ? `<li><strong>WhatsApp:</strong> ${esc(row.buyer_phone)}</li>` : ""}
          ${row.discount_code ? `<li><strong>Cupón:</strong> ${esc(row.discount_code)}</li>` : ""}
        </ul>
        <p><a href="${link}" style="display:inline-block;background:#e6007e;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Ver y confirmar pago →</a></p>
        <p style="color:#666;font-size:12px">El botón abre una página donde tenés que apretar "Confirmar" — no se habilita nada hasta que lo hagas. Si no llegó la plata, ignorá este mail.</p>
      `,
    }),
  }).catch(() => null);

  if (res?.ok) {
    await supabaseAdmin
      .from("compras")
      .update({ aviso_transferencia_at: new Date().toISOString() })
      .eq("id", row.id);
  }
  return NextResponse.json({ ok: true });
}
