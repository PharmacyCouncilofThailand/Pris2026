"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "next-intl";
import { galleryData } from "@/data/galleryData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GalleryPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = galleryData.pris2025.images;
  const title = locale === "th" ? galleryData.pris2025.titleTh : galleryData.pris2025.title;
  const subtitle = locale === "th" ? galleryData.pris2025.subtitleTh : galleryData.pris2025.subtitle;

  // Lightbox handlers
  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev + 1) % images.length : null);
  }, [images.length]);
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => prev !== null ? (prev - 1 + images.length) % images.length : null);
  }, [images.length]);

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

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
    // Hero text reveal
    gsap.from(".gallery-hero-line", {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.6,
      ease: "power4.out",
      delay: 0.15,
    });
    gsap.from(".gallery-hero-sub", {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power3.out",
      delay: 0.6,
    });

    // Gallery items stagger
    const items = pageRef.current?.querySelectorAll(".gallery-item");
    items?.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: (i % 6) * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
          },
        }
      );
    });
  }, { scope: pageRef });

  return (
    <>
      <main
        ref={pageRef}
        className="bg-[#0a0a0a] text-white overflow-hidden selection:bg-gold/30 min-h-screen"
      >
        {/* ══════ HERO ══════ */}
        <section className="relative pt-40 md:pt-56 pb-16 md:pb-24 px-6 md:px-12 flex flex-col items-center text-center">
          {/* Decorative bg glows */}
          <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-600/[0.06] rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center">
            <div className="gallery-hero-sub flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-gold/50" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold">PRIS 2025</span>
              <span className="w-12 h-px bg-gold/50" />
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.85] text-white">
              <div className="overflow-hidden md:pl-2">
                <span className="block gallery-hero-line pr-[0.15em]">
                  {locale === "th" ? "แกลเลอรี" : "Gallery"}
                </span>
              </div>
              <div className="overflow-hidden md:pl-2">
                <span className="block gallery-hero-line text-transparent bg-clip-text bg-gradient-to-r from-gold via-orange-400 to-gold pr-[0.15em]">
                  {locale === "th" ? "ภาพประทับใจ" : "Highlights"}
                </span>
              </div>
            </h1>

            <div className="gallery-hero-sub max-w-2xl mx-auto mt-8 px-4">
              <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* ══════ GALLERY SECTION TITLE ══════ */}
        <section className="relative px-4 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <span className="w-8 h-px bg-white/20" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {title}
              </h2>
            </div>
            <p className="text-white/20 text-sm pl-12">
              {images.length} {locale === "th" ? "ภาพ" : "photos"}
            </p>
          </div>
        </section>

        {/* ══════ UNIFORM GALLERY GRID ══════ */}
        <section className="relative px-4 md:px-8 pb-32 md:pb-44">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {images.map((src, idx) => (
              <div
                key={idx}
                className="gallery-item relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group bg-neutral-900"
                onClick={() => openLightbox(idx)}
              >
                <Image
                  src={src}
                  alt={`PRIS 2025 - ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl border border-white/0 group-hover:border-white/20 transition-all duration-500" />
                {/* Image index badge */}
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/60 backdrop-blur-md text-white/60 text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 tracking-widest">
                  {idx + 1} / {images.length}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ══════ LIGHTBOX ══════ */}
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
              src={images[lightboxIndex]}
              alt={`PRIS 2025 - ${lightboxIndex + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs sm:text-sm font-medium tracking-widest uppercase">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
