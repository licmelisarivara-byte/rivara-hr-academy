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
  process.env.CERTIFICADO_RESPUESTA_CORRECTA ?? "48/100";

// Opciones que se muestran como tildable en el formulario (en vez de un
// campo de texto libre, para no dar pistas con el placeholder). La correcta
// tiene que ser exactamente el string de CERTIFICADO_RESPUESTA_CORRECTA.
// Si el score real cambia, actualizar ambas constantes juntas.
export const CERTIFICADO_OPCIONES = ["28/100", "48/100", "76/100", "95/100"];

export const CERTIFICADO_GRABACION_URL =
  process.env.CERTIFICADO_GRABACION_URL ?? evento?.youtubeLink ?? "";

export function normalizarRespuesta(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function esRespuestaCorrecta(raw: string): boolean {
  return normalizarRespuesta(raw) === normalizarRespuesta(CERTIFICADO_RESPUESTA_CORRECTA);
}
