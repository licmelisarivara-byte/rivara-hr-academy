"use client";

import { useState } from "react";
import { CERTIFICADO_CLAUDE_SELECCION } from "@/lib/certificado";

type Estado =
  | { paso: "form" }
  | { paso: "error"; mensaje: string }
  | { paso: "ok"; id: string; nombre: string };

export default function CertificadoClaudeSeleccionPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<Estado>({ paso: "form" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/certificado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, tipo: "claude-seleccion" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEstado({
          paso: "error",
          mensaje: "Algo falló de nuestro lado. Probá de nuevo en un rato.",
        });
        return;
      }
      if (!data.correcta) {
        setEstado({ paso: "error", mensaje: data.mensaje });
        return;
      }
      setEstado({ paso: "ok", id: data.id, nombre });
    } catch {
      setEstado({
        paso: "error",
        mensaje: "No pudimos conectar con el servidor. Probá de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Claude para Selección</p>
      <h1 className="font-display text-3xl text-bone mb-3">
        Pedí tu certificado del curso
      </h1>
      <p className="text-bone/60 mb-4">
        {CERTIFICADO_CLAUDE_SELECCION.titulo} — {CERTIFICADO_CLAUDE_SELECCION.fecha}.
      </p>
      <p className="text-bone/60 mb-10">
        Si terminaste el video del Módulo 6, el certificado ya se te tendría que haber generado
        solo. Usá este formulario solo si no fue así.
      </p>

      {estado.paso === "ok" ? (
        <div className="card rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl text-bone mb-4">
            ¡Listo, {estado.nombre.split(" ")[0]}! 🎉
          </h2>
          <div className="rounded-lg overflow-hidden border border-black/10 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/certificado/imagen/${estado.id}`}
              alt={`Certificado de participación de ${estado.nombre}`}
              className="w-full h-auto"
            />
          </div>
          <a
            href={`/api/certificado/imagen/${estado.id}`}
            download
            className="btn-cta bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors inline-block"
          >
            Descargar mi certificado
          </a>

          <div className="hairline my-6" />

          <p className="text-bone/70 mb-3">
            Compartí tu certificado en LinkedIn y etiquetanos — nos encanta verlos 💛
          </p>
          <a
            href="https://www.linkedin.com/company/rivara-hr-academy/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta bg-sage text-white px-6 py-3 rounded-full hover:opacity-90 transition-colors inline-block"
          >
            Seguinos en LinkedIn →
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card rounded-xl p-6 sm:p-8 space-y-4">
          <p className="text-sm text-bone/60">
            Usá el mismo mail con el que compraste el curso — así verificamos tu inscripción.
          </p>
          <div>
            <label className="text-sm text-bone/60 block mb-1">Nombre completo</label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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

          {estado.paso === "error" && (
            <p className="text-sm text-magenta">{estado.mensaje}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cta w-full bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar y generar certificado"}
          </button>
        </form>
      )}
    </div>
  );
}
