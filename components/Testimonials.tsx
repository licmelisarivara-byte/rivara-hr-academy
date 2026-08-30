type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  source: string;
  stars?: number;
  // Presente (aunque sea sin `url`) cuando el testimonio viene de un post de
  // LinkedIn: en vez de su foto (no tenemos permiso para reproducirla) se
  // muestra el ícono de LinkedIn, enlazado al post cuando ya tengamos el link.
  linkedin?: { url?: string };
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Es muy valioso su aporte para automatizar tareas y agilizar todo el proceso de selección. Muy útil.",
    name: "Paula G.",
    source: "Reseña de Google",
    stars: 4,
  },
  {
    quote:
      "Quiero agradecer a Melisa Rivara por tan valiosa capacitación sobre IA para crear un Asistente de Selección y un ATS.",
    name: "Yordanis Chirino",
    role: "IT Recruiter | Talent Acquisition | SAP Recruiter | Sourcer",
    source: "Post público de LinkedIn",
    // TODO: sumar el link real del post cuando Melisa lo pase (url: "https://...").
    linkedin: {},
  },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

// Los testimonios son de talleres anteriores (no de este curso grabado
// puntual) — por eso el encabezado habla de "mis talleres" en general, sin
// prometer que sean específicos de este contenido.
export default function Testimonials() {
  return (
    <div className="mb-10">
      <h2 className="font-display text-2xl text-bone mb-6">
        Lo que dicen quienes ya participaron de mis talleres
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {testimonials.map((t) => (
          <div key={t.name} className="card-alt rounded-xl p-6 border border-black/5">
            <div className="flex items-start justify-between gap-3 mb-2">
              {t.stars ? (
                <p className="text-magenta" aria-label={`${t.stars} de 5 estrellas`}>
                  {"⭐".repeat(t.stars)}
                </p>
              ) : (
                <span />
              )}
              {t.linkedin &&
                (t.linkedin.url ? (
                  <a
                    href={t.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Post de ${t.name} en LinkedIn`}
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
                  >
                    <LinkedInIcon />
                  </a>
                ) : (
                  <span
                    aria-hidden="true"
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0A66C2]/10 text-[#0A66C2]"
                  >
                    <LinkedInIcon />
                  </span>
                ))}
            </div>
            <p className="text-sm text-bone/80 mb-4">&ldquo;{t.quote}&rdquo;</p>
            <p className="text-sm font-semibold text-bone">{t.name}</p>
            {t.role && <p className="text-xs text-bone/50">{t.role}</p>}
            <p className="text-xs text-bone/40 mt-1">{t.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
