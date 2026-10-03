import type { Course } from "@/lib/courses";
import TrackedAnchor from "@/components/TrackedAnchor";

// Primera pantalla de la página de venta, pensada para celular: título de la
// oferta, beneficio, fechas/horario/plataforma, precio y botón, todo visible
// sin scrollear (390 px de ancho). Fondo de marca #0D0D14 con acento #E8006F.
// En pantallas grandes la portada del curso va a la derecha.
export default function CourseHero({ course }: { course: Course }) {
  return (
    <section className="bg-[#0D0D14]">
      <div className="max-w-4xl mx-auto px-5 pt-6 pb-8 md:px-6 md:py-14 md:grid md:grid-cols-[1.25fr_0.75fr] md:gap-10 md:items-center">
        <div>
          <p className="eyebrow !text-magentaSoft">{course.format} · 3ra edición</p>
          <h1 className="font-display text-white mt-2 mb-3 !text-[1.65rem] !leading-[1.15] md:!text-[2.4rem]">
            {course.pageH1 ?? course.title.replace(/\s*\(3ra edición\)\s*$/, "")}
          </h1>
          <p className="!text-white/85 !text-[0.95rem] !leading-snug mb-4">{course.tagline}</p>

          {course.schedule && (
            <p className="!text-white !text-sm !font-semibold !leading-snug border-l-2 border-magenta pl-3 mb-4">
              {course.schedule}
            </p>
          )}

          <p className="mb-4">
            <span className="font-display font-extrabold text-white text-2xl">{course.price}</span>
            {course.mercadoPagoNote && (
              <span className="!text-white/70 text-sm"> · {course.mercadoPagoNote}</span>
            )}
          </p>

          <TrackedAnchor
            id="cta-hero"
            href="#comprar"
            location="hero"
            courseSlug={course.slug}
            className="btn-cta block w-full md:inline-block md:w-auto text-center bg-magenta text-white px-8 py-4 rounded-full hover:bg-magentaSoft active:bg-magentaDeep transition-colors"
          >
            Inscribirme ahora
          </TrackedAnchor>
        </div>

        {course.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.image}
            alt={course.title}
            width={1080}
            height={1520}
            className="hidden md:block w-full rounded-xl"
          />
        )}
      </div>
    </section>
  );
}
