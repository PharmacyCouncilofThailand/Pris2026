"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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

  // Duplicate each column for seamless infinite scroll
  const col1Items = [...column1, ...column1, ...column1, ...column1];
  const col2Items = [...column2, ...column2, ...column2, ...column2];
  const col3Items = [...column3, ...column3, ...column3, ...column3];

  return (
    <>
      <section className="relative bg-black text-white overflow-hidden">
        {/* Theme background glows */}
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none opacity-50 translate-x-[-30%]" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-orange-500/20 blur-[150px] rounded-full pointer-events-none opacity-50 translate-x-[30%]" />


        {/* Vertical Scrolling Gallery — 3 columns */}
        <div className="relative h-[600px] sm:h-[700px] md:h-[800px] overflow-hidden z-10">
          {/* Top & Bottom fade overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-40 md:h-64 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none flex">
             <div className="w-full h-full backdrop-blur-xl [mask-image:linear-gradient(to_top,black_10%,transparent_100%)]" />
          </div>

          <div className="flex gap-3 sm:gap-4 md:gap-5 px-3 sm:px-4 md:px-8 h-full">
            {/* Column 1 — scrolls UP */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 animate-scroll-up">
                {col1Items.map((src, i) => (
                  <div
                    key={`c1-${i}`}
                    className="relative w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0"
                    onClick={() => openLightbox(src)}
                  >
                    <Image
                      src={src}
                      alt={`PRIS 2024 Memory`}
                      fill
                      sizes="33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/0 group-hover:border-white/20 transition-all duration-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 — scrolls DOWN */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 animate-scroll-down">
                {col2Items.map((src, i) => (
                  <div
                    key={`c2-${i}`}
                    className="relative w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0"
                    onClick={() => openLightbox(src)}
                  >
                    <Image
                      src={src}
                      alt={`PRIS 2024 Memory`}
                      fill
                      sizes="33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/0 group-hover:border-white/20 transition-all duration-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 — scrolls UP */}
            <div className="flex-1 overflow-hidden relative">
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 animate-scroll-up-slow">
                {col3Items.map((src, i) => (
                  <div
                    key={`c3-${i}`}
                    className="relative w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0"
                    onClick={() => openLightbox(src)}
                  >
                    <Image
                      src={src}
                      alt={`PRIS 2024 Memory`}
                      fill
                      sizes="33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/0 group-hover:border-white/20 transition-all duration-500" />
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
          }
          .animate-scroll-down {
            animation: scroll-down 135s linear infinite;
          }
          .animate-scroll-up-slow {
            animation: scroll-up 150s linear infinite;
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
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center"
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
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white transition-colors duration-300 p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white transition-colors duration-300 p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md"
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
