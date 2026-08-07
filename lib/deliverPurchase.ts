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

  return null;
}

export async function deliverCourseAccess(courseSlug: string, buyerEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const course = getCourseBySlug(courseSlug);
  if (!apiKey || !course) return;

  const accessLink = await getAccessLink(buyerEmail);

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
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
        <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
      `,
    }),
  });
}

export async function deliverResource(resourceSlug: string, buyerEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const resource = getPaidResourceBySlug(resourceSlug);
  if (!apiKey || !resource) return;

  const accessLink = await getAccessLink(buyerEmail);
  const fileLinks = resource.fileUrls?.length
    ? resource.fileUrls.map((f) => `${siteUrl()}${f}`)
    : resource.fileUrl
    ? [`${siteUrl()}${resource.fileUrl}`]
    : [];

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
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
}
