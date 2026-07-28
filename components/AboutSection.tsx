import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        {/* Editorial photo composition: main portrait + supporting shot, offset */}
        <div className="relative max-w-sm mx-auto lg:mx-0 w-full">
          <div className="relative rounded-2xl overflow-hidden border border-magenta/25 shadow-2xl shadow-black/40">
            <Image
              src="/images/melisa-portrait.jpg"
              alt="Melisa Rivara"
              width={700}
              height={840}
              className="w-full h-auto object-cover"
              priority={false}
            />
          </div>
          <div className="absolute -bottom-10 -right-8 w-40 sm:w-48 rounded-xl overflow-hidden border-2 border-ink shadow-xl shadow-black/50 rotate-3">
            <Image
              src="/images/melisa-kit.jpg"
              alt="Melisa Rivara mostrando el Kit de Prompts"
              width={700}
              height={840}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="mt-10 lg:mt-0">
          <p className="eyebrow mb-4">Sobre mí</p>
          <h2 className="font-display text-3xl sm:text-4xl text-bone mb-6 leading-tight">
            Sobre <span className="text-magenta">RIVARA HR Academy</span>
          </h2>
          <p className="text-bone/70 leading-relaxed mb-4">
            Soy Melisa Rivara, Licenciada en RRHH y especialista en selección
            de personal con IA. Creé RIVARA HR Academy para ayudar a
            recruiters y profesionales de recursos humanos a dejar de perder
            horas en tareas repetitivas y enfocarse en lo que realmente
            importa: evaluar, entrevistar y decidir con criterio.
          </p>
          <p className="text-bone/70 leading-relaxed mb-8">
            Todos mis cursos y materiales son 100% prácticos, sin tecnicismos
            innecesarios. Salís con herramientas funcionando desde el día 1.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-4 py-2 rounded-full border border-black/15 text-bone/70">
              Selección de Personal
            </span>
            <span className="px-4 py-2 rounded-full border border-black/15 text-bone/70">
              IA aplicada a RRHH
            </span>
            <span className="px-4 py-2 rounded-full border border-black/15 text-bone/70">
              RIVARA Consultora
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
