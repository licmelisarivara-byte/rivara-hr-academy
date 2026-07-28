"use client";

import { useState } from "react";
import type { PaidResource } from "@/lib/resources";

export default function ResourceCheckoutButton({ resource }: { resource: PaidResource }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "resource", slug: resource.slug }),
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
        className="w-full text-sm bg-magenta text-white font-semibold px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-60"
      >
        {loading ? "Redirigiendo..." : resource.isCombo ? "Comprar combo →" : "Comprar ahora →"}
      </button>
      {error && (
        <p className="text-xs text-bone/50 mt-2">
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
