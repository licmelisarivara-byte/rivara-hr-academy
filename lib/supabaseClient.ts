import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// If the env vars aren't set yet (fresh deploy, before Melisa creates the
// Supabase project), we export `null` instead of crashing the build.
// Every place that uses this checks `supabaseConfigured` first.
//
// persistSession + autoRefreshToken explícitos: la sesión se guarda en
// localStorage y se renueva sola en segundo plano mientras la pestaña esté
// abierta, para que no se cierre sola antes de que la persona la cierre a
// mano o borre los datos del navegador.
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
