"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import { courses } from "@/lib/courses";
import { getPaidResourceBySlug, freeResources } from "@/lib/resources";
import FreeResourceDownloadButton from "@/components/FreeResourceDownloadButton";

type MyPurchase = {
  kind: "resource" | "course";
  resource_slug: string;
  title: string;
  paid_at: string | null;
};

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const compra = searchParams.get("compra");
  const verified = searchParams.get("verified") === "1";
  const nextAfterVerify = searchParams.get("next");
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<MyPurchase[]>([]);

  useEffect(() => {
    if (compra !== "exitosa") return;
    // Evita contar la conversión dos veces si la persona refresca esta página.
    if (sessionStorage.getItem("compra_exitosa_tracked")) return;
    sessionStorage.setItem("compra_exitosa_tracked", "1");
    (window as any).gtag?.("event", "purchase", {
      event_category: "checkout",
    });
  }, [compra]);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      setChecking(false);

      const token = data.session?.access_token;
      if (!token) return;
      try {
        const res = await fetch("/api/mis-compras", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const body = await res.json();
          setPurchases(body.purchases ?? []);
        }
      } catch {
        // Si falla, simplemente no mostramos la sección de compras.
      }
    });
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <meta name="robots" content="noindex, nofollow" />
        <ConfigNotice what="el login y las compras de los alumnos" />
      </div>
    );
  }

  if (checking) {
    return <div className="max-w-4xl mx-auto px-6 py-16 text-bone/50">Cargando...</div>;
  }

  if (!userEmail) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <meta name="robots" content="noindex, nofollow" />
        <h1 className="font-display text-2xl text-bone mb-4">Necesitás ingresar</h1>
        <Link href="/login" className="text-magenta hover:underline">
          Ir a login →
        </Link>
      </div>
    );
  }

  const resourcePurchases = purchases.filter((p) => p.kind === "resource");
  const purchasedCourseSlugs = new Set(
    purchases.filter((p) => p.kind === "course").map((p) => p.resource_slug)
  );
  const myCourses = courses.filter((c) => purchasedCourseSlugs.has(c.slug));

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Mi cuenta</p>
      <h1 className="font-display text-3xl text-bone mb-2">Hola de nuevo</h1>
      <p className="text-bone/50 mb-10">{userEmail}</p>

      {verified && (
        <div className="card-alt rounded-xl p-4 mb-10 border border-sage/40 text-sm text-bone/80">
          ✅ ¡Tu cuenta quedó verificada! Ya podés acceder a todo tu
          contenido.
          {nextAfterVerify && nextAfterVerify !== "/dashboard" && (
            <>
              {" "}
              <Link href={nextAfterVerify} className="text-magenta hover:underline">
                Volver a lo que estabas viendo →
              </Link>
            </>
          )}
        </div>
      )}

      {compra === "exitosa" && (
        <div className="card-alt rounded-xl p-4 mb-10 border border-sage/40 text-sm text-bone/80">
          ¡Gracias por tu compra! En cuanto se confirme el pago, lo vas a ver
          acá abajo (puede tardar unos minutos).
        </div>
      )}
      {compra === "fallida" && (
        <div className="card-alt rounded-xl p-4 mb-10 border border-magenta/40 text-sm text-bone/80">
          El pago no se pudo completar. Podés intentar de nuevo o escribirnos
          por WhatsApp para coordinar el pago.
        </div>
      )}

      {resourcePurchases.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-xl text-bone mb-4">Tus compras</h2>
          <div className="space-y-4">
            {resourcePurchases.map((p) => {
              const resource = getPaidResourceBySlug(p.resource_slug);
              const links = resource?.fileUrls?.length
                ? resource.fileUrls
                : resource?.fileUrl
                ? [resource.fileUrl]
                : [];
              return (
                <div key={`${p.resource_slug}-${p.paid_at}`} className="card rounded-xl p-6">
                  <h3 className="font-semibold text-bone mb-2">{p.title}</h3>
                  {links.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {links.map((link) => (
                        <a
                          key={link}
                          href={link}
                          download
                          className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block text-sm"
                        >
                          Descargar →
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-bone/50">
                      Ya la tenemos registrada, en breve te llega el archivo.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-12">
        <h2 className="font-display text-xl text-bone mb-4">Tus clases</h2>
        {myCourses.length === 0 ? (
          <p className="text-sm text-bone/50">
            Todavía no tenés ningún curso inscripto.{" "}
            <Link href="/cursos" className="text-magenta hover:underline">
              Ver cursos disponibles →
            </Link>
            <br />
            <span className="text-xs">
              (Si pagaste por transferencia o Payoneer, puede tardar un poco en
              aparecer mientras confirmamos el pago.)
            </span>
          </p>
        ) : (
          <div className="space-y-4">
            {myCourses.map((c) => (
              <div key={c.slug} className="card rounded-xl p-6">
                <p className="eyebrow mb-1">¡Bienvenida al curso!</p>
                <h3 className="font-semibold text-bone mb-2">{c.title}</h3>
                {c.schedule && <p className="text-sm text-bone/60 mb-4">📅 {c.schedule}</p>}

                {c.format === "En vivo" && (
                  <div className="mb-4">
                    {c.meetLink ? (
                      <a
                        href={c.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cta bg-magenta text-white px-4 py-2 rounded-full hover:bg-magentaSoft transition-colors inline-block text-sm"
                      >
                        Unirte a la clase por Google Meet →
                      </a>
                    ) : (
                      <p className="text-sm text-bone/50">
                        Te vamos a compartir acá el link de Google Meet antes de la clase.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-4">
                  {c.modules.map((m) => (
                    <div key={m.title}>
                      <p className="text-xs text-bone/50 mb-2">{m.title}</p>
                      {m.recordingVideoId ? (
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${m.recordingVideoId}`}
                            title={m.title}
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-bone/40">
                          Grabación disponible después de esta clase.
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {c.materials && c.materials.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-bone/50 mb-2">Materiales</p>
                    <div className="flex flex-wrap gap-2">
                      {c.materials.map((mat) => (
                        <a
                          key={mat.url}
                          href={mat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-cta bg-sage text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-colors inline-block text-xs"
                        >
                          {mat.title} →
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href="https://wa.me/5491123912820"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-magenta hover:underline"
                  >
                    Consultas por WhatsApp →
                  </a>
                  {c.whatsappGroupLink && (
                    <a
                      href={c.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-magenta hover:underline"
                    >
                      Sumarte al grupo de WhatsApp →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl text-bone mb-4">Recursos gratis</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {freeResources.map((r) => (
            <div key={r.slug} className="card rounded-xl p-5 flex flex-col">
              <h3 className="font-semibold text-bone text-sm mb-3">{r.title}</h3>
              <div className="mt-auto">
                <FreeResourceDownloadButton resource={r} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
