import Image from "next/image";

const WHATSAPP_URL =
  "https://wa.me/5491123912820?text=" +
  encodeURIComponent("Hola Melisa! Quiero mi asesoría de carrera.");

const audiencia = [
  "Estás buscando trabajo activamente y tu CV no te está generando respuestas",
  "Sos extranjero/a y te radicaste (o estás por radicarte) en Argentina",
  "Estás en una transición de carrera y no sabés cómo posicionar tu experiencia",
  "Tenés un perfil bilingüe o con experiencia internacional y no lo estás aprovechando",
  "Necesitás que alguien te diga, con criterio real de selección de personal, qué empresas y roles encajan con vos — no una lista genérica",
];

const incluye = [
  {
    title: "CV ATS",
    description:
      "Versión optimizada para sistemas de selección automatizados — así tu CV no se pierde antes de que lo vea una persona.",
  },
  {
    title: "CV con foto y diseño",
    description:
      "Versión profesional con diseño de marca, pensada para contacto directo por mail con empresas, agencias y contactos personales.",
  },
  {
    title: "Informe de Estrategia Laboral",
    description: 'No es una lista de consejos genéricos. Es un análisis de tu perfil con:',
    bullets: [
      "Recomendaciones concretas de dónde postularte, en orden de prioridad",
      "Ofertas activas verificadas al momento de la entrega",
      "Contactos reales (mails, portales, empresas) chequeados uno por uno",
      "Preparación para entrevistas con preguntas frecuentes de tu rubro",
      "Un checklist de acción para no perderte en el proceso",
    ],
  },
  {
    title: "Optimización de LinkedIn",
    description:
      'Headline, sección "Acerca de" y recomendaciones de perfil — listas para usar o para que las carguemos juntos.',
  },
  {
    title: "Sesión de seguimiento (1 hora, post-entrega)",
    description: "Una vez que tenés todo el material, nos volvemos a encontrar para:",
    bullets: [
      "Practicar juntos las preguntas de entrevista más probables",
      "Revisar si hubo cambios en tu búsqueda (nueva info, otro enfoque, corrección de último momento)",
      "Ajustar lo que haga falta antes de que empieces a postularte en serio",
    ],
  },
];

const proceso = [
  {
    step: "1",
    title: "Sesión inicial",
    description:
      "Nos conocemos, reviso tu experiencia y entendemos juntos hacia dónde apunta tu búsqueda.",
  },
  {
    step: "2",
    title: "Entrega de materiales",
    description:
      "Armo tu CV, tu Informe de Estrategia y la optimización de LinkedIn con todo lo relevado.",
  },
  {
    step: "3",
    title: "Sesión de seguimiento y práctica",
    description:
      "Una hora para practicar entrevista y ajustar lo que necesites antes de postularte.",
  },
];

const testimonios = [
  {
    quote:
      "Con Meli reorganizamos mi CV y mi LinkedIn de punta a punta, con foco en los puestos que realmente quería. En el camino resolví un montón de dudas que tenía. Un trabajo excelente y muy completo.",
    author: "Vicky Z.",
  },
  {
    quote:
      "El acompañamiento con mi CV fue clave — conseguí trabajo nuevo enseguida. Un servicio excelente, de principio a fin.",
    author: "Jeny",
  },
];

const faqs = [
  {
    q: "¿Cuánto tarda la entrega?",
    a: "Depende de la complejidad del perfil, pero en general trabajamos con tiempos cortos y bien definidos.",
  },
  {
    q: "¿Sirve si estoy buscando trabajo fuera de Argentina también?",
    a: "El Informe de Estrategia está pensado específicamente para el mercado argentino, pero el CV y el LinkedIn son la base para cualquier búsqueda.",
  },
  {
    q: "¿Qué pasa si necesito otro idioma además de español?",
    a: "Trabajamos perfiles bilingües — CV e Informe en los dos idiomas.",
  },
  {
    q: "¿La sesión de seguimiento es obligatoria?",
    a: "Está incluida en el paquete completo. Es el momento donde practicamos entrevista juntos y ajustamos cualquier detalle de último momento.",
  },
];

