import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug, getTransferenciaAmountARS, getPayoneerAmountUSD, type Course } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCoupon } from "@/lib/coupons";
import { applyDiscount } from "@/lib/discount";

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
  // pleno early bird/con el descuento permanente de los recursos). El
  // cupón solo aplica por transferencia — los links de Payoneer son de
  // monto fijo, así que no se les puede aplicar un % dinámicamente sin
  // armar un link nuevo por cada combinación cupón × producto (ver
  // components/CoursePaymentActions.tsx). Mercado Pago sigue siempre sin
  // descuento, a propósito.
  const coupon =
    method !== "transferencia"
      ? null
      : kind === "course"
      ? getCoupon(couponCode, { courseSlug: item.slug })
      : getCoupon(couponCode, { resourceSlug: item.slug });
  let amount: number;
  if (kind === "course") {
    const course = item as Course;
    amount =
      method === "payoneer"
        ? getPayoneerAmountUSD(course)
        : applyDiscount(getTransferenciaAmountARS(course), coupon?.percentOff);
  } else {
    const resource = item as ReturnType<typeof getPaidResourceBySlug>;
    amount =
      method === "payoneer"
        ? resource!.priceUSD
        : applyDiscount(resource!.priceARSTransferencia ?? resource!.priceARS, coupon?.percentOff);
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
