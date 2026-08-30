"use client";

import { useState } from "react";
import Image from "next/image";
import ProfessionalRecommendations from "./ProfessionalRecommendations";

export default function AboutMeSummary() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-10">
      <h2 className="font-display text-2xl text-bone mb-6">Sobre mí</h2>
      <div className="card-alt rounded-xl p-6 grid sm:grid-cols-[auto_1fr] gap-5 items-start">
        <Image
          src="/images/melisa-avatar.jpg"
          alt="Lic. Melisa Rivara"
          width={160}
          height={160}
          className="w-20 h-20 rounded-full object-cover mx-auto sm:mx-0"
        />
        <div className="text-sm text-bone/70 space-y-4">
          <p>
            Lic. en Recursos Humanos, especializada en selección de personal con IA desde hace un
            año y medio, fundadora de RIVARA HR Academy.
          </p>
          {expanded && (
            <>
              <p>
                Antes de dedicarme a selección, pasé por varios roles que hoy se notan en cómo
                trabajo: 4 años como vendedora de seguros, 3 años en una importadora de calzado
                haciendo administración de ventas — carga de pedidos, facturación, notas de
                crédito, control de logística, y trato directo con vendedores mayoristas y
                clientes — donde además armé desde cero el organigrama, la descripción de mi
                puesto y los manuales de procedimiento que no existían, 5 años en operaciones de
                cliente en una multinacional donde empecé a dar mis primeras capacitaciones
                internas, y un tiempo en emprendimientos digitales propios haciendo community
                management y marketing.
              </p>
              <p>
                Hace un año y medio me especialicé en selección de personal — y ahí fue cuando
                empecé a aplicar Claude a mis propios procesos, no como demo para vender un curso,
                sino porque necesitaba filtrar más rápido sin bajar la calidad de mis ternas.
              </p>
              <p>
                Fundé RIVARA Consultora y RIVARA HR Academy para compartir ese método con colegas
                de RRHH: no vengo a venderte una promesa de IA genérica, vengo de armar
                organigramas, dar capacitaciones y hacer selección real, y te enseño lo que uso
                yo, todas las semanas, en búsquedas reales.
              </p>
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-magenta text-sm font-semibold hover:underline"
          >
            {expanded ? "Leer menos ↑" : "Leer más →"}
          </button>
        </div>
      </div>
      <ProfessionalRecommendations />
    </div>
  );
}
