const audiences = [
  {
    title: "Selectora freelance",
    text: "Manejás varios procesos a la vez y necesitás filtrar rápido, sin perder criterio.",
  },
  {
    title: "RRHH en una PyME",
    text: "Sos el equipo de una persona y no tenés tiempo para leer 150 CVs a mano.",
  },
  {
    title: "Consultora de RRHH",
    text: "Querés ofrecerle a tus clientes procesos más rápidos y presentaciones más sólidas.",
  },
];

export default function AudienceSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="eyebrow mb-3 text-center">Para quién es</p>
      <h2 className="font-display text-2xl text-center mb-10 text-bone">
        Esto te sirve si sos...
      </h2>
      <div className="grid sm:grid-cols-3 gap-6 text-center">
        {audiences.map((a) => (
          <div key={a.title} className="card rounded-2xl p-6">
            <h3 className="font-semibold mb-2 text-bone">{a.title}</h3>
            <p className="text-sm text-bone/60">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
