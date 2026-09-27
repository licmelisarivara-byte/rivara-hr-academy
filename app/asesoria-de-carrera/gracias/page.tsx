import type { Metadata } from "next";
import AsesoriaPostPagoForm from "@/components/AsesoriaPostPagoForm";

export const metadata: Metadata = {
  title: { absolute: "¡Gracias por tu compra! | RIVARA Consultora" },
  robots: { index: false, follow: false },
};

export default function GraciasPage({
  searchParams,
}: {
  searchParams: { pedido?: string };
}) {
  const { pedido } = searchParams;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-display text-2xl sm:text-3xl text-careerNavy mb-3 text-center">
        ¡Gracias por tu compra!
      </h1>
      <p className="font-body text-careerNavy/70 text-center mb-10">
        Un último paso: contame sobre vos para armar tu material.
      </p>
      {pedido ? (
        <AsesoriaPostPagoForm pedidoId={pedido} />
      ) : (
        <p className="font-body text-careerNavy/70 text-center">
          No encontramos el pedido. Si acabás de pagar, escribinos por
          WhatsApp con tu comprobante.
        </p>
      )}
    </div>
  );
}
