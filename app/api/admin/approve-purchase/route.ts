import { NextRequest, NextResponse } from "next/server";
import { approvePurchase } from "@/lib/approvePurchase";

// Aprueba a mano una compra pagada por transferencia o Payoneer y dispara
// el mail de bienvenida (ver lib/approvePurchase). También sirve para
// reintentar una entrega que falló.
//
// Uso: POST con header "x-admin-secret" = ADMIN_SECRET y body:
//   { "id": "<uuid de la fila en compras>", "amount"?: <monto real confirmado, solo para esa fila> }
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id, amount } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const result = await approvePurchase(id, amount);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "not_found" ? 404 : 501 }
    );
  }
  return NextResponse.json({ ok: true, processed: result.processed, fallidas: result.fallidas });
}
