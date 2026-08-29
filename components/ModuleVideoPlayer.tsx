"use client";

import { useEffect, useRef, useState } from "react";
import {
  markVideoCompleted,
  getCompletedVideoIds,
  getCertificadoGenerado,
  setCertificadoGenerado,
} from "@/lib/progress";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Se carga una sola vez para toda la página, sin importar cuántos
// ModuleVideoPlayer con triggersCertificate haya montados.
let apiLoadingPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadingPromise) return apiLoadingPromise;

  apiLoadingPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiLoadingPromise;
}

type Props = {
  title: string;
  videoId: string;
  startSeconds?: number;
  // Si está en true, al terminar este video se genera solo el certificado
  // del curso (ver lib/courses.ts) usando el mail/nombre de la sesión.
  triggersCertificate?: boolean;
  certificadoTipo?: string;
  certificadoUrl?: string;
  userEmail?: string | null;
  userName?: string | null;
  // Se llama al terminar el video, para que el dashboard actualice el
  // indicador de progreso ("X de Y módulos completados") sin esperar a un
  // reload — ver app/(academy)/dashboard/page.tsx.
  onComplete?: (videoId: string) => void;
};

type CertState =
  | { paso: "idle" }
  | { paso: "generando" }
  | { paso: "listo"; id: string; nombre: string }
  | { paso: "error" };

export default function ModuleVideoPlayer({
  title,
  videoId,
  startSeconds,
  triggersCertificate,
  certificadoTipo,
  certificadoUrl,
  userEmail,
  userName,
  onComplete,
}: Props) {
  const iframeId = `yt-player-${videoId}`;
  const yaTerminado = useRef(false);
  // Si el video ya se había marcado como completado antes (por el player
  // embebido o a mano, ver completarVideo más abajo), no repetimos el
  // enlace de "marcalo a mano" — evita confusión y clicks de más.
  const [completado, setCompletado] = useState(() => getCompletedVideoIds().has(videoId));
  // Si esta alumna ya se había generado el certificado antes (en este
  // mismo navegador), arrancamos directo mostrando la tarjeta de "listo"
  // en vez del video — así no se pierde de vista al recargar o volver al
  // dashboard.
  const [cert, setCert] = useState<CertState>(() => {
    if (!triggersCertificate || !certificadoTipo) return { paso: "idle" };
    const guardado = getCertificadoGenerado(certificadoTipo);
    return guardado ? { paso: "listo", id: guardado.id, nombre: guardado.nombre } : { paso: "idle" };
  });

  // Se llama tanto al terminar el video adentro del player embebido como
  // al tocar "marcarlo a mano" (ver más abajo) — mismo resultado en los
  // dos casos: progreso guardado y, si corresponde, certificado generado.
  function completarVideo() {
    if (yaTerminado.current) return;
    yaTerminado.current = true;
    setCompletado(true);
    markVideoCompleted(videoId);
    onComplete?.(videoId);
    if (triggersCertificate && userEmail && certificadoTipo) {
      generarCertificado();
    }
  }

  // El listener de "video terminado" corre para TODOS los módulos (no
  // solo el que dispara el certificado): sirve para marcar el progreso de
  // cada uno en el dashboard. El certificado automático solo se dispara
  // además, puntualmente, cuando triggersCertificate está en true.
  //
  // Ojo: esto SOLO se dispara si la alumna mira el video adentro de este
  // player embebido. Si en cambio toca el link de YouTube del embed y lo
  // termina de ver allá (fuera del sitio), nunca llega el evento ENDED acá
  // — por eso existe el link de "marcarlo a mano" más abajo, para esos
  // casos.
  useEffect(() => {
    let cancelado = false;

    loadYouTubeApi().then(() => {
      if (cancelado) return;
      new window.YT.Player(iframeId, {
        events: {
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              completarVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, triggersCertificate, userEmail, certificadoTipo]);

  async function generarCertificado() {
    if (!userEmail || !certificadoTipo) return;
    setCert({ paso: "generando" });
    const nombre = (userName || userEmail.split("@")[0])
      .toLowerCase()
      .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    try {
      const res = await fetch("/api/certificado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email: userEmail, tipo: certificadoTipo }),
      });
      const data = await res.json();
      if (res.ok && data.correcta) {
        setCert({ paso: "listo", id: data.id, nombre });
        setCertificadoGenerado(certificadoTipo, { id: data.id, nombre });
      } else {
        setCert({ paso: "error" });
      }
    } catch {
      setCert({ paso: "error" });
    }
  }

  return (
    <div>
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          id={iframeId}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1${
            startSeconds ? `&start=${startSeconds}` : ""
          }`}
          title={title}
          allowFullScreen
        />
      </div>

      {!completado && (
        <p className="text-xs text-bone/40 mt-2">
          ¿Ya viste el video pero no se marcó como completado (por ejemplo, si lo terminaste
          de ver en YouTube en vez de acá arriba)?{" "}
          <button
            type="button"
            onClick={completarVideo}
            className="text-magenta hover:underline"
          >
            Marcarlo como visto →
          </button>
        </p>
      )}

      {cert.paso === "generando" && (
        <p className="text-xs text-bone/50 mt-3">Generando tu certificado…</p>
      )}

      {cert.paso === "listo" && (
        <div className="card-alt rounded-xl p-5 mt-4 border border-sage/40 text-center">
          <p className="text-sm text-bone/80 mb-3">
            🎉 ¡Terminaste el curso, {cert.nombre.split(" ")[0]}! Ya generamos tu certificado.
          </p>
          <div className="rounded-lg overflow-hidden border border-black/10 mb-4 max-w-md mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/certificado/imagen/${cert.id}`}
              alt={`Certificado de participación de ${cert.nombre}`}
              className="w-full h-auto"
            />
          </div>
          <a
            href={`/api/certificado/imagen/${cert.id}`}
            download
            className="btn-cta bg-magenta text-white px-5 py-2.5 rounded-full hover:bg-magentaSoft transition-colors inline-block text-sm"
          >
            Descargar mi certificado
          </a>

          <div className="hairline my-4" />

          <p className="text-xs text-bone/60 mb-2">
            ¿Te sirvió el curso? Dejame tu reseña en Google 🙏
          </p>
          <a
            href="https://maps.app.goo.gl/XEqBvBxA2DWxxUrZ8"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta bg-sage text-white px-4 py-2 rounded-full hover:opacity-90 transition-colors inline-block text-sm"
          >
            Dejar mi reseña →
          </a>
        </div>
      )}

      {cert.paso === "error" && certificadoUrl && (
        <p className="text-xs text-bone/50 mt-3">
          No pudimos generar tu certificado automáticamente.{" "}
          <a href={certificadoUrl} className="text-magenta hover:underline">
            Pedilo acá →
          </a>
        </p>
      )}
    </div>
  );
}
