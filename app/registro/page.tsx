"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";

export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegistroForm />
    </Suspense>
  );
}

function RegistroForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone },
        emailRedirectTo: `${window.location.origin}${next}`,
      },
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
        <h1 className="font-display text-2xl text-bone mb-3">Revisá tu email</h1>
        <p className="text-bone/60">
          Te enviamos un link de confirmación para activar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <meta name="robots" content="noindex, nofollow" />
      <p className="eyebrow mb-4">Alumnos</p>
      <h1 className="font-display text-3xl text-bone mb-8">Crear cuenta</h1>

      {!supabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice what="el registro" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-bone/60 block mb-1">Nombre y apellido</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!supabaseConfigured}
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-sm text-bone/60 block mb-1">Celular / WhatsApp</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 1123456789"
            disabled={!supabaseConfigured}
            className="w-full rounded-lg bg-panel border border-black/10 px-4 py-2.5 text-bone focus:border-magenta outline-none disabled:opacity-50"
          />
        </div>
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
        <div>
          <label className="text-sm text-bone/60 block mb-1">Contraseña</label>
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-sm text-bone/50 mt-6">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-magenta hover:underline"
        >
          Ingresá
        </Link>
      </p>
    </div>
  );
}
