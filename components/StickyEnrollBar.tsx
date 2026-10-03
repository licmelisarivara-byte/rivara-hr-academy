"use client";

import { useEffect, useState } from "react";
import TrackedAnchor from "@/components/TrackedAnchor";

// Barra fija abajo, solo en celular. Se esconde mientras ya se ve algún
// botón de inscripción de la página (el del principio, el del final) o el
// formulario de pago, para no mostrar dos botones iguales a la vez ni tapar
// los campos mientras se completan.
const WATCHED_IDS = ["cta-hero", "cta-final", "comprar"];

export default function StickyEnrollBar({
  courseSlug,
  line1,
  line2,
}: {
  courseSlug: string;
  line1: string;
  line2: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = WATCHED_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0 || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const inView = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inView.set(entry.target.id, entry.isIntersecting);
        setVisible(![...inView.values()].some(Boolean));
      },
      { threshold: 0.1 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    // `invisible` (visibility: hidden) lo saca del orden de tabulación y de
    // los lectores de pantalla mientras está escondido; aria-hidden dejaba un
    // enlace enfocable adentro.
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0D0D14] border-t border-white/10 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3 transition-transform duration-200 ${
        visible ? "translate-y-0" : "translate-y-full invisible pointer-events-none"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="!text-white text-sm font-bold leading-tight truncate">{line1}</p>
        <p className="!text-white/70 text-xs leading-tight truncate">{line2}</p>
      </div>
      <TrackedAnchor
        href="#comprar"
        location="sticky"
        courseSlug={courseSlug}
        className="btn-cta shrink-0 bg-magenta text-white px-5 py-3 rounded-full text-sm active:bg-magentaDeep"
      >
        Inscribirme ahora
      </TrackedAnchor>
    </div>
  );
}
