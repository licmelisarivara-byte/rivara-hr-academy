"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ResourceCheckoutButton from "@/components/ResourceCheckoutButton";
import { bankDetails } from "@/lib/bankDetails";
import { applyDiscount } from "@/lib/discount";
import type { PaidResource } from "@/lib/resources";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";
type Buyer = { email: string; phone: string };
type AppliedCoupon = { code: string; percentOff: number };

// Mismo orden que CoursePaymentActions: primero elige cómo pagar, después
// deja su mail — la cuenta se arma sola después de que el pago se
// confirme (ver lib/deliverPurchase), no hace falta contraseña para pagar.
export default function ResourcePaymentActions({ resource }: { resource: PaidResource }) {
  const router = useRouter();
  const [checking, setChecking] = useState(supabaseConfigured);
  const [sessionBuyer, setSessionBuyer] = useState<Buyer | null>(null);

  const [method, setMethod] = useState<Method>("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponInvalid, setCouponInvalid] = useState(false);

  // Mismo criterio que CoursePaymentActions: se valida contra /api/coupon,
  // que solo contesta si ESE código puntual es válido, sin revelar la lista.
  useEffect(() => {
    const code = couponInput.trim();
    if (!code) {
      setAppliedCoupon(null);
      setCouponInvalid(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, resourceSlug: resource.slug }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (data.valid) {
            setAppliedCoupon({ code: data.code, percentOff: data.percentOff });
            setCouponInvalid(false);
          } else {
            setAppliedCoupon(null);
            setCouponInvalid(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setAppliedCoupon(null);
            setCouponInvalid(true);
          }
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [couponInput, resource.slug]);

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const buyer = sessionBuyer ?? (contactSubmitted ? { email: formEmail, phone: formPhone } : null);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user?.email) {
        setSessionBuyer({ email: user.email, phone: user.user_metadata?.phone ?? "" });
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
        buyerPhone: buyer.phone,
        couponCode: appliedCoupon?.code,
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

  // El cupón solo aplica pagando por transferencia. Payoneer y Mercado
  // Pago quedan siempre a precio de lista: los links de Payoneer son de
  // monto fijo (no se puede aplicar un % dinámicamente sin armar un link
  // nuevo por cada combinación cupón × producto), y Mercado Pago nunca
  // tuvo descuento a propósito — mismo criterio que CoursePaymentActions
  // y que ya aplica /api/manual-purchase server-side.
  const transferenciaARS = applyDiscount(
    resource.priceARSTransferencia ?? resource.priceARS,
    appliedCoupon?.percentOff
  );
  const payoneerUSD = resource.priceUSD;

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSubmitted(true);
  }

  function confirmManual(m: "transferencia" | "payoneer") {
    const label = m === "transferencia" ? "Transferencia bancaria" : "Payoneer";
    const couponLine = appliedCoupon
      ? `\n🎟️ Cupón: ${appliedCoupon.code} (${appliedCoupon.percentOff}% off)`
      : "";
    const phoneLine = buyer?.phone ? `\n📱 Celular: ${buyer.phone}` : "";
    const message = encodeURIComponent(
      `Hola Melisa 👋\n\nQuiero comprar: ${resource.title}\n\n📧 Email: ${buyer?.email}${phoneLine}\n💳 Forma de pago: ${label}${couponLine}\n\n📎 Voy a enviar el comprobante de pago.\n\nQuedo a la espera de la confirmación. ¡Gracias!`
    );
    window.open(`https://wa.me/5491123912820?text=${message}`, "_blank");
    router.push("/");
  }

  return (
    <div>
      <div className="mb-3">
        <label className="text-xs text-bone/60 block mb-1">¿Tenés un cupón?</label>
        <input
          type="text"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder="Código de descuento (opcional)"
          className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
        />
        {couponInput && (appliedCoupon || couponInvalid) && (
          <p className={`text-xs mt-1 ${appliedCoupon ? "text-sage" : "text-magenta"}`}>
            {appliedCoupon
              ? `✅ Cupón aplicado: ${appliedCoupon.percentOff}% off pagando por transferencia`
              : "Ese cupón no es válido."}
          </p>
        )}
      </div>

      <div className="mb-3">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
        >
          <option value="">¿Cómo querés pagar?</option>
          <option value="mercadopago">
            Mercado Pago — ${resource.priceARS.toLocaleString("es-AR")} ARS
          </option>
          <option value="transferencia">
            Transferencia bancaria — ${transferenciaARS.toLocaleString("es-AR")} ARS
          </option>
          {resource.payoneerLink && (
            <option value="payoneer">Payoneer — USD {payoneerUSD}</option>
          )}
        </select>
      </div>

      {method && !buyer && (
        <form onSubmit={handleContactSubmit} className="card-alt rounded-lg p-4 mb-3 space-y-3">
          <p className="text-sm font-semibold text-bone">Tu mail</p>
          <p className="text-xs text-bone/50">
            Ahí te vamos a mandar la confirmación y, cuando el pago esté listo, la descarga.
          </p>
          <input
            type="email"
            required
            autoFocus
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
          {(resource.priceARSTransferencia || appliedCoupon) && (
            <p className="text-xs text-magenta mb-3">
              ⚠️ Este link de Payoneer todavía cobra el precio de lista en USD — no aplica el
              descuento por transferencia ni el cupón automáticamente. Pagá con el link y avisanos
              por WhatsApp: te devolvemos la diferencia o la descontamos de tu próxima compra.
            </p>
          )}
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
