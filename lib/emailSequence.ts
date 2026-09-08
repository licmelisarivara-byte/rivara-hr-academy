import { getCoupon } from "@/lib/coupons";

// Contenido de los Mails 2 y 3 de la secuencia de leads del combo gratis
// (ver Secuencia_Mails_y_Copy_Lanzamiento.md). Compartido entre el cron
// diario (app/api/cron/secuencia-recursos) y el reenvío manual puntual
// (app/api/admin/reenviar-mail-secuencia), para no duplicar el copy.
const CURSO_SLUG = "claude-para-seleccion";

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://hracademy.rivaraconsultora.com.ar";
}

export async function enviarResend(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "RIVARA HR Academy <hola@mailhr.rivaraconsultora.com.ar>",
      to: [to],
      bcc: ["licmelisarivara@gmail.com"],
      subject,
      html,
    }),
  });
  return res.ok;
}

export function mail2(nombre: string) {
  const firstName = nombre.split(" ")[0] || "";
  return {
    subject: "Un tip para que el Prompt Maestro te rinda mejor",
    html: `
      <p>Hola${firstName ? ` ${firstName}` : ""},</p>
      <p>Un tip rápido para el Prompt Maestro de Análisis de CVs: el resultado es tan bueno como los criterios que le des.</p>
      <p>Si le pegás solo "estos son los requisitos del puesto" en una línea genérica, te va a devolver un análisis genérico. Pero si le aclarás qué es realmente no negociable (excluyente) y qué es deseable pero no determinante, el análisis cambia por completo — ahí es donde te separa un candidato con un gap entrenable de uno con un gap real.</p>
      <p>Ejemplo simple: no es lo mismo poner "manejo de Excel" que aclarar "Excel avanzado, excluyente — sin esto no puede armar los reportes que pide el puesto". La segunda versión le da al prompt algo concreto para evaluar, no una casilla para tildar.</p>
      <p>Cuanto más claro sea el criterio que le des, más útil se vuelve la IA. Esa es, en el fondo, toda la idea detrás del curso.</p>
      <p>Lic. Melisa Rivara<br/>RIVARA HR Academy</p>
    `,
  };
}

export function mail3(nombre: string, cupon: ReturnType<typeof getCoupon>) {
  const firstName = nombre.split(" ")[0] || "";
  const cierre = cupon
    ? `<p>Con el código <strong>${cupon.code}</strong> tenés ${cupon.percentOff}% off por transferencia — de $70.000 a $52.500 — válido hasta el domingo 20/9.</p>`
    : "";
  return {
    subject: "Manual vs. Claude: la diferencia real",
    html: `
      <p>Hola${firstName ? ` ${firstName}` : ""},</p>
      <p>Después de una semana con los recursos, quiero mostrarte el paso que sigue.</p>
      <p><strong>Filtrando a mano:</strong> leés cada CV, armás tu propio criterio sobre la marcha, y cada selector de tu equipo evalúa un poco distinto.</p>
      <p><strong>Con Claude bien instruido:</strong> el mismo criterio se aplica a cada CV, con scoring técnico y cultural, banderas rojas y preguntas de entrevista ya armadas — vos seguís tomando la decisión final, pero con la parte mecánica resuelta.</p>
      <p>Eso es exactamente lo que armamos en <strong>Claude aplicado a selección</strong>: 6 módulos + 1 bonus (~2h10 en total), grabado, a tu ritmo. Vas a construir tu propio asistente de selección, no solo aprender prompts sueltos.</p>
      ${cierre}
      <p><a href="${siteUrl()}/cursos/${CURSO_SLUG}">Quiero ver el curso →</a></p>
      <p>Cualquier pregunta antes de anotarte, escribime.</p>
      <p>Lic. Melisa Rivara<br/>RIVARA HR Academy</p>
    `,
  };
}

export function getClaude25(): ReturnType<typeof getCoupon> {
  return getCoupon("CLAUDE25", { courseSlug: CURSO_SLUG });
}
