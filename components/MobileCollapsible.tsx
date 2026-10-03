"use client";

import { useId, useState } from "react";

// Sección que en celular arranca cerrada (el título es un botón que la abre)
// y en pantallas grandes se ve siempre completa, con su título de siempre.
// El contenido queda en el HTML en los dos casos: solo se oculta con CSS.
export default function MobileCollapsible({
  title,
  children,
  defaultOpen = false,
  className = "mb-10",
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={className}>
      <h2 className="hidden md:block font-display text-2xl text-bone mb-6">{title}</h2>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="md:hidden w-full flex items-center justify-between gap-4 text-left card-alt rounded-xl px-4 py-4 min-h-[56px]"
      >
        <span className="font-display font-bold text-bone text-lg leading-snug">{title}</span>
        <span className="shrink-0 text-magenta text-2xl font-bold leading-none" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      <div id={panelId} className={open ? "mt-4 md:mt-0" : "hidden md:block"}>
        {children}
      </div>
    </section>
  );
}
