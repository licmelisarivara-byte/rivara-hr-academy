export default function ContactoPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <p className="eyebrow mb-4">Contacto</p>
      <h1 className="font-display text-3xl text-bone mb-6">Escribime</h1>
      <p className="text-bone/60 mb-8">
        {/* TODO: reemplazar por el link real de WhatsApp de Melisa (wa.me/549...) */}
        Para coordinar el pago o resolver dudas, escribime a{" "}
        <a
          href="mailto:hola@rivaraconsultora.com.ar"
          className="text-magenta hover:underline"
        >
          hola@rivaraconsultora.com.ar
        </a>
        .
      </p>
    </div>
  );
}
