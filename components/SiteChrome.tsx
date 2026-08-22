"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Rutas que llevan su propia identidad de marca (header/footer propios)
// y no deben mostrar el Nav/Footer de RIVARA HR Academy.
const STANDALONE_PREFIXES = ["/asesoria-de-carrera"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
