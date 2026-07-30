import type { Metadata } from "next";
import Link from "next/link";
import { freeResources } from "@/lib/resources";
import { supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import FreeResourceDownloadButton from "@/components/FreeResourceDownloadButton";

export const metadata: Metadata = {
  title: "Recursos Gratis de IA para Selección de Personal",
  description:
    "Prompts y guías gratuitas para aplicar IA en selección de personal: kit de prompts, prompt maestro de análisis de CVs, y búsqueda booleana en LinkedIn.",
};

export default function RecursosPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Recursos</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
        Empezá sin costo
      </h1>
      <p className="text-bone/60 max-w-2xl mb-14">
        Prompts y guías que uso yo misma en procesos de selección reales,
        sin costo. ¿Buscás algo más completo?{" "}
        <Link href="/ebooks" className="text-magenta hover:underline">
          Mirá los ebooks pagos →
        </Link>
      </p>

      {!supabaseConfigured && (
        <div className="mb-8">
          <ConfigNotice what="la descarga con login" />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {freeResources.map((r) => (
          <div key={r.slug} className="card-alt rounded-xl p-6 flex flex-col">
            <span className="eyebrow">{r.kind}</span>
            <h3 className="font-display text-lg text-bone mt-2 mb-2">{r.title}</h3>
            <p className="text-bone/60 text-sm mb-6">{r.description}</p>
            <div className="mt-auto">
              <FreeResourceDownloadButton resource={r} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
