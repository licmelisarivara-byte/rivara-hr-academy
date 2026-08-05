// Sincroniza descargas de certificado con la base "📋 Inscriptos Masterclass
// 4/8" en Notion: si el email ya está en la base (se registró antes), tilda
// "Descargó certificado"; si no está, crea una fila nueva. Requiere una
// integración interna de Notion (notion.so/my-integrations) conectada a esa
// base — ver NOTION_API_KEY en .env.example.
const NOTION_VERSION = "2022-06-28";
const DATABASE_ID =
  process.env.NOTION_MASTERCLASS_DB_ID ?? "c02e0933-57e3-42ae-8d3b-1a114cc16f5c";

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function findPageByEmail(email: string): Promise<string | null> {
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: { property: "Email", email: { equals: email } },
      page_size: 1,
    }),
  });
  if (!res.ok) throw new Error(`notion_query_failed_${res.status}`);
  const data = await res.json();
  return data.results?.[0]?.id ?? null;
}

async function markCertificadoDescargado(pageId: string) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(),
    body: JSON.stringify({
      properties: { "Descargó certificado": { checkbox: true } },
    }),
  });
  if (!res.ok) throw new Error(`notion_update_failed_${res.status}`);
}

async function createInscripto(nombre: string, email: string) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties: {
        "Nombre completo": { title: [{ text: { content: nombre } }] },
        Email: { email },
        "Descargó certificado": { checkbox: true },
      },
    }),
  });
  if (!res.ok) throw new Error(`notion_create_failed_${res.status}`);
}

// No tira si falla: la sync a Notion es "nice to have", no debe romper la
// generación del certificado ni la respuesta al usuario.
export async function syncCertificadoDescargadoEnNotion(nombre: string, email: string) {
  if (!process.env.NOTION_API_KEY) return;
  try {
    const pageId = await findPageByEmail(email);
    if (pageId) {
      await markCertificadoDescargado(pageId);
    } else {
      await createInscripto(nombre, email);
    }
  } catch (err) {
    console.error("notion_sync_error", err);
  }
}
