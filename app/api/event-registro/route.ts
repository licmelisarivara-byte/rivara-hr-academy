import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Registro liviano para eventos gratuitos (masterclasses, webinars): sin
// contraseña ni confirmación de mail, para no perder inscriptos por
// fricción. Se guarda como lead en `event_registros` y, si Resend está
// configurado, se avisa a Melisa por mail al toque.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { eventSlug, name, email, phone } = await req.json();
  if (!eventSlug || !name || !email) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("event_registros").insert({
    event_slug: eventSlug,
    name,
    email,
    phone: phone || null,
  });

  if (error) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIVARA HR Academy <onboarding@resend.dev>",
        to: ["licmelisarivara@gmail.com"],
        subject: `Nuevo registro a ${eventSlug}: ${email}`,
        html: `
          <p>Nuevo registro a un evento gratuito:</p>
          <ul>
            <li><strong>Evento:</strong> ${eventSlug}</li>
            <li><strong>Nombre:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            ${phone ? `<li><strong>WhatsApp:</strong> ${phone}</li>` : ""}
          </ul>
        `,
      }),
    }).catch(() => {
      // No bloqueamos la confirmación si el mail falla.
    });
  }

  return NextResponse.json({ ok: true });
}
