import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Depende de quién llama (el token de auth va en el header), nunca se
// puede compartir una respuesta cacheada entre usuarios distintos.
export const dynamic = "force-dynamic";

// Mismo patrón que /api/mis-compras: el dashboard antes solo sabía qué
// certificados ya se habían generado mirando localStorage (por
// navegador/dispositivo) — si la alumna entraba desde otro dispositivo no
// los veía, aunque ya existieran. Acá se devuelven, por tipo, los
// certificados APROBADOS de ESE mail (nunca de otro, por eso vive en el
// servidor con la service role key).
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ certificados: {} });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  const email = userData?.user?.email;
  if (userError || !email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: filas } = await supabaseAdmin
    .from("certificado_solicitudes")
    .select("id, nombre, tipo, created_at")
    .ilike("email", email)
    .eq("respuesta_correcta", true)
    .order("created_at", { ascending: true });

  // Si hay más de uno del mismo tipo (pidió el certificado más de una
  // vez), nos quedamos con el más reciente — mismo criterio que ya usa
  // /api/certificado al no duplicar filas.
  const certificados: Record<string, { id: string; nombre: string }> = {};
  for (const fila of filas ?? []) {
    certificados[fila.tipo] = { id: fila.id, nombre: fila.nombre };
  }

  return NextResponse.json({ certificados });
}
