"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ResourceCheckoutButton from "@/components/ResourceCheckoutButton";
import { bankDetails } from "@/lib/bankDetails";
import type { PaidResource } from "@/lib/resources";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";
type Buyer = { email: string; name: string; phone: string };

// Mismo orden que CoursePaymentActions: primero elige cómo pagar, recién
// ahí completa sus datos, y al final crea la contraseña.
export default function ResourcePaymentActions({ resource }: { resource: PaidResource }) {
  const router = useRouter();
  const [checking, setChecking] = useState(supabaseConfigured);
  const [sessionBuyer, setSessionBuyer] = useState<Buyer | null>(null);

  const [method, setMethod] = useState<Method>("");

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const [password, setPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [newBuyer, setNewBuyer] = useState<Buyer | null>(null);

  const buyer = sessionBuyer ?? newBuyer;

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user?.email) {
        setSessionBuyer({
          email: user.email,
          name: user.user_metadata?.full_name ?? "",
          phone: user.user_metadata?.phone ?? "",
        });
      }
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!buyer) return;
    if (method !== "transferencia" && method !== "payoneer") return;
    fetch("/api/manual-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "resource",
        slug: resource.slug,
        method,
        buyerEmail: buyer.email,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
      }),
    }).catch(() => {
      // No bloqueamos la UI si esto falla; Melisa igual recibe el WhatsApp/mail.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer, method]);

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

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSubmitted(true);
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setCreatingAccount(true);
    setAccountError(null);
    const { error } = await supabase.auth.signUp({
      email: formEmail,
      password,
      options: {
        data: { full_name: formName, phone: formPhone },
        emailRedirectTo: `${window.location.origin}/dashboard?verified=1`,
      },
    });
    setCreatingAccount(false);
    if (error) {
      setAccountError(error.message);
      return;
    }
    setNewBuyer({ email: formEmail, name: formName, phone: formPhone });
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
          onChange={(e) => setMethod(e.target.value as Method)}
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

      {method && !buyer && !contactSubmitted && (
        <form onSubmit={handleContactSubmit} className="card-alt rounded-lg p-4 mb-3 space-y-3">
          <p className="text-sm font-semibold text-bone">Tus datos</p>
          <input
            type="text"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-sm text-bone focus:border-magenta outline-none"
          />
          <input
            type="email"
            required
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-sm text-bone focus:border-magenta outline-none"
          />
          <input
            type="tel"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="WhatsApp (opcional)"
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-sm text-bone focus:border-magenta outline-none"
          />
          <button
            type="submit"
            className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors"
          >
            Continuar →
          </button>
        </form>
      )}

      {method && !buyer && contactSubmitted && (
        <form onSubmit={handleCreateAccount} className="card-alt rounded-lg p-4 mb-3 space-y-3">
          <p className="text-sm font-semibold text-bone">Creá tu contraseña</p>
          <p className="text-xs text-bone/50">
            Así después vas a poder ver esta compra en tu cuenta de RIVARA HR Academy.
          </p>
          <input
            type="password"
            required
            minLength={6}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-sm text-bone focus:border-magenta outline-none"
          />
          {accountError && <p className="text-xs text-magenta">{accountError}</p>}
          <button
            type="submit"
            disabled={creatingAccount}
            className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-60"
          >
            {creatingAccount ? "Creando cuenta..." : "Crear cuenta y continuar →"}
          </button>
        </form>
      )}

      {method === "mercadopago" && buyer && (
        <ResourceCheckoutButton resource={resource} buyerEmail={buyer.email} />
      )}

      {method === "transferencia" && buyer && (
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

      {method === "payoneer" && buyer && resource.payoneerLink && (
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
