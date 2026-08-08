// Cupones de descuento para cursos. La validación real (nunca confiar en lo
// que mande el cliente) se hace siempre server-side, en /api/checkout y
// /api/manual-purchase.
export type Coupon = {
  code: string;
  percentOff: number;
  description: string;
  activeFrom?: string; // ISO datetime; antes de esto el cupón no es válido
  activeUntil?: string; // ISO datetime; después de esto el cupón no es válido
};

export const COUPONS: Coupon[] = [
  {
    code: "DESCARGA5",
    percentOff: 5,
    description: "5% off en cursos, por descargar un recurso gratis",
  },
  {
    code: "BOT",
    percentOff: 10,
    description:
      "10% off para leads de LinkedIn (post del 7/8) que escriben después del early bird",
    activeFrom: "2026-08-10T00:00:00-03:00",
  },
  {
    code: "MASTERCLASS",
    percentOff: 10,
    description:
      "10% off para inscriptos a la masterclass del 4/8 que escriben después del early bird",
    activeFrom: "2026-08-10T00:00:00-03:00",
  },
];

export function getCoupon(code: string | null | undefined): Coupon | null {
  if (!code) return null;
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return null;
  const now = Date.now();
  if (coupon.activeFrom && now < new Date(coupon.activeFrom).getTime()) return null;
  if (coupon.activeUntil && now > new Date(coupon.activeUntil).getTime()) return null;
  return coupon;
}

export function applyDiscount(amount: number, coupon: Coupon | null): number {
  if (!coupon) return amount;
  return Math.round(amount * (1 - coupon.percentOff / 100));
}
