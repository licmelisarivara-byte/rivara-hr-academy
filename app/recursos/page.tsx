"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { freeResources, paidResources } from "@/lib/resources";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import ResourceCheckoutButton from "@/components/ResourceCheckoutButton";

function formatARS(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default function RecursosPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Recursos</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
        Material para tu día a día
      </h1>
      <p className="text-bone/60 max-w-2xl mb-14">
        Prompts y guías que uso yo misma en procesos de selección reales.
      </p>

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
        <p className="text-bone/50 text-sm mb-8">
          Material listo para usar.
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
                <div className="text-bone/50 text-xs mb-1">USD {r.priceUSD}</div>
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

        <div className="grid md:grid-cols-2 gap-6">
          {freeResources.map((r) => (
            <div key={r.slug} className="card-alt rounded-xl p-6 flex flex-col">
              <span className="eyebrow">{r.kind}</span>
              <h3 className="font-display text-lg text-bone mt-2 mb-2">{r.title}</h3>
              <p className="text-bone/60 text-sm mb-6">{r.description}</p>
              <div className="mt-auto">
                {!r.fileUrl ? (
                  <span className="text-sm text-bone/40 italic">
                    Disponible muy pronto
                  </span>
                ) : supabaseConfigured && !loggedIn ? (
                  <Link
                    href="/registro"
                    className="text-sm bg-sage text-white font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
                  >
                    Registrarme para descargar
                  </Link>
                ) : (
                  <a
                    href={r.fileUrl}
                    download
                    className="text-sm bg-sage text-white font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
                  >
                    Descargar gratis
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
