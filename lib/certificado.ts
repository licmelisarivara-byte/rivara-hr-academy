import { getEventBySlug } from "@/lib/events";

// Datos de la masterclass en vivo del 4/8. El link de la grabación toma por
// default el mismo youtubeLink que ya usa /masterclass (lib/events.ts) — es
// el link en vivo, que YouTube deja como "grabación" automáticamente
// terminado el stream. Si el score que dio Claude en la demo cambia el día
// del vivo, editá CERTIFICADO_RESPUESTA_CORRECTA en las variables de entorno
// (Vercel) en vez de tocar código.
const evento = getEventBySlug("analiza-cvs-con-ia");

export const CERTIFICADO_EVENTO = {
  titulo: "Masterclass — Analizá un CV con IA en segundos",
  fecha: "martes 4 de agosto de 2026",
  fechaCorta: "04 / 08 / 2026",
};

export const CERTIFICADO_RESPUESTA_CORRECTA =
  process.env.CERTIFICADO_RESPUESTA_CORRECTA ?? "42";

export const CERTIFICADO_GRABACION_URL =
  process.env.CERTIFICADO_GRABACION_URL ?? evento?.youtubeLink ?? "";

export function normalizarRespuesta(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function esRespuestaCorrecta(raw: string): boolean {
  const normalizada = normalizarRespuesta(raw);
  const correcta = normalizarRespuesta(CERTIFICADO_RESPUESTA_CORRECTA);
  // Acepta el número solo ("42") o con el formato que mostró la demo ("42/100").
  return normalizada === correcta || normalizada === `${correcta}/100`;
}
