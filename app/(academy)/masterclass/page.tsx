import type { Metadata } from "next";
import MasterclassForm from "@/components/MasterclassForm";

const EVENT_SLUG = "analiza-cvs-con-ia";
const YOUTUBE_LINK = "https://youtube.com/live/6_qluLNXQ7M?feature=share";
const OG_IMAGE = "/images/masterclass/youtube-banner.png";

export const metadata: Metadata = {
  title: "Masterclass grabada: Analizá CVs con IA",
  description:
    "Masterclass gratuita por YouTube: aprendé a analizar CVs con IA de forma práctica. Registrate para ver la grabación cuando quieras.",
  openGraph: {
    images: [{ url: OG_IMAGE, width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

export default function MasterclassPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="rounded-xl overflow-hidden mb-10">
        <img
          src={OG_IMAGE}
          alt="Masterclass gratuita: Analizá un CV con IA en segundos"
          className="w-full h-auto"
        />
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-start">
        <div className="rounded-xl overflow-hidden">
          <img
            src="/images/masterclass/invite-flyer.jpg"
            alt="Invitación a la masterclass gratuita de RIVARA HR Academy"
            className="w-full h-auto"
          />
        </div>

        <div>
          <p className="eyebrow mb-4">Masterclass gratuita · Grabación disponible</p>
          <h1 className="font-display text-3xl sm:text-4xl text-bone mb-4">
            Analizá CVs con IA
          </h1>
          <p className="text-bone/70 text-lg mb-6">
            Una masterclass gratuita para aprender a usar IA en el análisis
            de currículums de forma práctica. Registrate y mirá la grabación
            cuando quieras.
          </p>
          <div className="detail-text card rounded-xl p-4 mb-8">
            🎥 Grabación disponible · Por YouTube
          </div>

          <MasterclassForm eventSlug={EVENT_SLUG} youtubeLink={YOUTUBE_LINK} />
        </div>
      </div>
    </div>
  );
}
