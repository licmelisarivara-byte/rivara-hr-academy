export type Course = {
  slug: string;
  title: string;
  format: "En vivo" | "Grabado";
  tagline: string;
  description: string;
  modules: { title: string; items: string[] }[];
  price: string; // TODO real: reemplazar con precio final
  priceNote?: string;
  schedule?: string;
  externalCheckout?: string; // e.g. link to Hotmart if it's sold there
  freePreviewVideoId?: string; // YouTube ID, unlisted is fine
};

// ⚠️ Contenido real tomado de lo que Melisa definió. Los precios en ARS son
// placeholders — reemplazar antes de publicar. No inventar datos nuevos acá.
export const courses: Course[] = [
  {
    slug: "de-cero-a-tu-asistente",
    title: "De cero a tu Asistente de Selección y tu propio ATS",
    format: "En vivo",
    tagline:
      "Armá tu asistente de selección con IA y tu propio ATS, en 2 clases en vivo por Google Meet.",
    description:
      "Curso en vivo de dos clases donde armamos, paso a paso, un asistente de selección con Claude Projects, un bot conectado a WhatsApp con Botpress, y un ATS a medida en Lovable con Supabase. Pensado para selectoras y selectores que quieren dejar de filtrar CVs a mano.",
    modules: [
      {
        title: "Clase 1 — Tu asistente de selección con IA",
        items: [
          "Asistente de selección en Claude Projects: análisis de CV, scoring y preguntas STAR",
          "Bot de WhatsApp con Botpress conectado a tu proceso",
          "Caso práctico en vivo con un CV y un puesto reales",
        ],
      },
      {
        title: "Clase 2 — Tu propio ATS",
        items: [
          "Diseño de tu ATS a medida en Lovable",
          "Base de datos con Supabase: pipeline, candidatos, estados",
          "Cómo seguir iterando tu asistente después del curso",
        ],
      },
    ],
    price: "Desde $45.000 ARS",
    priceNote: "Precio con descuento hasta el 9/8",
    schedule: "Martes 11 y Jueves 13 de agosto · 17 a 18:30 hs (ARG)",
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
