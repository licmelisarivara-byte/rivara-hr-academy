"use client";

import { trackEvent } from "@/lib/analytics";

// Link de inscripción que además manda el evento click_inscribirme a Google
// Analytics con la ubicación del botón (hero, sticky o final).
export default function TrackedAnchor({
  href,
  location,
  courseSlug,
  className,
  id,
  children,
}: {
  href: string;
  location: "hero" | "sticky" | "final";
  courseSlug: string;
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      id={id}
      href={href}
      className={className}
      onClick={() => trackEvent("click_inscribirme", { location, course_slug: courseSlug })}
    >
      {children}
    </a>
  );
}
