import { getCourseBySlug } from "@/lib/courses";
import { getPaidResourceBySlug } from "@/lib/resources";

// Lógica de entrega compartida entre el webhook automático de Mercado Pago
// (app/api/mp-webhook) y la aprobación manual de pagos por transferencia o
// Payoneer (app/api/admin/approve-purchase), para que ambos caminos manden
// exactamente el mismo mail de bienvenida.

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
}

export async function deliverCourseAccess(courseSlug: string, buyerEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const course = getCourseBySlug(courseSlug);
  if (!apiKey || !course) return;

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
      subject: `¡Estás dentro! ${course.title}`,
      html: `
        <p>¡Gracias por tu inscripción a <strong>${course.title}</strong>!</p>
        <p>Ya te aparece en tu cuenta de RIVARA HR Academy: <a href="${siteUrl()}/dashboard">${siteUrl()}/dashboard</a></p>
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
      subject: `Tu compra: ${resource.title}`,
      html: `
        <p>¡Gracias por tu compra!</p>
        <p>Acá tenés tu descarga de <strong>${resource.title}</strong>:</p>
        ${
          fileLinks.length
            ? `<ul>${fileLinks.map((l) => `<li><a href="${l}">${l}</a></li>`).join("")}</ul>`
            : `<p>Ya estamos preparando tu archivo, te lo mandamos en las próximas horas.</p>`
        }
        <p>Cualquier duda, escribinos por WhatsApp: https://wa.me/5491123912820</p>
      `,
    }),
  });
}
