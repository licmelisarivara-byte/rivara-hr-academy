import type { Metadata } from "next";
import { freeResources, paidResources } from "@/lib/resources";
import { bankDetails } from "@/lib/bankDetails";
import { supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import ResourceCheckoutButton from "@/components/ResourceCheckoutButton";
import FreeResourceDownloadButton from "@/components/FreeResourceDownloadButton";

export const metadata: Metadata = {
  title: "Recursos y Ebooks de IA para Selección de Personal",
  description:
    "Prompts y guías gratis y pagas para aplicar IA en selección de personal: kit de prompts, búsqueda booleana en LinkedIn, y guía de automatización de reclutamiento.",
};

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function RecursosPage({
  searchParams,
}: {
  searchParams?: { compra?: string };
}) {
  const compra = searchParams?.compra;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Recursos</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
        Material para tu día a día
      </h1>
      <p className="text-bone/60 max-w-2xl mb-14">
        Prompts y guías que uso yo misma en procesos de selección reales.
      </p>

      {compra === "exitosa" && (
        <div className="card-alt rounded-xl p-4 mb-10 border border-sage/40 text-sm text-bone/80">
          ¡Gracias por tu compra! Te enviamos el PDF por email apenas se
          confirmó el pago (revisá también spam). Si en unos minutos no te
          llegó, escribinos por WhatsApp.
        </div>
      )}
      {compra === "fallida" && (
        <div className="card-alt rounded-xl p-4 mb-10 border border-magenta/40 text-sm text-bone/80">
          El pago no se pudo completar. Podés intentar de nuevo o escribirnos
          por WhatsApp para coordinar el pago.
        </div>
      )}

      {/* EBOOKS Y RECURSOS PAGOS */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold bg-magenta text-white px-2.5 py-1 rounded-full">
            PAGO
          </span>
          <span className="eyebrow">Ebooks y recursos descargables</span>
        </div>
        <h2 className="font-display text-2xl text-bone mb-1">
          Comprá, descargá y aplicá desde hoy
        </h2>
        <p className="text-bone/50 text-sm mb-2">
          Material listo para usar.
        </p>
        <p className="detail-text mb-8">
          Pago en USD (Payoneer) disponible solo para el combo. El Kit y la
          Guía por separado se cobran en ARS.
        </p>

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
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-2xl text-bone">
                    {formatARS(r.priceARS)}
                  </span>
                  <span className="text-bone/40 text-xs">ARS</span>
                </div>
                <div className="text-bone/50 text-xs mb-1">
                  USD {r.priceUSD}
                  {!r.payoneerLink && (
                    <span className="text-bone/40"> (solo referencia, se cobra en ARS)</span>
                  )}
                </div>
                {r.savingsARS && (
                  <div className="text-magenta text-xs mb-3">
                    Ahorrás {formatARS(r.savingsARS)}
                  </div>
                )}
                <div className={r.savingsARS ? "" : "mt-3"}>
                  <ResourceCheckoutButton resource={r} />
                </div>
                {r.payoneerLink && (
                  <a
                    href={r.payoneerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-text block text-center mt-2 hover:text-magenta"
                  >
                    Pagar en USD con Payoneer →
                  </a>
                )}
                <a
                  href={`https://wa.me/5491123912820?text=${encodeURIComponent(
                    `Hola! Quiero pagar por transferencia: ${r.title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-text block text-center mt-2 hover:text-magenta"
                >
                  o por transferencia →
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="card-alt rounded-xl p-6 mt-8 text-sm text-bone/70">
          <p className="font-semibold text-bone mb-2">
            ¿Preferís transferencia bancaria?
          </p>
          <p>Titular: {bankDetails.holder}</p>
          <p>CBU: {bankDetails.cbu}</p>
          <p>Alias: {bankDetails.alias}</p>
          <p>CUIL: {bankDetails.cuil}</p>
          <p className="mt-2 text-xs text-bone/50">
            Transferí y escribinos por WhatsApp contándonos qué recurso
            querés — confirmamos el pago y te enviamos el PDF por ahí mismo.
          </p>
        </div>
      </section>

      <div className="hairline mb-16" />

      {/* RECURSOS GRATUITOS */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold bg-sage text-white px-2.5 py-1 rounded-full">
            GRATIS
          </span>
          <span className="eyebrow">Recursos gratuitos</span>
        </div>
        <h2 className="font-display text-2xl text-bone mb-1">Empezá sin costo</h2>
        <p className="text-bone/50 text-sm mb-8">
          Descargá herramientas sin costo para empezar a aplicar IA en tu selección.
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
      </section>
    </div>
  );
}
