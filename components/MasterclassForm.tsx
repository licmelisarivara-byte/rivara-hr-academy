"use client";

import { useState } from "react";

export default function MasterclassForm({
  eventSlug,
  youtubeLink,
}: {
  eventSlug: string;
  youtubeLink: string;
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
          Ya podés ver la grabación de la masterclass cuando quieras.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
          >
            Ver la grabación →
          </a>
        </div>

        <div className="border-t border-bone/10 pt-6 text-left">
          <p className="text-bone/70 text-sm mb-4 text-center">
            ¿Te gustó? Estos son los próximos pasos:
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/masterclass/certificado"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-panel border border-black/10 px-4 py-3 text-bone hover:border-magenta transition-colors"
            >
              🏆 Pedí tu certificado de participación
            </a>
            <a
              href="/cursos/claude-para-seleccion"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-panel border border-black/10 px-4 py-3 text-bone hover:border-magenta transition-colors"
            >
              🎓 Sumate al curso Claude para Selección — con{" "}
              <strong>25% off</strong> con el cupón CLAUDE25
            </a>
            <a
              href="https://www.youtube.com/@rivarahracademy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-panel border border-black/10 px-4 py-3 text-bone hover:border-magenta transition-colors"
            >
              ▶️ Suscribite al canal de YouTube
            </a>
            <a
              href="https://www.linkedin.com/company/rivara-hr-academy/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-panel border border-black/10 px-4 py-3 text-bone hover:border-magenta transition-colors"
            >
              💼 Seguinos en LinkedIn
            </a>
          </div>
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
        {loading ? "Registrando..." : "Ver grabación →"}
      </button>
    </form>
  );
}
