// Progreso de módulos vistos. Se guarda en localStorage del navegador de
// la alumna (por dispositivo, sin necesitar una tabla nueva en la base) —
// alcanza para mostrar un indicador simple tipo "2 de 7 módulos
// completados" en el dashboard. Ver components/ModuleVideoPlayer.tsx
// (marca completado al terminar el video) y app/(academy)/dashboard.
const KEY = "rivara_progreso_modulos";

export function getCompletedVideoIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markVideoCompleted(videoId: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getCompletedVideoIds();
    set.add(videoId);
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // localStorage puede fallar (modo privado, storage lleno, etc.) — no
    // es grave, el progreso es solo un indicador visual.
  }
}

// Certificado ya generado por curso (certificadoTipo -> {id, nombre}). Se
// guarda acá, en el mismo estilo que el progreso de arriba, para que la
// tarjeta de "ya tenés tu certificado" siga a la vista al recargar la
// página o volver al dashboard — sin esto, ModuleVideoPlayer perdía el
// estado en cada mount y la alumna veía de nuevo solo el video, como si no
// hubiera generado nada.
const CERT_KEY = "rivara_certificados_generados";

type CertificadoGuardado = { id: string; nombre: string };

export function getCertificadoGenerado(tipo: string): CertificadoGuardado | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CERT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const cert = parsed?.[tipo];
    return cert?.id && cert?.nombre ? cert : null;
  } catch {
    return null;
  }
}

export function setCertificadoGenerado(tipo: string, cert: CertificadoGuardado) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CERT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[tipo] = cert;
    window.localStorage.setItem(CERT_KEY, JSON.stringify(parsed));
  } catch {
    // Igual que arriba: si falla, la alumna solo pierde el atajo visual,
    // no el certificado en sí (sigue existiendo en certificado_solicitudes
    // y se puede volver a pedir desde /cursos/.../certificado).
  }
}
