import { notFound } from "next/navigation";
import { notes, getNoteBySlug } from "@/lib/notes";
import NoteBlocks from "@/components/NoteBlocks";

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export default function NoteDetailPage({ params }: { params: { slug: string } }) {
  const note = getNoteBySlug(params.slug);
  if (!note) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Notas</p>
      <div className="detail-text mb-3">{note.date}</div>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-8">{note.title}</h1>
      <NoteBlocks blocks={note.blocks} />
    </div>
  );
}
