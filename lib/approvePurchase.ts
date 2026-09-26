import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deliverCourseAccess, deliverResource } from "@/lib/deliverPurchase";

// Aprueba a mano una compra pagada por transferencia o Payoneer (sin
// preferencia de Mercado Pago, sin webhook posible) y dispara el mismo mail
// de bienvenida que ya manda el webhook automático de MP, para que ambos
// caminos de pago terminen en exactamente el mismo lugar. Lo usan
// /api/admin/approve-purchase (con la clave de admin) y
// /api/confirmar-pago (el botón del mail de aviso de transferencia).
//
// Si la fila es parte de un combo (bundle_group_id, ver
// /api/manual-purchase-bundle), aprobar CUALQUIERA de las dos filas
// vinculadas aprueba y entrega las dos — no hace falta llamar dos veces.
// Es idempotente: si ya estaba aprobada y entregada, no reenvía nada.
export async function approvePurchase(id: string, amount?: number) {
  if (!supabaseAdmin) return { error: "not_configured" as const };

  const { data: purchase } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("id", id)
    .single();
  if (!purchase) return { error: "not_found" as const };

  let group = [purchase];
  if (purchase.bundle_group_id) {
    const { data: siblings } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("bundle_group_id", purchase.bundle_group_id)
      .neq("id", id);
    if (siblings) group = [...group, ...siblings];
  }

  const fallidas: string[] = [];
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
      const entregado =
        row.kind === "course"
          ? await deliverCourseAccess(row.resource_slug, row.buyer_email)
          : await deliverResource(row.resource_slug, row.buyer_email);
      // Si falló, NO marcamos delivered_at — así queda visible en la tabla
      // (delivered_at null con status approved) y se puede reintentar
      // llamando de nuevo. deliverPurchase.ts ya le manda un aviso aparte
      // a Melisa cuando esto pasa.
      if (entregado) {
        await supabaseAdmin
          .from("compras")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", row.id);
      } else {
        fallidas.push(row.id);
      }
    }
  }

  return { ok: true as const, processed: group.length, fallidas, purchase };
}
