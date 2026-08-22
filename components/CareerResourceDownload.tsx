"use client";

import { useRef, useState } from "react";

const PDF_PATH = "/recursos/5-tips-busqueda-laboral.pdf";

export default function CareerResourceDownload() {
  const [askingEmail, setAskingEmail] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/career-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
    } catch {
      // No bloqueamos la descarga si falla el registro del lead.
    } finally {
      setLoading(false);
      setUnlocked(true);
      // El link real recién se monta en este render; hace falta esperar al
      // próximo tick para poder simular el click y disparar la descarga.
      setTimeout(() => linkRef.current?.click(), 0);
    }
  }

  if (unlocked) {
    return (
      <a
        ref={linkRef}
        href={PDF_PATH}
        download
        className="btn-cta inline-block bg-careerFucsia text-careerCream px-8 py-4 rounded-full hover:bg-careerFucsia/85 transition-colors"
      >
        Descargar los 5 tips en PDF →
      </a>
    );
  }

  if (askingEmail) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <input
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre y apellido"
          className="font-body flex-1 rounded-full bg-white border border-careerNavy/15 px-4 py-3 text-sm text-careerNavy focus:border-careerFucsia outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="font-body flex-1 rounded-full bg-white border border-careerNavy/15 px-4 py-3 text-sm text-careerNavy focus:border-careerFucsia outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-cta bg-careerFucsia text-careerCream px-6 py-3 rounded-full hover:bg-careerFucsia/85 transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Descargar →"}
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAskingEmail(true)}
      className="btn-cta inline-block bg-careerFucsia text-careerCream px-8 py-4 rounded-full hover:bg-careerFucsia/85 transition-colors"
    >
      Descargar los 5 tips en PDF →
    </button>
  );
}
