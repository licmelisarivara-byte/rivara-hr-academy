import LinkedInIcon from "./LinkedInIcon";

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
