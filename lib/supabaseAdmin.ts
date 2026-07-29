import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdminConfigured = Boolean(url && serviceRoleKey);

// Cliente con la service role key: solo se usa server-side (rutas /api/*),
// nunca se importa desde un componente "use client". Es el único que puede
// leer/escribir en `compras`, porque esa tabla no tiene policies de RLS.
export const supabaseAdmin: SupabaseClient | null = supabaseAdminConfigured
  ? createClient(url as string, serviceRoleKey as string, {
      auth: { persistSession: false },
    })
  : null;
