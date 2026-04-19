"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function HighlightVideoSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("highlightVideo");

  // TODO: เปลี่ยนรหัส YOUTUBE_ID ตรงนี้เป็นของวิดีโอคุณหลังจากอัปโหลดลง Youtube แล้ว
  const YOUTUBE_ID = "WXozyrXyWIQ"; 

  // ป้องกันการ Scroll เวลาเปิด Popup
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isModalOpen]);

  return (
    <section className="relative w-full py-24 md:py-40 flex flex-col justify-center items-center bg-black gap-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center z-10">
        {/* Header Text */}
        <div className="text-center mb-8 md:mb-16 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg md:text-2xl text-white/70 max-w-3xl font-light leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Thumbnail Layer - ลดภาระการโหลดวิดีโอ */}
        <div className="relative w-full aspect-video rounded-2xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.15)] group cursor-pointer"
             onClick={() => setIsModalOpen(true)}>
          
          <Image
            src="/assets/Img/PRIS_Higlight/PRIS_HighlightD1-11.jpg"
            alt="PRIS 2026 Highlight Thumbnail"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
          
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
          
          {/* Big Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-blue-600/90 rounded-full flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover:scale-110 shadow-[0_0_40px_rgba(37,99,235,0.5)]">
              <Play className="w-10 h-10 md:w-14 md:h-14 text-white ml-2" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Video Container */}
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl z-10">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-black/50 hover:bg-black/80 text-white rounded-full w-10 h-10"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
