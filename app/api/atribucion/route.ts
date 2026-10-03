import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Guarda de qué anuncio/campaña vino una persona que se registró o dejó sus
// datos (UTM + página de entrada), en una tabla aparte de `compras` para no
// tocar el flujo de pago. Se cruza con compras/usuarios por email.
// Es un endpoint público: se recorta y valida todo lo que llega.
function limpiar(valor: unknown, max = 200): string | null {
  if (typeof valor !== "string") return null;
  const v = valor.trim();
  return v ? v.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false }, { status: 501 });
  }

  const body = await req.json().catch(() => null);
  const email = limpiar(body?.email, 254)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("atribuciones").insert({
    email,
    evento: limpiar(body?.evento, 60) ?? "desconocido",
    curso_slug: limpiar(body?.curso_slug, 100),
    utm_source: limpiar(body?.utm_source),
    utm_medium: limpiar(body?.utm_medium),
    utm_campaign: limpiar(body?.utm_campaign),
    utm_content: limpiar(body?.utm_content),
    landing_path: limpiar(body?.landing_path, 300),
  });

  return NextResponse.json({ ok: !error });
}
