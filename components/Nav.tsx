import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/cursos", label: "Cursos" },
  { href: "/recursos", label: "Recursos gratis" },
  { href: "/notas", label: "Notas" },
];

export default function Nav() {
  return (
    <header className="border-b border-black/5 sticky top-0 z-40 bg-ink/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
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
          <Link
            href="/login"
            className="text-sm text-bone/80 hover:text-magenta transition-colors hidden sm:inline"
          >
            Ingresar
          </Link>
          <Link
            href="/cursos"
            className="text-sm font-semibold bg-magenta text-white px-4 py-2 rounded-full hover:bg-magentaSoft transition-colors"
          >
            Ver cursos
          </Link>
        </div>
      </div>
    </header>
  );
}
