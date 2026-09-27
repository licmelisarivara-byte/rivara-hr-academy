import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyConfirmToken } from "@/lib/confirmToken";
import { approvePurchase } from "@/lib/approvePurchase";

// Página del botón "Confirmar pago" del mail de aviso de transferencia
// (ver app/api/transfer-notice). Es una ruta de API que devuelve HTML a
// propósito: así no carga el layout del sitio ni los scripts de analytics
// (que registrarían la firma del link) y queda simple para el celular.
//
// GET  = solo MUESTRA los datos de la compra y un botón. No aprueba nada:
//        los escáneres de links de los mails abren los links solos, y con
//        un GET que aprobara se habilitaría acceso sin haber cobrado.
// POST = recién ahí aprueba (idempotente: si ya estaba confirmada, no
//        reenvía el mail de acceso).

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function html(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Confirmar pago</title>
<style>body{font-family:system-ui,sans-serif;background:#f7f4ee;color:#1a1a1a;margin:0;padding:24px}main{max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06)}h1{font-size:20px;margin:0 0 12px}li{margin:6px 0}input{font-size:16px;padding:8px;border:1px solid #ccc;border-radius:8px;width:160px}button{background:#e6007e;color:#fff;border:0;border-radius:999px;padding:14px 24px;font-size:16px;font-weight:700;width:100%;margin-top:16px}.ok{color:#0a7a3d}.warn{color:#b45309}small{color:#666}</style></head><body><main>${body}</main></body></html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    }
  );
}

