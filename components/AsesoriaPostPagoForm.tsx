"use client";

import { useEffect, useState } from "react";

type Pedido = {
  id: string;
  pack_title: string;
  addon_traduccion: boolean;
  amount: number;
  status: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  form_submitted_at: string | null;
};

const WHATSAPP_URL =
  "https://wa.me/5491123912820?text=" +
  encodeURIComponent("Hola Melisa! Te escribo por mi pedido de Asesoría de Carrera.");

export default function AsesoriaPostPagoForm({ pedidoId }: { pedidoId: string }) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [sinPerfil, setSinPerfil] = useState(false);
  const [rubro, setRubro] = useState("");
  const [etapa, setEtapa] = useState("");
  const [notas, setNotas] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/asesoria/pedido/${pedidoId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setPedido(data.pedido);
        setName(data.pedido.buyer_name || "");
        setPhone(data.pedido.buyer_phone || "");
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId, attempt]);

  // Mercado Pago puede tardar unos segundos en avisarnos por webhook —
  // reintentamos solos un par de veces antes de pedirle a la clienta que
  // refresque a mano.
  useEffect(() => {
    if (pedido?.status === "pending" && attempt < 5) {
      const t = setTimeout(() => setAttempt((a) => a + 1), 3000);
      return () => clearTimeout(t);
    }
  }, [pedido?.status, attempt]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cvFile) {
      setSubmitError("Falta subir tu CV.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.set("buyerName", name);
      formData.set("buyerPhone", phone);
      formData.set("linkedinUrl", linkedinUrl);
      formData.set("linkedinSinPerfil", String(sinPerfil));
      formData.set("objetivoRubro", rubro);
      formData.set("objetivoEtapa", etapa);
      formData.set("objetivoNotas", notas);
      formData.set("cvFile", cvFile);

      const res = await fetch(`/api/asesoria/pedido/${pedidoId}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setSubmitError(
        "Algo falló al enviar el formulario. Probá de nuevo o escribinos por WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl p-8 bg-white/60 border border-careerNavy/10 text-center">
        <p className="font-body text-careerNavy/70">
          No encontramos tu pedido. Si acabás de pagar, escribinos por
          WhatsApp con tu comprobante y lo resolvemos al toque.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta inline-block bg-careerFucsia text-careerCream px-6 py-3 rounded-full hover:bg-careerFucsia/85 transition-colors mt-6"
        >
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="rounded-2xl p-8 bg-white/60 border border-careerNavy/10 text-center">
        <p className="font-body text-careerNavy/60">Cargando tu pedido…</p>
      </div>
    );
  }

  if (pedido.status === "pending") {
    return (
      <div className="rounded-2xl p-8 bg-white/60 border border-careerNavy/10 text-center">
        <p className="font-body text-careerNavy/70 mb-4">
          Estamos confirmando tu pago con Mercado Pago — puede tardar unos
          segundos.
        </p>
        <button
          type="button"
          onClick={() => setAttempt((a) => a + 1)}
          className="btn-cta inline-block border border-careerNavy/20 text-careerNavy px-6 py-3 rounded-full hover:bg-white transition-colors"
        >
          Actualizar →
        </button>
      </div>
    );
  }

  if (done || pedido.form_submitted_at) {
    return (
      <div className="rounded-2xl p-8 bg-white/60 border border-careerNavy/10 text-center">
        <p className="font-display text-xl text-careerNavy mb-3">
          ¡Listo, ya tenemos todo!
        </p>
        <p className="font-body text-careerNavy/70">
          Recibimos tu pago y tu información. Te armo el material en 48-96hs
          y te escribo por WhatsApp o mail para coordinar la entrega.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 sm:p-8 bg-white/60 border border-careerNavy/10 flex flex-col gap-4"
    >
      <div>
        <p className="font-display text-lg text-careerNavy mb-1">
          {pedido.pack_title}
          {pedido.addon_traduccion ? " + Traducción al inglés" : ""}
        </p>
        <p className="font-body text-sm text-careerNavy/60">
          Pago confirmado ✓ — completá estos datos para que arranquemos.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="font-body text-sm text-careerNavy/70 block mb-1">
            Nombre y apellido
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-body w-full rounded-lg bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
          />
        </div>
        <div>
          <label className="font-body text-sm text-careerNavy/70 block mb-1">
            WhatsApp
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="font-body w-full rounded-lg bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
          />
        </div>
      </div>

      <div>
        <label className="font-body text-sm text-careerNavy/70 block mb-1">
          Tu CV actual (PDF o Word)
        </label>
        <input
          type="file"
          required
          accept=".pdf,.doc,.docx"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          className="font-body w-full text-sm text-careerNavy/70 file:mr-4 file:rounded-full file:border-0 file:bg-careerFucsia file:text-careerCream file:px-4 file:py-2 file:text-sm file:font-body"
        />
      </div>

      <div>
        <label className="font-body text-sm text-careerNavy/70 block mb-1">
          Link de tu perfil de LinkedIn
        </label>
        <input
          type="url"
          disabled={sinPerfil}
          required={!sinPerfil}
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/tu-perfil"
          className="font-body w-full rounded-lg bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none disabled:opacity-50 mb-2"
        />
        <label className="font-body text-sm text-careerNavy/70 flex items-center gap-2">
          <input
            type="checkbox"
            checked={sinPerfil}
            onChange={(e) => setSinPerfil(e.target.checked)}
            className="accent-careerFucsia"
          />
          No tengo perfil de LinkedIn armado todavía
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="font-body text-sm text-careerNavy/70 block mb-1">
            Rubro / puesto que buscás
          </label>
          <input
            type="text"
            value={rubro}
            onChange={(e) => setRubro(e.target.value)}
            className="font-body w-full rounded-lg bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
          />
        </div>
        <div>
          <label className="font-body text-sm text-careerNavy/70 block mb-1">
            ¿En qué etapa de la búsqueda estás?
          </label>
          <input
            type="text"
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            placeholder="Ej: recién arranco, ya postulé a varias, etc."
            className="font-body w-full rounded-lg bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
          />
        </div>
      </div>

      <div>
        <label className="font-body text-sm text-careerNavy/70 block mb-1">
          Algo más que quieras contarme (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="font-body w-full rounded-lg bg-white border border-careerNavy/15 px-4 py-2.5 text-sm text-careerNavy focus:border-careerFucsia outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-cta bg-careerFucsia text-careerCream px-6 py-3 rounded-full hover:bg-careerFucsia/85 transition-colors disabled:opacity-60"
      >
        {submitting ? "Enviando…" : "Enviar →"}
      </button>
      {submitError && (
        <p className="font-body text-xs text-careerNavy/60">{submitError}</p>
      )}
    </form>
  );
}
