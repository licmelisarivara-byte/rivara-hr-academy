"use client";

import { useState } from "react";
import { freeResources } from "@/lib/resources";
import { getEventBySlug } from "@/lib/events";

const masterclass = getEventBySlug("analiza-cvs-con-ia");

export default function FreeComboSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch("/api/log-free-combo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerName: name, buyerEmail: email, buyerPhone: phone }),
    }).catch(() => {
      // No bloqueamos el acceso si el log falla.
    });
    (window as any).gtag?.("event", "generate_lead", {
      event_category: "combo_gratis",
      event_label: "combo-recursos-gratis",
    });
    setUnlocked(true);
  }

  if (unlocked) {
    return (
      <div>
        <p className="text-sm text-bone/80 mb-3">
          ¡Listo! Ya podés acceder a todo, y te mandamos un mail con estos mismos links:
        </p>
        <div className="flex flex-col gap-2">
          {freeResources.map(
            (r) =>
              r.fileUrl && (
                <a
                  key={r.slug}
                  href={r.fileUrl}
                  download
                  className="rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-sm text-bone hover:border-magenta transition-colors"
                >
                  ⬇️ {r.title}
                </a>
              )
          )}
          {masterclass && (
            <a
              href={masterclass.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-sm text-bone hover:border-magenta transition-colors"
            >
              🎥 Ver la masterclass grabada
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre y apellido"
        className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
        className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp (opcional)"
        className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
      />
      <button
        type="submit"
        className="btn-cta bg-magenta text-white px-4 py-2.5 rounded-full hover:bg-magentaSoft transition-colors text-sm"
      >
        Llevarme todo gratis →
      </button>
    </form>
  );
}
