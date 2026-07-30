import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Depende de quién llama (el token de auth va en el header), nunca se
// puede compartir una respuesta cacheada entre usuarios distintos.
export const dynamic = "force-dynamic";

// El dashboard llama a esto pasando el access_token de la sesión (Supabase
// auth) en el header Authorization. Acá lo validamos contra Supabase Auth
// y devolvemos solo las compras aprobadas de ESE mail, nunca de otro
// (por eso esto vive en el servidor, con la service role key, y no se
// consulta la tabla `compras` directo desde el browser).
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ purchases: [] });
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

  const { data: purchases } = await supabaseAdmin
    .from("compras")
    .select("kind, resource_slug, title, paid_at")
    .eq("buyer_email", email)
    .eq("status", "approved")
    .order("paid_at", { ascending: false });

  return NextResponse.json({ purchases: purchases ?? [] });
}
