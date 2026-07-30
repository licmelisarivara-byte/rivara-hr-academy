"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import CheckoutButton from "@/components/CheckoutButton";
import type { Course } from "@/lib/courses";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";

// Los precios/formas de pago quedan visibles sin loguearse (ayudan a
// decidir la compra), pero ninguna acción real —Mercado Pago, coordinar
// transferencia, Payoneer— se puede tocar sin registrarse antes. Así, sea
// cual sea el método que elija, siempre queda su mail (y ahora también
// nombre y celular, que ya pidió el registro).
export default function CoursePaymentActions({ course }: { course: Course }) {
  const [checking, setChecking] = useState(supabaseConfigured);
  const [buyer, setBuyer] = useState<{ email: string; name: string; phone: string } | null>(
    null
  );
  const [method, setMethod] = useState<Method>("");
  const [confirmed, setConfirmed] = useState(false);

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
        href="/registro"
        className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Registrarme para elegir cómo pagar →
      </Link>
    );
  }

  if (!course.paymentOptions?.length) {
    return <CheckoutButton course={course} />;
  }

  async function logInterest(m: "transferencia" | "payoneer") {
    try {
      await fetch("/api/course-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: course.slug,
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
    setConfirmed(false);
    if (value === "transferencia" || value === "payoneer") {
      logInterest(value);
    }
  }

  function confirmManual(m: "transferencia" | "payoneer") {
    const label = m === "transferencia" ? "Transferencia bancaria" : "Payoneer";
    const message = encodeURIComponent(
      `Hola Melisa 👋\n\nQuiero inscribirme al curso "${course.title}" de RIVARA HR Academy.\n\n📌 Nombre: ${buyer?.name}\n📧 Email: ${buyer?.email}\n📱 Celular: ${buyer?.phone}\n💳 Forma de pago: ${label}\n\n📎 Voy a enviar el comprobante de pago.\n\nQuedo a la espera de la confirmación. ¡Gracias!`
    );
    window.open(`https://wa.me/5491123912820?text=${message}`, "_blank");
    setConfirmed(true);
  }

  return (
    <div className="max-w-md">
      <div className="mb-4">
        <label className="text-sm text-bone/60 block mb-1">¿Cómo querés pagar?</label>
        <select
          value={method}
          onChange={(e) => handleMethodChange(e.target.value as Method)}
          className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none"
        >
          <option value="">— Elegí una opción —</option>
          {course.paymentOptions?.map((opt) => (
            <option
              key={opt.method}
              value={
                opt.method === "Transferencia bancaria"
                  ? "transferencia"
                  : opt.method === "Payoneer"
                  ? "payoneer"
                  : "mercadopago"
              }
            >
              {opt.method} — {opt.price}
              {opt.note ? ` (${opt.note})` : ""}
            </option>
          ))}
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
          {confirmed ? (
            <p className="mt-3 text-sm text-sage">
              ¡Listo! En cuanto confirmemos el pago, se activa el curso en tu cuenta.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => confirmManual("transferencia")}
              className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors mt-3"
            >
              Confirmar inscripción →
            </button>
          )}
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
          {confirmed ? (
            <p className="mt-3 text-sm text-sage">
              ¡Listo! En cuanto confirmemos el pago, se activa el curso en tu cuenta.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => confirmManual("payoneer")}
              className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors mt-3"
            >
              Confirmar inscripción →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
