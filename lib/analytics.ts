// Eventos de Google Analytics 4 y atribución (UTM) del lado del navegador.
// Todo es a prueba de fallos: si gtag no está cargado, si el navegador bloquea
// sessionStorage o si el servidor no responde, la página sigue funcionando.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const UTM_STORAGE_KEY = "rivara_utm";
const NO_TRACK_KEY = "rivara_no_track";

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

// Visitando cualquier página con ?notrack=1 este navegador deja de mandar
// eventos (para las pruebas de Melisa); ?notrack=0 lo reactiva.
function isTrackingDisabled(): boolean {
  try {
    return window.localStorage.getItem(NO_TRACK_KEY) === "1";
  } catch {
    return false;
  }
}

export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  if (typeof window === "undefined" || isTrackingDisabled()) return;
  try {
    // transport_type beacon: el evento sale igual aunque la página cambie
    // enseguida (por ejemplo al redirigir a Mercado Pago).
    (window as any).gtag?.("event", name, { ...params, transport_type: "beacon" });
  } catch {
    // sin analytics no pasa nada
  }
}

// Se llama una vez al llegar al sitio (ver components/UtmCapture.tsx).
export function saveUtmFromLocation() {
  if (typeof window === "undefined") return;
  try {
    const search = new URLSearchParams(window.location.search);

    const noTrack = search.get("notrack");
    if (noTrack === "1") window.localStorage.setItem(NO_TRACK_KEY, "1");
    if (noTrack === "0") window.localStorage.removeItem(NO_TRACK_KEY);

    const found: UtmParams = {};
    for (const key of UTM_KEYS) {
      const value = search.get(key);
      if (value) found[key] = value.slice(0, 200);
    }
    // Solo se pisa lo guardado si esta visita trae UTM propios: así los UTM
    // del anuncio original sobreviven mientras la persona navega el sitio.
    if (Object.keys(found).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // sessionStorage bloqueado: simplemente no hay atribución
  }
}

export function getUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

function isTestEnvironment(email: string): boolean {
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host.endsWith(".vercel.app") ||
    email.toLowerCase().endsWith("@example.com")
  );
}

// Un lead REAL: alguien que dejó sus datos y el servidor los registró (no un
// simple clic en un botón). Se cuenta una sola vez por persona, curso y
// origen dentro de la misma sesión, y no se manda a Analytics desde
// localhost, previews de Vercel ni mails @example.com.
// La atribución (UTM) se guarda siempre en el servidor, para saber de qué
// anuncio vino cada inscripta.
export function trackLead(email: string, source: string, courseSlug?: string) {
  if (typeof window === "undefined" || !email) return;
  try {
    const dedupeKey = `rivara_lead_${source}_${courseSlug ?? ""}_${email.toLowerCase()}`;
    if (window.sessionStorage.getItem(dedupeKey)) return;
    window.sessionStorage.setItem(dedupeKey, "1");
  } catch {
    // sin sessionStorage no se puede deduplicar; seguimos igual
  }

  if (!isTestEnvironment(email)) {
    trackEvent("generate_lead", { lead_source: source, course_slug: courseSlug });
  }

  if (isTrackingDisabled()) return;
  fetch("/api/atribucion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      evento: source,
      curso_slug: courseSlug,
      landing_path: window.location.pathname,
      ...getUtm(),
    }),
    keepalive: true,
  }).catch(() => {});
}
