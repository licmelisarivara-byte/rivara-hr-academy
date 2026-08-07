import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getFreeResourceBySlug } from "@/lib/resources";
import { COUPONS } from "@/lib/coupons";

// Registra cada descarga de un recurso gratuito, para poder contarlas en
// el reporte diario (a diferencia de compras/eventos, acá no hay "alta"
// explícita: es solo un log de fire-and-forget disparado al descargar). De
// paso, avisa a Melisa por mail y le manda un agradecimiento a quien
// descargó, con un cupón para el curso como próximo paso.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { resourceSlug, buyerEmail, buyerName, buyerPhone } = await req.json();
  if (!resourceSlug) {
    return NextResponse.json({ error: "missing_resource_slug" }, { status: 400 });
  }

  await supabaseAdmin.from("descargas_gratuitas").insert({
    resource_slug: resourceSlug,
    buyer_email: buyerEmail || null,
    buyer_name: buyerName || null,
    buyer_phone: buyerPhone || null,
  });

  const apiKey = process.env.RESEND_API_KEY;
  const resource = getFreeResourceBySlug(resourceSlug);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
  const coupon = COUPONS[0];

  if (apiKey && resource && buyerEmail) {
    const firstName = (buyerName || "").split(" ")[0] || "";
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
        subject: `Gracias por descargar ${resource.title} 🎁`,
        html: `
          <p>Hola${firstName ? ` ${firstName}` : ""},</p>
          <p>¡Gracias por descargar <strong>${resource.title}</strong>! Ya la tenés lista, y si por algo no llegó a bajarse, la volvés a tener acá:</p>
          ${resource.fileUrl ? `<p><a href="${siteUrl}${resource.fileUrl}">${siteUrl}${resource.fileUrl}</a></p>` : ""}
          <p>Si querés ir más en profundidad, tenemos el curso "Creá tu propio Asistente de Selección con IA + ATS" y otros recursos pagos con contenido más completo.</p>
          <p>Como ya diste este primer paso, te dejamos un <strong>${coupon.percentOff}% off</strong> extra en el curso con el cupón <strong>${coupon.code}</strong>:</p>
          <p><a href="${siteUrl}/cursos">${siteUrl}/cursos</a></p>
          <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
        `,
      }),
    }).catch(() => {
      // No bloqueamos la descarga si el mail falla.
    });
  }

  return NextResponse.json({ ok: true });
}
