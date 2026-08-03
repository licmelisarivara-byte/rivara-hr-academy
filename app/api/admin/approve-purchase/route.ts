import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deliverCourseAccess, deliverResource } from "@/lib/deliverPurchase";

// Aprueba a mano una compra pagada por transferencia o Payoneer (sin
// preferencia de Mercado Pago, sin webhook posible) y dispara el mismo mail
// de bienvenida que ya manda el webhook automático de MP, para que ambos
// caminos de pago terminen en exactamente el mismo lugar.
//
// Uso: POST con header "x-admin-secret" = ADMIN_SECRET y body:
//   { "id": "<uuid de la fila en compras>", "amount"?: <monto real confirmado> }
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const { id, amount } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const { data: purchase } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("id", id)
    .single();
  if (!purchase) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (purchase.status === "approved" && purchase.delivered_at) {
    return NextResponse.json({ ok: true, skipped: "already_delivered" });
  }

  const updates: Record<string, unknown> = {
    status: "approved",
    paid_at: purchase.paid_at || new Date().toISOString(),
  };
  if (typeof amount === "number") {
    updates.amount = amount;
  }

  await supabaseAdmin.from("compras").update(updates).eq("id", id);

  if (!purchase.delivered_at && purchase.buyer_email) {
    if (purchase.kind === "course") {
      await deliverCourseAccess(purchase.resource_slug, purchase.buyer_email);
    } else {
      await deliverResource(purchase.resource_slug, purchase.buyer_email);
    }
    await supabaseAdmin
      .from("compras")
      .update({ delivered_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
