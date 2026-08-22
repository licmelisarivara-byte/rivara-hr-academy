import Link from "next/link";
import RivaraMark from "@/components/RivaraMark";

const WHATSAPP_URL =
  "https://wa.me/5491123912820?text=" +
  encodeURIComponent("Hola Melisa! Quiero info sobre la Asesoría de Carrera.");

export default function CareerHeader() {
  return (
    <header className="sticky top-0 z-40 bg-careerNavy/95 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/asesoria-de-carrera" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <RivaraMark className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="font-display font-extrabold text-careerCream text-xs sm:text-base tracking-wide truncate">
              RIVARA CONSULTORA
            </span>
            <span className="font-body text-[11px] sm:text-xs text-careerRose truncate">
              Asesoría de Carrera
            </span>
          </span>
        </Link>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta text-xs sm:text-sm bg-careerFucsia text-careerCream px-3 sm:px-5 py-2.5 rounded-full hover:bg-careerFucsia/85 transition-colors whitespace-nowrap shrink-0"
        >
          <span className="sm:hidden">WhatsApp</span>
          <span className="hidden sm:inline">Escribir por WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