// Ingresos por transferencia bancaria a la cuenta de Mercado Pago (últimos
// días) cuyo monto coincide con el de la compra y que todavía no se
// usaron para confirmar otra compra. Es solo una ayuda para quien confirma:
// ver que la plata realmente entró. Si la transferencia fue a otra cuenta
// o MP no responde, devuelve `null` y la página no muestra nada.
async function buscarIngresos(total: number) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token || !supabaseAdmin || !(total > 0)) return null;
  try {
    const q = new URLSearchParams({
      status: "approved",
      sort: "date_created",
      criteria: "desc",
      range: "date_created",
      begin_date: "NOW-5DAYS",
      end_date: "NOW",
      limit: "50",
    });
    const res = await fetch(`https://api.mercadopago.com/v1/payments/search?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const candidatos = (data.results ?? []).filter(
      (p: any) =>
        p.payment_type_id === "bank_transfer" &&
        p.operation_type === "account_fund" &&
        Math.abs(Number(p.transaction_amount) - total) < 0.5
    );
    if (!candidatos.length) return [];
    const ids = candidatos.map((p: any) => String(p.id));
    const { data: usados } = await supabaseAdmin
      .from("compras")
      .select("mp_payment_id")
      .in("mp_payment_id", ids);
    const usadosSet = new Set((usados ?? []).map((u) => u.mp_payment_id));
    return candidatos.filter((p: any) => !usadosSet.has(String(p.id)));
  } catch {
    return null;
  }
}

function fechaAR(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadGroup(id: string) {
  if (!supabaseAdmin) return null;
  const { data: row } = await supabaseAdmin.from("compras").select("*").eq("id", id).single();
  if (!row) return null;
  let filas = [row];
  if (row.bundle_group_id) {
    const { data: hermanas } = await supabaseAdmin
      .from("compras")
      .select("*")
      .eq("bundle_group_id", row.bundle_group_id)
      .neq("id", row.id);
    if (hermanas) filas = [...filas, ...hermanas];
  }
  return { row, filas };
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (!id || !verifyConfirmToken(id, t)) {
    return html("<h1>Link inválido</h1><p>Este link no es válido o está incompleto.</p>", 403);
  }
  const grupo = await loadGroup(id);
  if (!grupo) return html("<h1>No encontré esta compra</h1>", 404);

  const { row, filas } = grupo;
  const moneda = row.currency === "USD" ? "USD " : "$";
  const total = filas.reduce((s, f) => s + Number(f.amount || 0), 0);
  const yaConfirmada = filas.every((f) => f.status === "approved" && f.delivered_at);
  const ingresos =
    yaConfirmada || row.payment_method !== "transferencia" ? null : await buscarIngresos(total);
  const ingresoBloque =
    ingresos === null
      ? ""
      : ingresos.length
      ? `<p class="ok">✅ Encontré en tu Mercado Pago ${ingresos.length > 1 ? "estos ingresos" : "un ingreso"} por ${moneda}${total.toLocaleString("es-AR")} (transferencia): ${ingresos
          .map((p: any) => fechaAR(p.date_created))
          .join(" · ")}.</p>`
      : `<p class="warn">⚠️ No veo todavía en Mercado Pago un ingreso por transferencia de ${moneda}${total.toLocaleString("es-AR")} (sin usar). Puede tardar unos minutos, o haber ido a otra cuenta.</p>`;

  return html(`
    <h1>${yaConfirmada ? "✅ Ya estaba confirmado" : "Confirmar pago recibido"}</h1>
    <ul>
      ${filas.map((f) => `<li>${esc(f.title)} — ${moneda}${Number(f.amount).toLocaleString("es-AR")}</li>`).join("")}
      <li><strong>Total:</strong> ${moneda}${total.toLocaleString("es-AR")}</li>
      <li><strong>Nombre:</strong> ${esc(row.buyer_name || "(sin nombre)")}</li>
      <li><strong>Mail:</strong> ${esc(row.buyer_email)}</li>
      ${row.discount_code ? `<li><strong>Cupón:</strong> ${esc(row.discount_code)}</li>` : ""}
    </ul>
    ${ingresoBloque}
    ${
      yaConfirmada
        ? "<p>El acceso ya se había enviado. No hace falta hacer nada más.</p>"
        : `<form method="POST">
      <input type="hidden" name="id" value="${esc(id)}">
      <input type="hidden" name="t" value="${esc(t)}">
      ${ingresos && ingresos.length ? `<input type="hidden" name="pid" value="${esc(ingresos[0].id)}">` : ""}
      ${filas.length > 1 ? "" : `<label>Monto que recibiste (${moneda.trim()}):<br>
        <input type="number" name="amount" step="any" value="${Number(row.amount)}"></label>`}
      <p><small>Si te transfirió otro monto, corregilo acá. Se habilita el acceso y se le manda el mail de bienvenida.</small></p>
      <button type="submit">Ya veo la plata — habilitar acceso</button>
    </form>`
    }
  `);
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const id = String(form?.get("id") ?? "");
  const t = String(form?.get("t") ?? "");
  if (!id || !verifyConfirmToken(id, t)) {
    return html("<h1>Link inválido</h1>", 403);
  }
  const amountRaw = form?.get("amount");
  const amount = amountRaw !== null && amountRaw !== "" ? Number(amountRaw) : undefined;

  const result = await approvePurchase(id, Number.isFinite(amount) ? amount : undefined);
  if ("error" in result) {
    return html(`<h1>No se pudo confirmar</h1><p>Error: ${esc(result.error)}</p>`, 500);
  }
  // Si se detectó el ingreso en Mercado Pago, se deja registrado en la
  // compra para que el mismo ingreso no sirva para confirmar otra.
  const pid = String(form?.get("pid") ?? "");
  if (/^\d+$/.test(pid) && supabaseAdmin) {
    await supabaseAdmin.from("compras").update({ mp_payment_id: pid }).eq("id", id);
  }
  if (result.fallidas.length) {
    return html(`<h1 class="warn">⚠️ Confirmado, pero falló el mail</h1>
      <p>El pago quedó aprobado, pero no se pudo mandar el mail de acceso a <strong>${esc(result.purchase.buyer_email)}</strong>. Te llegó un aviso aparte; podés reintentar volviendo a abrir el mail original y apretando de nuevo.</p>`);
  }
  return html(`<h1 class="ok">✅ Listo</h1>
    <p>Se habilitó el acceso y se envió el mail de bienvenida a <strong>${esc(result.purchase.buyer_email)}</strong>.</p>`);
}
