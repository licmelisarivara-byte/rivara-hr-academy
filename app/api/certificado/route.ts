import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { esRespuestaCorrecta, CERTIFICADO_GRABACION_URL } from "@/lib/certificado";
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

  if (!nombre || nombre.length > 120) {
    return NextResponse.json({ error: "nombre_invalido" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalido" }, { status: 400 });
  }

  const correcta = esRespuestaCorrecta(respuesta);

  const { data, error } = await supabaseAdmin
    .from("certificado_solicitudes")
    .insert({ nombre, email, respuesta_correcta: correcta })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (!correcta) {
    return NextResponse.json({
      correcta: false,
      mensaje:
        "Esa no es la respuesta correcta — ¿la viste en vivo?" +
        (CERTIFICADO_GRABACION_URL
          ? ` Podés mirar la grabación acá: ${CERTIFICADO_GRABACION_URL} y volver a intentar.`
          : " Podés mirar la grabación (el link se comparte por mail) y volver a intentar."),
    });
  }

  await syncCertificadoDescargadoEnNotion(nombre, email);

  return NextResponse.json({ correcta: true, id: data.id });
}
