"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const links = [
  { href: "/cursos", label: "Cursos" },
  { href: "/recursos", label: "Recursos gratis" },
  { href: "/notas", label: "Notas" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="border-b border-black/5 sticky top-0 z-40 bg-ink/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo-horizontal.png"
            alt="RIVARA HR Academy"
            width={640}
            height={162}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-bone/80">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-magenta transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-bone/80 hover:text-magenta transition-colors hidden sm:inline"
              >
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-cta text-sm bg-magenta text-white px-4 py-2 rounded-full hover:bg-magentaSoft transition-colors hidden sm:inline-block"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-bone/80 hover:text-magenta transition-colors hidden sm:inline"
              >
                Ingresar
              </Link>
              <Link
                href="/cursos"
                className="btn-cta text-sm bg-magenta text-white px-4 py-2 rounded-full hover:bg-magentaSoft transition-colors hidden sm:inline-block"
              >
                Ver cursos
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 -mr-2"
          >
            <span
              className={`block h-0.5 w-6 bg-bone transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-bone transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-bone transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-black/5 bg-ink px-6 py-4 flex flex-col gap-4 text-bone/80">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="hover:text-magenta transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="hover:text-magenta transition-colors"
              >
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-cta bg-magenta text-white px-4 py-2.5 rounded-full text-center hover:bg-magentaSoft transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="hover:text-magenta transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/cursos"
                onClick={() => setOpen(false)}
                className="btn-cta bg-magenta text-white px-4 py-2.5 rounded-full text-center hover:bg-magentaSoft transition-colors"
              >
                Ver cursos
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
