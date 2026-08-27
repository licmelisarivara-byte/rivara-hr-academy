import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug, getTransferenciaAmountARS, getPayoneerAmountUSD } from "@/lib/courses";
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

  // Monto real según el método (antes acá siempre se usaba el precio de
  // Mercado Pago sin descuento, aunque fuera transferencia o Payoneer en
  // pleno early bird). El cupón aplica a transferencia y Payoneer por igual
  // — Mercado Pago sigue siempre sin descuento (link/preferencia a precio
  // de lista), a propósito.
  const coupon =
    kind === "course" ? getCoupon(couponCode, (item as ReturnType<typeof getCourseBySlug>)!.slug) : null;
  let amount: number;
  if (kind === "course") {
    const course = item as ReturnType<typeof getCourseBySlug>;
    amount =
      method === "payoneer"
        ? applyDiscount(getPayoneerAmountUSD(course!), coupon)
        : applyDiscount(getTransferenciaAmountARS(course!), coupon);
  } else {
    const resource = item as ReturnType<typeof getPaidResourceBySlug>;
    amount = method === "payoneer" ? resource!.priceUSD : resource!.priceARS;
  }

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
