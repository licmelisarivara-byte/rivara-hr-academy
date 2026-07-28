export default function NotasPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Notas</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-6">
        Notas de selección
      </h1>
      <p className="text-bone/60 mb-10">
        Acá vas a poder ir publicando tus reflexiones y aprendizajes de
        selección con IA — como un diario profesional para colegas. Esta
        página ya tiene el diseño listo; falta cargar el primer contenido.
      </p>

      <div className="card rounded-xl p-8 text-center text-bone/50">
        Todavía no hay notas publicadas. Decime qué querés escribir y armamos
        la primera entrada juntas.
      </div>
    </div>
  );
}
