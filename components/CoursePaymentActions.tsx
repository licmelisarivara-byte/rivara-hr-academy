"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import CheckoutButton from "@/components/CheckoutButton";
import type { Course } from "@/lib/courses";

// Los precios/formas de pago quedan visibles sin loguearse (ayudan a
// decidir la compra), pero ninguna acción real —Mercado Pago, coordinar
// transferencia por WhatsApp, Payoneer— se puede tocar sin registrarse
// antes. Así, sea cual sea el método que elija, siempre queda su mail.
export default function CoursePaymentActions({ course }: { course: Course }) {
  const [checking, setChecking] = useState(supabaseConfigured);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      setChecking(false);
    });
  }, []);

  if (checking) {
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

  if (supabaseConfigured && !loggedIn) {
    return (
      <Link
        href="/registro"
        className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Registrarme para elegir cómo pagar →
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <CheckoutButton course={course} />
      <a
        href="https://wa.me/5491123912820"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-magenta hover:underline"
      >
        O coordinar por WhatsApp →
      </a>
    </div>
  );
}
