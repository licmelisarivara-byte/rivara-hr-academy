"use client";

import { useState } from "react";
import LinkedInIcon from "./LinkedInIcon";

type Recommendation = {
  name: string;
  role: string;
  relationship: string;
  quote: string;
};

const recommendations: Recommendation[] = [
  {
    name: "Lic. Alejandro Acevedo",
    role: "Licenciado en RRHH",
    relationship: "Estudió con Melisa",
    quote:
      "Melisa es una profesional muy comprometida con su trabajo. Generadora de buen clima naturalmente y siempre va por más. Se desarrolla muy bien en equipo y tiene formas muy corporativas que invitan a una comunicación fluida. Es una gran colega.",
  },
  {
    name: "Noelia Guadalupe Pace",
    role: "Psicomotricista",
    relationship: "Trabajó con Melisa en el mismo equipo",
    quote:
      "Excelente profesional y ante todo, de gran calidad humana. Tuve la oportunidad de trabajar con ella años atrás e hicimos un lindo equipo. Siempre está capacitándose para brindar lo mejor a sus consultantes.",
  },
  {
    name: "Diego Luqui",
    role: "Comprador Técnico Senior",
    relationship: "Estudió con Melisa",
    quote:
      "Conozco a Melisa desde nuestra etapa de formación, donde se destacó por su responsabilidad, compromiso y calidad humana. Es una profesional empática y organizada, con muy buena capacidad para trabajar con personas. Sin dudas, alguien recomendable en su rol dentro de Recursos Humanos.",
  },
];

// Recorte por caracteres (no CSS line-clamp): así el alto colapsado es
// predecible sin importar el ancho de pantalla, y no corta una palabra
// a la mitad.
const PREVIEW_LENGTH = 110;

function truncate(text: string): string {
  if (text.length <= PREVIEW_LENGTH) return text;
  const cut = text.slice(0, PREVIEW_LENGTH);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

// Recomendaciones de LinkedIn sobre la trayectoria profesional de
// Melisa en general (no sobre este curso puntual) — por eso van en
// "Sobre mí", con un diseño a propósito distinto del de
// Testimonials.tsx: lista apilada de ancho completo con acento celeste
// (color de marca de LinkedIn), no el grid magenta de los testimonios
// del curso. Sin fotos de perfil: no tenemos permiso para reproducirlas
// (mismo criterio ya usado con Yordanis en Testimonials.tsx).
//
// Colapsadas por default y truncadas por caracteres (no todo el texto a
// la vista): ocupaban mucha pantalla y le sacaban protagonismo al
// contenido del curso, que es lo que tiene que resaltar más acá.
export default function ProfessionalRecommendations() {
  const [expandedNames, setExpandedNames] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setExpandedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-bone mb-4">Recomendaciones profesionales</h3>
      <div className="space-y-4">
        {recommendations.map((r) => {
          const expanded = expandedNames.has(r.name);
          const needsTruncation = r.quote.length > PREVIEW_LENGTH;
          return (
            <div
              key={r.name}
              className="bg-panel rounded-lg border border-black/5 border-l-4 border-l-[#0A66C2]/50 p-5"
            >
              <div className="flex items-start gap-3 mb-2">
                <span
                  aria-hidden="true"
                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0A66C2]/10 text-[#0A66C2]"
                >
                  <LinkedInIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-bone">{r.name}</p>
                  <p className="text-xs text-bone/50">{r.role}</p>
                  <p className="text-xs text-bone/40 italic">{r.relationship}</p>
                </div>
              </div>
              <p className="text-sm text-bone/80">
                &ldquo;{expanded || !needsTruncation ? r.quote : truncate(r.quote)}&rdquo;
              </p>
              {needsTruncation && (
                <button
                  type="button"
                  onClick={() => toggle(r.name)}
                  className="text-magenta text-xs font-semibold hover:underline mt-2"
                >
                  {expanded ? "Leer menos ↑" : "Leer más →"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
