"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import { courses } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";

type MyPurchase = { resource_slug: string; title: string; paid_at: string | null };

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Mi cuenta</p>
      <h1 className="font-display text-3xl text-bone mb-2">Hola de nuevo</h1>
      <p className="text-bone/50 mb-10">{userEmail}</p>

      {purchases.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-xl text-bone mb-4">Tus compras</h2>
          <div className="space-y-4">
            {purchases.map((p) => {
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

      {/*
        TODO (backend): esta sección hoy lista todos los cursos.
        Falta la tabla `inscripciones` en Supabase (user_id, course_slug,
        fecha_pago) para filtrar solo los cursos que el alumno compró.
      */}
      <h2 className="font-display text-xl text-bone mb-4">Tus clases</h2>
      <div className="space-y-4">
        {courses.map((c) => (
          <div key={c.slug} className="card rounded-xl p-6">
            <h3 className="font-semibold text-bone mb-2">{c.title}</h3>
            {c.freePreviewVideoId ? (
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${c.freePreviewVideoId}`}
                  title={c.title}
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-bone/50">
                Video no cargado todavía — se sube como no listado en
                YouTube/Vimeo y se pega el ID acá.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
