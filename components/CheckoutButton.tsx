"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import type { Course } from "@/lib/courses";

export default function CheckoutButton({
  course,
  couponCode,
}: {
  course: Course;
  couponCode?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(supabaseConfigured);
  const [buyerEmail, setBuyerEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setBuyerEmail(data.session?.user?.email ?? null);
      setCheckingSession(false);
    });
  }, []);

  if (course.comingSoon) {
    return (
      <button
        type="button"
        disabled
        className="btn-cta bg-bone/20 text-bone/50 px-6 py-3 rounded-full cursor-not-allowed"
      >
        Próximamente
      </button>
    );
  }

  if (course.externalCheckout) {
    return (
      <a
        href={course.externalCheckout}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Comprar en Hotmart
      </a>
    );
  }

  if (checkingSession) {
    return (
      <button
        type="button"
        disabled
        className="btn-cta bg-magenta/50 text-white px-6 py-3 rounded-full opacity-60"
      >
        Cargando...
      </button>
    );
  }

  // Pedimos login antes de inscribir: es lo que nos permite después saber
  // qué alumna compró qué curso y mostrárselo en su dashboard.
  if (supabaseConfigured && !buyerEmail) {
    return (
      <Link
        href="/registro"
        className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Registrarme para inscribirme →
      </Link>
    );
  }

  // Primero intenta el cobro automático. Si todavía no está configurado o
  // falla, cae al link fijo de MP (si existe) o al aviso de WhatsApp — el
  // pago manual (transferencia/Payoneer) se sigue coordinando aparte.
  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "course", slug: course.slug, buyerEmail, couponCode }),
      });
      if (!res.ok) throw new Error("no-config");
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }
      throw new Error("no-init-point");
    } catch (e) {
      if (course.mpPaymentLink) {
        window.open(course.mpPaymentLink, "_blank", "noopener,noreferrer");
      } else {
        setError(
          "El cobro online todavía no está configurado. Escribinos y coordinamos el pago."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-cta bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-60"
      >
        {loading ? "Redirigiendo..." : "Inscribirme"}
      </button>
      {error && (
        <p className="text-xs text-bone/50 mt-3 max-w-xs">
          {error}{" "}
          <a
            href="https://wa.me/5491123912820"
            target="_blank"
            rel="noopener noreferrer"
            className="text-magenta hover:underline"
          >
            Escribir por WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}
