"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoSlide {
  src: string;
  title: string;
}

const SLIDES: VideoSlide[] = [
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/09.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/06.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/02.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/03.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/04.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/05.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/01.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/07.mp4", title: "" },
  { src: "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20สัมภาษณ์/08.mp4", title: "" },
];

export default function VideoCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Manage video playback when slide changes
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      video.volume = volume;
      video.muted = isMuted;

      if (i === activeIndex) {
        if (isPlaying) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      } else {
        video.pause();
      }
    });
  }, [activeIndex, isPlaying, isMuted, volume]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= SLIDES.length) return;
      setActiveIndex(index);
      setIsPlaying(true);
    },
    [],
  );

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    setIsPlaying(true);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (prev && volume === 0) setVolume(1); // Unmute and restore volume if it was 0
      return !prev;
    });
  }, [volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) setIsMuted(true);
    else setIsMuted(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Reset
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      goNext();
    } else if (touchEndX.current - touchStartX.current > 50) {
      goPrev();
    }
  };

  return (
    <section className="relative w-full py-10 md:py-24 flex flex-col justify-center items-center bg-black overflow-hidden">
      <style>{`
        .carousel-track { --slide-width: 90%; }
        @media (min-width: 768px) { .carousel-track { --slide-width: 75%; } }
        @media (min-width: 1024px) { .carousel-track { --slide-width: 70%; } }
        @media (min-width: 1536px) { .carousel-track { --slide-width: 65%; } }
      `}</style>

      {/* Carousel Track */}
      <div className="relative w-full">

        {/* Slides Container — overflow visible so side panels peek */}
        <div
          className="carousel-track overflow-hidden cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] items-center"
            style={{
              transform: `translateX(calc(-1 * ${activeIndex} * var(--slide-width) + (100% - var(--slide-width)) / 2))`,
            }}
          >
            {SLIDES.map((slide, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={i}
                  className="flex-shrink-0 px-1.5 md:px-3 transition-all duration-700"
                  style={{ width: "var(--slide-width)" }}
                  onClick={() => !isActive && goTo(i)}
                >
                  <div
                    className={`relative aspect-video bg-neutral-900 rounded-2xl md:rounded-[28px] overflow-hidden border transition-all duration-700 ${isActive
                        ? "border-white/15 shadow-[0_0_60px_rgba(37,99,235,0.15)] scale-100 opacity-100"
                        : "border-white/5 shadow-none scale-[0.92] opacity-60 cursor-pointer hover:opacity-80"
                      }`}
                  >
                    {slide.src ? (
                      <video
                        ref={(el) => { videoRefs.current[i] = el; }}
                        src={`${slide.src}#t=0.1`}
                        preload="metadata"
                        autoPlay={i === 0}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Placeholder for empty slots */
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <Play className="w-7 h-7 md:w-8 md:h-8 text-white/30 ml-1" />
                        </div>
                        <p className="text-white/30 text-sm md:text-base font-medium tracking-wide">
                          {slide.title}
                        </p>
                        <p className="text-white/20 text-xs md:text-sm">
                          Coming Soon
                        </p>
                      </div>
                    )}

                    {/* Slide Title Overlay */}
                    {(slide.src && slide.title) && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
                        <p className="text-white/90 text-sm md:text-lg font-semibold tracking-wide">
                          {slide.title}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center mt-6 md:mt-10 px-2">
        <div className="inline-flex items-center gap-3 md:gap-6 px-4 md:px-6 py-2.5 md:py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] max-w-full overflow-x-auto select-none focus:outline-none">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex-shrink-0 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 w-5 h-5 md:w-6 md:h-6 focus:outline-none"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            )}
          </button>

          <div className="flex-shrink-0 w-[1px] h-4 md:h-5 bg-white/20"></div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5 md:gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-500 rounded-full flex-shrink-0 focus:outline-none ${i === activeIndex
                  ? "w-5 sm:w-7 md:w-9 h-1.5 sm:h-2 bg-white"
                  : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/50"
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex-shrink-0 w-[1px] h-4 md:h-5 bg-white/20"></div>

          {/* Mute/Unmute & Volume Visual Slider */}
          <div className="flex items-center gap-1.5 md:gap-3 group flex-shrink-0">
            <button
              onClick={toggleMute}
              className="flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 w-5 h-5 md:w-6 md:h-6 focus:outline-none"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              )}
            </button>
            <div className="relative flex items-center w-16 sm:w-20 md:w-24 h-5">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none bg-transparent outline-none focus:outline-none"
                aria-label="Volume"
              />
              {/* Custom visual track */}
              <div className="w-full h-1 md:h-1.5 rounded-full bg-white/30 relative overflow-hidden pointer-events-none">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-white"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                ></div>
              </div>
              {/* Custom thumb */}
              <div
                className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-white rounded-full shadow-md pointer-events-none transition-transform"
                style={{
                  left: `calc(${(isMuted ? 0 : volume) * 100}% - ${((isMuted ? 0 : volume) * 14)}px)`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
