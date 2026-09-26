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

// Certificado del curso pago "Creá tu propio Bot de Selección + ATS con IA".
// A diferencia de la masterclass (gratis, se valida con una pregunta trivia),
// acá se valida contra una compra aprobada del curso (ver /api/certificado).
export const CERTIFICADO_CURSO_BOT_ATS = {
  titulo: "Creá tu propio Bot de Selección + ATS con IA",
  fecha: "11 y 18 de agosto de 2026",
  fechaCorta: "11-18 / 08 / 2026",
  resourceSlug: "de-cero-a-tu-asistente",
};

// 3ra edición del mismo curso en vivo (15 y 22 de octubre de 2026). Es un
// tipo de certificado APARTE ("curso-bot-ats-3") y no una modificación del
// de arriba: los certificados de la edición de agosto se renderizan desde
// CERTIFICADO_CURSO_BOT_ATS cada vez que se abren, así que cambiarle la
// fecha les cambiaría la fecha a todos los ya emitidos.
export const CERTIFICADO_CURSO_BOT_ATS_3 = {
  titulo: "Creá tu propio Bot de Selección + ATS con IA",
  fecha: "15 y 22 de octubre de 2026",
  fechaCorta: "15-22 / 10 / 2026",
  resourceSlug: "de-cero-a-tu-asistente-3ra-edicion",
};

// Certificado del curso grabado "Claude para Selección". Es autoservicio (a
// su ritmo, sin fecha fija), así que en vez de fechas se muestra la
// modalidad. Se valida contra una compra aprobada, igual que el curso en
// vivo, y además se dispara solo al terminar el video del Módulo 6 (ver
// components/ModuleVideoPlayer.tsx).
export const CERTIFICADO_CLAUDE_SELECCION = {
  titulo: "Claude para Selección",
  fecha: "curso grabado, a tu ritmo",
  fechaCorta: "A TU RITMO",
  resourceSlug: "claude-para-seleccion",
};

export function normalizarRespuesta(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function esRespuestaCorrecta(raw: string): boolean {
  return normalizarRespuesta(raw) === normalizarRespuesta(CERTIFICADO_RESPUESTA_CORRECTA);
}
