const AUDIENCE_LINKS = [
  { label: "¿Sos de RRHH?", href: "https://hracademy.rivaraconsultora.com.ar" },
  { label: "¿Sos empresa?", href: "https://rivaraconsultora.com.ar" },
  { label: "¿Buscás trabajo?", href: "https://carrera.rivaraconsultora.com.ar" },
];

export default function AudienceStrip() {
  return (
    <div className="bg-[#12081a] text-white/70 text-xs font-body">
      <div className="max-w-6xl mx-auto px-6 py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        {AUDIENCE_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="hover:text-magenta transition-colors whitespace-nowrap"
          >
            {l.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
