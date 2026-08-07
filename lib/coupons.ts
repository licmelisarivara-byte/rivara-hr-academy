// Cupones de descuento para cursos. Hoy solo hay uno, pensado para quien
// descargó un recurso gratis: se le manda por mail como incentivo para dar
// el siguiente paso. La validación real (nunca confiar en lo que mande el
// cliente) se hace siempre server-side, en /api/checkout y /api/manual-purchase.
export type Coupon = {
  code: string;
  percentOff: number;
  description: string;
};

export const COUPONS: Coupon[] = [
  {
    code: "DESCARGA5",
    percentOff: 5,
    description: "5% off en cursos, por descargar un recurso gratis",
  },
];

export function getCoupon(code: string | null | undefined): Coupon | null {
  if (!code) return null;
  return COUPONS.find((c) => c.code === code.trim().toUpperCase()) ?? null;
}

export function applyDiscount(amount: number, coupon: Coupon | null): number {
  if (!coupon) return amount;
  return Math.round(amount * (1 - coupon.percentOff / 100));
}
