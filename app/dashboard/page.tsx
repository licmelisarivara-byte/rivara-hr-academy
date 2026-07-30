"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import { courses } from "@/lib/courses";
import { getPaidResourceBySlug, freeResources } from "@/lib/resources";

type MyPurchase = {
  kind: "resource" | "course";
  resource_slug: string;
  title: string;
  paid_at: string | null;
};

export default function DashboardPage() {
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<MyPurchase[]>([]);

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
                <h3 className="font-semibold text-bone mb-3">{c.title}</h3>

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

                <div className="space-y-4">
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
              {r.fileUrl ? (
                <a
                  href={r.fileUrl}
                  download
                  className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block text-center text-sm mt-auto"
                >
                  Descargar →
                </a>
              ) : (
                <p className="text-xs text-bone/40 mt-auto">Próximamente</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
