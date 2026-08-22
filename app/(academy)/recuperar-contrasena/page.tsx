"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-contrasena`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <meta name="robots" content="noindex, nofollow" />
        <h1 className="font-display text-2xl text-bone mb-3">📩 Revisá tu email</h1>
        <p className="text-bone/60 mb-2">
          Si <strong>{email}</strong> tiene una cuenta, te enviamos un link para elegir una
          contraseña nueva. Tocalo y vas a poder entrar enseguida.
        </p>
        <p className="text-bone/40 text-sm">
          Si no lo ves en unos minutos, revisá la carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Alumnos</p>
      <h1 className="font-display text-3xl text-bone mb-8">Recuperar contraseña</h1>

      {!supabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice what="la recuperación de contraseña" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-bone/60 block mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!supabaseConfigured}
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none disabled:opacity-50"
          />
        </div>
        {error && <p className="text-sm text-magenta">{error}</p>}
        <button
          type="submit"
          disabled={!supabaseConfigured || loading}
          className="btn-cta w-full bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviarme el link"}
        </button>
      </form>

      <p className="text-sm text-bone/50 mt-6">
        ¿Te acordaste?{" "}
        <Link href="/login" className="text-magenta hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
