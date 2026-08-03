"use client";

import { useState } from "react";

export default function MasterclassForm({
  eventSlug,
  youtubeLink,
  calendarLink,
}: {
  eventSlug: string;
  youtubeLink: string;
  calendarLink: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/event-registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, name, email, phone }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
      (window as any).gtag?.("event", "generate_lead", {
        event_category: "masterclass",
        event_label: eventSlug,
      });
    } catch {
      setError("Algo falló al registrarte. Probá de nuevo o escribinos por WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="font-display text-2xl text-bone mb-3">
          ¡Ya estás registrada!
        </p>
        <p className="text-bone/70 mb-6">
          Guardá este link para conectarte el día del evento. Te esperamos ahí.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
          >
            Ver en YouTube →
          </a>
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-sage text-white px-6 py-3 rounded-full hover:opacity-90 transition-colors"
          >
            + Agendar en Google Calendar
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-xl p-6 sm:p-8 space-y-4">
      <div>
        <label className="text-sm text-bone/60 block mb-1">Nombre completo</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-bone/60 block mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-bone/60 block mb-1">
          WhatsApp <span className="text-bone/40">(opcional)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 1123456789"
          className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none"
        />
      </div>
      {error && <p className="text-sm text-magenta">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-cta w-full bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Reservar mi lugar →"}
      </button>
    </form>
  );
}
