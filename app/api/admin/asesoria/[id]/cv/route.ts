import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Genera un link firmado temporal para descargar el CV de un pedido (el
// bucket "asesoria-cv" es privado). Protegido igual que el resto de
// /api/admin/asesoria.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { id } = params;
  const { data: pedido } = await supabaseAdmin
    .from("asesoria_pedidos")
    .select("cv_file_path")
    .eq("id", id)
    .single();

  if (!pedido?.cv_file_path) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: signed, error } = await supabaseAdmin.storage
    .from("asesoria-cv")
    .createSignedUrl(pedido.cv_file_path, 60 * 10);

  if (error || !signed) {
    return NextResponse.json({ error: "signing_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
