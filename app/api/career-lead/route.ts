import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PDF_PATH = "/recursos/5-tips-busqueda-laboral.pdf";
const SITE_URL = "https://carrera.rivaraconsultora.com.ar";

// Lead magnet de Asesoría de Carrera (los 5 tips en PDF). Reutiliza la
// misma tabla `descargas_gratuitas` de HR Academy con un resource_slug
// propio, así Melisa empieza a juntar contactos sin necesitar una tabla
// nueva. El mail de agradecimiento va con branding de Asesoría de Carrera,
// no de HR Academy.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { name, email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  await supabaseAdmin.from("descargas_gratuitas").insert({
    resource_slug: "asesoria-carrera-5-tips",
    buyer_email: email,
    buyer_name: name || null,
    buyer_phone: null,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const firstName = (name || "").split(" ")[0] || "";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIVARA Consultora <hola@mailhr.rivaraconsultora.com.ar>",
        to: [email],
        bcc: ["licmelisarivara@gmail.com"],
        subject: "Tus 5 tips para la búsqueda laboral 🎁",
        html: `
          <p>Hola${firstName ? ` ${firstName}` : ""},</p>
          <p>¡Gracias por tu interés! Acá tenés los 5 tips para tu búsqueda laboral:</p>
          <p><a href="${SITE_URL}${PDF_PATH}">${SITE_URL}${PDF_PATH}</a></p>
          <p>Si querés ayuda personalizada con tu CV, tu LinkedIn y tu estrategia de búsqueda, escribime por WhatsApp: <a href="https://wa.me/5491123912820">https://wa.me/5491123912820</a></p>
        `,
      }),
    }).catch(() => {
      // No bloqueamos la descarga si el mail falla.
    });
  }

  return NextResponse.json({ ok: true });
}
