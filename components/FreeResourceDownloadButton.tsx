"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FreeResource } from "@/lib/resources";

export default function FreeResourceDownloadButton({ resource }: { resource: FreeResource }) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [askingEmail, setAskingEmail] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });
  }, []);

  function logDownload(buyerEmail: string | null, buyerName?: string, buyerPhone?: string) {
    fetch("/api/log-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceSlug: resource.slug,
        buyerEmail,
        buyerName: buyerName || null,
        buyerPhone: buyerPhone || null,
      }),
    }).catch(() => {
      // No bloqueamos la descarga si el log falla.
    });
    (window as any).gtag?.("event", "file_download", {
      event_category: "recurso_gratis",
      event_label: resource.slug,
    });
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    logDownload(email, name, phone);
    (window as any).gtag?.("event", "generate_lead", {
      event_category: "recurso_gratis",
      event_label: resource.slug,
    });
    setUnlocked(true);
    // El link real recién se monta en este render; hace falta esperar al
    // próximo tick para poder simular el click y disparar la descarga.
    setTimeout(() => linkRef.current?.click(), 0);
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

  if (sessionEmail || unlocked) {
    return (
      <a
        ref={linkRef}
        href={resource.fileUrl}
        download
        onClick={() => !sessionEmail || logDownload(sessionEmail)}
        className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
      >
        Descargar gratis →
      </a>
    );
  }

  if (askingEmail) {
    return (
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre y apellido"
          className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp (opcional)"
          className="w-full rounded-lg bg-panel border border-black/10 px-3 py-2 text-sm text-bone focus:border-magenta outline-none"
        />
        <button
          type="submit"
          className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors text-sm"
        >
          Descargar →
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAskingEmail(true)}
      className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block"
    >
      Descargar gratis →
    </button>
  );
}
