// Descarga un peso de Montserrat en formato .ttf para usarlo con
// next/og (ImageResponse), que no soporta @font-face ni fuentes del sistema.
// Google solo sirve .ttf (en vez de .woff2) a user-agents viejos, por eso el
// header. Se cachea en memoria del proceso: en una función serverless "warm"
// el segundo request no vuelve a pegarle a Google Fonts.
const OLD_UA =
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

const cache = new Map<string, Promise<ArrayBuffer>>();

async function fetchTtfUrl(family: string, weight: number): Promise<string> {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { "User-Agent": OLD_UA } }
  );
  const css = await cssRes.text();
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) throw new Error(`No se pudo resolver la fuente ${family}:${weight}`);
  return match[1];
}

export function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const key = `${family}:${weight}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchTtfUrl(family, weight).then((url) =>
      fetch(url).then((r) => r.arrayBuffer())
    );
    cache.set(key, pending);
  }
  return pending;
}
