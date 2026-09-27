import type { Metadata } from "next";
import AdminAsesoriaPanel from "@/components/AdminAsesoriaPanel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminAsesoriaPage() {
  return <AdminAsesoriaPanel />;
}
