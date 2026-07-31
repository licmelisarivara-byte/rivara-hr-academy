export type Event = {
  slug: string;
  title: string;
  youtubeLink: string;
};

export const events: Event[] = [
  {
    slug: "analiza-cvs-con-ia",
    title: "Masterclass gratuita: Analizá CVs con IA",
    youtubeLink: "https://youtube.com/live/6_qluLNXQ7M?feature=share",
  },
];

export function getEventBySlug(slug: string) {
  return events.find((e) => e.slug === slug);
}
