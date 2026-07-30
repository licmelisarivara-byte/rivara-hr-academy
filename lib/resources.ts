// Recursos gratuitos: lead magnets reales, sin costo.
export type FreeResource = {
  slug: string;
  title: string;
  kind: string;
  description: string;
  fileUrl?: string; // servido desde /public/downloads; vacío si todavía no está subido
};

export const freeResources: FreeResource[] = [
  {
    slug: "kit-5-prompts-esenciales",
    title: "Kit de 5 Prompts Esenciales para Selección",
    kind: "PDF",
    description:
      "Los 5 prompts más usados en el proceso de selección: análisis de CV, aviso de empleo, preguntas STAR, resumen post-entrevista y email al candidato. Material de apoyo del Taller Virtual \"IA para Recruiters\".",
    fileUrl: "/downloads/kit-5-prompts-esenciales.pdf",
  },
  {
    slug: "prompt-maestro-analisis-cv",
    title: "Prompt Maestro: Análisis de CVs con IA",
    kind: "PDF",
    description:
      "El prompt que arma scoring técnico y cultural (0 a 100), banderas rojas y preguntas de entrevista sugeridas a partir de un CV y un puesto. Regalo de RIVARA HR Academy.",
    fileUrl: "/downloads/prompt-maestro-analisis-cv.pdf",
  },
  {
    slug: "busqueda-booleana-linkedin",
    title: "Búsqueda Booleana en LinkedIn",
    kind: "PDF",
    description:
      "5 prompts listos para armar búsquedas booleanas en LinkedIn: búsqueda general, perfiles técnicos/IT, comerciales, RRHH, y una guía de operadores (AND, OR, NOT, X-Ray) con ejemplos.",
    fileUrl: "/downloads/busqueda-booleana-linkedin.pdf",
  },
];

// Ebooks y kits pagos.
// ⚠️ Precios tal como los definiste en la corrección — confirmalos antes de
// activar el cobro real en Mercado Pago (hoy MP_ACCESS_TOKEN no está
// configurado, así que el botón todavía no cobra de verdad).
export type PaidResource = {
  slug: string;
  title: string;
  kind: string;
  description: string;
  priceARS: number;
  priceUSD: number;
  savingsARS?: number;
  isCombo?: boolean;
  fileUrl?: string; // se completa cuando esté subido el PDF final de venta
  fileUrls?: string[]; // para combos: un link por cada PDF incluido
  image?: string; // foto de portada en /public/images, opcional
  mpPaymentLink?: string; // link de pago fijo de Mercado Pago (mientras la API de Checkout Pro esté bloqueada)
  payoneerLink?: string; // link de pago en USD; Payoneer exige mínimo USD 20 por link
};

export const paidResources: PaidResource[] = [
  {
    slug: "kit-12-prompts-seleccion",
    title: "Kit de 12 Prompts para Selección de Personal",
    kind: "PDF",
    description:
      "12 prompts listos para usar en atracción de talento, preselección, entrevistas y post-entrevista. Compatible con Claude, ChatGPT, Gemini, Copilot y NotebookLM.",
    // TEMPORAL: precio bajado a $50 solo para probar el cobro de punta a
    // punta. Volver a 15000 apenas se confirme que la compra de prueba
    // funcionó (avisar si esto sigue acá el día del lanzamiento).
    priceARS: 50,
    priceUSD: 12,
    fileUrl: "/downloads/kit-12-prompts-seleccion.pdf",
    image: "/images/covers/kit-12-prompts.png",
    mpPaymentLink: "https://mpago.la/2jfJB1e",
  },
  {
    slug: "basta-de-filtrar-a-mano",
    title: "Basta de filtrar candidatos a mano",
    kind: "eBook",
    description:
      "Guía práctica de automatización de reclutamiento para PyMEs: qué automatizar, cómo elegir un ATS, plantillas listas para usar y un plan de implementación de 5 semanas.",
    priceARS: 22000,
    priceUSD: 18,
    fileUrl: "/downloads/guia-automatizacion-pymes.pdf",
    image: "/images/covers/guia-pymes.png",
    mpPaymentLink: "https://mpago.la/1eGALVn",
  },
  {
    slug: "combo-kit-y-guia",
    title: "Combo: Kit de 12 Prompts + Guía de Automatización",
    kind: "Combo",
    description: "Llevate los dos recursos juntos y ahorrás.",
    priceARS: 30000,
    priceUSD: 25,
    savingsARS: 7000,
    isCombo: true,
    fileUrls: [
      "/downloads/kit-12-prompts-seleccion.pdf",
      "/downloads/guia-automatizacion-pymes.pdf",
    ],
    image: "/images/covers/combo-kit-guia.png",
    mpPaymentLink: "https://mpago.la/1C4L7zt",
    payoneerLink: "https://link.payoneer.com/Token?t=6EFF423EBE87409CAD8EAD6CC230EC8C&src=pl",
  },
];

export function getPaidResourceBySlug(slug: string) {
  return paidResources.find((r) => r.slug === slug);
}
