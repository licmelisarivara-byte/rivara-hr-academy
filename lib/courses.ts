import { bankDetails } from "@/lib/bankDetails";

export type PaymentOption = { method: string; price: string; note?: string };
export type BankDetails = { holder: string; cbu: string; alias: string; cuil: string };
export type FAQ = { q: string; a: string };

export type Course = {
  slug: string;
  title: string;
  format: "En vivo" | "Grabado";
  tagline: string;
  description: string;
  modules: {
    title: string;
    benefit?: string; // título en clave de beneficio, mostrado arriba de `title` en la página del curso (ver app/(academy)/cursos/[slug]/page.tsx)
    icon?: string; // emoji simple mostrado junto al título en el acordeón de contenido, elegido según el tema real del módulo
    items: string[];
    takeaways?: string[]; // bullets de "Lo que te llevás", extraídos tal cual del guión real — no resumir
    recordingVideoId?: string; // YouTube ID no listado de la grabación de esa clase, se completa después de dictarla
    recordingStartSeconds?: number; // si el módulo arranca a mitad de un video compartido con otro módulo (ej: el cierre del módulo anterior queda al principio)
    materials?: { title: string; url: string }[]; // PDFs y otros materiales de ESTA clase puntual, se muestran debajo de su video en el dashboard
    triggersCertificate?: boolean; // al terminar este video se genera el certificado del curso automáticamente (ver components/ModuleVideoPlayer.tsx)
  }[];
  image?: string; // portada en /public/images
  outcomes?: string[];
  pageH1?: string; // texto del <h1> en la página del curso, si difiere de `title` (que se usa en otros lugares: card de home, WhatsApp, etc.)
  seoTitle?: string; // title tag de la página del curso, si difiere de `title`
  seoDescription?: string; // meta description de la página del curso, si difiere de `description`
  price: string; // texto mostrado en pantalla
  priceARS?: number; // monto real que se cobra por Mercado Pago (nunca tiene descuento)
  priceNote?: string;
  earlyBirdUntil?: string; // ISO datetime; hasta acá rige el precio early bird de transferencia/Payoneer
  priceARSEarlyBird?: number; // monto real de transferencia antes de earlyBirdUntil
  priceARSRegular?: number; // monto real de transferencia después de earlyBirdUntil
  priceUSDEarlyBird?: number; // monto real de Payoneer antes de earlyBirdUntil
  priceUSDRegular?: number; // monto real de Payoneer después de earlyBirdUntil
  paymentOptions?: PaymentOption[];
  bankDetails?: BankDetails;
  faqs?: FAQ[];
  schedule?: string;
  externalCheckout?: string; // e.g. link to Hotmart if it's sold there
  mpPaymentLink?: string; // link de pago fijo de Mercado Pago (mientras la API de Checkout Pro esté bloqueada)
  payoneerLink?: string; // link de pago en USD para quien elige Payoneer
  comingSoon?: boolean; // todavía no se vende; muestra "Próximamente" en vez de un botón de compra
  freePreviewVideoId?: string; // YouTube ID, unlisted is fine
  meetLink?: string; // link de Google Meet del curso en vivo, se muestra solo a quien ya se inscribió
  checklistUrl?: string; // checklist final del curso, se muestra debajo de todos los módulos
  certificadoUrl?: string; // página para pedir el certificado de este curso, se muestra en el dashboard
  certificadoTipo?: string; // "tipo" que se manda a /api/certificado (curso-bot-ats, claude-seleccion, etc.)
  whatsappGroupLink?: string; // link de invitación al grupo de WhatsApp del curso
};

