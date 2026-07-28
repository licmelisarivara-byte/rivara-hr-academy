import { notFound } from "next/navigation";
import { courses, getCourseBySlug } from "@/lib/courses";
import CheckoutButton from "@/components/CheckoutButton";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  if (!course) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">{course.format}</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">{course.title}</h1>
      <p className="text-bone/70 text-lg mb-8">{course.description}</p>

      {course.schedule && (
        <div className="card rounded-xl p-4 mb-8 text-sm text-bone/70">
          📅 {course.schedule}
        </div>
      )}

      <div className="card rounded-xl p-6 mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-display text-bone">{course.price}</div>
          {course.priceNote && (
            <div className="text-sm text-magenta mt-1">{course.priceNote}</div>
          )}
        </div>
        <CheckoutButton course={course} />
      </div>

      <h2 className="font-display text-2xl text-bone mb-6">Contenido</h2>
      <div className="space-y-6">
        {course.modules.map((m) => (
          <div key={m.title} className="card-alt rounded-xl p-6">
            <h3 className="font-semibold text-bone mb-3">{m.title}</h3>
            <ul className="space-y-1.5 text-sm text-bone/70 list-disc list-inside">
              {m.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
