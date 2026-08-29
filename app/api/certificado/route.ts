import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  esRespuestaCorrecta,
  CERTIFICADO_GRABACION_URL,
  CERTIFICADO_CURSO_BOT_ATS,
  CERTIFICADO_CLAUDE_SELECCION,
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
  const tipo =
    body?.tipo === "curso-bot-ats" || body?.tipo === "claude-seleccion"
      ? body.tipo
      : "masterclass";

  if (!nombre || nombre.length > 120) {
    return NextResponse.json({ error: "nombre_invalido" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalido" }, { status: 400 });
  }

  // Evita duplicar filas si el certificado ya se generó antes para ese
  // mail (por ejemplo, el disparo automático al terminar el video del
  // Módulo 6 podría llegar a pegar dos veces). Si ya existe uno aprobado,
  // devolvemos el mismo id en vez de crear uno nuevo — pero actualizamos
  // el nombre al recién enviado, así no queda congelado el que se haya
  // cargado la primera vez (por ejemplo un nombre de prueba, o uno viejo
  // de antes de que existiera "Permitir editar el nombre desde Mi cuenta").
  const { data: existente } = await supabaseAdmin
    .from("certificado_solicitudes")
    .select("id, nombre")
    .eq("tipo", tipo)
    .ilike("email", email)
    .eq("respuesta_correcta", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existente) {
    if (existente.nombre !== nombre) {
      await supabaseAdmin
        .from("certificado_solicitudes")
        .update({ nombre })
        .eq("id", existente.id);
    }
    return NextResponse.json({ correcta: true, id: existente.id });
  }

  // La masterclass (gratis) se valida con una pregunta trivia sobre el
  // contenido en vivo. Los cursos pagos se validan contra una compra
  // aprobada de ese mail — no tiene sentido pedir trivia para algo pago.
  const resourceSlugPorTipo: Record<string, string> = {
    "curso-bot-ats": CERTIFICADO_CURSO_BOT_ATS.resourceSlug,
    "claude-seleccion": CERTIFICADO_CLAUDE_SELECCION.resourceSlug,
  };

  let correcta: boolean;
  if (resourceSlugPorTipo[tipo]) {
    const { data: compra } = await supabaseAdmin
      .from("compras")
      .select("id")
      .eq("kind", "course")
      .eq("resource_slug", resourceSlugPorTipo[tipo])
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
    const mensaje = resourceSlugPorTipo[tipo]
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
