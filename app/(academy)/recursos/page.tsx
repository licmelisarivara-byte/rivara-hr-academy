import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { freeResources } from "@/lib/resources";
import FreeResourceDownloadButton from "@/components/FreeResourceDownloadButton";
import FreeComboSignup from "@/components/FreeComboSignup";

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
            🎥 Masterclass grabada
          </span>
          <h3 className="font-display text-base text-bone mb-0.5">
            Analizá un CV con IA en segundos
          </h3>
          <span className="text-magenta text-xs font-semibold">
            Ver la grabación gratis →
          </span>
        </div>
      </Link>

      <div className="rounded-xl p-5 sm:p-6 grid sm:grid-cols-[1fr_auto] gap-5 items-center border border-magenta bg-gradient-to-br from-panelAlt to-panel mb-10">
        <div>
          <span className="inline-block text-[10px] font-semibold bg-magenta text-white px-2 py-0.5 rounded-full mb-1.5">
            🎁 Combo gratis
          </span>
          <h3 className="font-display text-base text-bone mb-1">
            Llevate todo el combo gratis
          </h3>
          <p className="text-bone/60 text-xs">
            Los 3 PDFs + la masterclass grabada, con un solo registro.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <FreeComboSignup />
        </div>
      </div>

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
