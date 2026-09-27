import { NextRequest, NextResponse } from "next/server";
import { processAsesoriaMpPayment } from "@/lib/asesoriaPayments";

// Endpoint temporal para probar los mails de "pago confirmado" (a la
// compradora + copia a Melisa) sin necesidad de una compra real en
// Mercado Pago. Simula un pago "approved" para un pedido ya existente,
// reusando exactamente el mismo código que corre el webhook real.
// Se borra apenas termine la prueba — no queda en producción.
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { pedidoId } = await req.json();
  if (!pedidoId) {
    return NextResponse.json({ error: "missing_pedido_id" }, { status: 400 });
  }

  const result = await processAsesoriaMpPayment({
    id: `TEST-${Date.now()}`,
    external_reference: pedidoId,
    status: "approved",
  });

  return NextResponse.json({ result });
}
