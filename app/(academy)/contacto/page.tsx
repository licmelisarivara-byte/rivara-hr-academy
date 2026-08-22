import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribile a Lic. Melisa Rivara por WhatsApp o email para coordinar cursos, recursos o pagos.",
};

export default function ContactoPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <p className="eyebrow mb-4">Contacto</p>
      <h1 className="font-display text-3xl text-bone mb-6">Escribime</h1>
      <p className="text-bone/60 mb-8">
        Para coordinar el pago o resolver dudas, escribime por WhatsApp o a{" "}
        <a
          href="mailto:hola@rivaraconsultora.com.ar"
          className="text-magenta hover:underline"
        >
          hola@rivaraconsultora.com.ar
        </a>
        .
      </p>
      <a
        href="https://wa.me/5491123912820"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta inline-block bg-magenta text-white px-6 py-3 rounded-full hover:bg-magentaSoft transition-colors"
      >
        Escribir por WhatsApp →
      </a>
    </div>
  );
}
