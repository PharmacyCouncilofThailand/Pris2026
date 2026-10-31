import type { Metadata } from "next";
import { PosterGallery } from "@/components/poster-gallery/PosterGallery";

export const metadata: Metadata = {
  title: "Poster Gallery | PRIS 2026",
};

export default function PosterGalleryPage() {
  return <PosterGallery />;
}
