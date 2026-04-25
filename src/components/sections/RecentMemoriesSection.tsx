"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { column1, column2, column3, allImages } from "@/data/recentMemoriesData";

export default function RecentMemoriesSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Lightbox
  const openLightbox = useCallback((src: string) => {
    const idx = allImages.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : null);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % allImages.length : null
    );
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + allImages.length) % allImages.length : null
    );
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  // Duplicate each column for seamless infinite scroll (2x)
  const col1Items = [...column1, ...column1];
  const col2Items = [...column2, ...column2];
  const col3Items = [...column3, ...column3];

  // On mobile we show 2 columns, on md+ we show 3
  // Column 3 is hidden on mobile and shown on md+
  return (
    <>
      <section className="relative bg-black text-white overflow-hidden">

        {/* Vertical Scrolling Gallery — uniform grid */}
        <div className="memories-gallery relative h-[600px] sm:h-[800px] md:h-[1000px] lg:h-[1100px] overflow-hidden z-10">
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 md:h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 md:h-48 bg-gradient-to-t from-black via-black/90 to-transparent z-10 pointer-events-none" />

          <div className="flex gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 md:px-8 h-full">
            {/* Column 1 — scrolls UP */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 animate-scroll-up">
                {col1Items.map((src, i) => (
                  <div
                    key={`c1-${i}`}
                    className="memories-card relative w-full aspect-[4/3] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 bg-neutral-900"
                    onClick={() => openLightbox(src)}
                  >
                    <Image
                      src={src}
                      alt="PRIS 2024 Memory"
                      fill
                      quality={60}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 — scrolls DOWN */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 animate-scroll-down">
                {col2Items.map((src, i) => (
                  <div
                    key={`c2-${i}`}
                    className="memories-card relative w-full aspect-[4/3] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 bg-neutral-900"
                    onClick={() => openLightbox(src)}
                  >
                    <Image
                      src={src}
                      alt="PRIS 2024 Memory"
                      fill
                      quality={60}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out scale-[1.01] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 pointer-events-none" />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 — scrolls UP (hidden on mobile, visible on md+) */}
            <div className="hidden md:flex flex-1 overflow-hidden relative">
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 animate-scroll-up-slow w-full">
                {col3Items.map((src, i) => (
                  <div
                    key={`c3-${i}`}
                    className="memories-card relative w-full aspect-[4/3] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 bg-neutral-900"
                    onClick={() => openLightbox(src)}
                  >
                    <Image
                      src={src}
                      alt="PRIS 2024 Memory"
                      fill
                      quality={60}
                      sizes="33vw"
                      className="object-cover transition-transform duration-700 ease-out scale-[1.01] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 pointer-events-none" />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical scroll animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes scroll-down {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }
          .animate-scroll-up {
            animation: scroll-up 120s linear infinite;
            will-change: transform;
            transform: translateZ(0);
          }
          .animate-scroll-down {
            animation: scroll-down 135s linear infinite;
            will-change: transform;
            transform: translateZ(0);
          }
          .animate-scroll-up-slow {
            animation: scroll-up 150s linear infinite;
            will-change: transform;
            transform: translateZ(0);
          }

          .animate-scroll-up:hover,
          .animate-scroll-down:hover,
          .animate-scroll-up-slow:hover {
            animation-play-state: paused;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-scroll-up,
            .animate-scroll-down,
            .animate-scroll-up-slow {
              animation: none;
            }
          }
        `}} />
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white/60 hover:text-white transition-colors duration-300 p-2"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white transition-colors duration-300 p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white transition-colors duration-300 p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
          </Button>

          <div
            className="relative w-[90vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIndex]}
              alt="PRIS 2024 Memory"
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs sm:text-sm font-medium tracking-widest uppercase">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}
