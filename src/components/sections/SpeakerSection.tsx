"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Swiper from "swiper";
import { EffectCoverflow, Pagination, Autoplay, Navigation, Keyboard, Mousewheel } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { SPEAKERS_DATA } from "@/data/speakersData";

export default function SpeakerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperDomRef = useRef<HTMLDivElement>(null);

  // Initialize GSAP Animations
  useGSAP(
    () => {
      if (!sectionRef.current || !overlayRef.current || !textRef.current || !swiperContainerRef.current) return;

      const bgLayer = sectionRef.current.querySelector(".bg-speaker-img");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top", 
          end: "+=400%",    // Increased duration for an even smoother, longer scroll feel
          pin: true,        
          scrub: 0.5,       
        },
      });

      // 0. Slow zoom on the background image (Ken Burns cinematic effect)
      if (bgLayer) {
        tl.to(bgLayer, { scale: 1.15, transformOrigin: "center center", duration: 15, ease: "none" }, 0);
      }

      // 1. Darken BG
      tl.to(
        overlayRef.current,
        { backgroundColor: "rgba(0, 0, 0, 0.85)", duration: 2.5, ease: "power1.inOut" },
        0
      );

      // 2. Text slides up from below the screen (No fade, pure scroll movement)
      tl.fromTo(
        textRef.current,
        { y: window.innerHeight }, // starting completely below the viewport
        { y: 0, duration: 4, ease: "none" }, // pure linear scrub movement
        1.5
      );

      // 3. Short hold for text at the center
      tl.to({}, { duration: 2 }, 5.5);

      // 4. Text continues moving up and shrinking out of the way
      tl.to(
        textRef.current,
        { 
          y: -window.innerHeight * 0.5, // moving above the screen
          scale: 0.5, 
          opacity: 0, 
          duration: 3, 
          ease: "none" 
        },
        7.5
      );

      // 5. Swiper fades in smoothly
      tl.fromTo(
        swiperContainerRef.current,
        { y: 80, autoAlpha: 0, scale: 0.95 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 3, ease: "power2.out" },
        9 // slightly overlaps text exit
      );

      // 6. Hold Swiper on screen until scroll finishes
      tl.to({}, { duration: 4 }, 12);
    },
    { scope: sectionRef }
  );

  // Initialize Swiper Vanilla JS
  useEffect(() => {
    if (!swiperDomRef.current) return;

    const swiperInstance = new Swiper(swiperDomRef.current, {
      modules: [EffectCoverflow, Pagination, Autoplay, Navigation, Keyboard, Mousewheel],
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 1.5, // Mobile default
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 4,
        slideShadows: true,
      },
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      keyboard: {
        enabled: true,
      },
      mousewheel: {
        thresholdDelta: 70,
        forceToAxis: true, // IMPORTANT: Allows normal vertical page scrolling without trapping the user
      },
      breakpoints: {
        560: { slidesPerView: 2.5 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 3 },
      },
    });

    return () => {
      swiperInstance.destroy();
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen overflow-hidden bg-black z-[2]"
    >
      {/* Background SVG layer */}
      <div
        className="bg-speaker-img absolute inset-0 w-full h-full will-change-transform"
        style={{
          backgroundImage: "url('/assets/Img/BG/BG-Speaker.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Top Edge Gradient Blur (Blends with Welcome Section) */}
      <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-[2]" />

      {/* Darkening Overlay (mutated by GSAP) */}
      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      />

      {/* Text Container */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
        <h2
          ref={textRef}
          className="text-white text-[clamp(1.75rem,5vw,4rem)] font-bold uppercase tracking-widest text-center flex flex-col items-center gap-4 will-change-transform"
        >
          <span className="text-sm md:text-lg text-gold font-normal tracking-[0.2em] uppercase">
            Meet Our Experts
          </span>
          Distinguished Speakers
        </h2>
      </div>

      {/* Swiper Carousel Container (starts hidden via GSAP autoAlpha) */}
      <div 
        ref={swiperContainerRef}
        className="absolute inset-0 z-[3] flex items-center justify-center px-4"
        style={{ visibility: "hidden", opacity: 0, top: "10%" }} 
      >
        <div className="w-full max-w-6xl mx-auto h-[60vh] md:h-[65vh] relative">
          
          {/* Slider main container */}
          <div className="swiper w-full h-full pb-12" ref={swiperDomRef}>
            {/* Additional required wrapper */}
            <div className="swiper-wrapper">
              {/* Slides */}
              {SPEAKERS_DATA.map((speaker) => (
                <div 
                  key={speaker.id} 
                  className="swiper-slide aspect-[3/4] rounded-2xl overflow-hidden"
                >
                  {/* Speaker Card Design */}
                  <div className="relative w-full h-full group bg-[#0d1529] border border-white/10 rounded-2xl flex flex-col justify-end p-6 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1529]/60 to-[#0d1529] z-10" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:10px_10px]" />
                    <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                    
                    {/* Speaker Info */}
                    <div className="relative z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-gold text-xs font-bold uppercase tracking-wider mb-2 block">
                        {speaker.role}
                      </span>
                      <h3 className="text-white text-2xl font-bold mb-1 leading-tight">
                        {speaker.name}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {speaker.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="swiper-pagination"></div>

            {/* Navigation buttons */}
            <div className="swiper-button-prev !text-gold after:!text-2xl"></div>
            <div className="swiper-button-next !text-gold after:!text-2xl"></div>
            
          </div>

        </div>
      </div>

      {/* Bottom Edge Gradient Blur (Blends with Event Schedule black bg) */}
      <div className="absolute bottom-0 left-0 w-full h-12 md:h-24 bg-gradient-to-b from-transparent to-black pointer-events-none z-[4]" />
    </section>
  );
}
