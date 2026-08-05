// Descarga un peso de Montserrat en formato .ttf para usarlo con
// next/og (ImageResponse), que no soporta @font-face ni fuentes del sistema.
// Google solo sirve .ttf (en vez de .woff2) a user-agents viejos, por eso el
// header. Se pasa "text" para que Google devuelva un solo @font-face con
// justo los glifos pedidos — sin eso, la respuesta trae varios bloques
// partidos por idioma/unicode-range y un regex que agarra "el primer url()"
// puede terminar trayendo el subset equivocado, causando que letras
// puntuales (ej. "A") se rendericen con otro peso/fuente de fallback.
const OLD_UA =
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

async function fetchTtfUrl(family: string, weight: number, text: string): Promise<string> {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`,
    { headers: { "User-Agent": OLD_UA } }
  );
  const css = await cssRes.text();
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) throw new Error(`No se pudo resolver la fuente ${family}:${weight}`);
  return match[1];
}

export async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer> {
  const url = await fetchTtfUrl(family, weight, text);
  const res = await fetch(url);
  return res.arrayBuffer();
}
