export default function ConfigNotice({ what }: { what: string }) {
  return (
    <div className="card rounded-xl p-5 text-sm text-bone/70 border-magenta/40">
      <p>
        <strong className="text-magenta">Falta conectar {what}.</strong> Este
        sitio ya tiene el código listo — solo falta que Melisa cree el
        proyecto de Supabase y cargue las variables de entorno en Vercel
        (<code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>).
      </p>
    </div>
  );
}
