"use client";

import { useState } from "react";
import type { AsesoriaPack } from "@/lib/asesoriaPacks";
import { ASESORIA_ADDON_TRADUCCION } from "@/lib/asesoriaPacks";

const WHATSAPP_FALLBACK =
  "https://wa.me/5491123912820?text=" +
  encodeURIComponent("Hola Melisa! Quiero comprar un pack de Asesoría de Carrera.");

export default function AsesoriaCheckoutButton({
  pack,
  allowTraduccion,
}: {
  pack: AsesoriaPack;
  allowTraduccion?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [addonTraduccion, setAddonTraduccion] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = pack.priceARS + (addonTraduccion ? ASESORIA_ADDON_TRADUCCION.priceARS : 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/asesoria/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packSlug: pack.slug,
          addonTraduccion,
          buyerName: name,
          buyerEmail: email,
          buyerPhone: phone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
        return;
      }
      throw new Error(data.error || "checkout_failed");
    } catch {
      setError(
        "El cobro online todavía no está disponible. Escribinos y coordinamos el pago."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-cta w-full bg-careerFucsia text-careerCream px-6 py-3 rounded-full hover:bg-careerFucsia/85 transition-colors"
      >
        Comprar →
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      {allowTraduccion && (
        <label
          className={
            "font-body text-sm flex items-center gap-2 mb-1 " +
            (pack.popular ? "text-careerCream/90" : "text-careerNavy/80")
          }
        >
          <input
            type="checkbox"
            checked={addonTraduccion}
            onChange={(e) => setAddonTraduccion(e.target.checked)}
            className="accent-careerFucsia"
          />
          + {ASESORIA_ADDON_TRADUCCION.title} (+$
          {ASESORIA_ADDON_TRADUCCION.priceARS.toLocaleString("es-AR")})
        </label>
      )}
      <input
        type="text"
        required
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre y apellido"
        className="font-body w-full rounded-full bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
        className="font-body w-full rounded-full bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
      />
      <input
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp"
        className="font-body w-full rounded-full bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-cta w-full bg-careerFucsia text-careerCream px-6 py-3 rounded-full hover:bg-careerFucsia/85 transition-colors disabled:opacity-60"
      >
        {loading
          ? "Redirigiendo…"
          : `Pagar $${total.toLocaleString("es-AR")} →`}
      </button>
      {error && (
        <p
          className={
            "font-body text-xs " +
            (pack.popular ? "text-careerCream/80" : "text-careerNavy/60")
          }
        >
          {error}{" "}
          <a
            href={WHATSAPP_FALLBACK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-careerFucsia hover:underline"
          >
            Escribir por WhatsApp
          </a>
        </p>
      )}
    </form>
  );
}
