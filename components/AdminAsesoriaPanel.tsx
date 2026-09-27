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
  linkedin_url: string | null;
  linkedin_sin_perfil: boolean;
  objetivo_rubro: string | null;
  objetivo_etapa: string | null;
  objetivo_notas: string | null;
  cv_file_path: string | null;
  cv_file_name: string | null;
  created_at: string;
  form_submitted_at: string | null;
  delivered_at: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
};

const STORAGE_KEY = "asesoria_admin_secret";
const ESTADOS = ["en_proceso", "entregado", "agendado", "completado"] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado — falta formulario",
  en_proceso: "En proceso",
  entregado: "Entregado",
  agendado: "Sesión agendada",
  completado: "Completado",
};

export default function AdminAsesoriaPanel() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSecret(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  async function load() {
    setError(null);
    const res = await fetch("/api/admin/asesoria", {
      headers: { "x-admin-secret": secret },
    });
    if (res.status === 401) {
      setError("Clave incorrecta.");
      setUnlocked(false);
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    const data = await res.json();
    setPedidos(data.pedidos || []);
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(STORAGE_KEY, secret);
    setUnlocked(true);
  }

  async function handleEstadoChange(id: string, estado: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/asesoria/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownloadCv(id: string) {
    const res = await fetch(`/api/admin/asesoria/${id}/cv`, {
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  if (!unlocked) {
    return (
      <form onSubmit={handleUnlock} className="max-w-sm mx-auto mt-24 px-6">
        <h1 className="font-display text-xl mb-4">Admin — Asesoría de Carrera</h1>
        <input
          type="password"
          required
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Clave de admin"
          className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm mb-3"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-black text-white px-4 py-2.5 text-sm"
        >
          Entrar
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <h1 className="font-display text-xl mb-6">Pedidos — Asesoría de Carrera</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {!pedidos ? (
        <p className="text-sm text-black/60">Cargando…</p>
      ) : pedidos.length === 0 ? (
        <p className="text-sm text-black/60">Todavía no hay pedidos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-black/10">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Pack</th>
                <th className="py-2 pr-4">Contacto</th>
                <th className="py-2 pr-4">LinkedIn</th>
                <th className="py-2 pr-4">Objetivo</th>
                <th className="py-2 pr-4">CV</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Cambiar a</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-b border-black/5 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap text-black/60">
                    {new Date(p.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="py-3 pr-4">
                    {p.pack_title}
                    {p.addon_traduccion ? " + EN" : ""}
                    <br />
                    <span className="text-black/50">
                      ${Number(p.amount).toLocaleString("es-AR")}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {p.buyer_name || "-"}
                    <br />
                    <span className="text-black/50">{p.buyer_email}</span>
                    <br />
                    <span className="text-black/50">{p.buyer_phone}</span>
                  </td>
                  <td className="py-3 pr-4 max-w-[180px] break-words">
                    {p.linkedin_sin_perfil ? (
                      "Sin perfil"
                    ) : p.linkedin_url ? (
                      <a
                        href={p.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Ver perfil
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 pr-4 max-w-[220px]">
                    <div>{p.objetivo_rubro || "-"}</div>
                    <div className="text-black/50">{p.objetivo_etapa}</div>
                    {p.objetivo_notas && (
                      <div className="text-black/40 italic">{p.objetivo_notas}</div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {p.cv_file_path ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadCv(p.id)}
                        className="text-blue-600 underline"
                      >
                        Descargar
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {STATUS_LABEL[p.status] || p.status}
                  </td>
                  <td className="py-3 pr-4">
                    {p.form_submitted_at ? (
                      <select
                        defaultValue=""
                        disabled={busyId === p.id}
                        onChange={(e) => {
                          if (e.target.value) handleEstadoChange(p.id, e.target.value);
                        }}
                        className="border border-black/15 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Elegir…</option>
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {STATUS_LABEL[estado]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-black/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
