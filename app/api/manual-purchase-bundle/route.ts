import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug, getTransferenciaAmountARS, getPayoneerAmountUSD } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCoupon } from "@/lib/coupons";
import { applyDiscount } from "@/lib/discount";

// Igual que /api/manual-purchase, pero para el combo curso + recurso pago:
// el curso se cobra tal cual (con cupón si corresponde — nunca por
// Mercado Pago, que no acepta cupones — sin descontarlo una segunda vez)
// y al recurso se le aplica un % sobre su precio de lista, en reemplazo
// de su 10% individual (no se acumulan): 15% por transferencia/Payoneer,
// 5% por Mercado Pago (más chico porque ahí el curso no tiene ningún
// descuento). Se insertan DOS filas en `compras` (una "course", una
// "resource") que comparten `bundle_group_id`, para no tener que agregar
// un tercer valor de `kind` ni tocar el resto del sistema (dashboard,
// entrega, etc.) — ver app/api/admin/approve-purchase/route.ts, que
// aprueba y entrega las dos filas juntas cuando comparten ese id.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { courseSlug, resourceSlug, buyerEmail, buyerName, buyerPhone, method, couponCode } =
    await req.json();
  if (method !== "transferencia" && method !== "payoneer" && method !== "mercadopago") {
    return NextResponse.json({ error: "invalid_method" }, { status: 400 });
  }

  const course = getCourseBySlug(courseSlug);
  const resource = getPaidResourceBySlug(resourceSlug);
  if (!course || !resource) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // El cupón solo aplica por transferencia — Mercado Pago nunca tuvo
  // descuento, y los links de Payoneer de combo son de monto fijo (no se
  // les puede aplicar un % dinámicamente sin armar un link nuevo por cada
  // combinación cupón × combo).
  const coupon = method !== "transferencia" ? null : getCoupon(couponCode, { courseSlug: course.slug });
  const courseAmount =
    method === "payoneer"
      ? getPayoneerAmountUSD(course)
      : method === "mercadopago"
      ? course.priceARS ?? 0
      : applyDiscount(getTransferenciaAmountARS(course), coupon?.percentOff);
  // Precio de LISTA del recurso (no el de transferencia individual): el
  // % del combo reemplaza ese 10%, no se suma a él.
  const resourceAmount = method === "payoneer" ? resource.priceUSD : resource.priceARS;
  const addonDiscountPercent = method === "mercadopago" ? 5 : 15;

  // El curso no se toca — se suma tal cual (con cupón si corresponde).
  // Solo el recurso se descuenta un % adicional, permanente, sin fecha
  // de vencimiento (a diferencia del cupón del curso, que sí puede
  // vencer).
  const bundleCourseAmount = courseAmount;
  const bundleResourceAmount = applyDiscount(resourceAmount, addonDiscountPercent);

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
