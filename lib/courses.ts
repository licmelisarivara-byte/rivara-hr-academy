export type PaymentOption = { method: string; price: string; note?: string };
export type BankDetails = { holder: string; cbu: string; alias: string; cuil: string };
export type FAQ = { q: string; a: string };

export type Course = {
  slug: string;
  title: string;
  format: "En vivo" | "Grabado";
  tagline: string;
  description: string;
  modules: { title: string; items: string[] }[];
  outcomes?: string[];
  price: string; // texto mostrado en pantalla
  priceARS?: number; // monto real que se cobra por Mercado Pago
  priceNote?: string;
  paymentOptions?: PaymentOption[];
  bankDetails?: BankDetails;
  faqs?: FAQ[];
  schedule?: string;
  externalCheckout?: string; // e.g. link to Hotmart if it's sold there
  freePreviewVideoId?: string; // YouTube ID, unlisted is fine
};

// ⚠️ Contenido real tomado de lo que Melisa definió. Los precios en ARS son
// placeholders — reemplazar antes de publicar. No inventar datos nuevos acá.
export const courses: Course[] = [
  {
    slug: "de-cero-a-tu-asistente",
    title: "Creá tu propio Bot de Selección + ATS con IA",
    format: "En vivo",
    tagline:
      "En 2 clases en vivo armás tu asistente de selección con IA y publicás tu propio ATS, sin perfil técnico.",
    description:
      "Curso en vivo de dos clases donde armamos, paso a paso, un asistente de selección con Claude, un bot conectado con Botpress, y un ATS propio con IA publicado en Lovable. Pensado para recruiters y profesionales de RRHH sin perfil técnico que quieren dejar de filtrar CVs a mano.",
    modules: [
      {
        title: "Módulo 1 (11 de agosto) — Tu asistente de selección con IA",
        items: [
          "Introducción a Claude y sus ventajas frente a otras IAs",
          "Manejo de tokens y límites de uso",
          "Armado paso a paso de tu asistente de selección",
          "Prompt maestro de análisis de CV",
          "Introducción a Botpress",
        ],
      },
      {
        title: "Módulo 2 (18 de agosto) — Tu propio ATS con IA",
        items: [
          "Precios de las plataformas (Botpress y Lovable)",
          "Diseño de tu ATS en Claude",
          "Deploy del ATS en Lovable",
          "Pipeline de candidatos tipo Kanban",
          "Publicación del ATS recibiendo postulantes reales",
        ],
      },
    ],
    outcomes: [
      "Tu asistente de selección con IA, configurado con tu propio contexto",
      "Análisis de CVs en segundos, con scoring y recomendación automática",
      "Tu propio ATS publicado, con pipeline Kanban y formulario de postulación",
      "Prompts maestros para entrevistas y preguntas STAR",
      "Criterios de privacidad y mitigación de sesgos",
      "Grabación incluida de las dos clases",
      "Certificado de asistencia",
    ],
    price: "$45.000 ARS",
    priceARS: 60000,
    priceNote:
      "🔥 $45.000 ARS por transferencia o USD 30 por Payoneer, antes del 9/8 · Por Mercado Pago: $60.000 ARS (sin descuento)",
    paymentOptions: [
      {
        method: "Transferencia bancaria",
        price: "$45.000 ARS",
        note: "Antes del 9/8 (después $60.000)",
      },
      {
        method: "Payoneer",
        price: "USD 30",
        note: "Antes del 9/8 (después USD 40)",
      },
      {
        method: "Mercado Pago",
        price: "$60.000 ARS",
        note: "Pago online inmediato, sin descuento",
      },
    ],
    bankDetails: {
      holder: "RIVARA MELISA",
      cbu: "0170111740000003078211",
      alias: "MELISA.RIVARA",
      cuil: "27-37993190-7",
    },
    faqs: [
      {
        q: "¿Necesito conocimientos técnicos?",
        a: "No. El curso está diseñado para recruiters y profesionales de RRHH sin perfil técnico.",
      },
      {
        q: "¿Las herramientas que usamos son pagas?",
        a: "No para empezar. Claude y Lovable tienen plan gratuito.",
      },
      {
        q: "¿Qué pasa si no puedo ir en vivo a alguna clase?",
        a: "Las dos clases quedan grabadas, así que podés verlas después. Igual se recomienda asistir en vivo para practicar en el momento.",
      },
    ],
    schedule:
      "Martes 11 y martes 18 de agosto · 17 a 18:30 hs (ARG) · por Google Meet · incluye grabación y certificado de asistencia",
  },
  {
    slug: "claude-para-seleccion",
    title: "Claude para Selección",
    format: "Grabado",
    tagline:
      "6 módulos grabados para incorporar Claude a tu día a día de selección, a tu ritmo.",
    description:
      "Curso grabado de 6 módulos (~2.5 horas en total) para aprender a usar Claude en cada etapa del proceso de selección: desde el análisis de CVs hasta el informe ejecutivo post-entrevista.",
    modules: [
      { title: "Módulo 1", items: ["Fundamentos: cómo piensa Claude y cómo escribirle bien"] },
      { title: "Módulo 2", items: ["Análisis de CVs con el prompt maestro"] },
      { title: "Módulo 3", items: ["Preguntas STAR y guías de entrevista"] },
      { title: "Módulo 4", items: ["Comparar candidatos y armar la terna"] },
      { title: "Módulo 5", items: ["Informes ejecutivos y comunicación con el cliente"] },
      { title: "Módulo 6", items: ["Armar tu propio Proyecto de Claude para no repetir el prompt cada vez"] },
    ],
    price: "USD 47 (early access) / USD 67 (regular)",
    externalCheckout: "https://hotmart.com", // TODO: reemplazar por el link real de Hotmart cuando esté publicado
  },
];

export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug);
}