export default function AsesoriaCarreraPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-careerNavy">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase text-careerRose mb-5">
              Asesoría de Carrera
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-careerCream mb-6">
              Tu CV y tu búsqueda laboral, con estrategia
            </h1>
            <p className="font-body text-careerCream/75 text-lg max-w-xl mb-8">
              Te ayudo a armar un perfil profesional sólido — CV, LinkedIn y
              un plan concreto de dónde y cómo postularte — para que
              consigas el trabajo que buscás en Argentina.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta inline-block bg-careerFucsia text-careerCream px-8 py-4 rounded-full hover:bg-careerFucsia/85 transition-colors shadow-lg shadow-careerFucsia/20"
            >
              Quiero mi asesoría →
            </a>
          </div>

          <div className="relative max-w-md mx-auto w-full">
            <div className="relative rounded-[20px] overflow-hidden border border-careerRose/30 shadow-2xl shadow-black/30">
              <Image
                src="/images/asesoria/hero-cv-2.jpg"
                alt="Persona sonriendo con su CV impreso en la mano"
                width={1696}
                height={2106}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUIÉN ES */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="font-display text-2xl sm:text-3xl text-careerNavy mb-10">
          ¿Este servicio es para vos?
        </h2>
        <ul className="grid sm:grid-cols-2 gap-5">
          {audiencia.map((item) => (
            <li
              key={item}
              className="flex gap-3 bg-white/60 border border-careerNavy/10 rounded-xl p-5"
            >
              <span className="text-careerFucsia font-bold mt-0.5">✓</span>
              <span className="font-body text-careerNavy/80">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="bg-white/50 border-y border-careerNavy/10">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="font-display text-2xl sm:text-3xl text-careerNavy mb-10">
            Un paquete completo, no solo un CV
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {incluye.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-7 bg-careerCream border border-careerNavy/10"
              >
                <h3 className="font-display text-lg text-careerNavy mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-careerNavy/70 mb-3">
                  {item.description}
                </p>
                {item.bullets && (
                  <ul className="space-y-1.5">
                    {item.bullets.map((b) => (
                      <li
                        key={b}
                        className="font-body text-sm text-careerNavy/70 flex gap-2"
                      >
                        <span className="text-careerFucsia">—</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO TRABAJAMOS */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="font-display text-2xl sm:text-3xl text-careerNavy mb-10">
          El proceso
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {proceso.map((p) => (
            <div key={p.step} className="rounded-2xl p-7 bg-careerNavy text-careerCream">
              <span className="font-display text-3xl text-careerRose mb-3 block">
                {p.step}
              </span>
              <h3 className="font-display text-lg mb-2">{p.title}</h3>
              <p className="font-body text-careerCream/70 text-sm">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIO */}
      <section className="bg-careerFucsia">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-careerCream mb-4">
            Inversión
          </h2>
          <p className="font-body text-careerCream/85 text-lg mb-8">
            Cotización a medida según tu perfil y necesidad (ej. si es en un
            solo idioma o bilingüe, si ya tenés LinkedIn armado o hay que
            construirlo desde cero).
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-careerCream text-careerFucsia px-8 py-4 rounded-full hover:bg-white transition-colors"
          >
            Pedir mi cotización →
          </a>
        </div>
      </section>

      {/* POR QUÉ CONMIGO */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-careerNavy mb-6">
          No es solo diseño de CV
        </h2>
        <p className="font-body text-careerNavy/75 text-lg">
          Soy Lic. en Recursos Humanos y trabajo del lado de la selección de
          personal — sé qué mira un reclutador antes de descartar un CV, y
          qué hace que una postulación llegue a entrevista. Este servicio no
          es una plantilla bonita: es estrategia real de búsqueda laboral.
        </p>
      </section>

      {/* TESTIMONIOS */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="font-display text-2xl sm:text-3xl text-careerNavy mb-10 text-center">
          Lo que dicen quienes ya hicieron la asesoría
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {testimonios.map((t) => (
            <figure
              key={t.author}
              className="rounded-2xl p-7 bg-white/60 border border-careerNavy/10"
            >
              <span className="text-careerFucsia font-display text-4xl leading-none block mb-2">
                "
              </span>
              <blockquote className="font-body text-careerNavy/80 mb-4">
                {t.quote}
              </blockquote>
              <figcaption className="font-display text-sm text-careerNavy">
                {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white/50 border-y border-careerNavy/10">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="font-display text-2xl sm:text-3xl text-careerNavy mb-10">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-careerNavy/10 bg-careerCream px-5 py-4"
              >
                <summary className="font-display text-base text-careerNavy cursor-pointer list-none flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-careerFucsia group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="font-body text-careerNavy/70 mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-careerNavy">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-careerCream mb-4">
            Empecemos con tu búsqueda laboral
          </h2>
          <p className="font-body text-careerCream/70 text-lg mb-8">
            Escribime y coordinamos una primera sesión.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta inline-block bg-careerFucsia text-careerCream px-8 py-4 rounded-full hover:bg-careerFucsia/85 transition-colors"
            >
              Escribir por WhatsApp
            </a>
            <a
              href="mailto:hola@rivaraconsultora.com.ar?subject=Asesor%C3%ADa%20de%20Carrera"
              className="btn-cta inline-block border border-careerCream/30 text-careerCream px-8 py-4 rounded-full hover:bg-white/5 transition-colors"
            >
              Agendar sesión inicial
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
