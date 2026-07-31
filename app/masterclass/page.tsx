import type { Metadata } from "next";
import MasterclassForm from "@/components/MasterclassForm";

const EVENT_SLUG = "analiza-cvs-con-ia";
const YOUTUBE_LINK = "https://youtube.com/live/6_qluLNXQ7M?feature=share";

export const metadata: Metadata = {
  title: "Masterclass gratuita: Analizá CVs con IA",
  description:
    "Masterclass gratuita en vivo por YouTube: aprendé a analizar CVs con IA de forma práctica. Martes 4 de agosto, 17:30 hs (ARG).",
};

export default function MasterclassPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <p className="eyebrow mb-4">Masterclass gratuita · En vivo</p>
      <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
        Analizá CVs con IA
      </h1>
      <p className="text-bone/70 text-lg mb-6">
        Una masterclass en vivo y gratuita para aprender a usar IA en el
        análisis de currículums de forma práctica.
      </p>
      <div className="detail-text card rounded-xl p-4 mb-10">
        📅 Martes 4 de agosto · 17:30 hs (ARG) · en vivo por YouTube
      </div>

      <MasterclassForm eventSlug={EVENT_SLUG} youtubeLink={YOUTUBE_LINK} />
    </div>
  );
}
