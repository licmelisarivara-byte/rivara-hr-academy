import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Registra cada descarga de un recurso gratuito, para poder contarlas en
// el reporte diario (a diferencia de compras/eventos, acá no hay "alta"
// explícita: es solo un log de fire-and-forget disparado al descargar).
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { resourceSlug, buyerEmail } = await req.json();
  if (!resourceSlug) {
    return NextResponse.json({ error: "missing_resource_slug" }, { status: 400 });
  }

  await supabaseAdmin.from("descargas_gratuitas").insert({
    resource_slug: resourceSlug,
    buyer_email: buyerEmail || null,
  });

  return NextResponse.json({ ok: true });
}
