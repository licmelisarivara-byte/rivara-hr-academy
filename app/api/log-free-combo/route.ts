import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { freeResources } from "@/lib/resources";
import { getEventBySlug } from "@/lib/events";
import { getCoupon } from "@/lib/coupons";

const MASTERCLASS_EVENT_SLUG = "analiza-cvs-con-ia";
const CURSO_SLUG = "claude-para-seleccion";

// Registra, con un solo formulario, la descarga de los 3 recursos
// gratuitos + el registro a la masterclass — mismas tablas/columnas que
// se usarían si la persona hiciera cada paso por separado (así el
// conteo diario sigue funcionando igual), pero mandando un único mail
// consolidado en vez de hasta 4 mails distintos.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { buyerName, buyerEmail, buyerPhone } = await req.json();

  await Promise.all([
    ...freeResources.map((r) =>
      supabaseAdmin!.from("descargas_gratuitas").insert({
        resource_slug: r.slug,
        buyer_email: buyerEmail || null,
        buyer_name: buyerName || null,
        buyer_phone: buyerPhone || null,
      })
    ),
    supabaseAdmin.from("event_registros").insert({
      event_slug: MASTERCLASS_EVENT_SLUG,
      name: buyerName || null,
      email: buyerEmail || null,
      phone: buyerPhone || null,
    }),
  ]).catch(() => {
    // Si alguna fila falla, igual seguimos: no bloqueamos el mail ni la UI.
  });

  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
  const event = getEventBySlug(MASTERCLASS_EVENT_SLUG);
  // Mail 1 de la secuencia (Secuencia_Mails_y_Copy_Lanzamiento.md) — el
  // único de los 3 que se manda 100% automático, disparado acá mismo al
  // momento del registro. Mails 2 y 3 los manda /api/cron/secuencia-recursos
  // a los 3 y 7 días. El P.D. con CLAUDE25 se arma solo mientras el cupón
  // siga vigente (ver lib/coupons.ts) — cuando venza, este mail deja de
  // mencionarlo sin que haga falta tocar el código.
  const cupon = getCoupon("CLAUDE25", { courseSlug: CURSO_SLUG });

  if (apiKey && buyerEmail) {
    const firstName = (buyerName || "").split(" ")[0] || "";
    const fileLinks = freeResources
      .filter((r) => r.fileUrl)
      .map((r) => `<li>✅ <a href="${siteUrl}${r.fileUrl}">${r.title}</a></li>`)
      .join("");
    const masterclassItem = event
      ? `<li>✅ <a href="${event.youtubeLink}">Masterclass grabada: Analizá un CV con IA en segundos</a></li>`
      : "";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
        to: [buyerEmail],
        bcc: ["licmelisarivara@gmail.com"],
        subject: "Ya podés descargar tus 4 recursos 🎁",
        html: `
          <p>Hola${firstName ? ` ${firstName}` : ""},</p>
          <p>Acá tenés los 4 recursos, listos para usar hoy mismo:</p>
          <ul>${fileLinks}${masterclassItem}</ul>
          <p>En la masterclass cuento por qué elijo Claude por sobre otras herramientas de IA para este trabajo — vale la pena verla antes de usar los prompts.</p>
          <p>Cualquier duda que te surja usando los prompts, respondeme este mail directamente.</p>
          <p>Lic. Melisa Rivara<br/>RIVARA HR Academy</p>
          ${
            cupon
              ? `<p style="color:#666">P.D.: Si después de probar los recursos querés ir más a fondo, el curso "Claude aplicado a selección" está con ${cupon.percentOff}% off (código ${cupon.code}, por transferencia) hasta el domingo 20/9. <a href="${siteUrl}/cursos/${CURSO_SLUG}">Ver el curso →</a></p>`
              : ""
          }
        `,
      }),
    }).catch(() => {
      // No bloqueamos la respuesta si el mail falla.
    });
  }

  return NextResponse.json({ ok: true });
}
