// Cupones de descuento para cursos. La validación real (nunca confiar en lo
// que mande el cliente) se hace siempre server-side, en /api/checkout y
// /api/manual-purchase.
//
// ⚠️ Este archivo (con la lista completa de códigos) NUNCA se tiene que
// importar desde un componente "use client" — quedaría embebido tal cual
// en el bundle de JS del navegador y cualquiera podría leer los códigos
// inspeccionando la página. El frontend valida cupones a través de
// /api/coupon (ver esa ruta), que solo revela si el código es válido y
// su % — nunca la lista completa. Para aplicar el descuento en el
// cliente una vez ya conocido el %, usar lib/discount.ts en su lugar.
export type Coupon = {
  code: string;
  percentOff: number;
  description: string;
  activeFrom?: string; // ISO datetime; antes de esto el cupón no es válido
  activeUntil?: string; // ISO datetime; después de esto el cupón no es válido
  courses?: string[]; // si está definido, el cupón solo vale para estos slugs de curso (sin definir = todos)
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
  {
    code: "CLAUDE25",
    percentOff: 25,
    description: "25% off de lanzamiento en Claude para Selección, válido 7 días",
    activeUntil: "2026-09-03T23:59:59-03:00",
    courses: ["claude-para-seleccion"],
  },
];

// courseSlug: si se pasa, el cupón solo es válido cuando aplica a ESE curso
// (ver Coupon.courses arriba) — evita que un cupón pensado para un curso
// puntual (ej: CLAUDE25) se cuele en el checkout de otro curso distinto.
export function getCoupon(
  code: string | null | undefined,
  courseSlug?: string
): Coupon | null {
  if (!code) return null;
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return null;
  const now = Date.now();
  if (coupon.activeFrom && now < new Date(coupon.activeFrom).getTime()) return null;
  if (coupon.activeUntil && now > new Date(coupon.activeUntil).getTime()) return null;
  if (coupon.courses && (!courseSlug || !coupon.courses.includes(courseSlug))) return null;
  return coupon;
}
