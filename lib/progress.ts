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
