import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deliverCourseAccess, deliverResource } from "@/lib/deliverPurchase";

// Aprueba a mano una compra pagada por transferencia o Payoneer (sin
// preferencia de Mercado Pago, sin webhook posible) y dispara el mismo mail
// de bienvenida que ya manda el webhook automático de MP, para que ambos
// caminos de pago terminen en exactamente el mismo lugar.
//
// Si la fila es parte de un combo (bundle_group_id, ver
// /api/manual-purchase-bundle), aprobar CUALQUIERA de las dos filas
// vinculadas aprueba y entrega las dos — no hace falta llamar dos veces.
//
// Uso: POST con header "x-admin-secret" = ADMIN_SECRET y body:
//   { "id": "<uuid de la fila en compras>", "amount"?: <monto real confirmado, solo para esa fila> }
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

  let group = [purchase];
  if (purchase.bundle_group_id) {
    const { data: siblings } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("bundle_group_id", purchase.bundle_group_id)
      .neq("id", id);
    if (siblings) group = [...group, ...siblings];
  }

  for (const row of group) {
    if (row.status === "approved" && row.delivered_at) continue;

    const updates: Record<string, unknown> = {
      status: "approved",
      paid_at: row.paid_at || new Date().toISOString(),
    };
    if (row.id === id && typeof amount === "number") {
      updates.amount = amount;
    }
    await supabaseAdmin.from("compras").update(updates).eq("id", row.id);

    if (!row.delivered_at && row.buyer_email) {
      if (row.kind === "course") {
        await deliverCourseAccess(row.resource_slug, row.buyer_email);
      } else {
        await deliverResource(row.resource_slug, row.buyer_email);
      }
      await supabaseAdmin
        .from("compras")
        .update({ delivered_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }

  return NextResponse.json({ ok: true, processed: group.length });
}
