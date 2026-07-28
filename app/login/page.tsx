"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import ConfigNotice from "@/components/ConfigNotice";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <p className="eyebrow mb-4">Alumnos</p>
      <h1 className="font-display text-3xl text-bone mb-8">Ingresar</h1>

      {!supabaseConfigured && (
        <div className="mb-6">
          <ConfigNotice what="el login" />
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
        <div>
          <label className="text-sm text-bone/60 block mb-1">Contraseña</label>
          <input
            type="password"
            required
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
          className="w-full bg-magenta text-white font-semibold px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="text-sm text-bone/50 mt-6">
        ¿No tenés cuenta todavía?{" "}
        <Link href="/registro" className="text-magenta hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
