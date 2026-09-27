import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Lista los pedidos de Asesoría de Carrera para la mini pantalla de admin
// (app/admin/asesoria). Protegido con el mismo esquema que
// /api/admin/approve-purchase: header "x-admin-secret" = ADMIN_SECRET.
export async function GET(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { data, error } = await supabaseAdmin
    .from("asesoria_pedidos")
    .select(
      "id, pack_title, addon_traduccion, amount, status, buyer_name, buyer_email, buyer_phone, linkedin_url, linkedin_sin_perfil, objetivo_rubro, objetivo_etapa, objetivo_notas, cv_file_path, cv_file_name, created_at, paid_at, form_submitted_at, delivered_at, scheduled_at, completed_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  return NextResponse.json({ pedidos: data });
}
