import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Lógica de entrega compartida entre el webhook automático de Mercado Pago
// (app/api/mp-webhook) y la aprobación manual de pagos por transferencia o
// Payoneer (app/api/admin/approve-purchase), para que ambos caminos manden
// exactamente el mismo mail de bienvenida.
//
// La cuenta se crea recién ACÁ, cuando el pago ya está confirmado — no
// antes. Así nadie tiene que ponerse una contraseña para poder pagar; solo
// la necesita para ver lo que ya compró.

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
}

// Genera el link para que la compradora entre por primera vez. Si el mail
// no tenía cuenta todavía, la crea y devuelve un link de "invitación" (le
// deja poner su contraseña). Si ya tenía cuenta (por ejemplo, de otra
// compra anterior), devuelve un link de recuperación de contraseña en su
// lugar, así igual puede entrar sin tener que acordarse la contraseña.
async function getAccessLink(email: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const redirectTo = `${siteUrl()}/dashboard?verified=1`;

  try {
    const invite = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo },
    });
    if (!invite.error && invite.data?.properties?.action_link) {
      return invite.data.properties.action_link;
    }

    const recovery = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });
    if (!recovery.error && recovery.data?.properties?.action_link) {
      return recovery.data.properties.action_link;
    }
  } catch (err) {
    // No tirar la entrega entera por esto — el mail igual sale, solo que
    // sin link de acceso directo (la compradora entra por /dashboard).
    console.error("deliverPurchase: getAccessLink falló", email, err);
  }

  return null;
}

// Si el mail de entrega falla (Resend caído, error inesperado, etc.), la
// compra queda aprobada+pagada pero SIN avisar a nadie — antes pasaba en
// silencio y ni Melisa se enteraba (pasó de verdad el 14/9 con una compra
// por Mercado Pago). Este aviso de respaldo intenta avisarle directo a su
// Gmail, sin pasar por el mismo Resend que puede estar fallando.
async function avisarFalloEntrega(tipo: string, slug: string, buyerEmail: string, err: unknown) {
  console.error(`deliverPurchase: entrega de ${tipo} "${slug}" a ${buyerEmail} falló`, err);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
        reply_to: "hola@rivaraconsultora.com.ar",
        to: ["licmelisarivara@gmail.com"],
        subject: `⚠️ Falló el mail de entrega — ${slug} (${buyerEmail})`,
        html: `
          <p>Se aprobó una compra (${tipo}: <strong>${slug}</strong>, comprador: <strong>${buyerEmail}</strong>) pero el mail automático de entrega falló.</p>
          <p>La compra quedó marcada como aprobada pero <strong>sin entregar</strong> — revisá en Supabase (tabla <code>compras</code>) y reenviá manualmente cuando puedas (podés usar de nuevo /api/admin/approve-purchase con el mismo id, ahora que ya sabés que hubo un problema puntual).</p>
          <p>Error: <code>${String(err).slice(0, 500)}</code></p>
        `,
      }),
    }).catch(() => {});
  } catch {
    // Si esto también falla, ya quedó el console.error de arriba en los logs de Vercel.
  }
}

// Devuelve true si el mail de entrega salió bien — el caller (approve-purchase,
// mp-webhook) SOLO debe marcar delivered_at cuando esto da true, para no
// perder de vista una entrega que en realidad falló.
export async function deliverCourseAccess(courseSlug: string, buyerEmail: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const course = getCourseBySlug(courseSlug);
  if (!apiKey || !course) return false;

  try {
    const accessLink = await getAccessLink(buyerEmail);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
        reply_to: "hola@rivaraconsultora.com.ar",
        to: [buyerEmail],
        bcc: ["licmelisarivara@gmail.com"],
        subject: `¡Ya podés acceder! ${course.title}`,
        html: `
          <p>¡Gracias por tu inscripción a <strong>${course.title}</strong>! Tu pago ya está confirmado.</p>
          <p>Tu usuario es: <strong>${buyerEmail}</strong></p>
          ${
            accessLink
              ? `<p><a href="${accessLink}">Iniciar curso →</a></p><p>Ese link te va a pedir que crees una contraseña la primera vez, y después entrás directo al curso, al link de la clase y a los materiales.</p>`
              : `<p>Entrá a tu cuenta acá: <a href="${siteUrl()}/dashboard">${siteUrl()}/dashboard</a></p>`
          }
          ${course.schedule ? `<p>${course.schedule}</p>` : ""}
          ${
            course.whatsappGroupLink
              ? `<p>💬 Sumate a la Comunidad de Alumnos por WhatsApp: <a href="${course.whatsappGroupLink}">${course.whatsappGroupLink}</a></p>`
              : ""
          }
          <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
        `,
      }),
    });
    if (!res.ok) throw new Error(`Resend respondió ${res.status}: ${await res.text().catch(() => "")}`);
    return true;
  } catch (err) {
    await avisarFalloEntrega("curso", courseSlug, buyerEmail, err);
    return false;
  }
}

export async function deliverResource(resourceSlug: string, buyerEmail: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const resource = getPaidResourceBySlug(resourceSlug);
  if (!apiKey || !resource) return false;

  try {
    const accessLink = await getAccessLink(buyerEmail);
    const fileLinks = resource.fileUrls?.length
      ? resource.fileUrls.map((f) => `${siteUrl()}${f}`)
      : resource.fileUrl
      ? [`${siteUrl()}${resource.fileUrl}`]
      : [];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
        reply_to: "hola@rivaraconsultora.com.ar",
        to: [buyerEmail],
        bcc: ["licmelisarivara@gmail.com"],
        subject: `¡Ya podés acceder! ${resource.title}`,
        html: `
          <p>¡Gracias por tu compra! Tu pago ya está confirmado.</p>
          <p>Acá tenés tu descarga de <strong>${resource.title}</strong>:</p>
          ${
            fileLinks.length
              ? `<ul>${fileLinks.map((l) => `<li><a href="${l}">${l}</a></li>`).join("")}</ul>`
              : `<p>Ya estamos preparando tu archivo, te lo mandamos en las próximas horas.</p>`
          }
          ${
            accessLink
              ? `<p>Tu usuario es: <strong>${buyerEmail}</strong>. Creá tu contraseña para verla también desde tu cuenta: <a href="${accessLink}">Crear contraseña →</a></p>`
              : `<p>También la vas a ver desde tu cuenta: <a href="${siteUrl()}/dashboard">${siteUrl()}/dashboard</a></p>`
          }
          <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
        `,
      }),
    });
    if (!res.ok) throw new Error(`Resend respondió ${res.status}: ${await res.text().catch(() => "")}`);
    return true;
  } catch (err) {
    await avisarFalloEntrega("recurso", resourceSlug, buyerEmail, err);
    return false;
  }
}
