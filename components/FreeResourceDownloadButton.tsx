"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import type { FreeResource } from "@/lib/resources";

export default function FreeResourceDownloadButton({ resource }: { resource: FreeResource }) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
  }, []);

  if (!resource.fileUrl) {
    return (
      <button
        type="button"
        disabled
        className="btn-cta bg-bone/20 text-bone/50 px-4 py-2 rounded-full cursor-not-allowed"
      >
        Próximamente
      </button>
    );
  }

  if (supabaseConfigured && !loggedIn) {
    return (
      <Link
        href={`/registro?next=${encodeURIComponent(pathname)}`}
        className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
      >
        Registrarme para descargar
      </Link>
    );
  }

  return (
    <a
      href={resource.fileUrl}
      download
      className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
    >
      Descargar gratis →
    </a>
  );
}
