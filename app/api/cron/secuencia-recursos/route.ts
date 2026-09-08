import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { enviarResend, mail2, mail3, getClaude25 } from "@/lib/emailSequence";

// Mails 2 y 3 de la secuencia de leads del combo gratis
// (Secuencia_Mails_y_Copy_Lanzamiento.md) — el Mail 1 es inmediato y se
// manda desde /api/log-free-combo; estos dos los dispara Vercel Cron una
// vez por día (ver vercel.json) llamando a esta ruta. El copy de los
// mails vive en lib/emailSequence.ts, compartido con el reenvío manual
// puntual de app/api/admin/reenviar-mail-secuencia.
//
// Mail 2: se dispara desde el REGISTRO (event_registros), a partir de 3
// días de antigüedad. Solo mira leads desde AUTOMATIZACION_DESDE en
// adelante (ver más abajo por qué).
//
// Mail 3: se dispara desde que se mandó el MAIL 2 (secuencia_mails_enviados,
// columna sent_at), a partir de 3 días desde ESE envío — no desde el
// registro original. Así, aunque un lead haya recibido su Mail 2 tarde o
// en un momento raro, el Mail 3 siempre le llega espaciado, nunca el mismo
// día. (Antes usaba "7 días desde el registro", pero eso mandó Mail 2 y
// Mail 3 juntos el mismo día a leads viejos en la primera corrida del
// cron — ver más abajo.)
const MASTERCLASS_EVENT_SLUG = "analiza-cvs-con-ia";
const DIA_MS = 24 * 60 * 60 * 1000;
const LIMITE_POR_TANDA = 200; // tope de seguridad por corrida
// Nunca inscribir (Mail 2) a leads de antes de esta fecha (el día que se
// activó esta automatización). Sin este piso, la primera corrida de un
// cron nuevo (o una reactivación después de borrar
// secuencia_mails_enviados) interpreta a TODOS los leads históricos
// "viejos" como pendientes y les manda el Mail 2 de golpe, aunque se
// hayan registrado hace semanas — pasó exactamente eso el 8/9 con 33
// leads de la masterclass anterior (y, como en ese momento el Mail 3
// todavía se basaba en "7 días desde el registro", muchos de esos leads
// ya tenían también más de 7 días, así que recibieron los dos mails
// juntos el mismo día).
const AUTOMATIZACION_DESDE = "2026-09-08T00:00:00-03:00";

// Excepciones puntuales al "3 días desde el Mail 2": para casos donde
// Melisa ya le dijo a alguien a mano una fecha de vencimiento distinta
// (por ejemplo, por WhatsApp), así el Mail 3 le llega ese día exacto en
// vez del que le tocaría por regla general. Se borra la entrada una vez
// que ya se mandó (el chequeo contra secuencia_mails_enviados lo hace
// innocuo igual, pero así queda prolijo).
const EXCEPCIONES_MAIL3: Record<string, string> = {
  // Melisa le dijo a Yanina que el cupón vencía el 10/9.
  "yaformichelli@gmail.com": "2026-09-10T00:00:00-03:00",
};

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!supabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const resultado = { mail2: 0, mail3: 0 };
  const limite3dias = new Date(Date.now() - 3 * DIA_MS).toISOString();

  // --- Mail 2: 3 días desde el registro (solo leads post-lanzamiento) ---
  {
    const { data: leads } = await supabaseAdmin
      .from("event_registros")
      .select("email, name, created_at")
      .eq("event_slug", MASTERCLASS_EVENT_SLUG)
      .gte("created_at", AUTOMATIZACION_DESDE)
      .lte("created_at", limite3dias)
      .not("email", "is", null)
      .order("created_at", { ascending: true })
      .limit(LIMITE_POR_TANDA);

    if (leads?.length) {
      const { data: yaEnviados } = await supabaseAdmin
        .from("secuencia_mails_enviados")
        .select("email")
        .eq("event_slug", MASTERCLASS_EVENT_SLUG)
        .eq("mail_number", 2);
      const enviadosSet = new Set((yaEnviados ?? []).map((r) => r.email.toLowerCase()));

      const vistos = new Set<string>();
      for (const lead of leads) {
        const email = lead.email?.trim().toLowerCase();
        if (!email || enviadosSet.has(email) || vistos.has(email)) continue;
        vistos.add(email);

        const { subject, html } = mail2(lead.name || "");
        const ok = await enviarResend(apiKey, email, subject, html);
        if (!ok) continue;

        const { error: insertError } = await supabaseAdmin
          .from("secuencia_mails_enviados")
          .insert({ email, event_slug: MASTERCLASS_EVENT_SLUG, mail_number: 2 });
        if (!insertError) resultado.mail2++;
      }
    }
  }

  // --- Mail 3: 3 días desde que se mandó el Mail 2 (no desde el registro) ---
  {
    const { data: pendientes } = await supabaseAdmin
      .from("secuencia_mails_enviados")
      .select("email, sent_at")
      .eq("event_slug", MASTERCLASS_EVENT_SLUG)
      .eq("mail_number", 2)
      .order("sent_at", { ascending: true })
      .limit(LIMITE_POR_TANDA);

    if (pendientes?.length) {
      const { data: yaEnviados } = await supabaseAdmin
        .from("secuencia_mails_enviados")
        .select("email")
        .eq("event_slug", MASTERCLASS_EVENT_SLUG)
        .eq("mail_number", 3);
      const enviadosSet = new Set((yaEnviados ?? []).map((r) => r.email.toLowerCase()));

      const cupon = getClaude25();
      const vistos = new Set<string>();
      for (const p of pendientes) {
        const email = p.email?.trim().toLowerCase();
        if (!email || enviadosSet.has(email) || vistos.has(email)) continue;

        const excepcion = EXCEPCIONES_MAIL3[email];
        const umbral = excepcion
          ? new Date(excepcion).getTime()
          : new Date(p.sent_at).getTime() + 3 * DIA_MS;
        if (Date.now() < umbral) continue;
        vistos.add(email);

        const { data: registro } = await supabaseAdmin
          .from("event_registros")
          .select("name")
          .eq("event_slug", MASTERCLASS_EVENT_SLUG)
          .ilike("email", email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { subject, html } = mail3(registro?.name || "", cupon);
        const ok = await enviarResend(apiKey, email, subject, html);
        if (!ok) continue;

        const { error: insertError } = await supabaseAdmin
          .from("secuencia_mails_enviados")
          .insert({ email, event_slug: MASTERCLASS_EVENT_SLUG, mail_number: 3 });
        if (!insertError) resultado.mail3++;
      }
    }
  }

  return NextResponse.json({ ok: true, ...resultado });
}
