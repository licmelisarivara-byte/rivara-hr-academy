import { NextRequest, NextResponse } from "next/server";

// Supabase dispara esto (vía trigger en auth.users) cada vez que se registra
// una alumna nueva. El header x-webhook-secret evita que cualquiera pueda
// llamar a este endpoint y hacer que te lleguen mails falsos.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.SIGNUP_WEBHOOK_SECRET || secret !== process.env.SIGNUP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "resend_not_configured" }, { status: 501 });
  }

  const body = await req.json();
  const email = body?.record?.email ?? "(sin email)";
  const createdAt = body?.record?.created_at ?? new Date().toISOString();
  const fullName = body?.record?.raw_user_meta_data?.full_name ?? "";
  const phone = body?.record?.raw_user_meta_data?.phone ?? "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
      to: ["licmelisarivara@gmail.com"],
      subject: `Nueva alumna registrada: ${email}`,
      html: `
        <p>Se registró alguien nuevo en RIVARA HR Academy:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          ${fullName ? `<li><strong>Nombre:</strong> ${fullName}</li>` : ""}
          ${phone ? `<li><strong>Celular:</strong> ${phone}</li>` : ""}
          <li><strong>Fecha:</strong> ${createdAt}</li>
        </ul>
      `,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "resend_error", detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
