import Link from "next/link";
import { notes } from "@/lib/notes";

export default function NotasPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Notas</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-6">
        Notas de selección
      </h1>
      <p className="text-bone/60 mb-10">
        Reflexiones y aprendizajes de selección con IA — como un diario
        profesional para colegas.
      </p>

      {notes.length === 0 ? (
        <div className="card rounded-xl p-8 text-center text-bone/50">
          Todavía no hay notas publicadas.
        </div>
      ) : (
        <div className="space-y-6">
          {notes.map((n) => (
            <Link
              key={n.slug}
              href={`/notas/${n.slug}`}
              className="card rounded-xl p-7 block hover:border-magenta/60 transition-colors"
            >
              <div className="detail-text mb-2">{n.date}</div>
              <h2 className="font-display text-xl text-bone mb-2">{n.title}</h2>
              <p className="text-bone/60 text-sm mb-4">{n.excerpt}</p>
              <span className="text-magenta text-sm font-semibold">Leer más →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
