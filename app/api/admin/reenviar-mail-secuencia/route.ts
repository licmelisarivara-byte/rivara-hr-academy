import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { enviarResend, mail2, mail3, getClaude25 } from "@/lib/emailSequence";

const MASTERCLASS_EVENT_SLUG = "analiza-cvs-con-ia";

// Reenvío manual puntual del Mail 2 o Mail 3 de la secuencia (ver
// app/api/cron/secuencia-recursos) para un lead puntual — pensado para
// casos excepcionales, como un lead que quedó afuera del rango automático
// por el corte de AUTOMATIZACION_DESDE (ver ese archivo).
//
// Uso: POST con header "x-admin-secret" = ADMIN_SECRET y body:
//   { "email": "...", "nombre"?: "...", "mailNumber": 2 | 3 }
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { email, nombre, mailNumber } = await req.json();
  if (!email || (mailNumber !== 2 && mailNumber !== 3)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const to = String(email).trim().toLowerCase();

  const { subject, html } =
    mailNumber === 2 ? mail2(nombre || "") : mail3(nombre || "", getClaude25());

  const ok = await enviarResend(apiKey, to, subject, html);
  if (!ok) {
    return NextResponse.json({ error: "resend_failed" }, { status: 502 });
  }

  await supabaseAdmin
    .from("secuencia_mails_enviados")
    .upsert(
      { email: to, event_slug: MASTERCLASS_EVENT_SLUG, mail_number: mailNumber },
      { onConflict: "email,event_slug,mail_number" }
    );

  return NextResponse.json({ ok: true });
}
