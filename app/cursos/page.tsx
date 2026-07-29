import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Cursos de IA para Selección de Personal",
  description:
    "Cursos en vivo y grabados para aplicar IA en selección de personal: armá tu asistente de selección, tu propio ATS, y sumá Claude a tu día a día de RRHH.",
};

export default function CursosPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Catálogo</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-10">Cursos</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div
            key={c.slug}
            className="card rounded-xl overflow-hidden flex flex-col hover:border-magenta/60 transition-colors"
          >
            <div className="relative w-full aspect-[1080/1520] bg-parchment">
              {c.image ? (
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-bone/30 text-sm">
                  Foto próximamente
                </div>
              )}
            </div>
            <div className="p-7 flex flex-col flex-1">
              <span className="eyebrow">{c.format}</span>
              <h2 className="font-display text-xl text-bone mt-2 mb-2">{c.title}</h2>
              <p className="text-bone/60 text-sm mb-6">{c.tagline}</p>
              <div className="mt-auto flex items-center justify-between gap-4">
                <span className="detail-text">{c.price}</span>
                <Link
                  href={`/cursos/${c.slug}`}
                  className="btn-cta bg-magenta text-white px-5 py-2.5 rounded-full hover:bg-magentaSoft transition-colors"
                >
                  Ver más →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
