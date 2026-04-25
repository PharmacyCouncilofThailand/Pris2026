"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin, CalendarDays } from "lucide-react";
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
  const infoRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);

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
        gsap.set(infoRef.current, { opacity: 1, y: 0 });
        gsap.set(buttonsRef.current, { opacity: 1, y: 0 });
        gsap.set(partnersRef.current, { opacity: 1, y: 0 });
        heroCompleteRef.current = true;

        return;
      }

      /* First visit: full cinematic intro */
      // Initial states
      gsap.set(svgRef.current, { scale: 1, opacity: 1 });
      gsap.set(hintRef.current, { opacity: 0 });
      gsap.set(logoRef.current, { opacity: 0 });
      gsap.set(infoRef.current, { opacity: 0, y: 30 });
      gsap.set(countdownRef.current, { opacity: 0, y: 30 });
      gsap.set(buttonsRef.current, { opacity: 0, y: 30 });
      gsap.set(partnersRef.current, { opacity: 0, y: 20 });
      // Start video immediately so it shows through the text mask


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
      document.documentElement.style.overflow = "hidden";

      const preventKeyScroll = (e: KeyboardEvent) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
          e.preventDefault();
        }
      };
      
      const preventPostZoomWheel = (e: WheelEvent) => e.preventDefault();
      const preventTouchMove = (e: TouchEvent | Event) => e.preventDefault();

      // Block keyboard scrolling immediately
      window.addEventListener("keydown", preventKeyScroll, { passive: false });
      window.addEventListener("touchmove", preventTouchMove, { passive: false });

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
          document.documentElement.style.overflow = "";
          window.removeEventListener("keydown", preventKeyScroll);
          window.removeEventListener("wheel", preventPostZoomWheel);
          window.removeEventListener("touchmove", preventTouchMove);
          document.body.classList.remove("hero-playing");
          heroCompleteRef.current = true;
          markPlayed();

          gsap.set(svgRef.current, { display: "none" });
        },
      });
      if (isMobile) {
        // Mobile-optimized: Single smooth continuous push (avoids the 0.2s pause gap that looks like stutter)
        tlAuto
          .to(logoRef.current, { opacity: 1, y: 0, scale: 1, ease: "power3.out", duration: 1.4, force3D: true }, 0.2)
          .fromTo(infoRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 0.8)
          .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 0.8)
          .fromTo(partnersRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: "power3.out", duration: 0.8 }, 1.0)
          .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 1.4);
      } else {
        // Desktop: Two-phase motion (syncs with the SVG mask scroll)
        tlAuto
          .to(logoRef.current, { opacity: 1, y: initialY, scale: initialScale, ease: "power2.out", duration: 0.8, force3D: true }, 0)
          .to(logoRef.current, { y: 0, scale: 1, ease: "power2.inOut", duration: 0.6, force3D: true }, 1.0)
          .fromTo(infoRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3)
          .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3)
          .fromTo(partnersRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.7 }, 1.5)
          .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.9 }, 1.9);
      }

      // Wheel-driven zoom control
      let scrollAccum = 0;
      const maxScroll = window.innerHeight * HERO_CFG.zoomScrollDistance;
      let autoTriggered = false;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (autoTriggered) return; // Already triggered

        // Kill any pending fade-in of hintRef to prevent conflict with tlZoom
        gsap.killTweensOf(hintRef.current, "opacity");

        scrollAccum = Math.min(maxScroll, Math.max(0, scrollAccum + e.deltaY));
        const progress = scrollAccum / maxScroll;
        tlZoom.progress(progress);

        if (progress >= HERO_CFG.autoTriggerAt) {
          autoTriggered = true;
          window.removeEventListener("wheel", handleWheel);
          window.addEventListener("wheel", preventPostZoomWheel, { passive: false });
          gsap.to(tlZoom, {
            progress: 1,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => { 
              gsap.set(hintRef.current, { display: "none" });
              tlAuto.play(); 
            },
          });
        }
      };

      const triggerAutoPlay = () => {
        autoTriggered = true;
        gsap.killTweensOf(hintRef.current);
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
            bindInteractions();
          },
        });
        
        // Show scroll down hint earlier, independent of mask animation completion
        if (!isMobile) {
          gsap.to(hintRef.current, { opacity: 1, duration: 0.8, delay: 0.6, ease: "power2.out" });
        }
      } else {
        if (!isMobile) gsap.set(hintRef.current, { opacity: 1 });
        bindInteractions();
      }

      // NOTE: wheel/touch listeners are added in addScrollListeners()
      // after the letter stagger animation completes

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("wheel", preventPostZoomWheel);
        window.removeEventListener("keydown", preventKeyScroll);
        window.removeEventListener("touchmove", preventTouchMove);
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        tlZoom.kill();
        tlAuto.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[100svh] overflow-hidden bg-black flex flex-col justify-center items-center isolate"
    >
      {/* Background: BG2Monly.webp for mobile, BGonly.webp for desktop */}
      <Image
        src="/assets/Img/BG/BG2Monly.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={90}
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0 pointer-events-none lg:hidden"
      />
      <Image
        src="/assets/Img/BG/BGonly.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={90}
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0 pointer-events-none hidden lg:block"
      />

      {/* Subtle vignette overlay for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* Hero Content */}
      <div className="relative z-[2] w-full min-h-[100svh] flex flex-col items-center pointer-events-auto px-4 pt-[130px] md:pt-[160px] pb-2 text-center">

        {/* Main Content Wrapper (Centered) */}
        <div className="flex-1 w-full flex flex-col justify-center items-center pb-4 md:pb-8 mt-12 md:mt-20">

        {/* Logo */}
        <div
          ref={logoRef}
          className="z-[2] will-change-transform transform-gpu flex flex-col items-center mb-4 md:mb-6"
          style={{ opacity: 0 }}
        >
          <Image
            src="/assets/Img/logo/LOGO1.png"
            alt="PRIS 2026 Logo"
            width={400}
            height={500}
            className="w-[85vw] max-w-[420px] md:max-w-[680px] h-auto drop-shadow-2xl"
            priority
          />
        </div>

        {/* Thin divider */}
        <div
          ref={infoRef}
          className="z-[2] w-full max-w-xl flex flex-col items-center gap-3 md:gap-4"
          style={{ opacity: 0 }}
        >
          {/* Horizontal rule */}
          <div className="w-24 h-px bg-white/20" />

          {/* Date + Location */}
          <div className="flex flex-col items-center gap-2.5 sm:gap-3 text-white/80 text-xs sm:text-sm tracking-widest uppercase font-medium text-center">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 opacity-70 shrink-0" />
              15 – 16 October 2025
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 opacity-70 shrink-0" />
              IMPACT Challenger, Muang Thong Thani
            </span>
          </div>

          {/* Organizer — subtle, small */}
          <p className="text-white/50 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-center mt-1 md:mt-2">
            Organized by The Pharmacy Council of Thailand
          </p>
        </div>

        {/* Countdown — on Desktop stays at top due to md:mb-auto, on Mobile sits above button */}
        <div
          ref={countdownRef}
          className="w-full flex justify-center mt-2 md:mt-4 mb-6 md:mb-auto z-[2]"
          style={{ opacity: 0 }}
        >
          <div className="scale-[0.88] md:scale-[0.95] origin-center">
            <Countdown />
          </div>
        </div>

        {/* Register Button */}
        <div
          ref={buttonsRef}
          className="z-[2]"
          style={{ opacity: 0 }}
        >
          <Link
            href="/registration"
            onClick={handleRegisterClick}
            className="group relative inline-flex items-center gap-4 px-10 md:px-14 py-5 md:py-6 rounded-full text-white transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] z-10"
          >
            {/* Outer pulsing glow (GPU accelerated) */}
            <div className="absolute inset-[-6px] rounded-full bg-gradient-to-r from-[#ff7300] to-[#ffb74d] blur-md opacity-30 group-hover:opacity-70 animate-[gentle-pulse_3s_ease-in-out_infinite] -z-10" />

            {/* Main Button Background with border */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7300] to-[#e65c00] border border-[#ffb74d]/40 rounded-full shadow-[0_0_25px_rgba(255,115,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:from-[#ff8c00] group-hover:to-[#ff7300] group-hover:border-[#ffd54f]/60 transition-all duration-500 -z-10 overflow-hidden">
              
              {/* Continuous shimmer sweep */}
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-sweep_3.5s_infinite_ease-in-out]" />
              
              {/* Bottom accent line for 3D depth */}
              <div className="absolute bottom-0 left-[15%] w-[70%] h-[2px] bg-gradient-to-r from-transparent via-[#ffb74d]/70 to-transparent rounded-sm" />
            </div>
            
            <span className="relative z-10 text-[0.9375rem] sm:text-[1.0625rem] md:text-[1.15rem] font-bold tracking-[0.2em] uppercase text-white/90 group-hover:text-white transition-colors">
              {t("registerNow")}
            </span>
            <span className="relative z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 group-hover:bg-white/25 group-hover:translate-x-[4px] transition-all duration-300 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
        </div>

        {/* ── Official Partners ── */}
        <div
          ref={partnersRef}
          className="w-full flex justify-center mt-2 md:mt-4 flex-col items-center overflow-hidden pb-1 order-3"
          style={{ opacity: 0 }}
        >
          {/* Subtle top border */}
          <div className="w-full border-t border-white/8 mb-2 md:mb-3" />

          <span className="text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em] mb-2 md:mb-3">
            Official Partners
          </span>

          {/* Partner logos marquee — full width edge-to-edge */}
          <div className="relative w-full overflow-hidden">
            <div className="flex w-max animate-partner-scroll items-center will-change-transform transform-gpu py-1">
              {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  {[
                    { name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png", scale: "scale-[1.4]" },
                    { name: "Royal College of Pharmacy of Thailand", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png", scale: "scale-[1.5]" },
                    { name: "Pharmacy Administration College", logo: "/assets/Img/sponsors/วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย.png", scale: "" },
                    { name: "Consumer Protection Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยคุ้มครอง.png", scale: "scale-[1.4]" },
                    { name: "Community Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมชุมชน.png", scale: "" },
                    { name: "Herbal Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย.png", scale: "" },
                    { name: "Industrial Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย.png", scale: "" },
                    { name: "Pharmacotherapy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชบำบัด.png", scale: "scale-[1.4]" },
                    { name: "CPPGX", logo: "/assets/Img/sponsors/CPPGX.png", scale: "scale-[0.85]" },
                  ].map((partner, index) => (
                    <div
                      key={`partner-${i}-${index}`}
                      className="mx-6 md:mx-9 flex items-center justify-center flex-shrink-0"
                    >
                      <div className="relative h-16 w-16 md:h-[65px] md:w-[65px] flex items-center justify-center">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          sizes="80px"
                          className={`object-contain ${partner.scale}`}
                        />
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes partner-scroll {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-33.333%, 0, 0); }
          }
          .animate-partner-scroll {
            animation: partner-scroll 35s linear infinite;
          }
          @keyframes shimmer-sweep {
            0% { transform: translate3d(-200%, 0, 0) skewX(-25deg); }
            100% { transform: translate3d(300%, 0, 0) skewX(-25deg); }
          }
          @keyframes gentle-pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.03); }
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-partner-scroll, .animate-\\[shimmer-sweep_3\\.5s_infinite_ease-in-out\\], .animate-\\[gentle-pulse_3s_ease-in-out_infinite\\] {
              animation: none;
            }
          }
        `}} />
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
            <linearGradient id="prisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0055FF" />
              <stop offset="100%" stopColor="#FF5A00" />
            </linearGradient>
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

          {/* Gradient text to fill the cutout instead of video (per user request) */}
          <text
            x="50%"
            y="54%"
            dominantBaseline="central"
            textAnchor="middle"
            className="font-black text-[13vw] sm:text-[11vw] md:text-[10vw] font-outfit tracking-tighter"
            fill="url(#prisGradient)"
            pointerEvents="none"
          >
            {"PRIS 2026"}
          </text>



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
        <div className="flex flex-col items-center gap-3 text-black text-[9px] font-medium uppercase tracking-[5px]">
          <span>{t('scrollDown')}</span>
          <ChevronDown className="w-4 h-4 text-black animate-bounce" />
        </div>
      </div>
    </section>
  );
}
