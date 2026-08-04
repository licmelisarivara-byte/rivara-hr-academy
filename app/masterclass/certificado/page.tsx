"use client";

import { useState } from "react";
import { CERTIFICADO_EVENTO } from "@/lib/certificado";

type Estado =
  | { paso: "form" }
  | { paso: "error"; mensaje: string }
  | { paso: "ok"; id: string; nombre: string };

export default function CertificadoMasterclassPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<Estado>({ paso: "form" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/certificado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, respuesta }),
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
      <p className="eyebrow mb-4">Masterclass en vivo</p>
      <h1 className="font-display text-3xl text-bone mb-3">
        Pedí tu certificado de participación
      </h1>
      <p className="text-bone/60 mb-10">
        {CERTIFICADO_EVENTO.titulo} — {CERTIFICADO_EVENTO.fecha}.
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
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card rounded-xl p-6 sm:p-8 space-y-4">
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
          <div>
            <label className="text-sm text-bone/60 block mb-1">
              ¿Qué score le dio Claude al candidato de ejemplo en la demo?
            </label>
            <input
              required
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Ej: 42"
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
