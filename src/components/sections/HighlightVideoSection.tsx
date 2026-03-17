"use client";

import React, { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HighlightVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };



  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 md:py-40 flex flex-col justify-center items-center bg-black gap-12"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center">
        {/* Header Text */}
        <div className="text-center mb-8 md:mb-16 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6">
            Recent Memories
          </h2>
          <p className="text-base sm:text-lg md:text-2xl text-white/70 max-w-3xl font-light leading-relaxed">
            Relive the highlights from the Pharmaceutical Research and Innovation Symposium 2025
          </p>
        </div>

        {/* Layer 1: วิดีโอหลัก */}
        <div className="relative w-full aspect-video rounded-2xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.15)] z-[1]">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="/assets/Img/PSIS_Higlight/Highlight PRIS 2025 - Day 1 - สภาเภสัชกรรม Pharmacy Council (720p, h264).mp4"
              type="video/mp4"
            />
          </video>
          
          {/* Play/Pause Button - Positioned inside the video card wrapper */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[40]">
            <Button
              onClick={togglePlay}
              variant="outline"
              size="icon"
              className="bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 md:w-14 md:h-14 backdrop-blur-md transition-all border-white/20 hover:scale-110"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="w-4 h-4 md:w-6 md:h-6" /> : <Play className="w-4 h-4 md:w-6 md:h-6 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
