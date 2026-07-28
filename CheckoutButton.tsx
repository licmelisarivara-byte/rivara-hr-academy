"use client";

import { useState } from "react";
import type { Course } from "@/lib/courses";

export default function CheckoutButton({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (course.externalCheckout) {
    return (
      <a
        href={course.externalCheckout}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-magenta text-white font-semibold px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Comprar en Hotmart
      </a>
    );
  }

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "course", slug: course.slug }),
      });
      if (!res.ok) throw new Error("no-config");
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("no-init-point");
      }
    } catch (e) {
      setError(
        "El cobro online todavía no está configurado. Escribinos y coordinamos el pago."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-magenta text-white font-semibold px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-60"
      >
        {loading ? "Redirigiendo..." : "Inscribirme"}
      </button>
      {error && (
        <p className="text-xs text-bone/50 mt-3 max-w-xs">
          {error}{" "}
          {/* TODO: reemplazar por el link real wa.me/549[numero] de Melisa */}
          <a href="/contacto" className="text-magenta hover:underline">
            Escribir por WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}
