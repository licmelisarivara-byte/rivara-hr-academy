import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { getCoupon } from "@/lib/coupons";

// Mails 2 y 3 de la secuencia de leads del combo gratis
// (Secuencia_Mails_y_Copy_Lanzamiento.md) — el Mail 1 es inmediato y se
// manda desde /api/log-free-combo; estos dos los dispara Vercel Cron una
// vez por día (ver vercel.json) llamando a esta ruta.
//
// Por qué "al menos N días" y no "exactamente el día N": si el cron no
// llega a correr un día puntual (deploy, caída, lo que sea), este approach
// se autocura solo al día siguiente en vez de perderse esos leads para
// siempre. secuencia_mails_enviados evita mandar el mismo mail dos veces.
const MASTERCLASS_EVENT_SLUG = "analiza-cvs-con-ia";
const CURSO_SLUG = "claude-para-seleccion";
const DIA_MS = 24 * 60 * 60 * 1000;
const LIMITE_POR_TANDA = 200; // tope de seguridad por corrida

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
}

async function enviarResend(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
      to: [to],
      bcc: ["licmelisarivara@gmail.com"],
      subject,
      html,
    }),
  });
  return res.ok;
}

function mail2(nombre: string) {
  const firstName = nombre.split(" ")[0] || "";
  return {
    subject: "Un tip para que el Prompt Maestro te rinda mejor",
    html: `
      <p>Hola${firstName ? ` ${firstName}` : ""},</p>
      <p>Un tip rápido para el Prompt Maestro de Análisis de CVs: el resultado es tan bueno como los criterios que le des.</p>
      <p>Si le pegás solo "estos son los requisitos del puesto" en una línea genérica, te va a devolver un análisis genérico. Pero si le aclarás qué es realmente no negociable (excluyente) y qué es deseable pero no determinante, el análisis cambia por completo — ahí es donde te separa un candidato con un gap entrenable de uno con un gap real.</p>
      <p>Ejemplo simple: no es lo mismo poner "manejo de Excel" que aclarar "Excel avanzado, excluyente — sin esto no puede armar los reportes que pide el puesto". La segunda versión le da al prompt algo concreto para evaluar, no una casilla para tildar.</p>
      <p>Cuanto más clara seas vos con el criterio, más útil se vuelve la IA. Esa es, en el fondo, toda la idea detrás del curso.</p>
      <p>Lic. Melisa Rivara<br/>RIVARA HR Academy</p>
    `,
  };
}

function mail3(nombre: string, cupon: ReturnType<typeof getCoupon>) {
  const firstName = nombre.split(" ")[0] || "";
  const cierre = cupon
    ? `<p>Con el código <strong>${cupon.code}</strong> tenés ${cupon.percentOff}% off por transferencia — de $70.000 a $52.500 — válido hasta el domingo 20/9.</p>`
    : "";
  return {
    subject: "Manual vs. Claude: la diferencia real",
    html: `
      <p>Hola${firstName ? ` ${firstName}` : ""},</p>
      <p>Después de una semana con los recursos, quiero mostrarte el paso que sigue.</p>
      <p><strong>Filtrando a mano:</strong> leés cada CV, armás tu propio criterio sobre la marcha, y cada selector de tu equipo evalúa un poco distinto.</p>
      <p><strong>Con Claude bien instruido:</strong> el mismo criterio se aplica a cada CV, con scoring técnico y cultural, banderas rojas y preguntas de entrevista ya armadas — vos seguís tomando la decisión final, pero con la parte mecánica resuelta.</p>
      <p>Eso es exactamente lo que armamos en <strong>Claude aplicado a selección</strong>: 6 módulos + 1 bonus (~2h10 en total), grabado, a tu ritmo. Vas a construir tu propio asistente de selección, no solo aprender prompts sueltos.</p>
      ${cierre}
      <p><a href="${siteUrl()}/cursos/${CURSO_SLUG}">Quiero ver el curso →</a></p>
      <p>Cualquier pregunta antes de anotarte, escribime.</p>
      <p>Lic. Melisa Rivara<br/>RIVARA HR Academy</p>
    `,
  };
}

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

  for (const mailNumber of [2, 3] as const) {
    const diasMinimo = mailNumber === 2 ? 3 : 7;
    const limite = new Date(Date.now() - diasMinimo * DIA_MS).toISOString();

    const { data: leads } = await supabaseAdmin
      .from("event_registros")
      .select("email, name, created_at")
      .eq("event_slug", MASTERCLASS_EVENT_SLUG)
      .lte("created_at", limite)
      .not("email", "is", null)
      .order("created_at", { ascending: true })
      .limit(LIMITE_POR_TANDA);
    if (!leads?.length) continue;

    const { data: yaEnviados } = await supabaseAdmin
      .from("secuencia_mails_enviados")
      .select("email")
      .eq("event_slug", MASTERCLASS_EVENT_SLUG)
      .eq("mail_number", mailNumber);
    const enviadosSet = new Set((yaEnviados ?? []).map((r) => r.email.toLowerCase()));

    const cupon =
      mailNumber === 3 ? getCoupon("CLAUDE25", { courseSlug: CURSO_SLUG }) : null;

    const vistos = new Set<string>(); // evita duplicar dentro de la misma corrida
    for (const lead of leads) {
      const email = lead.email?.trim().toLowerCase();
      if (!email || enviadosSet.has(email) || vistos.has(email)) continue;
      vistos.add(email);

      const { subject, html } =
        mailNumber === 2 ? mail2(lead.name || "") : mail3(lead.name || "", cupon);

      const ok = await enviarResend(apiKey, email, subject, html);
      if (!ok) continue;

      const { error: insertError } = await supabaseAdmin
        .from("secuencia_mails_enviados")
        .insert({ email, event_slug: MASTERCLASS_EVENT_SLUG, mail_number: mailNumber });
      // Si insertError es por el unique constraint, alguien más ya lo marcó
      // como enviado (otra corrida en paralelo) — no es un problema real,
      // solo mandamos el mail dos veces en el peor caso de carrera exacta.
      if (!insertError) resultado[mailNumber === 2 ? "mail2" : "mail3"]++;
    }
  }

  return NextResponse.json({ ok: true, ...resultado });
}
