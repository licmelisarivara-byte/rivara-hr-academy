"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import type { FreeResource } from "@/lib/resources";

export default function FreeResourceDownloadButton({ resource }: { resource: FreeResource }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      setEmail(data.session?.user.email ?? null);
    });
  }, []);

  function logDownload() {
    fetch("/api/log-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceSlug: resource.slug, buyerEmail: email }),
    }).catch(() => {
      // No bloqueamos la descarga si el log falla.
    });
    (window as any).gtag?.("event", "file_download", {
      event_category: "recurso_gratis",
      event_label: resource.slug,
    });
  }

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
        href="/registro?next=%2Fdashboard"
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
      onClick={logDownload}
      className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
    >
      Descargar gratis →
    </a>
  );
}
