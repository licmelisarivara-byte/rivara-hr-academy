import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug, getTransferenciaAmountARS, getPayoneerAmountUSD } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCoupon } from "@/lib/coupons";
import { applyDiscount } from "@/lib/discount";

// Igual que /api/manual-purchase, pero para el combo curso + recurso pago
// (15% adicional sobre la suma de ambos, solo transferencia/Payoneer). Se
// insertan DOS filas en `compras` (una "course", una "resource") que
// comparten `bundle_group_id`, para no tener que agregar un tercer valor
// de `kind` ni tocar el resto del sistema (dashboard, entrega, etc.) — ver
// app/api/admin/approve-purchase/route.ts, que aprueba y entrega las dos
// filas juntas cuando comparten ese id.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { courseSlug, resourceSlug, buyerEmail, buyerName, buyerPhone, method, couponCode } =
    await req.json();
  if (method !== "transferencia" && method !== "payoneer") {
    return NextResponse.json({ error: "invalid_method" }, { status: 400 });
  }

  const course = getCourseBySlug(courseSlug);
  const resource = getPaidResourceBySlug(resourceSlug);
  if (!course || !resource) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const coupon = getCoupon(couponCode, { courseSlug: course.slug });
  const courseAmount =
    method === "payoneer"
      ? applyDiscount(getPayoneerAmountUSD(course), coupon?.percentOff)
      : applyDiscount(getTransferenciaAmountARS(course), coupon?.percentOff);
  const resourceAmount =
    method === "payoneer"
      ? resource.priceUSD
      : resource.priceARSTransferencia ?? resource.priceARS;

  // 15% adicional por llevar los dos juntos — permanente, sin fecha de
  // vencimiento (a diferencia del cupón del curso, que sí puede vencer).
  const bundleCourseAmount = applyDiscount(courseAmount, 15);
  const bundleResourceAmount = applyDiscount(resourceAmount, 15);

  const currency = method === "payoneer" ? "USD" : "ARS";
  const bundleGroupId = crypto.randomUUID();

  await supabaseAdmin.from("compras").insert([
    {
      kind: "course",
      resource_slug: course.slug,
      title: `${course.title} (combo)`,
      amount: bundleCourseAmount,
      currency,
      status: "pending",
      payment_method: method,
      buyer_email: buyerEmail || null,
      buyer_name: buyerName || null,
      buyer_phone: buyerPhone || null,
      discount_code: coupon?.code ?? null,
      bundle_group_id: bundleGroupId,
    },
    {
      kind: "resource",
      resource_slug: resource.slug,
      title: `${resource.title} (combo)`,
      amount: bundleResourceAmount,
      currency,
      status: "pending",
      payment_method: method,
      buyer_email: buyerEmail || null,
      buyer_name: buyerName || null,
      buyer_phone: buyerPhone || null,
      discount_code: coupon?.code ?? null,
      bundle_group_id: bundleGroupId,
    },
  ]);

  return NextResponse.json({ ok: true });
}
