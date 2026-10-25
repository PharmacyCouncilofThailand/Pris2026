import type { Metadata } from "next";
import { PosterKiosk } from "@/components/poster-kiosk/PosterKiosk";

export const metadata: Metadata = {
  title: "Poster Kiosk | PRIS 2026",
  robots: { index: false, follow: false },
};

export default function PosterKioskPage() {
  return <PosterKiosk />;
}
