"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import type { PaidResource } from "@/lib/resources";

// Si el que llama ya sabe el mail del comprador (porque lo acaba de pedir
// en su propio formulario), lo pasa por prop y nos salteamos el chequeo de
// sesión y el cartel de "Registrarme".
export default function ResourceCheckoutButton({
  resource,
  buyerEmail: buyerEmailProp,
}: {
  resource: PaidResource;
  buyerEmail?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(supabaseConfigured && !buyerEmailProp);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const buyerEmail = buyerEmailProp ?? sessionEmail;

  useEffect(() => {
    if (buyerEmailProp) return;
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user?.email ?? null);
      setCheckingSession(false);
    });
  }, [buyerEmailProp]);

  if (checkingSession) {
    return (
      <button
        type="button"
        disabled
        className="btn-cta w-full bg-magenta/50 text-white px-4 py-2.5 rounded-full opacity-60"
      >
        Cargando...
      </button>
    );
  }

  // Primero intenta el flujo automático (crea la preferencia en /api/checkout
  // y te manda a Mercado Pago; eso es lo único que dispara el webhook que
  // registra la compra y envía el PDF solo). Si MP_ACCESS_TOKEN todavía no
  // está configurado en el servidor, cae al link fijo de MP (si existe) o al
  // mensaje de WhatsApp — igual que el flujo manual de antes.
  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "resource", slug: resource.slug, buyerEmail }),
      });
      if (!res.ok) throw new Error("no-config");
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }
      throw new Error("no-init-point");
    } catch (e) {
      if (resource.mpPaymentLink) {
        // window.open() acá se bloquea como popup en varios navegadores al
        // llegar después de un await (deja de contar como gesto directo
        // del usuario) — mismo bug encontrado y arreglado en
        // CheckoutButton.tsx. Redirigir en la misma pestaña no lo tiene.
        window.location.href = resource.mpPaymentLink;
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
        className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-60"
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
