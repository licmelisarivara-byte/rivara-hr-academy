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
  excludeCourses?: string[]; // el cupón NO vale para estos slugs de curso (ej: para que no se acumule con un early bird propio)
  resources?: string[]; // si está definido, el cupón solo vale para estos slugs de recurso pago (sin definir = todos)
};

export const COUPONS: Coupon[] = [
  {
    code: "DESCARGA5",
    percentOff: 5,
    description: "5% off en cursos o recursos pagos, por descargar un recurso gratis",
  },
  {
    code: "BOT",
    percentOff: 10,
    description:
      "10% off para leads de LinkedIn (post del 7/8) que escriben después del early bird",
    activeFrom: "2026-08-10T00:00:00-03:00",
    // La 3ra edición del curso Bot + ATS ya tiene su propio early bird
    // ($72.000 por transferencia hasta el 7/10): este 10% se sumaría encima.
    excludeCourses: ["de-cero-a-tu-asistente-3ra-edicion"],
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
    description:
      "25% off de lanzamiento en Claude para Selección — extendido hasta mediados de septiembre porque la primera semana no se pudo difundir mucho",
    activeUntil: "2026-09-20T23:59:59-03:00",
    courses: ["claude-para-seleccion"],
  },
  {
    code: "COMUNIDAD25",
    percentOff: 25,
    description: "25% off en Claude para Selección para una comunidad externa aliada",
    activeUntil: "2026-09-20T23:59:59-03:00",
    courses: ["claude-para-seleccion"],
  },
  {
    code: "COMUNIDAD10",
    percentOff: 10,
    description: "10% off en Claude para Selección para una comunidad externa aliada",
    activeUntil: "2026-09-20T23:59:59-03:00",
    courses: ["claude-para-seleccion"],
  },
  {
    // BOT al 25% solo para la 3ra edición del curso Bot + ATS. Arranca el
    // 8/10, cuando termina el early bird: sobre el precio de lista
    // ($96.000) da $72.000, igual que el early bird. Antes del 8/10 no
    // aplica para que no se acumule con el early bird. (El BOT de 10% de
    // arriba excluye este curso.)
    code: "BOT",
    percentOff: 25,
    description:
      "25% off en la 3ra edición del curso Bot + ATS, desde que termina el early bird (8/10)",
    activeFrom: "2026-10-08T00:00:00-03:00",
    courses: ["de-cero-a-tu-asistente-3ra-edicion"],
  },
];

// courseSlug/resourceSlug: si se pasa uno, el cupón solo es válido cuando
// aplica a ESE curso/recurso (ver Coupon.courses/resources arriba) — evita
// que un cupón pensado para un curso puntual (ej: CLAUDE25) se cuele en el
// checkout de otro curso, o de un recurso pago, distinto.
export function getCoupon(
  code: string | null | undefined,
  target?: { courseSlug?: string; resourceSlug?: string }
): Coupon | null {
  if (!code) return null;
  const now = Date.now();
  const courseSlug = target?.courseSlug;
  const resourceSlug = target?.resourceSlug;
  // Un mismo código puede tener más de una entrada con distinto alcance
  // (ej: BOT vale 10% en general y 25% en la 3ra edición del curso Bot +
  // ATS): se devuelve la primera que aplica a este curso/recurso y fecha.
  const candidatos = COUPONS.filter((c) => c.code === code.trim().toUpperCase());
  for (const coupon of candidatos) {
    if (coupon.activeFrom && now < new Date(coupon.activeFrom).getTime()) continue;
    if (coupon.activeUntil && now > new Date(coupon.activeUntil).getTime()) continue;
    if (coupon.courses && (!courseSlug || !coupon.courses.includes(courseSlug))) continue;
    if (courseSlug && coupon.excludeCourses?.includes(courseSlug)) continue;
    if (coupon.resources && (!resourceSlug || !coupon.resources.includes(resourceSlug))) continue;
    return coupon;
  }
  return null;
}
