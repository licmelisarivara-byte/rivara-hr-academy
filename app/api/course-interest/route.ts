import { NextRequest, NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Registra la intención de compra de un curso por un método MANUAL
// (transferencia o Payoneer): no hay preferencia de Mercado Pago ni
// webhook posible acá, así que la compra queda "pending" hasta que Melisa
// confirme el pago a mano (transferencia recibida / Payoneer acreditado)
// y la marque como aprobada.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { slug, buyerEmail, buyerName, buyerPhone, method } = await req.json();
  if (method !== "transferencia" && method !== "payoneer") {
    return NextResponse.json({ error: "invalid_method" }, { status: 400 });
  }

  const course = getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json({ error: "course_not_found" }, { status: 404 });
  }

  await supabaseAdmin.from("compras").insert({
    kind: "course",
    resource_slug: course.slug,
    title: course.title,
    amount: course.priceARS ?? 0,
    currency: method === "payoneer" ? "USD" : "ARS",
    status: "pending",
    payment_method: method,
    buyer_email: buyerEmail || null,
    buyer_name: buyerName || null,
    buyer_phone: buyerPhone || null,
  });

  return NextResponse.json({ ok: true });
}
