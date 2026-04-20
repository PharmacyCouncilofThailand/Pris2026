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
        gsap.set(infoRef.current, { opacity: 1, y: 0 });
        gsap.set(buttonsRef.current, { opacity: 1, y: 0 });
        gsap.set(partnersRef.current, { opacity: 1, y: 0 });
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
      gsap.set(infoRef.current, { opacity: 0, y: 30 });
      gsap.set(countdownRef.current, { opacity: 0, y: 30 });
      gsap.set(buttonsRef.current, { opacity: 0, y: 30 });
      gsap.set(partnersRef.current, { opacity: 0, y: 20 });
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
          videoRef.current?.play().catch(() => { /* noop */ });
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
      className="relative w-full h-screen overflow-hidden bg-black flex justify-center items-center isolate"
    >
      {/* Background: Static image on mobile, Video on desktop */}
      <Image
        src="/assets/Img/BG/BG-mobile-1080.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0 pointer-events-none lg:hidden"
      />
      <video
        ref={videoRef}
        src="/assets/Img/BG/New BG 30fps.mp4"
        className="absolute inset-0 w-full h-full object-cover transform-gpu opacity-90 z-0 pointer-events-none hidden lg:block"
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Subtle vignette overlay for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* Hero Content */}
      <div className="absolute inset-0 w-full h-full z-0 flex flex-col justify-center items-center pointer-events-auto px-4">

        {/* Logo */}
        <div
          ref={logoRef}
          className="z-[2] will-change-transform transform-gpu flex flex-col items-center mb-6 md:mb-8"
          style={{ opacity: 0 }}
        >
          <Image
            src="/assets/Img/logo/Pris2026-logo.svg"
            alt="PRIS 2026 Logo"
            width={400}
            height={500}
            className="w-full max-w-[340px] md:max-w-[680px] h-auto drop-shadow-2xl"
            priority
          />
        </div>

        {/* Thin divider */}
        <div
          ref={infoRef}
          className="z-[2] w-full max-w-xl flex flex-col items-center gap-4 md:gap-5"
          style={{ opacity: 0 }}
        >
          {/* Horizontal rule */}
          <div className="w-24 h-px bg-white/20" />

          {/* Date + Location — one clean row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5 text-white/75 text-[10px] sm:text-xs tracking-widest uppercase font-medium text-center">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 opacity-60 shrink-0" />
              15 – 16 October 2025
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 opacity-60 shrink-0" />
              IMPACT Challenger, Bangkok
            </span>
          </div>

          {/* Organizer — subtle, small */}
          <p className="text-white/40 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-center">
            Organized by The Pharmacy Council of Thailand
          </p>
        </div>

        {/* Countdown */}
        <div
          ref={countdownRef}
          className="w-full flex justify-center mt-6 md:mt-8 mb-5 md:mb-7 z-[2]"
          style={{ opacity: 0 }}
        >
          <div className="scale-[0.78] md:scale-[0.82] origin-center">
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
            className="hero-register-btn"
          >
            <span className="text_button flex items-center gap-4">
              {t("registerNow")}
              <span className="hero-register-btn__arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </span>
          </Link>
        </div>

        {/* ── Official Partners ── */}
        <div
          ref={partnersRef}
          className="absolute bottom-0 left-0 right-0 z-[2] flex flex-col items-center w-full overflow-hidden pb-5 md:pb-7"
          style={{ opacity: 0 }}
        >
          {/* Subtle top border */}
          <div className="w-full border-t border-white/8 mb-4 md:mb-5" />

          <span className="text-white/35 text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.35em] mb-3.5">
            Official Partners
          </span>

          {/* Partner logos marquee — no fade edges */}
          <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
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
                  ].map((partner, index) => (
                    <div
                      key={`partner-${i}-${index}`}
                      className="mx-6 md:mx-9 flex items-center justify-center flex-shrink-0"
                    >
                      <div className="h-14 w-14 md:h-[60px] md:w-[60px] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className={`object-contain w-full h-full ${partner.scale}`}
                          loading="lazy"
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
          @media (prefers-reduced-motion: reduce) {
            .animate-partner-scroll {
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
        <div className="flex flex-col items-center gap-3 text-black text-[9px] font-medium uppercase tracking-[5px]">
          <span>{t('scrollDown')}</span>
          <ChevronDown className="w-4 h-4 text-black animate-bounce" />
        </div>
      </div>
    </section>
  );
}
