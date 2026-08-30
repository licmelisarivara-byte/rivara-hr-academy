import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { freeResources } from "@/lib/resources";
import { getEventBySlug } from "@/lib/events";
import { COUPONS } from "@/lib/coupons";

const MASTERCLASS_EVENT_SLUG = "analiza-cvs-con-ia";

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
  const coupon = COUPONS[0];

  if (apiKey && buyerEmail) {
    const firstName = (buyerName || "").split(" ")[0] || "";
    const fileLinks = freeResources
      .filter((r) => r.fileUrl)
      .map((r) => `<li><a href="${siteUrl}${r.fileUrl}">${r.title}</a></li>`)
      .join("");

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
        subject: "Tu combo gratis de RIVARA HR Academy 🎁",
        html: `
          <p>Hola${firstName ? ` ${firstName}` : ""},</p>
          <p>¡Gracias por sumarte! Acá tenés los 3 recursos gratuitos:</p>
          <ul>${fileLinks}</ul>
          ${
            event
              ? `<p>Y la masterclass grabada, "${event.title}":</p>
                 <p><a href="${event.youtubeLink}">${event.youtubeLink}</a></p>`
              : ""
          }
          <p>Si querés ir más en profundidad, tenemos el curso "Creá tu propio Asistente de Selección con IA + ATS" y otros recursos pagos con contenido más completo.</p>
          <p>Como ya diste este primer paso, te dejamos un <strong>${coupon.percentOff}% off</strong> extra en el curso con el cupón <strong>${coupon.code}</strong>:</p>
          <p><a href="${siteUrl}/cursos">${siteUrl}/cursos</a></p>
          <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
        `,
      }),
    }).catch(() => {
      // No bloqueamos la respuesta si el mail falla.
    });
  }

  return NextResponse.json({ ok: true });
}
