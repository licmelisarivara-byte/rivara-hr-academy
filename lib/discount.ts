// Aplica un % de descuento a un monto. Vive separado de lib/coupons.ts a
// propósito: éste sí se importa desde componentes "use client" (para
// mostrar el precio ya con el descuento aplicado), y no tiene que traer
// consigo la lista de códigos de cupón válidos al bundle del navegador —
// ver components/CoursePaymentActions.tsx y app/api/coupon/route.ts.
export function applyDiscount(amount: number, percentOff: number | null | undefined): number {
  if (!percentOff) return amount;
  return Math.round(amount * (1 - percentOff / 100));
}
