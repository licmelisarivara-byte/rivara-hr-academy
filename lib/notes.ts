export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "cta"; before: string; linkText: string; linkHref: string; after: string };

export type Note = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  blocks: NoteBlock[];
};

export const notes: Note[] = [
  {
    slug: "la-ia-en-rrhh-ya-no-se-prueba-se-implementa",
    title: "La IA en RRHH ya no se prueba: se implementa",
    date: "1 de julio de 2026",
    excerpt:
      "La IA dejó de ser una novedad para convertirse en una capa operativa que toca procesos reales: selección, onboarding, automatización administrativa y compliance.",
    blocks: [
      {
        type: "p",
        text: "Durante mucho tiempo, hablar de inteligencia artificial en RR.HH. era hablar de promesas. Hoy, la conversación cambió. La IA dejó de ser una novedad para convertirse en una capa operativa que empieza a tocar procesos reales: selección, onboarding, automatización administrativa y compliance.",
      },
      {
        type: "p",
        text: "Lo interesante no es solo que las empresas estén adoptando herramientas nuevas. Lo interesante es que el criterio de valor también cambió: ya no alcanza con automatizar tareas. Ahora importa automatizar bien.",
      },
      { type: "h2", text: "El cambio en selección" },
      {
        type: "p",
        text: "En selección, la transformación es visible. Las empresas usan IA para filtrar, resumir y priorizar candidatos, mientras los candidatos también la usan para preparar CV, entrevistas y postulaciones. Eso generó un efecto doble: más velocidad, pero también más necesidad de criterio humano.",
      },
      {
        type: "p",
        text: "Ahí aparece una tensión central. Cuanto más automatizado se vuelve el proceso, más importante se vuelve la calidad del diseño. Porque una mala automatización no solo ahorra poco: también puede sesgar, confundir o degradar la experiencia del candidato.",
      },
      { type: "h2", text: "La nueva frontera: del chatbot al agente" },
      {
        type: "p",
        text: "En paralelo, crece otra señal más profunda. La industria está empezando a pasar del chatbot como interfaz al agente como operador. Es decir: sistemas que no solo responden, sino que ejecutan acciones dentro de flujos de trabajo reales. En RR.HH., eso se traduce en reportes, onboarding, aprobaciones, seguimiento y tareas administrativas que antes consumían tiempo operativo.",
      },
      {
        type: "p",
        text: "Para quienes lideran recruiting, people ops o HR tech, este cambio abre una oportunidad clara. El diferencial no estará en “usar IA”, sino en combinar automatización, supervisión humana y trazabilidad. Las empresas van a pagar por soluciones que reduzcan fricción sin perder control.",
      },
      { type: "h2", text: "Lo que veo venir" },
      {
        type: "p",
        text: "Hay tres frentes donde esta tendencia va a acelerarse:",
      },
      {
        type: "ol",
        items: [
          "**Selección más asistida por IA**, pero con revisión humana más exigente.",
          "**Automatización administrativa más profunda**, especialmente en onboarding, documentación y reporting.",
          "**Más presión sobre compliance, privacidad y sesgos algorítmicos.**",
        ],
      },
      {
        type: "p",
        text: "La lectura estratégica es simple: la IA en RR.HH. ya no se mide por cuánto impresiona, sino por cuánto mejora un proceso real. Y eso cambia por completo el tipo de producto, servicio y discurso que conviene construir.",
      },
      { type: "h2", text: "La próxima ventaja competitiva" },
      {
        type: "p",
        text: "La próxima ventaja competitiva en RR.HH. no va a venir de hacer más cosas. Va a venir de **diseñar mejor qué se automatiza, qué se supervisa y qué sigue siendo profundamente humano.**",
      },
      { type: "hr" },
      {
        type: "cta",
        before: "Si este análisis resuena con lo que ves en tu día a día, te invito a mi taller práctico ",
        linkText: "“De cero a tu Asistente de Selección y tu propio ATS”",
        linkHref: "/cursos/de-cero-a-tu-asistente",
        after:
          " — en 2 clases en vivo. No es un curso de herramientas, es un espacio para aprender a integrar IA con criterio estratégico y ético.",
      },
    ],
  },
];

export function getNoteBySlug(slug: string) {
  return notes.find((n) => n.slug === slug);
}
