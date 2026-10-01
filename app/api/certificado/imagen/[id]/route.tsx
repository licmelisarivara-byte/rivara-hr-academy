import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  CERTIFICADO_EVENTO,
  CERTIFICADO_CURSO_BOT_ATS,
  CERTIFICADO_CURSO_BOT_ATS_3,
  CERTIFICADO_CLAUDE_SELECCION,
} from "@/lib/certificado";
import { loadGoogleFont } from "@/lib/googleFont";

export const runtime = "nodejs";

const WIDTH = 1600;
const HEIGHT = 1131;

// No se puede leer public/ con fs en una función serverless de Vercel (se
// sube aparte, como asset estático) — se pide por HTTP al mismo deploy.
async function fetchAsDataUri(req: NextRequest, publicPath: string, mime: string) {
  const res = await fetch(new URL(publicPath, req.url));
  const buf = await res.arrayBuffer();
  return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabaseAdminConfigured || !supabaseAdmin) {
    return new Response("not_configured", { status: 501 });
  }

  const { data, error } = await supabaseAdmin
    .from("certificado_solicitudes")
    .select("nombre, respuesta_correcta, tipo")
    .eq("id", params.id)
    .single();

  if (error || !data || !data.respuesta_correcta) {
    return new Response("not_found", { status: 404 });
  }

  // Plantilla de textos por tipo de certificado — cada uno con su propio
  // evento, duración, descripción y etiqueta de fecha/modalidad.
  const plantillas = {
    "curso-bot-ats": {
      evento: CERTIFICADO_CURSO_BOT_ATS,
      duracion: "Duración: 2 clases en vivo de 90 minutos",
      descripcion: (evento: typeof CERTIFICADO_CURSO_BOT_ATS) =>
        `Por completar el curso en vivo "${evento.titulo}" (2 clases, dictadas los días ${evento.fecha}): armado de un asistente de selección con IA y de un ATS propio, con pipeline de candidatos, desarrollado por RIVARA HR Academy.`,
      fechaLabel: "Fechas del curso",
    },
    "curso-bot-ats-3": {
      evento: CERTIFICADO_CURSO_BOT_ATS_3,
      duracion: "Duración: 2 clases en vivo de 90 minutos",
      descripcion: (evento: typeof CERTIFICADO_CURSO_BOT_ATS_3) =>
        `Por completar el curso en vivo "${evento.titulo}" (2 clases, dictadas los días ${evento.fecha}): armado de un asistente de selección con IA y de un ATS propio, con pipeline de candidatos, desarrollado por RIVARA HR Academy.`,
      fechaLabel: "Fechas del curso",
    },
    "claude-seleccion": {
      evento: CERTIFICADO_CLAUDE_SELECCION,
      duracion: "Duración: 6 módulos + 1 bonus (2h10 de contenido)",
      descripcion: (evento: typeof CERTIFICADO_CLAUDE_SELECCION) =>
        `Por completar el curso "${evento.titulo}": análisis de CVs, preguntas de entrevista por competencias (STAR), comparación de candidatos e informes ejecutivos con IA, desarrollado por RIVARA HR Academy.`,
      fechaLabel: "Modalidad",
    },
    masterclass: {
      evento: CERTIFICADO_EVENTO,
      duracion: "Duración: 60 minutos en vivo",
      descripcion: (evento: typeof CERTIFICADO_EVENTO) =>
        `Por su participación activa en la masterclass en vivo "${evento.titulo.split("— ")[1] ?? evento.titulo}", dictada el ${evento.fecha} por RIVARA HR Academy.`,
      fechaLabel: "Fecha de la masterclass",
    },
  } as const;

  const plantilla =
    plantillas[data.tipo as keyof typeof plantillas] ?? plantillas.masterclass;
  const evento = plantilla.evento;
  // Se capitaliza cada palabra sin importar cómo la haya tipeado quien pide
  // el certificado (ej: "melisa rivara" -> "Melisa Rivara").
  const nombre = String(data.nombre)
    .slice(0, 120)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  // Alfabeto completo en español + el nombre y el título reales, para que
  // Google Fonts devuelva un único subset con todos los glifos que se van
  // a usar (ver comentario en lib/googleFont.ts).
  const fontText =
    "ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789ÁÉÍÓÚáéíóúÜü.,:—-'\"/() " +
    nombre +
    evento.titulo +
    evento.fecha;

  const [logoDataUri, firmaDataUri, regular, semibold, bold, extrabold] = await Promise.all([
    fetchAsDataUri(req, "/images/logo-isotipo.png", "image/png"),
    fetchAsDataUri(req, "/images/firma-melisa.png", "image/png"),
    loadGoogleFont("Montserrat", 400, fontText),
    loadGoogleFont("Montserrat", 600, fontText),
    loadGoogleFont("Montserrat", 700, fontText),
    loadGoogleFont("Montserrat", 800, fontText),
  ]);

  // Layout de dos paneles (panel izquierdo de color + panel derecho con el
  // nombre), tomado como referencia del certificado que se hizo para TBO
  // Group — pero con la paleta oscura de siempre del sitio, no la clara de
  // ese certificado puntual, para no romper la identidad del resto del
  // sitio.
  const duracionLimpia = plantilla.duracion.replace(/^Duración:\s*/i, "");

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0D0D14",
          fontFamily: "Montserrat",
        }}
      >
        {/* PANEL IZQUIERDO — degradé magenta, datos del curso */}
        <div
          style={{
            width: 540,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 48px",
            backgroundImage: "linear-gradient(160deg, #E8006F 0%, #8A0E4C 100%)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* El isotipo ya es un cuadrado magenta — sobre el panel rosa se
                pierde, así que le ponemos una tarjeta blanca atrás para que
                resalte (en vez de usarlo "pelado"). */}
            <div
              style={{
                width: 64,
                height: 64,
                background: "#FFFFFF",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoDataUri} width={48} height={48} style={{ borderRadius: 10 }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 24, fontWeight: 800, color: "#FFFFFF", letterSpacing: 2 }}>
              RIVARA
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 4, marginTop: 2 }}>
              HR ACADEMY
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: 2 }}>
                {plantilla.fechaLabel.toUpperCase()}
              </div>
              <div style={{ marginTop: 4, fontSize: 19, fontWeight: 700, color: "#FFFFFF" }}>
                {evento.fechaCorta}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: 2 }}>
                DURACIÓN
              </div>
              <div style={{ marginTop: 4, fontSize: 19, fontWeight: 700, color: "#FFFFFF" }}>
                {duracionLimpia}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: 2 }}>
                DICTADO POR
              </div>
              <div style={{ marginTop: 4, fontSize: 19, fontWeight: 700, color: "#FFFFFF" }}>
                Lic. Melisa Rivara
              </div>
            </div>
          </div>

          {/* Firma */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Foto de la firma real (fondo ya removido, PNG transparente),
                recortada con overflow hidden ya que este renderer (satori)
                no soporta object-fit/object-position de forma confiable.
                Los offsets están calculados a mano para
                public/images/firma-melisa.png (433x576) — si se reemplaza
                esa foto por otra con distinto encuadre, hay que reajustar
                left/top/width/height de abajo. */}
            <div style={{ width: 190, height: 95, overflow: "hidden", position: "relative", display: "flex", marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={firmaDataUri}
                width={272}
                height={361}
                style={{
                  position: "absolute",
                  left: -32,
                  top: -170,
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
            <div style={{ width: 190, height: 1, background: "rgba(255,255,255,0.4)", display: "flex" }} />
            <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>
              Lic. Melisa Rivara
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              Fundadora · RIVARA HR Academy
            </div>
          </div>
        </div>

        {/* PANEL DERECHO — título y nombre, con la "R" de marca de agua */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* "R" gigante de fondo, tomada de la marca de agua del certificado
              de TBO Group — muy tenue, solo de textura. */}
          <div
            style={{
              position: "absolute",
              right: -60,
              bottom: -140,
              fontSize: 620,
              fontWeight: 800,
              color: "rgba(232,0,111,0.07)",
              lineHeight: 1,
              display: "flex",
            }}
          >
            R
          </div>

          <div style={{ fontSize: 64, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.05 }}>
            CERTIFICADO
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#E8006F", letterSpacing: 5, marginTop: 6 }}>
            DE PARTICIPACIÓN
          </div>

          <div style={{ marginTop: 44, fontSize: 16, color: "rgba(247,244,238,0.55)" }}>
            RIVARA HR Academy otorga a
          </div>
          <div style={{ marginTop: 6, fontSize: 52, fontWeight: 800, color: "#E8006F", maxWidth: 820 }}>
            {nombre}
          </div>

          <div style={{ marginTop: 24, width: 420, height: 2, background: "#C0185A", display: "flex" }} />

          <div style={{ marginTop: 28, fontSize: 19, fontWeight: 700, lineHeight: 1.6, color: "#FFFFFF", maxWidth: 760 }}>
            {plantilla.descripcion(evento as never)}
          </div>

          <div style={{ marginTop: 48, fontSize: 13, color: "rgba(247,244,238,0.35)" }}>
            hracademy.rivaraconsultora.com.ar
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Montserrat", data: regular, weight: 400, style: "normal" },
        { name: "Montserrat", data: semibold, weight: 600, style: "normal" },
        { name: "Montserrat", data: bold, weight: 700, style: "normal" },
        { name: "Montserrat", data: extrabold, weight: 800, style: "normal" },
      ],
    }
  );

  const buf = await image.arrayBuffer();
  const safeNombre = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return new Response(buf, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="certificado-${safeNombre || "rivara-hr-academy"}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
