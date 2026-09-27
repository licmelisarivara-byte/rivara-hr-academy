import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { courses, getCourseBySlug, moduleAnchor } from "@/lib/courses";
import { paidResources } from "@/lib/resources";
import CoursePaymentActions from "@/components/CoursePaymentActions";
import ModuleAccordion from "@/components/ModuleAccordion";
import AboutMeSummary from "@/components/AboutMeSummary";
import Testimonials, { type Testimonial } from "@/components/Testimonials";

// Testimonio de una alumna de la edición anterior de este mismo curso
// (agosto 2026, certificado real): se suma solo en la página de este
// curso, no en la de Claude para Selección, porque habla puntualmente del
// bot/ATS armado en el taller.
const jessikaTestimonial: Testimonial = {
  quote:
    "Aprendiendo cada día para dar un mejor servicio a nuestros clientes, ahora en Consultora Human 360°, contamos con chat bot, ahora más rápido y eficiente para las empresas que nos contraten como reclutadores de sus búsquedas. Gracias Melisa Rivara por el aprendizaje y las herramientas brindadas, sin duda los mejores.",
  name: "Jessika Bottini",
  source: "Comentario público en LinkedIn · alumna de la edición de agosto",
  linkedin: {},
};

const showAboutAndTestimonials = new Set([
  "claude-para-seleccion",
  "de-cero-a-tu-asistente-3ra-edicion",
]);

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const course = getCourseBySlug(params.slug);
  if (!course) return {};
  return {
    title: course.seoTitle ?? course.title,
    description: course.seoDescription ?? course.description,
    openGraph: course.image ? { images: [{ url: course.image }] } : undefined,
  };
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  if (!course) return notFound();
  // Edición anterior ya reemplazada: quien entra por la web pública (o por
  // un link viejo, como el de las notas) va a la edición vigente. El panel
  // y los certificados de sus alumnos no pasan por esta página.
  if (course.supersededBy) permanentRedirect(`/cursos/${course.supersededBy}`);

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "RIVARA HR Academy",
      sameAs: "https://hracademy.rivaraconsultora.com.ar",
    },
    ...(course.priceARS
      ? {
          offers: {
            "@type": "Offer",
            price: course.priceARS,
            priceCurrency: "ARS",
            availability: "https://schema.org/InStock",
            url: `https://hracademy.rivaraconsultora.com.ar/cursos/${course.slug}`,
          },
        }
      : {}),
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-28 sm:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {course.image && (
        <div className="relative w-full max-w-md mx-auto aspect-[1080/1520] rounded-xl overflow-hidden mb-8">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="eyebrow mb-4">{course.format}</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
        {course.pageH1 ?? course.title}
      </h1>
      <p className="text-bone/70 text-lg mb-6">{course.description}</p>

      {course.previewClipUrl && (
        <div className="mb-8">
          {course.previewClipCaption && (
            <p className="text-sm text-bone/60 mb-3">{course.previewClipCaption}</p>
          )}
          <div className="rounded-xl overflow-hidden border border-black/10">
            <video
              src={course.previewClipUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* PRECIO Y CTA — visibles sin scrollear, arriba de todo lo demás */}
      <div className="card rounded-xl p-5 sm:p-6 mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl sm:text-3xl font-display text-bone">{course.price}</div>
          {course.priceNote && (
            <div className="text-sm text-bone/50 mt-1">{course.priceNote}</div>
          )}
        </div>
        <a
          href="#comprar"
          className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors whitespace-nowrap"
        >
          Inscribirme ahora →
        </a>
      </div>

      {showAboutAndTestimonials.has(course.slug) && <AboutMeSummary />}

      {course.modules.length > 3 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bone/50 mb-8">
          <span>Ir a:</span>
          {course.modules.map((m, i) => (
            <span key={m.title}>
              <a href={`#${moduleAnchor(m.title)}`} className="text-magenta hover:underline">
                {m.title}
              </a>
              {i < course.modules.length - 1 && <span className="text-bone/30"> ·</span>}
            </span>
          ))}
        </div>
      )}

      {course.schedule && (
        <div className="detail-text card rounded-xl p-4 mb-8">
          📅 {course.schedule}
        </div>
      )}

      {course.highlight && (
        <div className="card rounded-xl p-5 sm:p-6 mb-8 border border-magenta/30">
          <p className="eyebrow mb-2">Novedad en esta edición</p>
          <h2 className="font-display text-xl text-bone mb-2">{course.highlight.title}</h2>
          <p className="text-sm text-bone/70">{course.highlight.text}</p>
        </div>
      )}

      {course.outcomes && (
        <div className="mb-10">
          <h2 className="font-display text-2xl text-bone mb-6">¿Qué vas a lograr?</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {course.outcomes.map((o) => (
              <li
                key={o}
                className="card-alt rounded-lg px-4 py-3 text-sm text-bone/70 flex items-start gap-2"
              >
                <span className="text-magenta">✓</span>
                {o}
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <a
              href="#comprar"
              className="btn-cta inline-block bg-magenta text-white px-8 py-3.5 rounded-full hover:bg-magentaSoft transition-colors"
            >
              Quiero inscribirme →
            </a>
          </div>
        </div>
      )}

      {/* FORMAS DE PAGO */}
      {course.paymentOptions ? (
        <div id="comprar" className="card rounded-xl p-6 sm:p-8 mb-10 scroll-mt-24">
          <h2 className="font-display text-xl text-bone mb-4">Formas de pago</h2>
          <CoursePaymentActions course={course} />
        </div>
      ) : (
        <div
          id="comprar"
          className="card rounded-xl p-6 mb-10 flex flex-wrap items-center justify-between gap-4 scroll-mt-24"
        >
          <div>
            <div className="text-2xl font-display text-bone">{course.price}</div>
            {course.priceNote && (
              <div className="text-sm text-magenta mt-1">{course.priceNote}</div>
            )}
          </div>
          <CoursePaymentActions course={course} />
        </div>
      )}

      <h2 className="font-display text-2xl text-bone mb-6">Contenido</h2>
      <div className="mb-10">
        <ModuleAccordion modules={course.modules} />
      </div>

      {course.slug === "claude-para-seleccion" && <Testimonials />}
      {course.slug === "de-cero-a-tu-asistente-3ra-edicion" && (
        <Testimonials extra={[jessikaTestimonial]} />
      )}

      {course.faqs && (
        <div>
          <h2 className="font-display text-2xl text-bone mb-6">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {course.faqs.map((f) => (
              <div key={f.q} className="card-alt rounded-xl p-6">
                <p className="font-semibold text-bone mb-2">{f.q}</p>
                <p className="text-sm text-bone/70">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {course.slug === "claude-para-seleccion" && (
        <div className="mt-12">
          <h2 className="font-display text-2xl text-bone mb-6">También te puede interesar</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/masterclass"
              className="card-alt rounded-xl p-5 hover:border-magenta/40 transition-colors border border-transparent"
            >
              <span className="text-xl">🎥</span>
              <p className="font-semibold text-bone text-sm mt-2 mb-1">
                Masterclass grabada gratis
              </p>
              <p className="text-magenta text-xs font-semibold">Ver la grabación →</p>
            </Link>
            {paidResources.map((r) => (
              <Link
                key={r.slug}
                href="/ebooks"
                className="card-alt rounded-xl p-5 hover:border-magenta/40 transition-colors border border-transparent"
              >
                <span className="text-xl">⬇️</span>
                <p className="font-semibold text-bone text-sm mt-2 mb-1">{r.title}</p>
                <p className="text-magenta text-xs font-semibold">Ver el recurso →</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA fijo en mobile: se mantiene visible al hacer scroll */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-ink/95 backdrop-blur border-t border-black/10 px-4 py-3">
        <a
          href="#comprar"
          className="btn-cta block w-full text-center bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
        >
          Inscribirme ahora →
        </a>
      </div>
    </div>
  );
}
