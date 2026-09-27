import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MELISA_EMAIL = "licmelisarivara@gmail.com";
const MAX_CV_BYTES = 4 * 1024 * 1024; // 4MB — límite real de body en funciones serverless de Vercel
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// GET: el formulario post-pago lo llama para saber si el pedido existe, ya
// está pagado, y si ya se completó antes (evita mostrar el formulario de
// nuevo si la compradora vuelve a entrar al link).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { data: pedido } = await supabaseAdmin
    .from("asesoria_pedidos")
    .select(
      "id, pack_title, addon_traduccion, amount, status, buyer_name, buyer_email, buyer_phone, form_submitted_at"
    )
    .eq("id", id)
    .single();

  if (!pedido) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ pedido });
}

// POST: formulario post-pago (multipart/form-data, incluye el archivo del
// CV). Solo se puede completar una vez que el pago quedó confirmado
// (status "paid" en adelante) — si todavía está "pending", el webhook de
// Mercado Pago no llegó o el pago no se acreditó.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { data: pedido } = await supabaseAdmin
    .from("asesoria_pedidos")
    .select("*")
    .eq("id", id)
    .single();

  if (!pedido) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (pedido.status === "pending") {
    return NextResponse.json({ error: "payment_not_confirmed" }, { status: 409 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const buyerName = String(form.get("buyerName") || pedido.buyer_name || "");
  const buyerPhone = String(form.get("buyerPhone") || pedido.buyer_phone || "");
  const linkedinUrl = String(form.get("linkedinUrl") || "");
  const linkedinSinPerfil = form.get("linkedinSinPerfil") === "true";
  const objetivoRubro = String(form.get("objetivoRubro") || "");
  const objetivoEtapa = String(form.get("objetivoEtapa") || "");
  const objetivoNotas = String(form.get("objetivoNotas") || "");
  const cvFile = form.get("cvFile");

  if (!(cvFile instanceof File) || cvFile.size === 0) {
    return NextResponse.json({ error: "missing_cv" }, { status: 400 });
  }
  if (cvFile.size > MAX_CV_BYTES) {
    return NextResponse.json({ error: "cv_too_large" }, { status: 413 });
  }
  if (cvFile.type && !ALLOWED_CV_TYPES.includes(cvFile.type)) {
    return NextResponse.json({ error: "cv_invalid_type" }, { status: 415 });
  }
  if (!linkedinSinPerfil && !linkedinUrl) {
    return NextResponse.json({ error: "missing_linkedin" }, { status: 400 });
  }

  const extension = cvFile.name.split(".").pop() || "pdf";
  const path = `${pedido.id}/${Date.now()}-cv.${extension}`;
  const bytes = new Uint8Array(await cvFile.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("asesoria-cv")
    .upload(path, bytes, {
      contentType: cvFile.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("asesoria cv upload error", uploadError);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  await supabaseAdmin
    .from("asesoria_pedidos")
    .update({
      buyer_name: buyerName || null,
      buyer_phone: buyerPhone || null,
      cv_file_path: path,
      cv_file_name: cvFile.name,
      linkedin_url: linkedinSinPerfil ? null : linkedinUrl,
      linkedin_sin_perfil: linkedinSinPerfil,
      objetivo_rubro: objetivoRubro || null,
      objetivo_etapa: objetivoEtapa || null,
      objetivo_notas: objetivoNotas || null,
      form_submitted_at: new Date().toISOString(),
      status: "en_proceso",
    })
    .eq("id", pedido.id);

  await notifyMelisaFormularioCompleto({
    ...pedido,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    linkedin_url: linkedinSinPerfil ? null : linkedinUrl,
    linkedin_sin_perfil: linkedinSinPerfil,
    objetivo_rubro: objetivoRubro,
    objetivo_etapa: objetivoEtapa,
    objetivo_notas: objetivoNotas,
    cv_file_name: cvFile.name,
    cv_file_path: path,
  });

  return NextResponse.json({ ok: true });
}

async function notifyMelisaFormularioCompleto(pedido: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !supabaseAdmin) return;

  // Link firmado de descarga del CV (el bucket es privado), válido 30 días
  // — tiempo de sobra para armar el material sin tener que volver a pedirlo.
  const { data: signed } = await supabaseAdmin.storage
    .from("asesoria-cv")
    .createSignedUrl(pedido.cv_file_path, 60 * 60 * 24 * 30);

  const packLabel = pedido.addon_traduccion
    ? `${pedido.pack_title} + Traducción al inglés`
    : pedido.pack_title;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RIVARA Consultora <hola@mailhr.rivaraconsultora.com.ar>",
      to: [MELISA_EMAIL],
      subject: `📋 Formulario completo: ${pedido.buyer_name || pedido.buyer_email}`,
      html: `
        <p>Nuevo pedido listo para trabajar — pago confirmado y formulario completo.</p>
        <ul>
          <li><strong>Pack:</strong> ${packLabel}</li>
          <li><strong>Nombre:</strong> ${pedido.buyer_name || "-"}</li>
          <li><strong>Email:</strong> ${pedido.buyer_email || "-"}</li>
          <li><strong>WhatsApp:</strong> ${pedido.buyer_phone || "-"}</li>
          <li><strong>LinkedIn:</strong> ${
            pedido.linkedin_sin_perfil
              ? "No tiene perfil armado todavía"
              : pedido.linkedin_url || "-"
          }</li>
          <li><strong>Rubro / puesto buscado:</strong> ${pedido.objetivo_rubro || "-"}</li>
          <li><strong>Etapa de la búsqueda:</strong> ${pedido.objetivo_etapa || "-"}</li>
          <li><strong>Notas:</strong> ${pedido.objetivo_notas || "-"}</li>
        </ul>
        <p><strong>CV:</strong> ${pedido.cv_file_name}<br/>
        ${signed?.signedUrl ? `<a href="${signed.signedUrl}">Descargar CV →</a>` : "(no se pudo generar el link de descarga, revisar en Supabase Storage)"}
        </p>
        <p>Pedido #${pedido.id}</p>
      `,
    }),
  }).catch(() => {
    // No bloqueamos el guardado si el mail falla.
  });
}
