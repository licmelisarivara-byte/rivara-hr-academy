"use client";

import { useEffect } from "react";
import { saveUtmFromLocation } from "@/lib/analytics";

export default function UtmCapture() {
  useEffect(() => {
    saveUtmFromLocation();
  }, []);
  return null;
}