// ⚠️ Contenido real tomado de lo que Melisa definió. Los precios en ARS son
// placeholders — reemplazar antes de publicar. No inventar datos nuevos acá.
export const courses: Course[] = [
  {
    slug: "de-cero-a-tu-asistente",
    title: "Creá tu propio Bot de Selección + ATS con IA",
    format: "Grabado",
    image: "/images/covers/curso-bot-seleccion.png",
    tagline:
      "En 2 clases en vivo armás tu asistente de selección con IA y publicás tu propio ATS, sin perfil técnico.",
    description:
      "Curso en vivo de dos clases donde armamos, paso a paso, un asistente de selección con Claude, un bot conectado con Botpress, y un ATS propio con IA publicado en Lovable. Pensado para recruiters y profesionales de RRHH sin perfil técnico que quieren dejar de filtrar CVs a mano.",
    modules: [
      {
        title: "Módulo 1 (11 de agosto) — Tu asistente de selección con IA",
        icon: "🤖",
        items: [
          "Introducción a Claude y sus ventajas frente a otras IAs",
          "Manejo de tokens y límites de uso",
          "Armado paso a paso de tu asistente de selección",
          "Prompt maestro de análisis de CV",
          "Introducción a Botpress",
        ],
        recordingVideoId: "_MtS9SPQ8vk",
        materials: [
          {
            title: "Resumen Clase 1",
            url: "/downloads/resumen-clase1-bot-seleccion.pdf",
          },
          {
            title: "Slides Clase 1",
            url: "/downloads/slides-clase1-bot-seleccion.pdf",
          },
          {
            title: "Ejemplo de CV y puesto",
            url: "/downloads/ejemplo-cv-puesto-clase1.pdf",
          },
        ],
      },
      {
        title: "Módulo 2 (18 de agosto) — Tu propio ATS con IA",
        icon: "🗂️",
        items: [
          "Precios de las plataformas (Botpress y Lovable)",
          "Diseño de tu ATS en Claude",
          "Deploy del ATS en Lovable",
          "Pipeline de candidatos tipo Kanban",
          "Publicación del ATS recibiendo postulantes reales",
        ],
        recordingVideoId: "mCt_krEKdAI",
        materials: [
          {
            title: "Resumen Clase 2",
            url: "/downloads/resumen-clase2-rivara.pdf",
          },
          {
            title: "Slides Clase 2",
            url: "/downloads/slides-clase2-ats.pdf",
          },
          {
            title: "CV de ejemplo (Martín Sosa)",
            url: "/downloads/cv-ejemplo-martin-sosa.pdf",
          },
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
    price: "Próximamente",
    comingSoon: true,
    priceARS: 60000,
    priceNote: "$60.000 ARS por transferencia · USD 40 por Payoneer · $60.000 ARS por Mercado Pago",
    earlyBirdUntil: "2026-08-09T23:59:59-03:00",
    priceARSEarlyBird: 45000,
    priceARSRegular: 60000,
    priceUSDEarlyBird: 30,
    priceUSDRegular: 40,
    paymentOptions: [
      {
        method: "Transferencia bancaria",
        price: "$60.000 ARS",
      },
      {
        method: "Payoneer",
        price: "USD 40",
      },
      {
        method: "Mercado Pago",
        price: "$60.000 ARS",
        note: "Pago online inmediato, sin descuento",
      },
    ],
    bankDetails,
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
    mpPaymentLink: "https://mpago.la/1urEhEV",
    payoneerLink: "https://link.payoneer.com/Token?t=55DF705DCE7144E59B7DAB4C198ACDB1&src=tpl",
    meetLink: "https://meet.google.com/ezw-ueie-xzd",
    checklistUrl:
      "https://noble-shawl-f26.notion.site/Tu-checklist-para-armar-tu-asistente-de-selecci-n-3ae5c6b67016816ead9ad4c5fb17d5a6",
    certificadoUrl: "/cursos/de-cero-a-tu-asistente/certificado",
    certificadoTipo: "curso-bot-ats",
  },
  {
    slug: "claude-para-seleccion",
    title: "Claude para Selección",
    format: "Grabado",
    image: "/images/covers/curso-claude-seleccion.svg",
    tagline:
      "6 módulos + 1 bonus grabados para incorporar Claude a tu día a día de selección, a tu ritmo.",
    description:
      "Curso grabado de 6 módulos + 1 bonus (2h10 de contenido) para aprender a usar Claude en cada etapa del proceso de selección: desde el análisis de CVs hasta el informe ejecutivo post-entrevista.",
    modules: [
      {
        title: "Bienvenida",
        icon: "👋",
        items: ["Presentación del curso"],
        recordingVideoId: "Uolt_JCNOOM",
      },
      {
        title: "Módulo 1",
        benefit: "Escribile bien a Claude desde el primer prompt",
        icon: "✍️",
        items: ["Fundamentos: cómo piensa Claude y cómo escribirle bien"],
        takeaways: [
          "Criterio para elegir herramienta según la tarea",
          "las 3 herramientas configuradas con privacidad correcta",
          "plantilla ROL+CONTEXTO+TAREA+FORMATO",
        ],
        recordingVideoId: "tva0e-JLfUs",
        materials: [
          {
            title: "Kit Módulo 1 — Fórmula de Prompting",
            url: "/downloads/kit-modulo-1-claude-seleccion.pdf",
          },
        ],
      },
      {
        title: "Módulo 2",
        benefit: "Analizá CVs en segundos, con criterio consistente",
        icon: "🔍",
        items: ["Análisis de CVs con el prompt maestro"],
        takeaways: [
          "Prompt maestro de análisis de CV listo para copiar",
          "prompt de comparativa múltiple",
          "checklist de qué sí y qué no delegar en la IA",
        ],
        recordingVideoId: "DEai1Icm7AM",
        materials: [
          {
            title: "Kit Módulo 2 — Análisis de CVs",
            url: "/downloads/kit-modulo-2-claude-seleccion.pdf",
          },
          {
            title: "Descripción del puesto (caso)",
            url: "/downloads/descripcion-puesto-vendedor-salon.pdf",
          },
          {
            title: "CV Facundo García (caso)",
            url: "/downloads/cv-facundo-garcia.pdf",
          },
          {
            title: "CV Lucía Martínez (caso)",
            url: "/downloads/cv-lucia-martinez.pdf",
          },
          {
            title: "CV Roberto Sánchez (caso)",
            url: "/downloads/cv-roberto-sanchez.pdf",
          },
        ],
      },
      {
        title: "Módulo 3",
        benefit: "Llegá a cada entrevista con las preguntas justas",
        icon: "🎤",
        items: ["Preguntas STAR y guías de entrevista"],
        takeaways: [
          "Banco de 8 preguntas STAR por seniority",
          "prompt de guía completa por competencias",
        ],
        recordingVideoId: "m-Vqeg2qSB4",
        materials: [
          {
            title: "Kit Módulo 3 — Entrevistas STAR",
            url: "/downloads/kit-modulo-3-claude-seleccion.pdf",
          },
        ],
      },
      {
        title: "Módulo 4",
        benefit: "Armá la terna sin dudar entre candidatos parecidos",
        icon: "⚖️",
        items: ["Comparar candidatos y armar la terna"],
        takeaways: [
          "Prompt de comparativa múltiple",
          "prompt de ajuste de tabla a terna final",
          "criterio para no elegir solo por el score más alto",
        ],
        recordingVideoId: "QCExLmdFLjY",
        materials: [
          {
            title: "Kit Módulo 4 — Comparar y armar la Terna",
            url: "/downloads/kit-modulo-4-claude-seleccion.pdf",
          },
          {
            title: "CV Valentina Torres (caso)",
            url: "/downloads/cv-valentina-torres.pdf",
          },
          {
            title: "CV Martín Ibarra (caso)",
            url: "/downloads/cv-martin-ibarra.pdf",
          },
        ],
      },
      {
        title: "Módulo 5",
        benefit: "Comunicá tus decisiones con informes profesionales",
        icon: "📊",
        items: ["Informes ejecutivos y comunicación con el cliente"],
        takeaways: [
          "3 plantillas listas: resumen post-entrevista, email al candidato, informe al hiring manager",
        ],
        recordingVideoId: "RyRDNLEcarg",
        materials: [
          {
            title: "Kit Módulo 5 — Informes Ejecutivos",
            url: "/downloads/kit-modulo-5-claude-seleccion.pdf",
          },
          {
            title: "Notas de entrevista — Facundo García",
            url: "/downloads/notas-entrevista-facundo-garcia.pdf",
          },
          {
            title: "Notas de entrevista — Martín Ibarra",
            url: "/downloads/notas-entrevista-martin-ibarra.pdf",
          },
          {
            title: "Notas de entrevista — Lucía Martínez",
            url: "/downloads/notas-entrevista-lucia-martinez.pdf",
          },
        ],
      },
      {
        title: "Módulo 6",
        benefit: "Dejá de repetir el mismo prompt cada vez",
        icon: "⚙️",
        items: ["Armar tu propio Proyecto de Claude para no repetir el prompt cada vez"],
        takeaways: [
          "Setup de tu Project configurado con tu metodología",
          "prompt maestro para Projects",
        ],
        recordingVideoId: "wB0W6jSYvR8",
        triggersCertificate: true,
        materials: [
          {
            title: "Kit Módulo 6 — Proyecto de Claude",
            url: "/downloads/kit-modulo-6-claude-seleccion.pdf",
          },
        ],
      },
      {
        title: "Módulo Bonus",
        benefit: "Atraé mejores candidatos antes de que lleguen los CVs",
        icon: "🧲",
        items: ["Atracción de talento: antes de que lleguen los CVs"],
        takeaways: [
          "Prompt de aviso de empleo",
          "prompt de post de LinkedIn",
          "prompt de descripción interna del puesto",
        ],
        recordingVideoId: "fvOezdtGWCo",
        materials: [
          {
            title: "Kit Módulo Bonus — Atracción de Talento",
            url: "/downloads/kit-bonus-atraccion-talento.pdf",
          },
        ],
      },
    ],
    pageH1: "Claude para Selección: Curso para Recruiters",
    seoTitle: "Curso de Claude para Selección de Personal",
    seoDescription:
      "Aprendé a usar Claude para analizar CVs, generar preguntas STAR y automatizar informes. Curso grabado de 6 módulos + 1 bonus para recruiters.",
    outcomes: [
      "Prompts maestros para analizar CVs, armar preguntas STAR y comparar candidatos",
      "Tu propio Proyecto de Claude configurado, para no repetir el prompt cada vez",
      "Informes ejecutivos automáticos para comunicar decisiones de selección",
      "Estrategias de atracción de talento con IA, antes de recibir postulaciones",
      "6 módulos + 1 bonus grabados (2h10 de contenido) para ver a tu ritmo, con acceso ilimitado",
      "Certificado de finalización",
    ],
    price: "$70.000 ARS",
    priceARS: 70000,
    priceUSDRegular: 50,
    priceNote: "$70.000 ARS por transferencia o Mercado Pago · USD 50 por Payoneer",
    bankDetails,
    payoneerLink: "https://link.payoneer.com/Token?t=55DF705DCE7144E59B7DAB4C198ACDB1&src=tpl",
    faqs: [
      {
        q: "¿Necesito saber programar?",
        a: "No.",
      },
      {
        q: "¿Qué versión de Claude necesito?",
        a: "Ninguna en particular — el que tengas disponible en tu cuenta (gratuita o paga) sirve. Las versiones cambian de nombre seguido, así que no te atés a un número puntual.",
      },
      {
        q: "¿El curso tiene fecha de vencimiento?",
        a: "Por ahora no tiene fecha de vencimiento — lo mirás cuando quieras.",
      },
    ],
    certificadoUrl: "/cursos/claude-para-seleccion/certificado",
    certificadoTipo: "claude-seleccion",
  },
];

export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug);
}

// Ancla estable por módulo, para el menú "Ir a:" y el acordeón de
// contenido — sin acentos ni espacios, así funciona como #id de HTML.
export function moduleAnchor(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isEarlyBird(course: Course): boolean {
  if (!course.earlyBirdUntil) return false;
  return Date.now() < new Date(course.earlyBirdUntil).getTime();
}

// Monto real por transferencia bancaria, según si el early bird sigue
// vigente hoy o no. Mercado Pago nunca usa esto: siempre cobra
// `course.priceARS`, sin descuento.
export function getTransferenciaAmountARS(course: Course): number {
  const early = isEarlyBird(course);
  return (early ? course.priceARSEarlyBird : course.priceARSRegular) ?? course.priceARS ?? 0;
}

// Monto real por Payoneer (USD), según si el early bird sigue vigente hoy.
export function getPayoneerAmountUSD(course: Course): number {
  const early = isEarlyBird(course);
  return (early ? course.priceUSDEarlyBird : course.priceUSDRegular) ?? 0;
}

// Resumen de precios ya resuelto contra la fecha real de hoy, para no
// mostrar textos fijos (como "$45.000... antes del 9/8") que quedan
// desactualizados solos apenas pasa la fecha. Se usa en la home y en la
// página del curso en vez de los campos estáticos `price`/`priceNote`/
// `paymentOptions`.
export function getCoursePriceSummary(course: Course) {
  const earlyBirdActive = isEarlyBird(course);
  const transferenciaARS = getTransferenciaAmountARS(course);
  const payoneerUSD = getPayoneerAmountUSD(course);
  const mercadoPagoARS = course.priceARS ?? 0;
  const savingsARS = earlyBirdActive ? Math.max(mercadoPagoARS - transferenciaARS, 0) : 0;
  return {
    earlyBirdActive,
    transferenciaARS,
    payoneerUSD,
    mercadoPagoARS,
    savingsARS,
    paymentOptions: [
      {
        method: "Transferencia bancaria",
        price: `$${transferenciaARS.toLocaleString("es-AR")} ARS`,
        note: earlyBirdActive ? `Antes del 9/8 (después $${(course.priceARSRegular ?? mercadoPagoARS).toLocaleString("es-AR")})` : undefined,
      },
      ...(course.payoneerLink
        ? [
            {
              method: "Payoneer",
              price: `USD ${payoneerUSD}`,
              note: earlyBirdActive ? `Antes del 9/8 (después USD ${course.priceUSDRegular})` : undefined,
            },
          ]
        : []),
      {
        method: "Mercado Pago",
        price: `$${mercadoPagoARS.toLocaleString("es-AR")} ARS`,
        note: "Pago online inmediato, sin descuento",
      },
    ] as PaymentOption[],
  };
}
