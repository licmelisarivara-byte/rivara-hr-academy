export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "source"; text: string }
  | { type: "links"; items: { text: string; href: string }[] }
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
    slug: "5-senales-de-que-el-mercado-laboral-ya-eligio-la-ia",
    title: "5 señales de que el mercado laboral ya eligió la IA",
    date: "8 de julio de 2026",
    excerpt:
      "El mercado laboral ya no está en la fase de \"probemos a ver qué pasa\". 5 señales concretas confirman que la IA no es el futuro, es el presente — y RRHH está en el centro.",
    blocks: [
      {
        type: "p",
        text: "El mercado laboral ya no está en la fase de \"probemos a ver qué pasa\". Los datos de las últimas semanas muestran una tendencia clara: la IA no es el futuro, es el presente. Y el área de Personas está en el centro de esta transformación.",
      },
      {
        type: "p",
        text: "Aquí tienes 5 señales concretas que confirman que el mercado ya eligió la IA.",
      },
      { type: "hr" },
      { type: "h2", text: "🧠 1. El dilema psicológico de la automatización" },
      { type: "source", text: "PsyPost" },
      {
        type: "p",
        text: "Un reciente estudio revela una brecha cognitiva peligrosa: los expertos en IA ven más beneficios en la automatización, pero el público general está hiperenfocado en los riesgos (sesgos, deshumanización).",
      },
      {
        type: "p",
        text: "Para RRHH, esto es un aviso claro: si implementas IA sin un plan de comunicación y gestión del cambio, generarás rechazo interno. La adopción exitosa no es técnica, es psicológica.",
      },
      {
        type: "links",
        items: [
          {
            text: "PsyPost — Experts and the public have radically different visions of an automated future",
            href: "https://www.psypost.org/experts-and-the-public-have-radically-different-visions-of-an-automated-future/",
          },
        ],
      },
      { type: "hr" },
      { type: "h2", text: "📊 2. El mercado ya votó: Talento IA vs. Talento tradicional" },
      { type: "source", text: "Reuters" },
      {
        type: "p",
        text: "En India, los roles de IA en el sector IT crecieron un 16% interanual, mientras que el empleo tecnológico total cayó un 3%. Además, los puestos de Machine Learning subieron un 25% en 14 sectores.",
      },
      {
        type: "p",
        text: "Conclusión: **El nuevo mercado laboral no pide que no uses IA; pide que sepas usarla.** La empleabilidad del futuro dependerá de nuestra capacidad para co-pilotar con estas herramientas.",
      },
      {
        type: "links",
        items: [
          {
            text: "RRI.co.id (citando a Reuters)",
            href: "https://rri.co.id/batam/internasional/2544770/perekrutan-talenta-ai-di-india-melonjak-lowongan-kerja-ti-justru-turun",
          },
        ],
      },
      { type: "hr" },
      { type: "h2", text: "💰 3. El dinero cree en el HR Tech" },
      { type: "source", text: "Reuters" },
      {
        type: "p",
        text: "La startup europea de software de RRHH Skello ha cerrado una ronda de 200 millones de euros liderada por Bridgepoint. Esto confirma que el mercado inversor apuesta fuerte por la digitalización de la gestión del talento.",
      },
      {
        type: "p",
        text: "**Oportunidad:** Las soluciones de matching, analítica predictiva y automatización de tareas operativas ya no son \"lujo\", son el nuevo estándar competitivo para PYMES y grandes empresas.",
      },
      {
        type: "links",
        items: [
          {
            text: "Notimérica",
            href: "https://www.notimerica.com/economia/noticia-skello-cierra-ronda-financiacion-200-millones-liderada-bridgepoint-development-capital-20260706080917.html",
          },
          {
            text: "TechFundingNews",
            href: "https://techfundingnews.com/bridgepoint-pours-e200m-into-partech-alums-skello-to-power-europes-frontline-workforce-tech/",
          },
        ],
      },
      { type: "hr" },
      { type: "h2", text: "⚖️ 4. Llega la regulación: \"Sí, pero con humano al mando\"" },
      { type: "source", text: "ONU Argentina" },
      {
        type: "p",
        text: "Desde la ONU, António Guterres alerta que la IA avanza más rápido que su supervisión. En el primer Diálogo Global sobre Gobernanza de la IA en Ginebra, propuso un pacto internacional para proteger a los menores: \"ningún niño debe convertirse en un conejillo de indias de una IA no regulada\".",
      },
      {
        type: "p",
        text: "Para el área de Personas, esto es un aviso claro: **la gobernanza de IA y la ética aplicada a procesos de selección y desempeño van a ser el próximo gran diferenciador (y salvoconducto legal).**",
      },
      {
        type: "links",
        items: [
          {
            text: "France24 (sobre la ONU)",
            href: "https://www.france24.com/es/minuto-a-minuto/20260706-el-jefe-de-la-onu-llama-a-gobernar-la-ia-para-no-improvisar-el-futuro-de-la-humanidad",
          },
        ],
      },
      { type: "hr" },
      { type: "h2", text: "💼 5. Microsoft recorta 4.800 empleos mientras la IA reconfigura el trabajo" },
      { type: "source", text: "Reuters" },
      {
        type: "p",
        text: "Microsoft ha anunciado el recorte de 4.800 puestos de trabajo (el 2,1% de su plantilla) como parte de una reestructuración de varias unidades de negocio, incluyendo Xbox. La compañía ha matizado que los puestos eliminados no serán reemplazados por IA, aunque su directora de RRHH, Amy Coleman, ha reconocido que \"la IA está cambiando la forma en que se trabaja\".",
      },
      {
        type: "p",
        text: "**Para RRHH:** el mensaje es claro. La IA no solo automatiza tareas, está redefiniendo la estructura de las organizaciones. El desafío no es si habrá despidos, sino cómo gestionar la recolocación, el upskilling y el impacto psicológico en los equipos que se quedan.",
      },
      {
        type: "links",
        items: [
          {
            text: "Vietnam.vn (citando a Reuters)",
            href: "https://www.vietnam.vn/es/microsoft-cat-khoang-4-800-nhan-su-noi-dai-lan-song-sa-thai-vi-ai/",
          },
        ],
      },
      { type: "hr" },
      { type: "h2", text: "La pregunta del millón" },
      {
        type: "p",
        text: "¿Sentís que en tu equipo o en tu día a día hay presión para \"automatizarlo todo\" con IA, pero no sabes por dónde empezar sin perder el criterio humano?",
      },
      {
        type: "cta",
        before: "Para eso diseñé mi taller ",
        linkText: "“De cero a tu Asistente de Selección y tu propio ATS”",
        linkHref: "/cursos/de-cero-a-tu-asistente",
        after:
          " — en 2 clases en vivo. No es un curso más de herramientas; es un taller práctico para que profesionales de RRHH y Psicología aprendan a integrar la IA con criterio estratégico y ético, tal como pide el mercado actual.",
      },
      {
        type: "p",
        text: "**El reto no es elegir entre \"prohibir\" o \"automatizar todo\". El reto es encontrar el punto medio donde la tecnología amplifique nuestra inteligencia emocional y estratégica, sin anularla.**",
      },
      {
        type: "p",
        text: "**¿Qué postura ves más en tu empresa? ¿Miedo a la IA o carrera por adoptarla?**",
      },
    ],
  },
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
