import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourseBySlug, getCoursePriceSummary } from "@/lib/courses";
import CoursePaymentActions from "@/components/CoursePaymentActions";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const course = getCourseBySlug(params.slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.description,
    openGraph: course.image ? { images: [{ url: course.image }] } : undefined,
  };
}

// Ancla estable por módulo, para el menú "Ir a:" de abajo — sin acentos
// ni espacios, así funciona como #id de HTML.
function moduleAnchor(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  if (!course) return notFound();

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
    <div className="max-w-4xl mx-auto px-6 py-16">
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
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">{course.title}</h1>
      <p className="text-bone/70 text-lg mb-8">{course.description}</p>

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
        </div>
      )}

      {/* FORMAS DE PAGO */}
      {course.paymentOptions ? (
        <div className="card rounded-xl p-6 sm:p-8 mb-10">
          <h2 className="font-display text-xl text-bone mb-4">Formas de pago</h2>
          <CoursePaymentActions course={course} />
        </div>
      ) : (
        <div className="card rounded-xl p-6 mb-10 flex flex-wrap items-center justify-between gap-4">
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
      <div className="space-y-6 mb-10">
        {course.modules.map((m) => (
          <div
            key={m.title}
            id={moduleAnchor(m.title)}
            className="card-alt rounded-xl p-6 scroll-mt-24"
          >
            <h3 className="font-semibold text-bone mb-3">{m.title}</h3>
            <ul className="space-y-1.5 text-sm text-bone/70 list-disc list-inside">
              {m.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

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
    </div>
  );
}
