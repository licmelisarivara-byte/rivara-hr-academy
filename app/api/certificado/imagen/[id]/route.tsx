import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { CERTIFICADO_EVENTO, CERTIFICADO_CURSO_BOT_ATS } from "@/lib/certificado";
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

  const esCurso = data.tipo === "curso-bot-ats";
  const evento = esCurso ? CERTIFICADO_CURSO_BOT_ATS : CERTIFICADO_EVENTO;
  const nombre = String(data.nombre).slice(0, 120);

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

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0D14",
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(232,0,111,0.16) 0%, rgba(13,13,20,0) 45%), radial-gradient(circle at 85% 90%, rgba(224,7,126,0.14) 0%, rgba(13,13,20,0) 45%)",
          position: "relative",
          fontFamily: "Montserrat",
        }}
      >
        {/* Barras decorativas superior/inferior */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 10, background: "#E8006F", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 10, background: "#E8006F", display: "flex" }} />

        {/* Marco */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: WIDTH - 96,
            height: HEIGHT - 96,
            border: "1.5px solid rgba(232,0,111,0.45)",
            borderRadius: 28,
            padding: "56px 64px",
            position: "relative",
          }}
        >
          {/* Logo + wordmark */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUri} width={72} height={72} style={{ borderRadius: 16 }} />
            <div
              style={{
                marginTop: 12,
                fontSize: 22,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: 2,
              }}
            >
              RIVARA
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#E8006F",
                letterSpacing: 4,
                marginTop: 2,
              }}
            >
              HR ACADEMY
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 15,
              fontWeight: 700,
              color: "#E8006F",
              letterSpacing: 4,
            }}
          >
            CERTIFICADO DE PARTICIPACIÓN
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 38,
              fontWeight: 800,
              color: "#FFFFFF",
              textAlign: "center",
              maxWidth: 1150,
            }}
          >
            {evento.titulo}
          </div>

          <div style={{ marginTop: 10, fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>
            {esCurso ? "Duración: 2 clases en vivo de 90 minutos" : "Duración: 60 minutos en vivo"}
          </div>

          <div style={{ marginTop: 40, fontSize: 20, color: "rgba(247,244,238,0.55)" }}>
            Otorgado a
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 58,
              fontWeight: 800,
              color: "#E8006F",
              textAlign: "center",
              maxWidth: 1200,
            }}
          >
            {nombre}
          </div>

          <div style={{ marginTop: 20, width: 460, height: 2, background: "#C0185A", display: "flex" }} />

          <div
            style={{
              marginTop: 36,
              fontSize: 21,
              fontWeight: 700,
              lineHeight: 1.6,
              color: "#FFFFFF",
              textAlign: "center",
              maxWidth: 1180,
            }}
          >
            {esCurso
              ? `Por completar el curso en vivo "${evento.titulo}" (2 clases), dictado los días ${evento.fecha} por RIVARA HR Academy.`
              : `Por su participación activa en la masterclass en vivo "${evento.titulo.split("— ")[1] ?? evento.titulo}", dictada el ${evento.fecha} por RIVARA HR Academy.`}
          </div>

          {/* Firma + fecha */}
          <div
            style={{
              marginTop: "auto",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingTop: 40,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 320 }}>
              {/* Foto de la firma real (fondo ya removido, PNG transparente),
                  recortada con overflow hidden ya que este renderer (satori)
                  no soporta object-fit/object-position de forma confiable.
                  Los offsets están calculados a mano para
                  public/images/firma-melisa.png (433x576) — si se reemplaza
                  esa foto por otra con distinto encuadre, hay que reajustar
                  left/top/width/height de abajo. */}
              <div
                style={{
                  width: 220,
                  height: 110,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  marginBottom: 10,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={firmaDataUri}
                  width={316}
                  height={419}
                  style={{
                    position: "absolute",
                    left: -37,
                    top: -199,
                    // Birome azul -> blanco, para que combine con el resto
                    // del texto del certificado.
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </div>
              <div style={{ width: "100%", height: 1, background: "rgba(247,244,238,0.3)", display: "flex" }} />
              <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
                Lic. Melisa Rivara
              </div>
              <div style={{ fontSize: 13, color: "rgba(247,244,238,0.55)" }}>
                Fundadora · RIVARA HR Academy
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 260 }}>
              <div style={{ width: "100%", height: 1, background: "rgba(247,244,238,0.3)", display: "flex" }} />
              <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
                {evento.fechaCorta}
              </div>
              <div style={{ fontSize: 13, color: "rgba(247,244,238,0.55)" }}>
                {esCurso ? "Fechas del curso" : "Fecha de la masterclass"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, fontSize: 13, color: "rgba(247,244,238,0.35)" }}>
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
