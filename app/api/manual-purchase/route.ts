import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Registra la intención de compra (curso o recurso pago) por un método
// MANUAL (transferencia o Payoneer): no hay preferencia de Mercado Pago ni
// webhook posible acá, así que la compra queda "pending" hasta que Melisa
// confirme el pago a mano y la marque como aprobada.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { kind, slug, buyerEmail, buyerName, buyerPhone, method } = await req.json();
  if (method !== "transferencia" && method !== "payoneer") {
    return NextResponse.json({ error: "invalid_method" }, { status: 400 });
  }
  if (kind !== "course" && kind !== "resource") {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }

  const item = kind === "course" ? getCourseBySlug(slug) : getPaidResourceBySlug(slug);
  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const amount = kind === "course" ? item.priceARS ?? 0 : item.priceARS;

  await supabaseAdmin.from("compras").insert({
    kind,
    resource_slug: item.slug,
    title: item.title,
    amount,
    currency: method === "payoneer" ? "USD" : "ARS",
    status: "pending",
    payment_method: method,
    buyer_email: buyerEmail || null,
    buyer_name: buyerName || null,
    buyer_phone: buyerPhone || null,
  });

  return NextResponse.json({ ok: true });
}
