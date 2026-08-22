import { NextResponse, type NextRequest } from "next/server";

// Subdominio propio de la Asesoría de Carrera — separado de HR Academy.
const CAREER_HOST = "carrera.rivaraconsultora.com.ar";
// Dominio de producción de HR Academy, donde la página vivía antes de tener
// subdominio propio. Cualquier visita ahí a /asesoria-de-carrera se redirige
// al subdominio nuevo para no dejar contenido duplicado.
const ACADEMY_HOST = "hracademy.rivaraconsultora.com.ar";
const CAREER_PATH = "/asesoria-de-carrera";

function stripCareerPrefix(pathname: string) {
  return pathname.replace(new RegExp(`^${CAREER_PATH}`), "") || "/";
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const isCareerPath = pathname === CAREER_PATH || pathname.startsWith(`${CAREER_PATH}/`);

  if (host === CAREER_HOST) {
    // Ya vino con el prefijo interno en la URL visible: lo limpiamos.
    if (isCareerPath) {
      const url = request.nextUrl.clone();
      url.pathname = stripCareerPrefix(pathname);
      return NextResponse.redirect(url, 308);
    }
    // Reescribe todo lo demás (incluida la home "/") hacia la página real,
    // sin que se note en la URL que vive en /asesoria-de-carrera.
    const url = request.nextUrl.clone();
    url.pathname = `${CAREER_PATH}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  if (host === ACADEMY_HOST && isCareerPath) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CAREER_HOST;
    url.port = "";
    url.pathname = stripCareerPrefix(pathname);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|images|robots.txt|sitemap.xml).*)",
  ],
};
