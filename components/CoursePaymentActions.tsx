"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import CheckoutButton from "@/components/CheckoutButton";
import { applyDiscount } from "@/lib/discount";
import {
  getTransferenciaAmountARS,
  getPayoneerAmountUSD,
  type Course,
} from "@/lib/courses";
import { paidResources, getPaidResourceBySlug } from "@/lib/resources";

type Method = "" | "transferencia" | "mercadopago" | "payoneer";
type Buyer = { email: string; phone: string };
type AppliedCoupon = { code: string; percentOff: number };

// % sobre el PRECIO DE LISTA del addon elegido — reemplaza su descuento
// individual del 10% (no se acumulan). El precio del curso no se toca:
// se suma tal cual, con o sin cupón (nunca en Mercado Pago, que no
// acepta cupones), para no descontarlo dos veces. Permanente, sin fecha
// de vencimiento. Por transferencia/Payoneer el addon baja un 15%; por
// Mercado Pago solo un 5% (el curso ahí no tiene ningún descuento).
const BUNDLE_DISCOUNT_PERCENT = 15;
const MP_BUNDLE_DISCOUNT_PERCENT = 5;

// Nombre corto de cada addon para el mensaje de ahorro ("...llevando el
// curso + el Kit juntos"), en vez del título largo completo del producto.
const ADDON_SHORT_NAMES: Record<string, string> = {
  "kit-12-prompts-seleccion": "el Kit",
  "basta-de-filtrar-a-mano": "la Guía",
  "combo-kit-y-guia": "el Combo",
};

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
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponInvalid, setCouponInvalid] = useState(false);
  const [addonSlug, setAddonSlug] = useState("");

  // El código y el % de descuento nunca viajan en el bundle de JS (no se
  // importa lib/coupons acá) — se valida contra /api/coupon, que solo
  // contesta si ESE código puntual es válido, sin revelar la lista.
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
        body: JSON.stringify({ code, courseSlug: course.slug }),
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
  }, [couponInput, course.slug]);

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
  // intención de compra — aunque después no confirme nada. Si eligió sumar
  // un recurso pago (combo), pega a la ruta de combo en vez de la normal.
  useEffect(() => {
    if (!buyer) return;
    if (addonSlug) {
      // El combo se ofrece con los 3 métodos (sin addon, Mercado Pago
      // sigue su propio flujo dinámico vía /api/checkout más abajo).
      if (method !== "transferencia" && method !== "payoneer" && method !== "mercadopago") return;
      fetch("/api/manual-purchase-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: course.slug,
          resourceSlug: addonSlug,
          method,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone,
          couponCode: appliedCoupon?.code,
        }),
      }).catch(() => {
        // No bloqueamos la UI si esto falla; Melisa igual recibe el WhatsApp/mail.
      });
      return;
    }
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
        couponCode: appliedCoupon?.code,
      }),
    }).catch(() => {
      // No bloqueamos la UI si esto falla; Melisa igual recibe el WhatsApp/mail.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer, method, addonSlug]);

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

  // El cupón solo aplica pagando por transferencia. Payoneer y Mercado
  // Pago quedan siempre a precio de lista: los links de Payoneer son de
  // monto fijo (no se puede aplicar un % dinámicamente sin armar un link
  // nuevo por cada combinación cupón × combo), y Mercado Pago nunca tuvo
  // descuento a propósito.
  const transferenciaARS = applyDiscount(getTransferenciaAmountARS(course), appliedCoupon?.percentOff);
  const payoneerUSD = getPayoneerAmountUSD(course);

  // Combo curso + recurso pago (Kit/Guía/Combo de ebooks): el curso se
  // suma tal cual (con cupón si corresponde, sin ningún % adicional — no
  // se descuenta dos veces), y al addon se le aplica un % sobre su
  // precio de lista, EN REEMPLAZO de su 10% individual (no se acumulan):
  // 15% por transferencia/Payoneer, 5% por Mercado Pago.
  const addon = addonSlug ? getPaidResourceBySlug(addonSlug) : undefined;
  const mpCourseARS = course.priceARS ?? 0; // Mercado Pago nunca tiene cupón ni descuento en el curso
  const addonBundleARS = addon ? applyDiscount(addon.priceARS, BUNDLE_DISCOUNT_PERCENT) : 0;
  const addonBundleUSD = addon ? applyDiscount(addon.priceUSD, BUNDLE_DISCOUNT_PERCENT) : 0;
  const addonBundleMP = addon ? applyDiscount(addon.priceARS, MP_BUNDLE_DISCOUNT_PERCENT) : 0;
  const rawBundleTransferenciaARS = addon ? transferenciaARS + addonBundleARS : transferenciaARS;
  const rawBundlePayoneerUSD = addon ? payoneerUSD + addonBundleUSD : payoneerUSD;
  const rawBundleMercadoPagoARS = addon ? mpCourseARS + addonBundleMP : mpCourseARS;

  // Resguardo: el combo nunca puede salir más barato que el curso solo. Si
  // por algún cambio futuro en los precios eso pasara, no se publica ese
  // número — se avisa como error en vez de mostrar un precio incorrecto.
  const bundleErrorARS = !!addon && rawBundleTransferenciaARS < transferenciaARS;
  const bundleErrorUSD = !!addon && !!course.payoneerLink && rawBundlePayoneerUSD < payoneerUSD;
  const bundleErrorMP = !!addon && rawBundleMercadoPagoARS < mpCourseARS;
  const bundleTransferenciaARS = bundleErrorARS ? transferenciaARS : rawBundleTransferenciaARS;
  const bundlePayoneerUSD = bundleErrorUSD ? payoneerUSD : rawBundlePayoneerUSD;
  const bundleMercadoPagoARS = bundleErrorMP ? mpCourseARS : rawBundleMercadoPagoARS;

  // Ahorro respecto de pagar los dos productos por separado, a precio de
  // lista (el mismo que cobra Mercado Pago, sin ningún descuento) — se
  // muestra siempre en moneda, nunca en porcentaje.
  const bundleSavingsARS =
    addon && !bundleErrorARS
      ? (course.priceARS ?? 0) + (addon.priceARS ?? 0) - bundleTransferenciaARS
      : 0;
  const bundleSavingsUSD =
    addon && !bundleErrorUSD
      ? (course.priceUSDRegular ?? 0) + (addon.priceUSD ?? 0) - bundlePayoneerUSD
      : 0;
  const bundleSavingsMP =
    addon && !bundleErrorMP ? mpCourseARS + (addon.priceARS ?? 0) - bundleMercadoPagoARS : 0;

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSubmitted(true);
  }

  function confirmManual(m: "transferencia" | "payoneer" | "mercadopago") {
    (window as any).gtag?.("event", "generate_lead", {
      event_category: "curso",
      event_label: course.slug,
      payment_method: m,
    });
    const label =
      m === "transferencia" ? "Transferencia bancaria" : m === "payoneer" ? "Payoneer" : "Mercado Pago";
    const couponLine = appliedCoupon
      ? `\n🎟️ Cupón: ${appliedCoupon.code} (${appliedCoupon.percentOff}% off)`
      : "";
    const comboAmount =
      m === "payoneer"
        ? `USD ${bundlePayoneerUSD}`
        : m === "mercadopago"
        ? `$${bundleMercadoPagoARS.toLocaleString("es-AR")} ARS`
        : `$${bundleTransferenciaARS.toLocaleString("es-AR")} ARS`;
    const comboLine = addon ? `\n📦 Combo: + ${addon.title}\n💰 Total con combo: ${comboAmount}` : "";
    const phoneLine = buyer?.phone ? `\n📱 Celular: ${buyer.phone}` : "";
    const message = encodeURIComponent(
      `Hola Melisa 👋\n\nQuiero inscribirme al curso "${course.title}" de RIVARA HR Academy.\n\n📧 Email: ${buyer?.email}${phoneLine}\n💳 Forma de pago: ${label}${couponLine}${comboLine}\n\n📎 Voy a enviar el comprobante de pago.\n\nQuedo a la espera de la confirmación. ¡Gracias!`
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
        {couponInput && (appliedCoupon || couponInvalid) && (
          <p className={`text-xs mt-1 ${appliedCoupon ? "text-sage" : "text-magenta"}`}>
            {appliedCoupon
              ? `✅ Cupón aplicado: ${appliedCoupon.percentOff}% off pagando por transferencia`
              : "Ese cupón no es válido."}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm text-bone/60 block mb-2">¿Cómo querés pagar?</label>
        {/* Antes era un <select> nativo: en mobile el navegador recorta el
            texto de la opción elegida (ej. "$52.500" quedaba en "$52"), y
            no hay CSS que lo arregle porque el recorte lo hace el control
            nativo del sistema operativo, no el layout de la página. Un
            grupo de botones propios evita ese problema de raíz. */}
        <div className="space-y-2" role="radiogroup" aria-label="¿Cómo querés pagar?">
          <button
            type="button"
            role="radio"
            aria-checked={method === "transferencia"}
            onClick={() => setMethod("transferencia")}
            className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              method === "transferencia"
                ? "border-magenta bg-panel text-bone"
                : "border-black/10 bg-panel/50 text-bone/70 hover:border-magenta/40"
            }`}
          >
            Transferencia bancaria — ${bundleTransferenciaARS.toLocaleString("es-AR")} ARS
          </button>
          {course.payoneerLink && (
            <button
              type="button"
              role="radio"
              aria-checked={method === "payoneer"}
              onClick={() => setMethod("payoneer")}
              className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                method === "payoneer"
                  ? "border-magenta bg-panel text-bone"
                  : "border-black/10 bg-panel/50 text-bone/70 hover:border-magenta/40"
              }`}
            >
              Payoneer — USD {bundlePayoneerUSD}
              {!addon && " (sin descuento)"}
            </button>
          )}
          <button
            type="button"
            role="radio"
            aria-checked={method === "mercadopago"}
            onClick={() => setMethod("mercadopago")}
            className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              method === "mercadopago"
                ? "border-magenta bg-panel text-bone"
                : "border-black/10 bg-panel/50 text-bone/70 hover:border-magenta/40"
            }`}
          >
            Mercado Pago — ${bundleMercadoPagoARS.toLocaleString("es-AR")} ARS
            {!addon && " (sin descuento)"}
          </button>
        </div>
      </div>

      {(method === "transferencia" || method === "payoneer" || method === "mercadopago") && (() => {
        const addonPercent = method === "mercadopago" ? MP_BUNDLE_DISCOUNT_PERCENT : BUNDLE_DISCOUNT_PERCENT;
        const activeError = method === "payoneer" ? bundleErrorUSD : method === "mercadopago" ? bundleErrorMP : bundleErrorARS;
        const activeSavingsLabel =
          method === "payoneer"
            ? `USD ${bundleSavingsUSD}`
            : `$${(method === "mercadopago" ? bundleSavingsMP : bundleSavingsARS).toLocaleString("es-AR")}`;
        return (
          <div className="mb-4">
            <label className="text-sm text-bone/60 block mb-2">
              Sumá también (opcional)
            </label>
            <div className="space-y-2" role="radiogroup" aria-label="Sumá también">
              <button
                type="button"
                role="radio"
                aria-checked={addonSlug === ""}
                onClick={() => setAddonSlug("")}
                className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  addonSlug === ""
                    ? "border-magenta bg-panel text-bone"
                    : "border-black/10 bg-panel/50 text-bone/70 hover:border-magenta/40"
                }`}
              >
                Ninguno
              </button>
              {paidResources.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  role="radio"
                  aria-checked={addonSlug === r.slug}
                  onClick={() => setAddonSlug(r.slug)}
                  className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    addonSlug === r.slug
                      ? "border-magenta bg-panel text-bone"
                      : "border-black/10 bg-panel/50 text-bone/70 hover:border-magenta/40"
                  }`}
                >
                  {r.title} — ${applyDiscount(r.priceARS, addonPercent).toLocaleString("es-AR")}
                </button>
              ))}
            </div>
            {addon && activeError && (
              <p className="text-xs text-magenta mt-2">
                ⚠️ No se pudo calcular el precio del combo con seguridad — escribinos por WhatsApp
                antes de continuar.
              </p>
            )}
            {addon && !activeError && (
              <p className="text-xs text-sage mt-2">
                ✅ Ahorrás {activeSavingsLabel} llevando el curso + {ADDON_SHORT_NAMES[addon.slug] ?? addon.title}{" "}
                juntos.
              </p>
            )}
          </div>
        );
      })()}

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

      {method === "mercadopago" && buyer && !addon && (
        <CheckoutButton course={course} buyerEmail={buyer.email} />
      )}

      {method === "mercadopago" && buyer && addon && (
        <div className="card-alt rounded-lg p-4 mb-4 text-sm text-bone/70">
          {addon.mpPaymentLinkWithCourse ? (
            <a
              href={addon.mpPaymentLinkWithCourse}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta w-full inline-block text-center bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors"
            >
              Pagar con Mercado Pago →
            </a>
          ) : (
            // Todavía no existe un link de Mercado Pago específico para
            // este combo (curso + este recurso) — se completa
            // `mpPaymentLinkWithCourse` en lib/resources.ts apenas esté
            // creado. Mientras tanto, se coordina el pago a mano.
            <>
              <p className="text-xs text-bone/60 mb-3">
                Todavía no tenemos armado el link de Mercado Pago para este combo puntual. Escribinos
                y coordinamos el pago directamente por WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => confirmManual("mercadopago")}
                className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors"
              >
                Escribime por WhatsApp para coordinar el pago →
              </button>
            </>
          )}
        </div>
      )}

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

      {method === "payoneer" && buyer && (course.payoneerLink || addon) && (
        <div className="card-alt rounded-lg p-4 mb-4 text-sm text-bone/70">
          {addon && !addon.payoneerLinkWithCourse ? (
            // Todavía no existe un link de Payoneer específico para este
            // combo (curso + este recurso) — se completa
            // `payoneerLinkWithCourse` en lib/resources.ts apenas esté
            // creado. Mientras tanto, se coordina el pago a mano.
            <>
              <p className="text-xs text-bone/60 mb-3">
                Todavía no tenemos armado el link de Payoneer para este combo puntual. Escribinos y
                coordinamos el pago en USD directamente por WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => confirmManual("payoneer")}
                className="btn-cta w-full bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors"
              >
                Escribime por WhatsApp para coordinar el pago en USD →
              </button>
            </>
          ) : (
            course.payoneerLink && (
              <>
                <a
                  href={addon?.payoneerLinkWithCourse ?? course.payoneerLink}
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
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
