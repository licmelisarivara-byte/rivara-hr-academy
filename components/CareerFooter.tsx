import RivaraMark from "@/components/RivaraMark";

export default function CareerFooter() {
  return (
    <footer className="bg-careerNavy border-t border-white/10 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3 text-sm font-body">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RivaraMark className="h-6 w-6 shrink-0" />
            <p className="font-display font-extrabold text-careerCream text-sm tracking-wide">
              RIVARA CONSULTORA
            </p>
          </div>
          <p className="text-careerCream/60">
            Asesoría de carrera personalizada — CV, LinkedIn y estrategia de
            búsqueda laboral en Argentina.
          </p>
        </div>
        <div>
          <p className="text-careerRose text-xs font-bold uppercase tracking-widest mb-3">
            Contacto
          </p>
          <p className="text-careerCream/60 mb-1">
            <a
              href="mailto:hola@rivaraconsultora.com.ar"
              className="hover:text-careerRose transition-colors"
            >
              hola@rivaraconsultora.com.ar
            </a>
          </p>
          <a
            href="https://wa.me/5491123912820"
            target="_blank"
            rel="noopener noreferrer"
            className="text-careerRose hover:underline inline-block"
          >
            WhatsApp
          </a>
        </div>
        <div>
          <p className="text-careerRose text-xs font-bold uppercase tracking-widest mb-3">
            Lic. Melisa Rivara
          </p>
          <p className="text-careerCream/60 mb-3">
            Especialista en Selección de Personal · RIVARA Consultora
          </p>
          <a
            href="https://www.rivaraconsultora.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-careerCream/60 hover:text-careerRose transition-colors inline-block mb-3"
          >
            rivaraconsultora.com.ar
          </a>
          <div className="flex flex-wrap gap-3 text-careerCream/60">
            <a
              href="https://www.instagram.com/lic.melisarivara/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-careerRose transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/Recursoshumanosydigitalizacion"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-careerRose transition-colors"
            >
              Facebook
            </a>
            <a
              href="http://www.youtube.com/@recursoshumanosydigitalizacion"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-careerRose transition-colors"
            >
              YouTube
            </a>
            <a
              href="https://www.linkedin.com/company/rivara-hr-academy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-careerRose transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-4 text-xs text-careerCream/40 font-body">
        © {new Date().getFullYear()} RIVARA Consultora. Todos los derechos reservados.
      </div>
    </footer>
  );
}
