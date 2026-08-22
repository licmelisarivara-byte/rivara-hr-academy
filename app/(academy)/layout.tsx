import AudienceStrip from "@/components/AudienceStrip";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AudienceStrip />
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
