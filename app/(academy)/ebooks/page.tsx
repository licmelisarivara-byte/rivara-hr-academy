import type { Metadata } from "next";
import { paidResources } from "@/lib/resources";
import ResourcePaymentActions from "@/components/ResourcePaymentActions";

export const metadata: Metadata = {
  title: "Ebooks y Kits de Prompts de IA para Selección de Personal",
  description:
    "Ebooks y kits de prompts listos para usar en selección de personal con IA: kit de 12 prompts, guía de automatización de reclutamiento, y el combo con descuento.",
};

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function EbooksPage({
  searchParams,
}: {
  searchParams?: { compra?: string };
}) {
  const compra = searchParams?.compra;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Ebooks</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
        Comprá, descargá y aplicá desde hoy
      </h1>
      <p className="text-bone/60 max-w-2xl mb-2">
        Ebooks y kits de prompts listos para usar en tus procesos de selección.
      </p>
      <p className="detail-text mb-14">
        Pago en USD (Payoneer) disponible solo para el combo. El Kit y la
        Guía por separado se cobran en ARS.
      </p>

      {compra === "fallida" && (
        <div className="card-alt rounded-xl p-4 mb-10 border border-magenta/40 text-sm text-bone/80">
          El pago no se pudo completar. Podés intentar de nuevo o escribirnos
          por WhatsApp para coordinar el pago.
        </div>
      )}

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
            <div className="relative w-full aspect-[1080/1520] rounded-lg overflow-hidden mb-4 bg-parchment border border-black/5">
              {r.image ? (
                <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-bone/30 text-sm">
                  Foto próximamente
                </div>
              )}
            </div>
            <span className="eyebrow">{r.kind}</span>
            <h3 className="font-display text-lg text-bone mt-2 mb-2">{r.title}</h3>
            <p className="text-bone/60 text-sm mb-5">{r.description}</p>

            <div className="mt-auto">
              <div className="mb-1">
                {r.priceARSTransferencia && (
                  <span className="text-bone/40 line-through text-sm mr-2">
                    {formatARS(r.priceARS)}
                  </span>
                )}
                <span className="font-display text-2xl text-bone">
                  {formatARS(r.priceARSTransferencia ?? r.priceARS)}
                </span>
                <span className="text-bone/40 text-xs ml-1">ARS</span>
              </div>
              {r.priceARSTransferencia && (
                <div className="text-bone/50 text-xs mb-1">
                  Por transferencia{r.payoneerLink ? " o Payoneer" : ""} · Mercado Pago:{" "}
                  {formatARS(r.priceARS)} (sin descuento)
                </div>
              )}
              <div className="text-bone/40 text-xs mb-1">
                USD {r.priceUSD}
                {!r.payoneerLink && " (solo referencia, se cobra en ARS)"}
              </div>
              {r.savingsARS && (
                <div className="mb-2">
                  <span className="inline-block text-xs font-semibold bg-magenta text-white px-3 py-1 rounded-full">
                    Ahorrás {formatARS(r.savingsARS)}
                  </span>
                </div>
              )}
              <div className={r.savingsARS ? "" : "mt-3"}>
                <ResourcePaymentActions resource={r} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
