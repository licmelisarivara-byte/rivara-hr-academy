import { NextRequest, NextResponse } from "next/server";
import { getCoupon } from "@/lib/coupons";

// Valida un cupón desde el frontend sin exponer nunca la lista completa de
// códigos (lib/coupons.ts es server-only a propósito — ver el comentario
// en ese archivo). Devuelve solo si ESE código puntual es válido y su %,
// nada más.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : null;
  const courseSlug = typeof body?.courseSlug === "string" ? body.courseSlug : undefined;

  const coupon = getCoupon(code, courseSlug);
  if (!coupon) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({ valid: true, code: coupon.code, percentOff: coupon.percentOff });
}
