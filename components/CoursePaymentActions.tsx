"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import CheckoutButton from "@/components/CheckoutButton";
import { getCoupon, applyDiscount } from "@/lib/coupons";
import {
  getTransferenciaAmountARS,
  getPayoneerAmountUSD,
  type Course,
} from "@/lib/courses";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";
type Buyer = { email: string; phone: string };

// Orden pensado para no perder gente en el camino: primero elige CÓMO
// quiere pagar (con los precios ya a la vista), recién ahí deja su mail —
// nada de crear cuenta ni poner contraseña para poder pagar. La cuenta se
// arma sola después, cuando el pago ya está confirmado: ahí le llega un
// mail para que ponga su contraseña y entre directo (ver lib/deliverPurchase).
export default function CoursePaymentActions({ course }: { course: Course }) {
  const router = useRouter();
  const [checking, setChecking] = useState(supabaseConfigured);
  const [sessionBuyer, setSessionBuyer] = useState<Buyer | null>(null);

  const [method, setMethod] = useState<Method>("");
  const [couponInput, setCouponInput] = useState("");
  const appliedCoupon = getCoupon(couponInput, course.slug);

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

  // Apenas conocemos el mail (ya sea porque estaba logueado o porque recién
  // completó el formulario) Y eligió un método manual, registramos la
  // intención de compra — aunque después no confirme nada.
  useEffect(() => {
    if (!buyer) return;
    if (method !== "transferencia" && method !== "payoneer") return;
    fetch("/api/manual-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "course",
        slug: course.slug,
        method,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        couponCode: method === "transferencia" ? appliedCoupon?.code : undefined,
      }),
    }).catch(() => {
      // No bloqueamos la UI si esto falla; Melisa igual recibe el WhatsApp/mail.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer, method]);

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

  // El cupón aplica pagando por transferencia o Payoneer por igual —
  // Mercado Pago sigue siempre a precio de lista, sin descuento.
  const transferenciaARS = applyDiscount(getTransferenciaAmountARS(course), appliedCoupon);
  const payoneerUSD = applyDiscount(getPayoneerAmountUSD(course), appliedCoupon);

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSubmitted(true);
  }

  function confirmManual(m: "transferencia" | "payoneer") {
    (window as any).gtag?.("event", "generate_lead", {
      event_category: "curso",
      event_label: course.slug,
      payment_method: m,
    });
    const label = m === "transferencia" ? "Transferencia bancaria" : "Payoneer";
    const couponLine = appliedCoupon
      ? `\n🎟️ Cupón: ${appliedCoupon.code} (${appliedCoupon.percentOff}% off)`
      : "";
    const phoneLine = buyer?.phone ? `\n📱 Celular: ${buyer.phone}` : "";
    const message = encodeURIComponent(
      `Hola Melisa 👋\n\nQuiero inscribirme al curso "${course.title}" de RIVARA HR Academy.\n\n📧 Email: ${buyer?.email}${phoneLine}\n💳 Forma de pago: ${label}${couponLine}\n\n📎 Voy a enviar el comprobante de pago.\n\nQuedo a la espera de la confirmación. ¡Gracias!`
    );
    window.open(`https://wa.me/5491123912820?text=${message}`, "_blank");
    router.push("/");
  }

  return (
    <div className="max-w-md">
      <div className="mb-4">
        <label className="text-sm text-bone/60 block mb-1">¿Tenés un cupón?</label>
        <input
          type="text"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder="Código de descuento (opcional)"
          className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none"
        />
        {couponInput && (
          <p className={`text-xs mt-1 ${appliedCoupon ? "text-sage" : "text-magenta"}`}>
            {appliedCoupon
              ? `✅ Cupón aplicado: ${appliedCoupon.percentOff}% off pagando por transferencia o Payoneer`
              : "Ese cupón no es válido."}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm text-bone/60 block mb-1">¿Cómo querés pagar?</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none"
        >
          <option value="">— Elegí una opción —</option>
          <option value="transferencia">
            Transferencia bancaria — ${transferenciaARS.toLocaleString("es-AR")} ARS
          </option>
          {course.payoneerLink && (
            <option value="payoneer">Payoneer — USD {payoneerUSD}</option>
          )}
          <option value="mercadopago">
            Mercado Pago — ${(course.priceARS ?? 0).toLocaleString("es-AR")} ARS (sin descuento)
          </option>
        </select>
      </div>

      {method && !buyer && (
        <form onSubmit={handleContactSubmit} className="card-alt rounded-lg p-4 mb-4 space-y-3">
          <p className="text-sm font-semibold text-bone">Tu mail</p>
          <p className="text-xs text-bone/50">
            Ahí te vamos a mandar la confirmación y, cuando el pago esté listo, el acceso al curso.
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

      {method === "mercadopago" && buyer && <CheckoutButton course={course} buyerEmail={buyer.email} />}

      {method === "transferencia" && buyer && course.bankDetails && (
        <div className="card-alt rounded-lg p-4 mb-4 text-sm text-bone/70">
          <p className="font-semibold text-bone mb-2">Datos para transferencia</p>
          <p>Titular: {course.bankDetails.holder}</p>
          <p>CBU: {course.bankDetails.cbu}</p>
          <p>Alias: {course.bankDetails.alias}</p>
          <p>CUIL: {course.bankDetails.cuil}</p>
          <p className="mt-3 text-xs text-bone/50">
            Una vez transferido, enviá el comprobante por WhatsApp o a{" "}
            <a href="mailto:hola@rivaraconsultora.com.ar" className="text-magenta hover:underline">
              hola@rivaraconsultora.com.ar
            </a>{" "}
            para confirmar tu lugar.
          </p>
          <button
            type="button"
            onClick={() => confirmManual("transferencia")}
            className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors mt-3"
          >
            Confirmar inscripción →
          </button>
        </div>
      )}

      {method === "payoneer" && buyer && course.payoneerLink && (
        <div className="card-alt rounded-lg p-4 mb-4 text-sm text-bone/70">
          <a
            href={course.payoneerLink}
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
            para confirmar tu lugar.
          </p>
          <button
            type="button"
            onClick={() => confirmManual("payoneer")}
            className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors mt-3"
          >
            Confirmar inscripción →
          </button>
        </div>
      )}
    </div>
  );
}
