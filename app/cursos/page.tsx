import Link from "next/link";
import { courses } from "@/lib/courses";

export default function CursosPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Catálogo</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-10">Cursos</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <Link
            key={c.slug}
            href={`/cursos/${c.slug}`}
            className="card rounded-xl p-7 hover:border-magenta/60 transition-colors flex flex-col"
          >
            <span className="eyebrow">{c.format}</span>
            <h2 className="font-display text-xl text-bone mt-2 mb-2">{c.title}</h2>
            <p className="text-bone/60 text-sm mb-6">{c.tagline}</p>
            <div className="mt-auto flex items-center justify-between text-sm">
              <span className="text-bone/50">{c.price}</span>
              <span className="text-magenta">Ver detalle →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
