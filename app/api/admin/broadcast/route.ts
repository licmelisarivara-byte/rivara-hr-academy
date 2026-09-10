import { NextRequest, NextResponse } from "next/server";
import { enviarResend } from "@/lib/emailSequence";

// Envío puntual de un mail a una lista de destinatarios (campañas manuales:
// avisos de cierre de cupón, novedades, etc.). No deja registro en ninguna
// tabla — es para envíos únicos, no para secuencias automáticas. Cada
// persona recibe su copia individual (con copia oculta a Melisa, via
// enviarResend), nunca ven a los demás. Protegido con ADMIN_SECRET.
//
// Uso: POST con header "x-admin-secret" = ADMIN_SECRET y body:
//   {
//     "subject": "...",
//     "html": "<p>Hola{{nombre}},</p>...",
//     "recipients": [{ "email": "...", "nombre": "..." }]
//   }
// En `html`, "{{nombre}}" se reemplaza por " Nombre" (con espacio adelante)
// o por "" si no hay nombre — por eso el saludo se escribe "Hola{{nombre}},".
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || req.headers.get("x-admin-secret") !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { subject, html, recipients } = await req.json();
  if (!subject || !html || !Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (recipients.length > 500) {
    return NextResponse.json({ error: "too_many" }, { status: 400 });
  }

  const enviados: string[] = [];
  const fallidos: string[] = [];
  const vistos = new Set<string>();

  for (const r of recipients) {
    const email = String(r?.email || "").trim().toLowerCase();
    if (!email || vistos.has(email)) continue;
    vistos.add(email);

    const firstName = String(r?.nombre || "").trim().split(/\s+/)[0] || "";
    const personalizado = html.split("{{nombre}}").join(firstName ? ` ${firstName}` : "");

    const ok = await enviarResend(apiKey, email, subject, personalizado);
    (ok ? enviados : fallidos).push(email);
  }

  return NextResponse.json({ ok: true, enviados: enviados.length, fallidos });
}
