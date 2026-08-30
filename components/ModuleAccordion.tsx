"use client";

import { useState } from "react";
import { moduleAnchor } from "@/lib/courses";

type ModuleItem = {
  title: string;
  benefit?: string;
  icon?: string;
  items: string[];
};

export default function ModuleAccordion({ modules }: { modules: ModuleItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {modules.map((m, i) => {
        const isOpen = openIndex === i;
        const panelId = `${moduleAnchor(m.title)}-panel`;
        return (
          <div
            key={m.title}
            id={moduleAnchor(m.title)}
            className="card-alt rounded-xl overflow-hidden scroll-mt-24"
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
              >
                <span className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5" aria-hidden="true">
                    {m.icon ?? "📚"}
                  </span>
                  <span>
                    {m.benefit && (
                      <span className="block text-magenta text-sm font-semibold mb-1">
                        {m.benefit}
                      </span>
                    )}
                    <span className="block font-semibold text-bone">{m.title}</span>
                  </span>
                </span>
                <span
                  className={`shrink-0 text-bone/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
            </h3>
            {isOpen && (
              <div id={panelId} className="px-6 pb-5 pl-[3.25rem]">
                <ul className="space-y-1.5 text-sm text-bone/70 list-disc list-inside">
                  {m.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
