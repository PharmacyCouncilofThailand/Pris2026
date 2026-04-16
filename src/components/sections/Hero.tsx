"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import Countdown from "@/components/elements/Countdown";
import { useAuth } from "@/context/AuthContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Config */
const HERO_CFG = {
  /** How far the user needs to scroll (in vh) to complete the zoom */
  zoomScrollDistance: 1.0,
  /** At what % of the zoom scroll the auto-reveal triggers (0-1) */
  autoTriggerAt: 0.7,
  /** How large the mask scales to reveal the video */
  maskScale: 60,
  /** Logo entrance settings per device */
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
  const t = useTranslations("hero");
  const { isAuthenticated } = useAuth();

  const heroCompleteRef = useRef<boolean>(false);

  // Track if hero has already played (persists across page reloads in the same tab)
  const hasPlayed = () => {
    if (typeof window === "undefined") return false;
    return !!(window as unknown as Record<string, boolean>).__heroPlayed || sessionStorage.getItem('heroPlayed') === 'true';
  };
  const markPlayed = () => {
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, boolean>).__heroPlayed = true;
      sessionStorage.setItem('heroPlayed', 'true');
    }
  };

  const handleRegisterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isAuthenticated) {
      window.location.href = "/registration";
    } else {
      // Pass the redirect parameter so the login page knows to send them back to registration
      window.location.href = "/login?redirect=/registration";
    }
  };

  // On mount: hide navbar during hero intro
  useEffect(() => {
    if (hasPlayed()) {
      heroCompleteRef.current = true;
      document.body.classList.remove("hero-playing");
      return;
    }

    // Hide navbar
    document.body.classList.add("hero-playing");

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    return () => {
      document.body.classList.remove("hero-playing");
    };
  }, []);

  useGSAP(
    () => {
      if (!svgRef.current) return;
      heroCompleteRef.current = false;

      /* Returning visitor: skip all animation */
      if (hasPlayed()) {
        gsap.set(svgRef.current, { display: "none" });
        gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
        gsap.set(countdownRef.current, { opacity: 1, y: 0 });
        gsap.set(buttonsRef.current, { opacity: 1, y: 0 });
        heroCompleteRef.current = true;
        videoRef.current?.play().catch(() => {
          /* noop */
        });
        return;
      }

      /* First visit: full cinematic intro */
      // Initial states
      gsap.set(svgRef.current, { scale: 1, opacity: 1 });
      gsap.set(hintRef.current, { opacity: 0 });
      gsap.set(logoRef.current, { opacity: 0 });
      gsap.set(countdownRef.current, { opacity: 0, y: 30 });
      gsap.set(buttonsRef.current, { opacity: 0, y: 30 });
      // Start video immediately so it shows through the text mask
      videoRef.current?.play().catch(() => { /* autoplay may be blocked */ });

      // Device settings
      const isMobile = window.innerWidth <= 1024; // Treat tablets as mobile for scrolling performance
      const { initialScale, initialY } = isMobile
        ? HERO_CFG.mobile
        : HERO_CFG.desktop;
      gsap.set(logoRef.current, {
        opacity: 0,
        y: initialY,
        scale: initialScale,
      });

      // Calculate zoom origin (center of "S")
      const calcOrigin = () => {
        if (!svgRef.current || !zoomTargetRef.current) return;
        const svg = svgRef.current.getBoundingClientRect();
        const tgt = zoomTargetRef.current.getBoundingClientRect();
        if (svg.width === 0 || svg.height === 0) return;
        const ox = ((tgt.left + tgt.width / 2 - svg.left) / svg.width) * 100;
        const oy = ((tgt.top + tgt.height / 2 - svg.top) / svg.height) * 100;
        gsap.set(svgRef.current, { transformOrigin: `${ox}% ${oy}%` });
      };
      calcOrigin();
      document.fonts?.ready.then(calcOrigin);

      // Lock scroll from the start; wheel events drive the animation
      document.body.style.overflow = "hidden";

      const tlZoom = gsap.timeline({ paused: true });
      tlZoom
        .to(
          svgRef.current,
          {
            scale: HERO_CFG.maskScale,
            ease: "power2.in",
            force3D: true,
            duration: 1,
          },
          0,
        )
        .to(svgRef.current, { opacity: 0, ease: "none", duration: 0.1 }, 0.9)
        .to(hintRef.current, { opacity: 0, duration: 0.1 }, 0);

      // Phase 3 (Auto + Locked): Reveal brand
      const tlAuto = gsap.timeline({
        paused: true,
        onComplete: () => {
          // Unlock scroll & show navbar
          document.body.style.overflow = "";
          document.body.classList.remove("hero-playing");
          heroCompleteRef.current = true;
          markPlayed();
          videoRef.current?.play().catch(() => { /* noop */ });
          gsap.set(svgRef.current, { display: "none" });
        },
      });
      if (isMobile) {
        // Mobile-optimized: Single smooth continuous push (avoids the 0.2s pause gap that looks like stutter)
        tlAuto
          .to(logoRef.current, { opacity: 1, y: 0, scale: 1, ease: "power3.out", duration: 1.4, force3D: true }, 0.2)
          .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 0.8)
          .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 1.0);
      } else {
        // Desktop: Two-phase motion (syncs with the SVG mask scroll)
        tlAuto
          .to(logoRef.current, { opacity: 1, y: initialY, scale: initialScale, ease: "power2.out", duration: 0.8, force3D: true }, 0)
          .to(logoRef.current, { y: 0, scale: 1, ease: "power2.inOut", duration: 0.6, force3D: true }, 1.0)
          .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3)
          .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.9 }, 1.5);
      }

      // Wheel-driven zoom control
      let scrollAccum = 0;
      const maxScroll = window.innerHeight * HERO_CFG.zoomScrollDistance;
      let autoTriggered = false;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (autoTriggered) return; // Already triggered

        scrollAccum = Math.min(maxScroll, Math.max(0, scrollAccum + e.deltaY));
        const progress = scrollAccum / maxScroll;
        tlZoom.progress(progress);

        if (progress >= HERO_CFG.autoTriggerAt) {
          autoTriggered = true;
          window.removeEventListener("wheel", handleWheel);
          gsap.to(tlZoom, {
            progress: 1,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => { tlAuto.play(); },
          });
        }
      };

      const triggerAutoPlay = () => {
        autoTriggered = true;
        gsap.set(svgRef.current, { display: "none" });
        gsap.set(hintRef.current, { display: "none" });
        tlAuto.play();
      };

      const bindInteractions = () => {
        if (isMobile) {
          triggerAutoPlay();
        } else {
          window.addEventListener("wheel", handleWheel, { passive: false });
        }
      };

      // Phase 1 (Auto): Letters stagger in
      const maskLetters = svgRef.current.querySelectorAll(".mask-letter");
      if (isMobile) {
        // Mobile optimization: Skip SVG Mask and Scroll Zoom entirely for performance
        triggerAutoPlay();
      } else if (maskLetters.length) {
        gsap.set(maskLetters, { fill: "white" });
        gsap.to(maskLetters, {
          fill: "black",
          duration: 0.35,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.4,
          onComplete: () => {
            if (!isMobile) {
              gsap.to(hintRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });
            }
            bindInteractions();
          },
        });
      } else {
        if (!isMobile) gsap.set(hintRef.current, { opacity: 1 });
        bindInteractions();
      }

      // NOTE: wheel/touch listeners are added in addScrollListeners()
      // after the letter stagger animation completes

      return () => {
        window.removeEventListener("wheel", handleWheel);
        tlZoom.kill();
        tlAuto.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black flex justify-center items-center isolate"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src="/assets/Img/BG/New BG 30fps.mp4"
        className="absolute inset-0 w-full h-full object-cover transform-gpu opacity-90 z-0 pointer-events-none"
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Hero Content (Behind mask) */}
      <div className="absolute inset-0 w-full h-full z-0 flex flex-col justify-center items-center pointer-events-auto">
        <div ref={logoRef} className="mb-8 md:mb-10 z-[2] will-change-transform transform-gpu" style={{ opacity: 0 }}>
          <Image
            src="/assets/Img/logo/Pris2026-logo.svg"
            alt="PRIS 2026 Logo"
            width={400}
            height={500}
            className="w-full max-w-[340px] md:max-w-[550px] h-auto md:drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            priority
          />
        </div>

        <div
          ref={countdownRef}
          className="w-full flex justify-center mb-8 z-[2]"
          style={{ opacity: 0 }}
        >
          <Countdown />
        </div>

        <div
          ref={buttonsRef}
          className="flex flex-col md:flex-row gap-4 md:gap-5 z-[2] mt-4"
          style={{ opacity: 0 }}
        >
          <Link 
            href="/registration"
            onClick={handleRegisterClick}
            className="group relative inline-flex items-center justify-center bg-white/[0.1] text-white border border-white/20 px-8 py-4 sm:px-10 sm:py-5 md:px-12 rounded-full overflow-hidden transition-all duration-500 hover:border-white/30 hover:bg-white/[0.15] hover:scale-[1.03] shadow-[0_12px_40px_rgba(0,85,255,0.15)]"
          >
            {/* Decorative gradient overlay matching countdown */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-100 pointer-events-none" />

            <span className="relative z-10 text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.2em] flex items-center gap-4">
              {t("registerNow")}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:translate-x-1">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </span>

            {/* Bottom glowing line matching countdown */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100" />
            
            {/* Hover bottom glowing line intensify */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>

      {/* SVG Mask Container */}
      <div className="absolute inset-0 w-full h-full z-[1] pointer-events-none overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full absolute top-0 left-0 will-change-transform transform-gpu"
          style={{ backfaceVisibility: "hidden", perspective: 1000 }}
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
                className="font-black text-[13vw] sm:text-[11vw] md:text-[10vw] font-outfit tracking-tighter"
                fill="black"
              >
                {"PRIS 2026".split("").map((char, i) => (
                  <tspan key={i} className="mask-letter">
                    {char}
                  </tspan>
                ))}
              </text>
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="white"
            mask="url(#textCutout)"
          />

          {/* Invisible replica for measuring the "S" coordinate */}
          <text
            x="50%"
            y="54%"
            dominantBaseline="central"
            textAnchor="middle"
            className="font-black text-[13vw] sm:text-[11vw] md:text-[10vw] font-outfit tracking-tighter"
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
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-4 text-black text-xs font-medium uppercase tracking-[4px]">
          <span>{t('scrollDown')}</span>
          <ChevronDown className="w-5 h-5 text-black animate-bounce" />
        </div>
      </div>
    </section>
  );
}
