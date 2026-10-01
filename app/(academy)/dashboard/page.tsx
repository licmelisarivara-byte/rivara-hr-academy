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
import { getCompletedVideoIds, getCertificadoGenerado } from "@/lib/progress";

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
  // Certificados ya generados (certificadoTipo -> {id, nombre}), para
  // mostrarlos fijos más abajo de cada curso, no solo dentro del video del
  // módulo que los dispara — ver lib/progress.ts.
  const [certificados, setCertificados] = useState<Record<string, { id: string; nombre: string }>>({});
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  function startEditingName() {
    setNameInput(userName || "");
    setEditingName(true);
  }

  function startEditingPassword() {
    setPasswordInput("");
    setPasswordError("");
    setPasswordSaved(false);
    setEditingPassword(true);
  }

  // Cambio de contraseña desde el dashboard — antes solo se podía desde
  // "¿Olvidaste tu contraseña?" en /login (que manda un mail), no había
  // forma de cambiarla estando ya logueada.
  async function savePassword() {
    if (!supabase) return;
    if (passwordInput.length < 6) {
      setPasswordError("Tiene que tener al menos 6 caracteres.");
      return;
    }
    setPasswordError("");
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordInput });
    setSavingPassword(false);
    if (error) {
      setPasswordError("No se pudo cambiar. Probá de nuevo en un rato.");
      return;
    }
    setPasswordInput("");
    setEditingPassword(false);
    setPasswordSaved(true);
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

  // Certificados ya generados en este navegador, uno por curso (si lo
  // tiene) — se leen todos juntos al entrar, así la tarjeta queda fija de
  // entrada sin esperar a que la alumna abra el video del módulo.
  useEffect(() => {
    const encontrados: Record<string, { id: string; nombre: string }> = {};
    for (const c of courses) {
      if (!c.certificadoTipo) continue;
      const guardado = getCertificadoGenerado(c.certificadoTipo);
      if (guardado) encontrados[c.certificadoTipo] = guardado;
    }
    setCertificados(encontrados);
  }, []);

  // Qué cursos dejó plegados la alumna (acordeón) — también en
  // localStorage, así que si cerró "Creá tu propio asistente" para
  // enfocarse en el otro, sigue cerrado la próxima vez que entra. Si
  // todavía no tocó nada (primera vez) y tiene más de un curso, arrancan
  // plegados todos menos el primero — si no, con 2 o 3 cursos el dashboard
  // es una sola pantalla larguísima de scroll antes de ver nada útil.
  useEffect(() => {
    if (purchases.length === 0) return;
    try {
      const raw = window.localStorage.getItem("rivara_cursos_colapsados");
      if (raw) {
        setCollapsedCourses(new Set(JSON.parse(raw)));
        return;
      }
      const purchasedSlugs = new Set(
        purchases.filter((p) => p.kind === "course").map((p) => p.resource_slug)
      );
      const slugsInOrder = courses.filter((c) => purchasedSlugs.has(c.slug)).map((c) => c.slug);
      if (slugsInOrder.length > 1) {
        setCollapsedCourses(new Set(slugsInOrder.slice(1)));
      }
    } catch {
      // Si falla, arrancan todos expandidos — no es grave.
    }
  }, [purchases]);

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

      // Certificados ya generados, desde la base (no solo localStorage) —
      // así se ven también si la alumna entra desde otro dispositivo o
      // navegador distinto al que usó para generarlo. Se combina con lo
      // que ya había en localStorage en vez de reemplazarlo, por si la
      // base tarda un poco más en responder.
      try {
        const res = await fetch("/api/mis-certificados", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const body = await res.json();
          if (body.certificados) {
            setCertificados((prev) => ({ ...prev, ...body.certificados }));
          }
        }
      } catch {
        // Si falla, queda lo que ya se haya leído de localStorage.
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
    const trackableModules = c.modules.filter((m) => m.recordingVideoId && !m.progressExempt);
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
            <h3 className="font-semibold text-bone mb-2 mt-1">{c.title}</h3>
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
                      onCertificado={(cert) =>
                        c.certificadoTipo &&
                        setCertificados((prev) => ({ ...prev, [c.certificadoTipo!]: cert }))
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

            {/* Certificado ya generado: queda fijo acá abajo (no solo
                adentro del video del módulo que lo dispara), con las mismas
                acciones de LinkedIn/reseña que se ven justo al generarlo —
                así no hay que ir a buscarlo entre los módulos cada vez. */}
            {(() => {
              const cert = c.certificadoTipo ? certificados[c.certificadoTipo] : undefined;
              if (!cert) return null;
              return (
                <div className="card-alt rounded-xl p-5 mb-4 border border-sage/40 text-center">
                  <p className="text-sm text-bone/80 mb-3">
                    🏆 Tu certificado de {c.title}, {cert.nombre.split(" ")[0]}:
                  </p>
                  <div className="rounded-lg overflow-x-auto border border-black/10 mb-4 max-w-2xl mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/certificado/imagen/${cert.id}`}
                      alt={`Certificado de participación de ${cert.nombre}`}
                      className="h-auto max-w-none"
                      style={{ width: "100%", minWidth: 560 }}
                    />
                  </div>
                  <a
                    href={`/api/certificado/imagen/${cert.id}`}
                    download
                    className="btn-cta bg-magenta text-white px-5 py-2.5 rounded-full hover:bg-magentaSoft transition-colors inline-block text-sm"
                  >
                    Descargar mi certificado
                  </a>

                  <div className="hairline my-4" />

                  <p className="text-xs text-bone/60 mb-2">
                    ¿Te sirvió el curso? Dejame tu reseña en Google 🙏
                  </p>
                  <a
                    href="https://maps.app.goo.gl/XEqBvBxA2DWxxUrZ8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta bg-magenta text-white px-4 py-2 rounded-full hover:bg-magentaSoft transition-colors inline-block text-sm"
                  >
                    Dejar mi reseña →
                  </a>
                  <div className="mt-3">
                    <a
                      href="https://www.linkedin.com/company/rivara-hr-academy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block text-sm"
                    >
                      Compartir en LinkedIn →
                    </a>
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-4 text-sm">
              {c.certificadoUrl && !(c.certificadoTipo && certificados[c.certificadoTipo]) && (
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
        <div className="flex flex-wrap items-center gap-2 mb-2">
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
        <p className="text-sm text-bone/50 mb-2">
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

      {editingPassword ? (
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nueva contraseña"
              autoFocus
              className="rounded-lg bg-panel border border-black/10 px-3 py-1.5 text-sm text-bone focus:border-magenta outline-none"
            />
            <button
              type="button"
              onClick={savePassword}
              disabled={savingPassword}
              className="btn-cta bg-magenta text-white px-4 py-1.5 rounded-full text-sm hover:bg-magentaSoft transition-colors disabled:opacity-50"
            >
              {savingPassword ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setEditingPassword(false)}
              className="text-xs text-bone/50 hover:underline"
            >
              Cancelar
            </button>
          </div>
          {passwordError && <p className="text-xs text-magenta mt-1.5">{passwordError}</p>}
        </div>
      ) : (
        <p className="text-sm text-bone/50 mb-10">
          <button type="button" onClick={startEditingPassword} className="text-magenta hover:underline">
            🔒 Cambiar contraseña
          </button>
          {passwordSaved && (
            <span className="block text-xs text-sage mt-0.5">✅ Contraseña actualizada.</span>
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
