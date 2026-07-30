"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ResourceCheckoutButton from "@/components/ResourceCheckoutButton";
import { bankDetails } from "@/lib/bankDetails";
import type { PaidResource } from "@/lib/resources";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";

// Mismo esquema que CoursePaymentActions: precios visibles sin loguearse,
// pero elegir y confirmar una forma de pago pide login antes. Transferencia
// y Payoneer quedan registrados como "pending" y avisan por WhatsApp;
// Mercado Pago usa el checkout automático existente.
export default function ResourcePaymentActions({ resource }: { resource: PaidResource }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(supabaseConfigured);
  const [buyer, setBuyer] = useState<{ email: string; name: string; phone: string } | null>(
    null
  );
  const [method, setMethod] = useState<Method>("");

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user?.email) {
        setBuyer({
          email: user.email,
          name: user.user_metadata?.full_name ?? "",
          phone: user.user_metadata?.phone ?? "",
        });
      }
      setChecking(false);
    });
  }, []);

  if (checking) {
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

  if (supabaseConfigured && !buyer) {
    return (
      <Link
        href={`/registro?next=${encodeURIComponent(pathname)}`}
        className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors inline-block text-center"
      >
        Registrarme para elegir cómo pagar →
      </Link>
    );
  }

  async function logInterest(m: "transferencia" | "payoneer") {
    try {
      await fetch("/api/manual-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "resource",
          slug: resource.slug,
          method: m,
          buyerEmail: buyer?.email,
          buyerName: buyer?.name,
          buyerPhone: buyer?.phone,
        }),
      });
    } catch {
      // No bloqueamos la UI si esto falla; Melisa igual recibe el WhatsApp/mail.
    }
  }

  function handleMethodChange(value: Method) {
    setMethod(value);
    if (value === "transferencia" || value === "payoneer") {
      logInterest(value);
    }
  }

  function confirmManual(m: "transferencia" | "payoneer") {
    const label = m === "transferencia" ? "Transferencia bancaria" : "Payoneer";
    const message = encodeURIComponent(
      `Hola Melisa 👋\n\nQuiero comprar: ${resource.title}\n\n📌 Nombre: ${buyer?.name}\n📧 Email: ${buyer?.email}\n📱 Celular: ${buyer?.phone}\n💳 Forma de pago: ${label}\n\n📎 Voy a enviar el comprobante de pago.\n\nQuedo a la espera de la confirmación. ¡Gracias!`
    );
    window.open(`https://wa.me/5491123912820?text=${message}`, "_blank");
    router.push("/dashboard");
  }

  return (
    <div>
      <div className="mb-3">
        <select
          value={method}
          onChange={(e) => handleMethodChange(e.target.value as Method)}
          className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
        >
          <option value="">¿Cómo querés pagar?</option>
          <option value="mercadopago">Mercado Pago — ${resource.priceARS.toLocaleString("es-AR")} ARS</option>
          <option value="transferencia">Transferencia bancaria — ${resource.priceARS.toLocaleString("es-AR")} ARS</option>
          {resource.payoneerLink && (
            <option value="payoneer">Payoneer — USD {resource.priceUSD}</option>
          )}
        </select>
      </div>

      {method === "mercadopago" && <ResourceCheckoutButton resource={resource} />}

      {method === "transferencia" && (
        <div className="card-alt rounded-lg p-4 text-sm text-bone/70">
          <p className="font-semibold text-bone mb-2">Datos para transferencia</p>
          <p>Titular: {bankDetails.holder}</p>
          <p>CBU: {bankDetails.cbu}</p>
          <p>Alias: {bankDetails.alias}</p>
          <p>CUIL: {bankDetails.cuil}</p>
          <p className="mt-3 text-xs text-bone/50">
            Una vez transferido, enviá el comprobante por WhatsApp o a{" "}
            <a href="mailto:hola@rivaraconsultora.com.ar" className="text-magenta hover:underline">
              hola@rivaraconsultora.com.ar
            </a>{" "}
            para confirmar tu compra.
          </p>
          <button
            type="button"
            onClick={() => confirmManual("transferencia")}
            className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors mt-3"
          >
            Confirmar compra →
          </button>
        </div>
      )}

      {method === "payoneer" && resource.payoneerLink && (
        <div className="card-alt rounded-lg p-4 text-sm text-bone/70">
          <a
            href={resource.payoneerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta w-full inline-block text-center bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors"
          >
            Pagar con Payoneer (USD) →
          </a>
          <p className="mt-3 text-xs text-bone/50">
            Una vez pagado, enviá el comprobante por WhatsApp o a{" "}
            <a href="mailto:hola@rivaraconsultora.com.ar" className="text-magenta hover:underline">
              hola@rivaraconsultora.com.ar
            </a>{" "}
            para confirmar tu compra.
          </p>
          <button
            type="button"
            onClick={() => confirmManual("payoneer")}
            className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors mt-3"
          >
            Confirmar compra →
          </button>
        </div>
      )}
    </div>
  );
}
