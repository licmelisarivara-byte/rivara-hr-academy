"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";

export default function ActualizarContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <ActualizarContrasenaForm />
    </Suspense>
  );
}

// El link de recuperación de mail deja la sesión activa acá (Supabase lee el
// token del link automáticamente, ver detectSessionInUrl en supabaseClient).
// Si alguien entra a esta página sin haber pasado por ese link, no hay
// sesión activa y le pedimos que primero pida el link de recuperación.
function ActualizarContrasenaForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (checking) {
    return null;
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <meta name="robots" content="noindex, nofollow" />
        <h1 className="font-display text-2xl text-bone mb-3">✅ Contraseña actualizada</h1>
        <p className="text-bone/60">Te llevamos a tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Alumnos</p>
      <h1 className="font-display text-3xl text-bone mb-8">Elegí tu nueva contraseña</h1>

      {!supabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice what="la actualización de contraseña" />
        </div>
      )}

      {supabaseConfigured && !hasSession ? (
        <p className="text-sm text-bone/60">
          Este link ya no es válido o expiró. Pedí uno nuevo desde{" "}
          <a href="/recuperar-contrasena" className="text-magenta hover:underline">
            Recuperar contraseña
          </a>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-bone/60 block mb-1">Contraseña nueva</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}
