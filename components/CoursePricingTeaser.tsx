"use client";

import Link from "next/link";
import { getCoursePriceSummary, type Course } from "@/lib/courses";

// Card de precio de la home. Es client component a propósito: la página
// se genera estática en el build, así que si el precio se calculara ahí
// quedaría congelado con la fecha del build. Acá se recalcula en el
// navegador cada vez que alguien entra, así el cambio de early bird a
// precio regular pasa solo, sin necesitar un redeploy.
export default function CoursePricingTeaser({ course }: { course: Course }) {
  const summary = getCoursePriceSummary(course);

  return (
    <div className="card-alt rounded-xl p-6 text-center">
      {summary.earlyBirdActive && summary.savingsARS > 0 && (
        <span className="inline-block text-xs font-semibold bg-magenta text-white px-3 py-1 rounded-full mb-3">
          🔥 Ahorrá ${summary.savingsARS.toLocaleString("es-AR")}
        </span>
      )}
      <div className="mb-1">
        {summary.earlyBirdActive && (
          <span className="text-bone/40 line-through text-lg mr-2">
            ${summary.mercadoPagoARS.toLocaleString("es-AR")}
          </span>
        )}
        <span className="font-display text-3xl text-bone">
          ${(summary.earlyBirdActive ? summary.transferenciaARS : summary.mercadoPagoARS).toLocaleString("es-AR")} ARS
        </span>
      </div>
      {summary.earlyBirdActive ? (
        <>
          <div className="text-sm text-magenta mb-1">Por transferencia o Payoneer, hasta el 9/8</div>
          <div className="detail-text mb-6">
            Por Mercado Pago: ${summary.mercadoPagoARS.toLocaleString("es-AR")} ARS
          </div>
        </>
      ) : (
        <div className="detail-text mb-6">Transferencia, Payoneer o Mercado Pago</div>
      )}
      <Link
        href={`/cursos/${course.slug}`}
        className="btn-cta inline-block w-full bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Me quiero inscribir →
      </Link>
    </div>
  );
}
