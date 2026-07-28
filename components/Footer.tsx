import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <Image
            src="/images/logo-horizontal.png"
            alt="RIVARA HR Academy"
            width={640}
            height={162}
            className="h-7 w-auto mb-3"
          />
          <p className="text-bone/60">
            Formación de IA aplicada a selección de personal, de colega a colega.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Contacto</div>
          <p className="text-bone/60">
            <a href="mailto:hola@rivaraconsultora.com.ar" className="hover:text-magenta transition-colors">
              hola@rivaraconsultora.com.ar
            </a>
          </p>
          <a
            href="https://www.rivaraconsultora.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone/60 hover:text-magenta transition-colors inline-block"
          >
            rivaraconsultora.com.ar
          </a>
          <a
            href="https://wa.me/5491123912820"
            target="_blank"
            rel="noopener noreferrer"
            className="text-magenta hover:underline inline-block mt-1"
          >
            WhatsApp
          </a>
        </div>
        <div>
          <div className="eyebrow mb-3">Lic. Melisa Rivara</div>
          <p className="text-bone/60 mb-3">
            Especialista en Selección de Personal · RIVARA Consultora
          </p>
          <div className="flex flex-wrap gap-3 text-bone/60">
            <a
              href="https://www.instagram.com/lic.melisarivara/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-magenta transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/Recursoshumanosydigitalizacion"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-magenta transition-colors"
            >
              Facebook
            </a>
            <a
              href="http://www.youtube.com/@recursoshumanosydigitalizacion"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-magenta transition-colors"
            >
              YouTube
            </a>
            <a
              href="https://www.linkedin.com/company/rivara-consultora"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-magenta transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="hairline" />
      <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-bone/40">
        © {new Date().getFullYear()} RIVARA Consultora. Todos los derechos reservados.
      </div>
    </footer>
  );
}
