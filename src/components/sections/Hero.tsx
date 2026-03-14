"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Countdown from "@/components/elements/Countdown";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HERO_CFG = {
  zoomScrollEnd: 1.0,
  scrollLockMax: 1.05,
  autoTriggerAt: 0.7,
  maskScale: 60,
  desktop: { initialScale: 2.2, initialY: "25vh" },
  mobile: { initialScale: 1.4, initialY: "15vh" },
} as const;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomTargetRef = useRef<SVGTSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const heroCompleteRef = useRef<boolean>(false);

  // Check if hero has played this session using sessionStorage
  const hasPlayed = () => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("__heroPlayed") === "true";
  };
  const markPlayed = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("__heroPlayed", "true");
    }
  };

  useEffect(() => {
    if (hasPlayed()) {
      heroCompleteRef.current = true;
      return;
    }

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const maxScroll = window.innerHeight * HERO_CFG.scrollLockMax;

    const preventOverscroll = (e: WheelEvent) => {
      if (heroCompleteRef.current) return;
      if (e.deltaY > 0 && window.scrollY >= maxScroll - 10) e.preventDefault();
    };

    const snapScrollBack = () => {
      if (heroCompleteRef.current) return;
      if (window.scrollY > maxScroll) {
        window.scrollTo({ top: maxScroll, behavior: "instant" });
      }
    };

    const releaseScrollLock = () => {
      heroCompleteRef.current = true;
    };

    window.addEventListener("wheel", preventOverscroll, { passive: false });
    window.addEventListener("scroll", snapScrollBack, { passive: true });
    window.addEventListener("heroRevealComplete", releaseScrollLock);

    return () => {
      window.removeEventListener("wheel", preventOverscroll);
      window.removeEventListener("scroll", snapScrollBack);
      window.removeEventListener("heroRevealComplete", releaseScrollLock);
    };
  }, []);

  useGSAP(
    () => {
      if (!svgRef.current) return;
      heroCompleteRef.current = false;

      // Returning visitor
      if (hasPlayed()) {
        gsap.set(svgRef.current, { display: "none" });
        gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
        gsap.set(countdownRef.current, { opacity: 1, y: 0 });
        gsap.set(buttonsRef.current, { opacity: 1, y: 0 });
        heroCompleteRef.current = true;
        videoRef.current?.play().catch(() => {});

        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("heroRevealComplete"));
        });
        return;
      }

      // First visit initialization
      gsap.set(svgRef.current, { scale: 1, opacity: 1 });
      gsap.set(hintRef.current, { opacity: 0 });
      gsap.set(logoRef.current, { opacity: 0 });
      gsap.set(countdownRef.current, { opacity: 0, y: 30 });
      gsap.set(buttonsRef.current, { opacity: 0, y: 30 });

      videoRef.current?.pause();

      // Letter Stagger Intro
      const maskLetters = svgRef.current.querySelectorAll(".mask-letter");
      if (maskLetters.length) {
        gsap.set(maskLetters, { opacity: 0 });
        gsap.to(maskLetters, {
          opacity: 1,
          duration: 0.35,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.4,
          onComplete: () => {
            gsap.to(hintRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });
          },
        });
      } else {
        gsap.set(hintRef.current, { opacity: 1 });
      }

      const calcOrigin = () => {
        if (!svgRef.current || !zoomTargetRef.current) return;
        const svg = svgRef.current.getBoundingClientRect();
        const tgt = zoomTargetRef.current.getBoundingClientRect();
        if (svg.width === 0 || svg.height === 0) return;

        const ox = ((tgt.left + tgt.width / 2) - svg.left) / svg.width * 100;
        const oy = ((tgt.top + tgt.height / 2) - svg.top) / svg.height * 100;
        gsap.set(svgRef.current, { transformOrigin: `${ox}% ${oy}%` });
      };
      
      calcOrigin();
      document.fonts?.ready.then(calcOrigin);

      // Phase 1 Zoom
      const tlScrub = gsap.timeline({
        scrollTrigger: {
          start: 0,
          end: window.innerHeight * HERO_CFG.zoomScrollEnd,
          scrub: 0.1,
        },
      });
      tlScrub
        .to(svgRef.current, { scale: HERO_CFG.maskScale, ease: "power2.in", force3D: true, duration: 1 }, 0)
        .to(svgRef.current, { opacity: 0, ease: "none", duration: 0.1 }, 0.9)
        .to(hintRef.current, { opacity: 0, duration: 0.1 }, 0);

      // Phase 2 Auto Reveal
      const isMobile = window.innerWidth <= 768;
      const { initialScale, initialY } = isMobile ? HERO_CFG.mobile : HERO_CFG.desktop;

      gsap.set(logoRef.current, { opacity: 0, y: initialY, scale: initialScale });

      const tlAuto = gsap.timeline({
        paused: true,
        onComplete: () => {
          heroCompleteRef.current = true;
          markPlayed();
          window.dispatchEvent(new CustomEvent("heroRevealComplete"));
          videoRef.current?.play().catch(() => {});
          tlScrub.scrollTrigger?.kill();
          tlScrub.kill();
          gsap.set(svgRef.current, { display: "none" });
        },
      });
      tlAuto
        .to(logoRef.current, { opacity: 1, y: initialY, scale: initialScale, ease: "power2.out", duration: 0.8 }, 0)
        .to(logoRef.current, { y: 0, scale: 1, ease: "power2.inOut", duration: 0.6 }, 1.0)
        .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3)
        .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.9 }, 1.5);

      const autoTrigger = ScrollTrigger.create({
        start: window.innerHeight * HERO_CFG.autoTriggerAt,
        once: true,
        onEnter: () => tlAuto.play(),
      });

      return () => {
        autoTrigger.kill();
        tlScrub.scrollTrigger?.kill();
        tlScrub.kill();
        tlAuto.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden bg-black flex justify-center items-center isolate"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src="/assets/img/bg/30fps.mp4"
        poster="/assets/img/BG 4500x2281.webp"
        className="absolute inset-0 w-full h-full object-cover transform-gpu opacity-90 z-0 pointer-events-none"
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Hero Content (Behind mask) */}
      <div className="absolute inset-0 w-full h-full z-0 flex flex-col justify-center items-center pointer-events-auto">
        <div ref={logoRef} className="mb-8 md:mb-10 z-[2]">
          <Image
            src="/assets/img/logo/Pris2026-logo.png"
            alt="PRIS 2026 Logo"
            width={400}
            height={500}
            className="w-full max-w-[250px] md:max-w-full h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            priority
          />
        </div>

        <div ref={countdownRef} className="w-full flex justify-center mb-8 z-[2]">
          <Countdown />
        </div>

        <div ref={buttonsRef} className="flex flex-col md:flex-row gap-4 md:gap-5 z-[2]">
          <Link 
            href="/registration"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-gold text-black hover:bg-gold/90 font-bold px-8 py-6 text-base md:text-lg uppercase tracking-wider"
            )}
          >
            Register Now
          </Link>
          <Link 
            href="/call-for-abstracts"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-[#203b89] text-white hover:bg-[#1a3070] shadow-[0_10px_20px_rgba(32,59,137,0.3)] hover:shadow-[0_15px_30px_rgba(32,59,137,0.4)] font-bold px-8 py-6 text-base md:text-lg uppercase tracking-wider transition-all"
            )}
          >
            Submit Abstract
          </Link>
        </div>
      </div>

      {/* SVG Mask Container */}
      <div className="absolute inset-0 w-full h-full z-[1] pointer-events-none overflow-hidden">
        {/*
          Transform-style, backface-visibility properties set inline or by GSAP 
          Force 3D acceleration for smoothness 
        */}
        <svg 
          ref={svgRef} 
          className="w-full h-full absolute top-0 left-0 will-change-transform transform-gpu" 
          style={{ backfaceVisibility: 'hidden', perspective: 1000 }}
          width="100%" 
          height="100%"
        >
          <defs>
            <mask id="textCutout">
              <rect width="100%" height="100%" fill="white" />
              <text
                x="50%" 
                y="54%"
                dominantBaseline="central"
                textAnchor="middle"
                className="font-black text-[11vw] md:text-[15vw] font-outfit tracking-tighter"
                fill="black"
              >
                {"PRIS 2026".split("").map((char, i) => (
                  <tspan key={i} className="mask-letter opacity-0">
                    {char}
                  </tspan>
                ))}
              </text>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="white" mask="url(#textCutout)" />

          {/* Invisible replica for measuring the "S" coordinate */}
          <text
            x="50%" 
            y="54%"
            dominantBaseline="central"
            textAnchor="middle"
            className="font-black text-[11vw] md:text-[15vw] font-outfit tracking-tighter"
            fill="transparent"
            pointerEvents="none"
          >
            PRI<tspan ref={zoomTargetRef}>S</tspan> 2026
          </text>
        </svg>
      </div>

      {/* Scroll indicator */}
      <div 
        ref={hintRef} 
        className="absolute bottom-8 md:bottom-12 left-0 w-full flex flex-col items-center justify-center z-[2] transition-opacity duration-300"
      >
        <div className="flex flex-col items-center gap-4 text-white/70 text-xs font-medium uppercase tracking-[4px]">
          <span>Scroll to Discover</span>
          <ChevronDown className="w-5 h-5 text-white/80 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
