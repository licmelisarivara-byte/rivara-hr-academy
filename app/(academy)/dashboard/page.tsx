"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";
import { courses, type Course } from "@/lib/courses";
import { getPaidResourceBySlug, freeResources } from "@/lib/resources";
import FreeResourceDownloadButton from "@/components/FreeResourceDownloadButton";
import ModuleVideoPlayer from "@/components/ModuleVideoPlayer";
import { getCompletedVideoIds } from "@/lib/progress";

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
  const [userName, setUserName] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<MyPurchase[]>([]);
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(new Set());
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  function startEditingName() {
    setNameInput(userName || "");
    setEditingName(true);
  }

  // Este nombre es el que se usa en el certificado (ver ModuleVideoPlayer
  // y las páginas de certificado) — por eso conviene poder corregirlo acá
  // sin depender de que haya quedado bien puesto en el registro.
  async function saveName() {
    if (!supabase) return;
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
    setSavingName(false);
    if (!error) {
      setUserName(trimmed);
      setEditingName(false);
    }
  }

  // El progreso vive en localStorage (por navegador, ver lib/progress.ts).
  // Se carga al entrar y se actualiza en vivo cuando termina un video,
  // sin esperar a un reload.
  useEffect(() => {
    setCompletedVideoIds(getCompletedVideoIds());
  }, []);

  // Qué cursos dejó plegados la alumna (acordeón) — también en
  // localStorage, así que si cerró "Creá tu propio asistente" para
  // enfocarse en el otro, sigue cerrado la próxima vez que entra.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("rivara_cursos_colapsados");
      if (raw) setCollapsedCourses(new Set(JSON.parse(raw)));
    } catch {
      // Si falla, arrancan todos expandidos — no es grave.
    }
  }, []);

  function toggleCourseCollapsed(slug: string) {
    setCollapsedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      try {
        window.localStorage.setItem("rivara_cursos_colapsados", JSON.stringify([...next]));
      } catch {
        // No es grave si no se puede guardar — solo no persiste entre visitas.
      }
      return next;
    });
  }

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
      setUserName(data.session?.user.user_metadata?.full_name ?? null);
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
  const liveCourses = myCourses.filter((c) => c.format === "En vivo");
  const recordedCourses = myCourses.filter((c) => c.format === "Grabado");
  // Solo separamos en dos listas cuando realmente hay de los dos tipos —
  // si es todo de un tipo, un solo subtítulo alcanza y no suma nada partirlo.
  const splitByFormat = liveCourses.length > 0 && recordedCourses.length > 0;

  function renderCourseCard(c: Course) {
    const trackableModules = c.modules.filter((m) => m.recordingVideoId);
    const completedCount = trackableModules.filter((m) =>
      completedVideoIds.has(m.recordingVideoId!)
    ).length;
    const totalCount = trackableModules.length;
    const isCollapsed = collapsedCourses.has(c.slug);

    return (
      <div key={c.slug} className="card rounded-xl p-6 border-t-4 border-t-magenta">
        <button
          type="button"
          onClick={() => toggleCourseCollapsed(c.slug)}
          className="w-full text-left flex items-start justify-between gap-4"
          aria-expanded={!isCollapsed}
        >
          <div className="flex-1">
            <span className="eyebrow">{c.format}</span>
            <p className="eyebrow mb-1 mt-1">¡Bienvenida al curso!</p>
            <h3 className="font-semibold text-bone mb-2">{c.title}</h3>
            {c.schedule && (
              <p className="text-sm text-bone/60">
                📅 {c.format === "En vivo" ? "Próxima clase: " : ""}
                {c.schedule}
              </p>
            )}
          </div>
          <span
            className={`text-bone/40 text-lg leading-none mt-1 transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        {totalCount > 0 && (
          <div className="mt-4">
            <p className="text-xs text-bone/50 mb-1.5">
              {completedCount} de {totalCount} módulos completados
            </p>
            <div className="h-1.5 w-full rounded-full bg-bone/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-magenta transition-all"
                style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {!isCollapsed && (
          <>
            {c.format === "En vivo" && (
              <div className="mt-4">
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

            <div className="space-y-6 mt-4">
              {c.modules.map((m) => (
                <div key={m.title}>
                  <p className="text-xs text-bone/50 mb-2">{m.title}</p>
                  {m.recordingVideoId ? (
                    <ModuleVideoPlayer
                      title={m.title}
                      videoId={m.recordingVideoId}
                      startSeconds={m.recordingStartSeconds}
                      triggersCertificate={m.triggersCertificate}
                      certificadoTipo={c.certificadoTipo}
                      certificadoUrl={c.certificadoUrl}
                      userEmail={userEmail}
                      userName={userName}
                      onComplete={(videoId) =>
                        setCompletedVideoIds((prev) => new Set(prev).add(videoId))
                      }
                    />
                  ) : (
                    <p className="text-xs text-bone/40">
                      Grabación disponible después de esta clase.
                    </p>
                  )}

                  {m.materials && m.materials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {m.materials.map((mat) => (
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
                  )}
                </div>
              ))}
            </div>

            {c.checklistUrl && (
              <div className="mb-4">
                <a
                  href={c.checklistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta bg-sage text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-colors inline-block text-xs"
                >
                  ✅ Checklist para ir chequeando tus pasos →
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {c.certificadoUrl && (
                <a href={c.certificadoUrl} className="text-magenta hover:underline">
                  🏆 Pedí tu certificado →
                </a>
              )}
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Mi cuenta</p>
      <h1 className="font-display text-3xl text-bone mb-2">Hola de nuevo</h1>
      <p className="text-bone/50 mb-2">{userEmail}</p>

      {editingName ? (
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Tu nombre completo"
            autoFocus
            className="rounded-lg bg-panel border border-black/10 px-3 py-1.5 text-sm text-bone focus:border-magenta outline-none"
          />
          <button
            type="button"
            onClick={saveName}
            disabled={savingName}
            className="btn-cta bg-magenta text-white px-4 py-1.5 rounded-full text-sm hover:bg-magentaSoft transition-colors disabled:opacity-50"
          >
            {savingName ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditingName(false)}
            className="text-xs text-bone/50 hover:underline"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <p className="text-sm text-bone/50 mb-10">
          {userName ? `Nombre: ${userName}` : "Todavía no cargaste tu nombre"} ·{" "}
          <button type="button" onClick={startEditingName} className="text-magenta hover:underline">
            ✏️ Editar
          </button>
          {userName && (
            <span className="block text-xs text-bone/40 mt-0.5">
              (así aparece en tu certificado)
            </span>
          )}
        </p>
      )}

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
        {myCourses.length === 0 ? (
          <>
            <h2 className="font-display text-xl text-bone mb-4">Tus clases</h2>
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
          </>
        ) : splitByFormat ? (
          <>
            <div>
              <h2 className="font-display text-xl text-bone mb-4">
                🔴 Tus cursos en vivo
              </h2>
              <div className="space-y-8">{liveCourses.map(renderCourseCard)}</div>
            </div>

            <div className="hairline my-10" />

            <div>
              <h2 className="font-display text-xl text-bone mb-4">
                🎬 Tus cursos grabados
              </h2>
              <div className="space-y-8">{recordedCourses.map(renderCourseCard)}</div>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl text-bone mb-4">Tus clases</h2>
            <div className="space-y-8">{myCourses.map(renderCourseCard)}</div>
          </>
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
