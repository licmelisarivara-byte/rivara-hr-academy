import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCoupon, applyDiscount } from "@/lib/coupons";

// Registra la intención de compra (curso o recurso pago) por un método
// MANUAL (transferencia o Payoneer): no hay preferencia de Mercado Pago ni
// webhook posible acá, así que la compra queda "pending" hasta que Melisa
// confirme el pago a mano y la marque como aprobada.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { kind, slug, buyerEmail, buyerName, buyerPhone, method, couponCode } = await req.json();
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
  // El cupón solo aplica a cursos, y se valida acá — nunca confiamos en un
  // monto ya descontado que venga del cliente.
  const coupon = kind === "course" ? getCoupon(couponCode) : null;
  const amount = applyDiscount(kind === "course" ? item.priceARS ?? 0 : item.priceARS, coupon);

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
    discount_code: coupon?.code ?? null,
  });

  return NextResponse.json({ ok: true });
}
