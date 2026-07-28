import Link from "next/link";
import Image from "next/image";
import { courses } from "@/lib/courses";
import { freeResources } from "@/lib/resources";
import AboutSection from "@/components/AboutSection";
import AudienceSection from "@/components/AudienceSection";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-score-grid bg-[length:38px_38px]">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <p className="eyebrow mb-5">RIVARA HR Academy</p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-bone mb-6">
              Dejá de perder horas filtrando CVs.
              <br />
              Empezá a decidir con <span className="text-magenta">IA de verdad</span>.
            </h1>
            <p className="text-bone/70 text-lg max-w-xl mb-8">
              Te ayudo a armar tu propio asistente de selección, tu bot de
              WhatsApp y tu ATS — con casos reales, de colega a colega.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/cursos"
                className="bg-magenta text-white font-semibold px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
              >
                Ver cursos
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-bone/50">
              <span className="w-8 h-8 rounded-full overflow-hidden border border-magenta/40 relative shrink-0">
                <Image
                  src="/images/melisa-avatar.jpg"
                  alt="Lic. Melisa Rivara"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </span>
              Lic. Melisa Rivara — Especialista en Selección de Personal
            </div>
          </div>

          {/* Signature element: candidate score card */}
          <div className="card rounded-2xl p-6 shadow-2xl shadow-black/40 rotate-1 max-w-sm mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">Análisis de candidato</span>
              <span className="text-xs text-bone/40 font-mono">IA</span>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-display text-5xl text-magenta">82</span>
              <span className="text-bone/40 text-sm mb-1">/ 100 fit</span>
            </div>
            <div className="hairline mb-4" />
            <ul className="space-y-2 text-sm text-bone/70">
              <li className="flex justify-between">
                <span>Fit técnico</span>
                <span className="text-bone">8 / 10</span>
              </li>
              <li className="flex justify-between">
                <span>Fit cultural</span>
                <span className="text-bone">7 / 10</span>
              </li>
              <li className="flex justify-between">
                <span>Banderas rojas</span>
                <span className="text-bone">Ninguna</span>
              </li>
            </ul>
            <div className="mt-4 text-xs px-3 py-2 rounded-lg bg-magenta/10 text-magenta border border-magenta/30">
              Recomendación: Avanzar con reservas
            </div>
          </div>
        </div>
      </section>

      <AudienceSection />
      <AboutSection />

      {/* CURSOS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl text-bone">Cursos</h2>
          <Link href="/cursos" className="text-sm text-magenta hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/cursos/${c.slug}`}
              className="card rounded-xl p-6 hover:border-magenta/60 transition-colors"
            >
              <span className="eyebrow">{c.format}</span>
              <h3 className="font-display text-xl text-bone mt-2 mb-2">{c.title}</h3>
              <p className="text-bone/60 text-sm">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* RECURSOS GRATIS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-2xl sm:text-3xl text-bone mb-8">
          Recursos gratuitos
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {freeResources.map((r) => (
            <div key={r.slug} className="card-alt rounded-xl p-6">
              <span className="eyebrow">{r.kind}</span>
              <h3 className="font-display text-lg text-bone mt-2 mb-2">{r.title}</h3>
              <p className="text-bone/60 text-sm mb-4">{r.description}</p>
              <Link
                href="/recursos"
                className="text-sm text-magenta hover:underline"
              >
                Descargar →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
