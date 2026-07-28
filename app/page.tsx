import Link from "next/link";
import Image from "next/image";
import { freeResources, paidResources } from "@/lib/resources";
import AboutSection from "@/components/AboutSection";
import ResourceCheckoutButton from "@/components/ResourceCheckoutButton";

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

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
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max rounded-full px-5 py-2.5 bg-black/60 backdrop-blur border border-magenta/40 shadow-xl shadow-black/30 flex items-center gap-2 text-sm text-white whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-magenta" />
              Lic. Melisa Rivara — Especialista en Selección de Personal
            </div>
          </div>
        </div>
      </section>

      {/* CURSOS EN VIVO */}
      <section id="cursos-en-vivo" className="max-w-6xl mx-auto px-6 py-24">
        <p className="eyebrow mb-3">📚 Cursos en vivo</p>
        <h2 className="font-display text-2xl sm:text-3xl text-bone mb-10">
          Aprendé en vivo, con casos reales
        </h2>

        <div className="card rounded-2xl p-8 sm:p-10 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <span className="eyebrow">En vivo</span>
            <h3 className="font-display text-2xl sm:text-3xl text-bone mt-3 mb-4">
              Creá tu propio Bot de Selección + ATS con IA
            </h3>
            <p className="text-bone/70 text-lg mb-6">
              En 2 clases en vivo armás tu asistente de selección con IA y
              publicás tu propio ATS, sin perfil técnico.
            </p>
            <div className="detail-text flex flex-col gap-2 mb-2">
              <span>📅 Martes 11 y martes 18 de agosto · 17 a 18:30 hs (ARG)</span>
            </div>
          </div>

          <div className="card-alt rounded-xl p-6 text-center">
            <span className="inline-block text-xs font-semibold bg-magenta text-white px-3 py-1 rounded-full mb-3">
              🔥 Ahorrá {formatARS(15000)}
            </span>
            <div className="mb-1">
              <span className="text-bone/40 line-through text-lg mr-2">
                {formatARS(60000)}
              </span>
              <span className="font-display text-3xl text-bone">
                {formatARS(45000)} ARS
              </span>
            </div>
            <div className="text-sm text-magenta mb-1">
              Por transferencia o Payoneer, hasta el 9/8
            </div>
            <div className="detail-text mb-6">
              Por Mercado Pago: {formatARS(60000)} ARS
            </div>
            <Link
              href="/cursos/de-cero-a-tu-asistente"
              className="btn-cta inline-block w-full bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
            >
              Ver formas de pago →
            </Link>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="max-w-6xl mx-auto px-6 py-24">
        {/* GRATIS */}
        <p className="eyebrow mb-3">🎁 Recursos gratuitos</p>
        <h2 className="font-display text-2xl sm:text-3xl text-bone mb-10">
          Empezá sin costo
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {freeResources.map((r) => (
            <div key={r.slug} className="card-alt rounded-xl p-6 flex flex-col">
              <span className="eyebrow">{r.kind}</span>
              <h3 className="font-display text-lg text-bone mt-2 mb-2">
                {r.title}
              </h3>
              <p className="text-bone/60 text-sm mb-6">{r.description}</p>
              <div className="mt-auto">
                {r.fileUrl ? (
                  <a
                    href={r.fileUrl}
                    download
                    className="btn-cta text-sm bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
                  >
                    ⬇️ Descargar gratis →
                  </a>
                ) : (
                  <span className="text-sm text-bone/40 italic">
                    Disponible muy pronto
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PAGOS */}
        <p className="eyebrow mb-3">📖 Ebooks y recursos descargables</p>
        <h2 className="font-display text-2xl sm:text-3xl text-bone mb-10">
          Comprá, descargá y aplicá desde hoy
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {paidResources.map((r) => (
            <div
              key={r.slug}
              className={
                r.isCombo
                  ? "rounded-xl p-6 flex flex-col border border-magenta bg-gradient-to-br from-panelAlt to-panel"
                  : "card rounded-xl p-6 flex flex-col"
              }
            >
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
                  <ResourceCheckoutButton resource={r} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AboutSection />
    </div>
  );
}
