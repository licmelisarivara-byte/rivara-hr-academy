import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  esRespuestaCorrecta,
  CERTIFICADO_GRABACION_URL,
  CERTIFICADO_CURSO_BOT_ATS,
} from "@/lib/certificado";
import { syncCertificadoDescargadoEnNotion } from "@/lib/notion";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!supabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const body = await req.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const respuesta = typeof body?.respuesta === "string" ? body.respuesta : "";
  const tipo = body?.tipo === "curso-bot-ats" ? "curso-bot-ats" : "masterclass";

  if (!nombre || nombre.length > 120) {
    return NextResponse.json({ error: "nombre_invalido" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalido" }, { status: 400 });
  }

  // La masterclass (gratis) se valida con una pregunta trivia sobre el
  // contenido en vivo. El curso (pago) se valida contra una compra
  // aprobada de ese mail — no tiene sentido pedir trivia para algo pago.
  let correcta: boolean;
  if (tipo === "curso-bot-ats") {
    const { data: compra } = await supabaseAdmin
      .from("compras")
      .select("id")
      .eq("kind", "course")
      .eq("resource_slug", CERTIFICADO_CURSO_BOT_ATS.resourceSlug)
      .eq("status", "approved")
      .ilike("buyer_email", email)
      .limit(1)
      .maybeSingle();
    correcta = Boolean(compra);
  } else {
    correcta = esRespuestaCorrecta(respuesta);
  }

  const { data, error } = await supabaseAdmin
    .from("certificado_solicitudes")
    .insert({ nombre, email, respuesta_correcta: correcta, tipo })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (!correcta) {
    const mensaje =
      tipo === "curso-bot-ats"
        ? "No encontramos una compra aprobada de este curso con ese mail. Si ya pagaste, escribinos por WhatsApp y lo resolvemos: https://wa.me/5491123912820"
        : "Esa no es la respuesta correcta — ¿la viste en vivo?" +
          (CERTIFICADO_GRABACION_URL
            ? ` Podés mirar la grabación acá: ${CERTIFICADO_GRABACION_URL} y volver a intentar.`
            : " Podés mirar la grabación (el link se comparte por mail) y volver a intentar.");
    return NextResponse.json({ correcta: false, mensaje });
  }

  if (tipo === "masterclass") {
    await syncCertificadoDescargadoEnNotion(nombre, email);
  }

  return NextResponse.json({ correcta: true, id: data.id });
}
