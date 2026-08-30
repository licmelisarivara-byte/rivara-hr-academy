import Link from "next/link";
import Image from "next/image";
import { freeResources, paidResources } from "@/lib/resources";
import { getCourseBySlug } from "@/lib/courses";
import AboutSection from "@/components/AboutSection";
import ResourcePaymentActions from "@/components/ResourcePaymentActions";
import FreeResourceDownloadButton from "@/components/FreeResourceDownloadButton";
import CoursePricingTeaser from "@/components/CoursePricingTeaser";

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

const featuredCourse = getCourseBySlug("claude-para-seleccion")!;

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d0d14 0%, #1a0028 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <p className="eyebrow mb-5 text-magenta">RIVARA HR ACADEMY</p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-white mb-6">
              Dejá de perder horas filtrando CVs y empezá a tomar mejores
              decisiones <span className="text-magenta">con IA</span>.
            </h1>
            <p className="text-white/70 text-lg max-w-xl mb-8">
              Cursos, herramientas y recursos para recruiters que quieren
              aplicar inteligencia artificial en selección de personal. Sin
              tecnicismos, con resultados desde el día 1.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#cursos-en-vivo"
                className="btn-cta bg-magenta text-white px-8 py-4 rounded-full hover:bg-magentaSoft transition-colors shadow-lg shadow-magenta/30"
              >
                Quiero mi lugar →
              </Link>
            </div>
          </div>

          <div className="relative max-w-md mx-auto w-full">
            <div
              className="relative rounded-[20px] overflow-hidden border border-magenta/30"
              style={{ boxShadow: "0 20px 40px rgba(232,0,111,0.25)" }}
            >
              <Image
                src="/images/melisa-portrait.jpg"
                alt="Lic. Melisa Rivara"
                width={700}
                height={840}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[90%] rounded-2xl sm:rounded-full px-5 py-2.5 bg-black/60 backdrop-blur border border-magenta/40 shadow-xl shadow-black/30 flex items-center gap-2 text-sm text-white text-center whitespace-normal sm:whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-magenta shrink-0" />
              Lic. Melisa Rivara — Especialista en Selección de Personal
            </div>
          </div>
        </div>
      </section>

      {/* CURSO DESTACADO — oferta principal, primero después del hero */}
      <section id="cursos-en-vivo" className="max-w-6xl mx-auto px-6 pt-20 pb-28">
        <p className="eyebrow mb-3">📚 Curso destacado</p>
        <h2 className="font-display text-2xl sm:text-3xl text-bone mb-10">
          Aprendé con Claude, a tu ritmo
        </h2>

        <div className="card rounded-2xl p-8 sm:p-10 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <span className="eyebrow">{featuredCourse.format}</span>
            <h3 className="font-display text-2xl sm:text-3xl text-bone mt-3 mb-4">
              {featuredCourse.title}
            </h3>
            <p className="text-bone/70 text-lg mb-6">{featuredCourse.tagline}</p>
            <div className="detail-text flex flex-col gap-2 mb-2">
              <span>🎥 7 módulos grabados · A tu ritmo</span>
            </div>
          </div>

          <CoursePricingTeaser course={featuredCourse} />
        </div>
      </section>

      {/* RECURSOS GRATUITOS — bloque secundario, más chico y discreto que el curso */}
      <section id="recursos" className="max-w-6xl mx-auto px-6 pb-20">
        <p className="eyebrow mb-3 text-bone/50">🎁 Recursos gratuitos</p>
        <h2 className="font-display text-lg sm:text-xl text-bone/80 mb-6">
          Para ir probando, sin costo
        </h2>

        {/* Masterclass gratuita — antes era una tarjeta grande, ahora un banner chico dentro del bloque secundario */}
        <Link
          href="/masterclass"
          className="card-alt rounded-xl p-4 grid sm:grid-cols-[auto_1fr] gap-4 items-center hover:border-magenta/40 transition-colors mb-6"
        >
          <Image
            src="/images/masterclass/invite-flyer.jpg"
            alt="Masterclass gratuita: Analizá un CV con IA en segundos"
            width={80}
            height={100}
            className="w-14 h-auto rounded-md object-cover mx-auto sm:mx-0"
          />
          <div>
            <span className="inline-block text-[10px] font-semibold bg-magenta/80 text-white px-2 py-0.5 rounded-full mb-1.5">
              GRABACIÓN · GRATIS
            </span>
            <h3 className="font-display text-base text-bone mb-0.5">
              Analizá un CV con IA en segundos
            </h3>
            <span className="text-magenta text-xs font-semibold">
              Ver la grabación gratis →
            </span>
          </div>
        </Link>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {freeResources.map((r) => (
            <div key={r.slug} className="card-alt rounded-xl p-5 flex flex-col">
              <span className="eyebrow">{r.kind}</span>
              <h3 className="font-display text-base text-bone mt-2 mb-1.5">
                {r.title}
              </h3>
              <p className="text-bone/60 text-xs mb-4">{r.description}</p>
              <div className="mt-auto">
                <FreeResourceDownloadButton resource={r} />
              </div>
            </div>
          ))}
        </div>

        {/* PAGOS */}
        <p className="eyebrow mb-2 text-bone/50">📖 Ebooks y recursos descargables</p>
        <h2 className="font-display text-lg sm:text-xl text-bone/80 mb-6">
          Comprá, descargá y aplicá desde hoy
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {paidResources.map((r) => (
            <div
              key={r.slug}
              className={
                r.isCombo
                  ? "rounded-xl p-6 flex flex-col border border-magenta bg-gradient-to-br from-panelAlt to-panel"
                  : "card rounded-xl p-6 flex flex-col"
              }
            >
              <div className="relative w-full aspect-[1080/1520] rounded-lg overflow-hidden mb-4 bg-parchment border border-black/5">
                {r.image ? (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-bone/30 text-sm">
                    Foto próximamente
                  </div>
                )}
              </div>
              <span className="eyebrow">{r.kind}</span>
              <h3 className="font-display text-lg text-bone mt-2 mb-2">
                {r.title}
              </h3>
              <p className="text-bone/60 text-sm mb-5">{r.description}</p>
              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-2xl text-bone">
                    {formatARS(r.priceARS)}
                  </span>
                  <span className="text-bone/40 text-xs">ARS</span>
                </div>
                {r.savingsARS && (
                  <div className="text-magenta text-xs mb-3">
                    Ahorrás {formatARS(r.savingsARS)}
                  </div>
                )}
                <div className={r.savingsARS ? "" : "mt-3"}>
                  <ResourcePaymentActions resource={r} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AboutSection />

      {/* SOS EMPRESA */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-alt rounded-2xl p-8 flex flex-col justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">
              ¿Estás buscando trabajo?
            </h2>
            <p className="text-bone/60">
              Conocé la Asesoría de Carrera: armamos tu CV, tu LinkedIn y tu estrategia de búsqueda laboral.
            </p>
          </div>
          <a
            href="https://carrera.rivaraconsultora.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors whitespace-normal sm:whitespace-nowrap self-center sm:self-start"
          >
            Conocé la asesoría →
          </a>
        </div>

        <div className="card-alt rounded-2xl p-8 flex flex-col justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">
              ¿Sos empresa?
            </h2>
            <p className="text-bone/60">
              Conocé nuestros servicios de RRHH y selección de personal en RIVARA Consultora.
            </p>
          </div>
          <a
            href="https://rivaraconsultora.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors whitespace-normal sm:whitespace-nowrap self-center sm:self-start"
          >
            Conocé nuestros servicios →
          </a>
        </div>

        <div className="card-alt rounded-2xl p-8 flex flex-col justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">
              ¿Necesitás un sistema de RRHH?
            </h2>
            <p className="text-bone/60">
              Conocé RIVARA HR Suite: selección inteligente con IA, diagnóstico de clima laboral, capacitaciones para tu equipo y recibo de sueldo PRO, todo en un solo lugar.
            </p>
          </div>
          <a
            href="https://hrsuite.rivaraconsultora.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors whitespace-normal sm:whitespace-nowrap self-center sm:self-start"
          >
            Conocé HR Suite →
          </a>
        </div>
      </section>
    </div>
  );
}
