"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import CheckoutButton from "@/components/CheckoutButton";
import { getCoupon, applyDiscount } from "@/lib/coupons";
import {
  getTransferenciaAmountARS,
  getPayoneerAmountUSD,
  type Course,
} from "@/lib/courses";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";

// Los precios/formas de pago quedan visibles sin loguearse (ayudan a
// decidir la compra), pero ninguna acción real —Mercado Pago, coordinar
// transferencia, Payoneer— se puede tocar sin registrarse antes. Así, sea
// cual sea el método que elija, siempre queda su mail (y ahora también
// nombre y celular, que ya pidió el registro).
export default function CoursePaymentActions({ course }: { course: Course }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(supabaseConfigured);
  const [buyer, setBuyer] = useState<{ email: string; name: string; phone: string } | null>(
    null
  );
  const [method, setMethod] = useState<Method>("");
  const [couponInput, setCouponInput] = useState("");
  const appliedCoupon = getCoupon(couponInput);

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

  if (supabaseConfigured && !buyer) {
    return (
      <Link
        href={`/registro?next=${encodeURIComponent(pathname)}`}
        className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Registrarme para elegir cómo pagar →
      </Link>
    );
  }

  if (!course.paymentOptions?.length) {
    return <CheckoutButton course={course} />;
  }

  // El cupón DESCARGA5 solo aplica pagando por transferencia — Mercado
  // Pago y Payoneer usan links fijos que no reflejan el descuento.
  const transferenciaARS = applyDiscount(getTransferenciaAmountARS(course), appliedCoupon);
  const payoneerUSD = getPayoneerAmountUSD(course);

  async function logInterest(m: "transferencia" | "payoneer") {
    try {
      await fetch("/api/manual-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "course",
          slug: course.slug,
          method: m,
          buyerEmail: buyer?.email,
          buyerName: buyer?.name,
          buyerPhone: buyer?.phone,
          couponCode: m === "transferencia" ? appliedCoupon?.code : undefined,
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
    const couponLine =
      m === "transferencia" && appliedCoupon
        ? `\n🎟️ Cupón: ${appliedCoupon.code} (${appliedCoupon.percentOff}% off)`
        : "";
    const message = encodeURIComponent(
      `Hola Melisa 👋\n\nQuiero inscribirme al curso "${course.title}" de RIVARA HR Academy.\n\n📌 Nombre: ${buyer?.name}\n📧 Email: ${buyer?.email}\n📱 Celular: ${buyer?.phone}\n💳 Forma de pago: ${label}${couponLine}\n\n📎 Voy a enviar el comprobante de pago.\n\nQuedo a la espera de la confirmación. ¡Gracias!`
    );
    window.open(`https://wa.me/5491123912820?text=${message}`, "_blank");
    router.push("/dashboard");
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
              ? `✅ Cupón aplicado: ${appliedCoupon.percentOff}% off pagando por transferencia`
              : "Ese cupón no es válido."}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm text-bone/60 block mb-1">¿Cómo querés pagar?</label>
        <select
          value={method}
          onChange={(e) => handleMethodChange(e.target.value as Method)}
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

      {method === "mercadopago" && <CheckoutButton course={course} />}

      {method === "transferencia" && course.bankDetails && (
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

      {method === "payoneer" && course.payoneerLink && (
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
