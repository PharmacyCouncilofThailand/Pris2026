"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Countdown from "@/components/elements/Countdown";
import { useAuth } from "@/context/AuthContext";
import { REGISTRATION_OPEN, ABSTRACT_OPEN } from "@/lib/registrationGate";

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

const INTRO_TEXT = "PRIS 2026";
const INTRO_CHARS = INTRO_TEXT.split("");

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLSpanElement>(null);
  const zoomTargetRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const subtextInnerRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("hero");
  const tg = useTranslations("registrationGate");
  const locale = useLocale();
  const isThai = locale === "th";
  const headingTracking = isThai ? "tracking-normal" : "tracking-[0.07em]";
  const detailTracking = isThai ? "tracking-normal" : "tracking-[0.11em]";
  const buttonTracking = isThai ? "tracking-normal" : "tracking-[0.16em] sm:tracking-[0.2em]";
  const noticeTracking = isThai ? "tracking-normal" : "tracking-[0.04em]";
  const countdownTracking = isThai ? "tracking-normal" : "tracking-[0.26em] sm:tracking-[0.34em]";
  const scrollTracking = isThai ? "tracking-normal" : "tracking-[0.18em]";
  const buttonLabelClass = "relative justify-self-center whitespace-nowrap text-[0.8rem] font-black leading-tight sm:text-base max-md:landscape:text-[0.68rem]";
  const organizerParts = t.raw("organizerParts") as string[];
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

  // Keep background video playing at all times
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const ensurePlaying = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    // Resume if the browser pauses the video (e.g. resource-saving)
    video.addEventListener("pause", ensurePlaying);

    // Resume when the user returns to the tab
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        ensurePlaying();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      video.removeEventListener("pause", ensurePlaying);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useGSAP(
    () => {
      if (!maskRef.current) return;
      heroCompleteRef.current = false;

      /* Returning visitor: skip all animation */
      if (hasPlayed()) {
        gsap.set(maskRef.current, { display: "none" });
        gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
        gsap.set(countdownRef.current, { opacity: 1, y: 0 });
        gsap.set(infoRef.current, { opacity: 1, y: 0 });
        gsap.set(buttonsRef.current, { opacity: 1, y: 0 });
        gsap.set(subtextRef.current, { display: "none" });
        heroCompleteRef.current = true;

        return;
      }

      /* First visit: full cinematic intro */
      // Initial states
      gsap.set(maskRef.current, { scale: 1, opacity: 1 });
      gsap.set(hintRef.current, { opacity: 0 });
      gsap.set(logoRef.current, { opacity: 0 });
      gsap.set(infoRef.current, { opacity: 0, y: 30 });
      gsap.set(countdownRef.current, { opacity: 0, y: 30 });
      gsap.set(buttonsRef.current, { opacity: 0, y: 30 });

      // Device settings
      const isMobile = window.innerWidth <= 1024; // Treat tablets as mobile for scrolling performance
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldSkipIntro = isMobile || prefersReducedMotion;
      const { initialScale, initialY } = isMobile
        ? HERO_CFG.mobile
        : HERO_CFG.desktop;
        
      const initialX = 0;

      gsap.set(logoRef.current, {
        opacity: 0,
        y: initialY,
        x: initialX,
        scale: initialScale,
        transformOrigin: "center center"
      });

      // Calculate zoom origin (center of "S")
      const calcOrigin = () => {
        if (!maskRef.current || !zoomTargetRef.current) return;
        const container = maskRef.current.getBoundingClientRect();
        const tgt = zoomTargetRef.current.getBoundingClientRect();
        if (container.width === 0 || container.height === 0) return;
        const ox = ((tgt.left + tgt.width / 2 - container.left) / container.width) * 100;
        const oy = ((tgt.top + tgt.height / 2 - container.top) / container.height) * 100;
        gsap.set(maskRef.current, { transformOrigin: `${ox}% ${oy}%` });
      };
      
      const updateSubtextWidth = () => {
        if (!mainTextRef.current || !subtextInnerRef.current || !subtextRef.current || !containerRef.current) return;
        const mainRect = mainTextRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (mainRect.width > 0) {
          // Position tightly under the PRIS 2026 text
          // Subtract a small percentage of height to account for font descender space
          const relativeTop = mainRect.bottom - containerRect.top;
          subtextRef.current.style.top = `${relativeTop - (mainRect.height * 0.1)}px`; 

          // Measure and scale to perfectly match width
          subtextInnerRef.current.style.transform = 'none';
          const naturalWidth = subtextInnerRef.current.getBoundingClientRect().width;
          
          if (naturalWidth > 0) {
            const scale = (mainRect.width / naturalWidth) * 0.92; // Reduce size to fit inside visible glyphs
            subtextInnerRef.current.style.transform = `scale(${scale})`;
          }
        }
      };

      // Set initial sizes
      calcOrigin();
      updateSubtextWidth();
      document.fonts?.ready.then(() => {
        calcOrigin();
        updateSubtextWidth();
      });

      window.addEventListener("resize", updateSubtextWidth);

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
      if (isMobile) {
        window.addEventListener("touchmove", preventTouchMove, { passive: false });
      }

      const tlZoom = gsap.timeline({ paused: true });
      tlZoom
        .to(
          maskRef.current,
          {
            scale: HERO_CFG.maskScale,
            ease: "power2.in",
            force3D: true,
            duration: 1,
          },
          0,
        )
        .to(maskRef.current, { opacity: 0, ease: "none", duration: 0.1 }, 0.9)
        .to(hintRef.current, { opacity: 0, duration: 0.1 }, 0)
        .to(subtextRef.current, { opacity: 0, duration: 0.1 }, 0);

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

          gsap.set(maskRef.current, { display: "none" });
          gsap.set(subtextRef.current, { display: "none" });
        },
      });
      if (isMobile) {
        // Mobile-optimized: Single smooth continuous push
        tlAuto
          .to(logoRef.current, { opacity: 1, y: 0, x: 0, scale: 1, ease: "power3.out", duration: 1.4, force3D: true }, 0.2)
          .fromTo(infoRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 0.8)
          .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 0.8)
          .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out", duration: 1.0 }, 0.8);
      } else {
        // Desktop: Two-phase motion (syncs with the SVG mask scroll)
        tlAuto
          .to(logoRef.current, { opacity: 1, y: initialY, x: initialX, scale: initialScale, ease: "power2.out", duration: 0.8, force3D: true }, 0)
          .to(logoRef.current, { y: 0, x: 0, scale: 1, ease: "power2.inOut", duration: 0.6, force3D: true }, 1.0)
          .fromTo(infoRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3)
          .fromTo(countdownRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3)
          .fromTo(buttonsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 1.3);
      }

      // Wheel-driven zoom control
      let scrollAccum = 0;
      const maxScroll = window.innerHeight * HERO_CFG.zoomScrollDistance;
      let autoTriggered = false;
      let hintTweenKilled = false;
      let wheelRaf = 0;

      const flushWheelProgress = () => {
        wheelRaf = 0;
        const progress = scrollAccum / maxScroll;
        tlZoom.progress(progress);

        if (progress >= HERO_CFG.autoTriggerAt) {
          autoTriggered = true;
          window.removeEventListener("wheel", handleWheel);
          window.addEventListener("wheel", preventPostZoomWheel, { passive: false });
          gsap.to(tlZoom, {
            progress: 1,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => { 
              gsap.set(hintRef.current, { display: "none" });
              tlAuto.play(); 
            },
          });
        }
      };

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (autoTriggered) return; // Already triggered

        if (!hintTweenKilled) {
          gsap.killTweensOf(hintRef.current, "opacity");
          hintTweenKilled = true;
        }

        scrollAccum = Math.min(maxScroll, Math.max(0, scrollAccum + e.deltaY));
        if (!wheelRaf) {
          wheelRaf = window.requestAnimationFrame(flushWheelProgress);
        }
      };

      const triggerAutoPlay = () => {
        autoTriggered = true;
        if (wheelRaf) {
          window.cancelAnimationFrame(wheelRaf);
          wheelRaf = 0;
        }
        gsap.killTweensOf(hintRef.current);
        gsap.killTweensOf(subtextRef.current);
        gsap.set(maskRef.current, { display: "none" });
        gsap.set(hintRef.current, { display: "none" });
        gsap.set(subtextRef.current, { display: "none" });
        tlAuto.play();
      };

      const bindInteractions = () => {
        if (shouldSkipIntro) {
          triggerAutoPlay();
        } else {
          window.addEventListener("wheel", handleWheel, { passive: false });
        }
      };

      // Phase 1 (Auto): Letters stagger in
      const gradientLetters = maskRef.current!.querySelectorAll(".gradient-letter");
      
      if (shouldSkipIntro) {
        // Mobile/reduced-motion optimization: skip the SVG zoom intro.
        triggerAutoPlay();
      } else if (gradientLetters.length) {
        gsap.set(gradientLetters, { opacity: 0 }); // Hide gradient text initially
        
        gsap.to(gradientLetters, {
          opacity: 1,
          duration: 0.35,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.4,
          onComplete: () => {
            bindInteractions();
          },
        });
        
        // Show scroll down hint earlier, independent of animation completion
        if (!isMobile) {
          gsap.to(hintRef.current, { opacity: 1, duration: 0.8, delay: 0.6, ease: "power2.out" });
        }
        
        // Fade in subtext alongside PRIS 2026
        const subtextParts = subtextRef.current?.querySelectorAll(".subtext-part");
        if (subtextParts) {
          gsap.set(subtextParts, { opacity: 0 });
          gsap.to(subtextParts, {
            opacity: 1,
            duration: 0.35,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.4,
          });
        }
      } else {
        if (!isMobile) gsap.set(hintRef.current, { opacity: 1 });
        const subtextParts = subtextRef.current?.querySelectorAll(".subtext-part");
        if (subtextParts) gsap.set(subtextParts, { opacity: 1 });
        bindInteractions();
      }

      return () => {
        window.removeEventListener("resize", updateSubtextWidth);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("wheel", preventPostZoomWheel);
        window.removeEventListener("keydown", preventKeyScroll);
        window.removeEventListener("touchmove", preventTouchMove);
        if (wheelRaf) {
          window.cancelAnimationFrame(wheelRaf);
        }
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
      lang={locale}
      className="font-heading relative isolate w-full min-h-[100svh] md:portrait:min-h-0 lg:portrait:min-h-0 overflow-x-hidden bg-[#04050d] text-white min-[1280px]:min-h-[100svh]"
    >
      <video
        ref={videoRef}
        src="https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20Hero%20Section/BG%20LOOP.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ objectPosition: "center top" }}
      />

      <div
        className="absolute inset-0 z-[1] pointer-events-none lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,5,14,0.3) 0%, rgba(3,5,14,0.72) 46%, rgba(3,5,14,0.94) 100%)",
        }}
      />
      {/* Desktop: centre vignette so text is always readable over the video */}
      <div
        className="absolute inset-0 z-[1] hidden pointer-events-none lg:block"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% 48%, rgba(3,5,14,0.52) 0%, rgba(3,5,14,0.28) 50%, rgba(3,5,14,0.10) 80%, transparent 100%)",
        }}
      />

      {/* Hero Content */}
      <div className="relative z-[2] mx-auto flex min-h-[100svh] md:portrait:min-h-0 lg:portrait:min-h-0 w-full max-w-[1920px] flex-col px-4 pb-6 pt-16 sm:px-8 sm:pt-20 md:px-10 md:pb-[7vh] md:pt-[7vh] md:portrait:px-[5.2vw] md:portrait:pb-[2.6vh] md:portrait:pt-[7.2vh] min-[1280px]:min-h-[100svh] min-[1280px]:px-[8vw] min-[1280px]:pb-[2.2vh] min-[1280px]:pt-[5.6rem] min-[1280px]:max-[1439px]:landscape:pt-[9.2rem] max-md:landscape:pb-5 max-md:landscape:pt-12 pointer-events-auto">
        <div className="mx-auto flex w-full flex-col items-center md:max-w-[820px] md:portrait:max-w-none min-[1280px]:mx-auto min-[1280px]:max-w-[80vw]">
          <div ref={logoRef} className="will-change-transform transform-gpu flex flex-col items-center" style={{ opacity: 0 }}>
            <div className="flex translate-y-6 items-center justify-center gap-4 sm:gap-6 lg:gap-5 md:portrait:gap-5 max-md:landscape:translate-y-3 max-md:landscape:gap-3">
              <div className="relative h-16 w-16 sm:h-[5.25rem] sm:w-[5.25rem] md:portrait:h-[4.6rem] md:portrait:w-[4.6rem] lg:h-[5.5vw] lg:w-[5.5vw] lg:max-h-[84px] lg:max-w-[84px] max-md:landscape:h-12 max-md:landscape:w-12">
                <Image
                  src="/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png"
                  alt="The Pharmacy Council of Thailand"
                  fill
                  sizes="112px"
                  className="scale-[1.05] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] [filter:drop-shadow(0_0_18px_rgba(255,255,255,0.35))_drop-shadow(0_4px_12px_rgba(0,0,0,0.6))]"
                />
              </div>
              <div className="relative h-16 w-16 sm:h-[5.25rem] sm:w-[5.25rem] md:portrait:h-[4.6rem] md:portrait:w-[4.6rem] lg:h-[5.5vw] lg:w-[5.5vw] lg:max-h-[84px] lg:max-w-[84px] max-md:landscape:h-12 max-md:landscape:w-12">
                <Image
                  src="/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png"
                  alt="Royal College of Pharmacy of Thailand"
                  fill
                  sizes="112px"
                  className="scale-[1.35] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] [filter:drop-shadow(0_0_18px_rgba(255,255,255,0.35))_drop-shadow(0_4px_12px_rgba(0,0,0,0.6))]"
                />
              </div>
            </div>

            <div className="mt-9 sm:mt-9 lg:mt-[1.6vh] md:portrait:mt-[2.8vh] min-[1280px]:portrait:mt-[1.6vh] max-md:landscape:mt-3 flex justify-center w-full">
              <Image
                src="/assets/Img/logo/Logo-Final .png"
                alt="2nd PRIS 2026 Pharmacy Research and Innovation Summit"
                width={982}
                height={268}
                priority
                className="h-auto w-full max-w-[min(94vw,620px)] sm:max-w-[780px] md:portrait:max-w-[min(88vw,900px)] lg:max-w-[min(50vw,780px)] max-md:landscape:max-w-[360px] drop-shadow-[0_0_24px_rgba(71,139,255,0.34)]"
              />
            </div>
          </div>

          <div ref={infoRef} className="will-change-transform transform-gpu flex flex-col items-center" style={{ opacity: 0 }}>
            <div className="mt-4 sm:mt-10 lg:mt-[2.2vh] md:portrait:mt-[4.1vh] min-[1280px]:portrait:mt-[2.2vh] max-md:landscape:mt-4 text-center flex justify-center w-full">
              <h1 className={`max-w-[1060px] text-center text-[1.85rem] font-black uppercase leading-[1.14] ${headingTracking} text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.5)] min-[380px]:text-[2.1rem] sm:text-[2.65rem] md:text-[3.05rem] md:portrait:text-[clamp(2.75rem,5.3vw,3.55rem)] lg:text-[clamp(2.05rem,2.25vw,2.95rem)] max-md:landscape:text-[1.45rem] max-md:landscape:leading-[1.08]`}>
                {t("headingLine1")}
                <span className="block">{t("headingLine2")}</span>
              </h1>
            </div>

            <div className="mt-7 w-full max-w-[880px] md:portrait:max-w-[920px] lg:mt-[2.8vh] md:portrait:mt-[3.4vh] min-[1280px]:portrait:mt-[2.8vh] max-md:landscape:mt-4">
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-x-7 sm:gap-y-0 md:portrait:grid-cols-1 md:portrait:gap-4 max-md:landscape:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] max-md:landscape:gap-x-4">
                {/* Date */}
                <div className="flex items-start justify-center gap-2.5 sm:justify-end sm:pt-1 md:portrait:justify-center max-md:landscape:justify-end">
                  <CalendarDays
                    aria-hidden="true"
                    className="-mt-0.5 h-6 w-6 shrink-0 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:portrait:h-6 md:portrait:w-6 lg:h-6 lg:w-6 max-md:landscape:h-5 max-md:landscape:w-5"
                  />
                  <p className={`max-w-[16rem] text-center text-[1.08rem] font-black uppercase leading-tight ${detailTracking} text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.5)] sm:text-right sm:text-[1.22rem] md:text-[1.32rem] md:portrait:text-center lg:text-[1.1rem] max-md:landscape:text-right max-md:landscape:text-[0.88rem]`}>
                    {t("date")}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden h-14 w-px shrink-0 self-center bg-gradient-to-b from-transparent via-white/28 to-transparent sm:block md:portrait:hidden max-md:landscape:block max-md:landscape:h-10" />
                <div className="mx-auto h-px w-14 bg-gradient-to-r from-transparent via-white/28 to-transparent sm:hidden md:portrait:block max-md:landscape:hidden" />

                {/* Venue */}
                <div className="flex justify-center sm:justify-start md:portrait:justify-center max-md:landscape:justify-start">
                  <div className="flex max-w-sm items-start gap-x-2.5 text-center sm:text-left md:portrait:mx-auto md:portrait:text-center max-md:landscape:text-left">
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 h-6 w-6 shrink-0 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:portrait:h-6 md:portrait:w-6 lg:h-6 lg:w-6 max-md:landscape:h-5 max-md:landscape:w-5"
                    />
                    <div className="flex flex-col gap-y-0.5">
                      <p className={`text-[1.08rem] font-black uppercase leading-tight ${detailTracking} text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.5)] sm:text-[1.22rem] md:text-[1.32rem] lg:text-[1.1rem] max-md:landscape:text-[0.88rem]`}>
                        {t("venueTitle")}
                      </p>
                      {t("venueLocationNameTh") ? (
                        <p className={`text-[1.08rem] font-black uppercase leading-tight ${detailTracking} text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.5)] sm:text-[1.22rem] md:text-[1.32rem] lg:text-[1.1rem] max-md:landscape:text-[0.88rem]`}>
                          {t("venueLocationNameTh")}
                        </p>
                      ) : null}
                      {t("venueLocationNameEn") ? (
                        <p className={`text-[1.08rem] font-black uppercase leading-tight ${detailTracking} text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.5)] sm:text-[1.22rem] md:text-[1.32rem] lg:text-[1.1rem] max-md:landscape:text-[0.88rem]`}>
                          {t("venueLocationNameEn")}
                        </p>
                      ) : null}
                      <p className={`text-[1.08rem] font-black uppercase leading-tight ${detailTracking} text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.5)] sm:text-[1.22rem] md:text-[1.32rem] lg:text-[1.1rem] max-md:landscape:text-[0.88rem]`}>
                        {t("venueRegion")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={buttonsRef} className="will-change-transform transform-gpu flex flex-col items-center w-full" style={{ opacity: 0 }}>
            <div className="mt-7 grid w-full max-w-[760px] grid-cols-1 gap-4 sm:grid-cols-2 md:portrait:mt-[4.6vh] md:portrait:max-w-none md:portrait:gap-5 min-[1280px]:mt-[2.8vh] max-md:landscape:mt-4 max-md:landscape:grid-cols-2 max-md:landscape:gap-3">
              {REGISTRATION_OPEN ? (
                <Link
                  href="/registration"
                  onClick={handleRegisterClick}
                  className={`group relative grid min-h-[64px] grid-cols-[1.75rem_1fr_1.75rem] items-center gap-3 overflow-hidden rounded-full border border-[#ff8a24] bg-[#ff6a00] px-5 text-center text-[0.8rem] font-black uppercase ${buttonTracking} text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-18px_38px_rgba(140,43,0,0.22),0_0_30px_rgba(255,112,20,0.38),0_14px_34px_rgba(0,0,0,0.42)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#ffc078] hover:bg-[#ff7a1a] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-18px_42px_rgba(140,43,0,0.24),0_0_48px_rgba(255,122,26,0.62),0_18px_42px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.99] sm:min-h-[76px] sm:grid-cols-[2rem_1fr_2rem] sm:gap-4 sm:px-7 sm:text-base md:portrait:min-h-[70px] lg:min-h-[72px] max-md:landscape:min-h-[52px] max-md:landscape:text-[0.68rem]`}
                >
                  <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,221,177,0.52),transparent_58%)]" />
                  <span className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-75 transition group-hover:via-[#07101f]" />
                  <span className="absolute -left-1/3 top-0 h-full w-1/3 skew-x-[-18deg] bg-white/26 opacity-0 blur-sm transition duration-700 group-hover:left-[115%] group-hover:opacity-100" />
                  <span className="relative justify-self-start h-2 w-2 rounded-full bg-white opacity-85 shadow-[0_0_18px_rgba(255,255,255,0.9)] transition group-hover:scale-[1.7] group-hover:opacity-100" />
                  <span className={`${buttonLabelClass} drop-shadow-[0_0_12px_rgba(100,28,0,0.32)]`}>{t("registerNow")}</span>
                  <span className="relative flex h-7 w-7 items-center justify-center justify-self-end rounded-full border border-white/18 bg-white text-[#ff6a00] shadow-[0_0_16px_rgba(255,255,255,0.28)] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#07101f] group-hover:text-white sm:h-8 sm:w-8">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  title={tg("registrationNotice")}
                  className="relative flex min-h-[64px] items-center justify-center gap-2 overflow-hidden rounded-full border border-[#ff8a24] bg-[#ff6a00] px-5 text-center font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_26px_rgba(0,0,0,0.35)] cursor-not-allowed select-none sm:min-h-[76px] sm:px-7 md:portrait:min-h-[70px] lg:min-h-[72px] max-md:landscape:min-h-[52px]"
                >
                  <span className={`relative whitespace-nowrap text-[0.78rem] ${noticeTracking} sm:text-[0.95rem]`}>{tg("registrationNotice")}</span>
                </div>
              )}
              {ABSTRACT_OPEN ? (
                <Link
                  href="/call-for-abstracts"
                  className={`group relative grid min-h-[64px] grid-cols-[1.75rem_1fr_1.75rem] items-center gap-3 overflow-hidden rounded-full border border-white/85 bg-white px-5 text-center text-[0.8rem] font-black uppercase ${buttonTracking} text-[#07101f] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_30px_rgba(255,255,255,0.24),0_14px_34px_rgba(0,0,0,0.42)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white hover:bg-[#f5fbff] hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_0_42px_rgba(255,255,255,0.38),0_18px_42px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.99] sm:min-h-[76px] sm:grid-cols-[2rem_1fr_2rem] sm:gap-4 sm:px-7 md:portrait:min-h-[70px] lg:min-h-[72px] max-md:landscape:min-h-[52px] max-md:landscape:text-[0.68rem]`}
                >
                  <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.92),rgba(214,238,255,0.55)_48%,transparent_72%)]" />
                  <span className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#168fff] to-transparent opacity-80 transition group-hover:via-[#ff7a1a]" />
                  <span className="absolute -left-1/3 top-0 h-full w-1/3 skew-x-[-18deg] bg-[#168fff]/22 opacity-0 blur-sm transition duration-700 group-hover:left-[115%] group-hover:opacity-100" />
                  <span className="relative justify-self-start h-2 w-2 rounded-full bg-[#168fff] opacity-80 shadow-[0_0_18px_rgba(22,143,255,0.9)] transition group-hover:scale-[1.7] group-hover:opacity-100" />
                  <span className={`${buttonLabelClass} drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]`}>{t("submitAbstract")}</span>
                  <span className="relative flex h-7 w-7 items-center justify-center justify-self-end rounded-full border border-[#07101f]/10 bg-[#07101f] text-white shadow-[0_0_16px_rgba(22,143,255,0.25)] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#168fff] sm:h-8 sm:w-8">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  title={tg("abstractNotice")}
                  className="relative flex min-h-[64px] items-center justify-center gap-2 overflow-hidden rounded-full border border-white bg-white px-5 text-center font-black text-[#07101f] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_26px_rgba(0,0,0,0.35)] cursor-not-allowed select-none sm:min-h-[76px] sm:px-7 md:portrait:min-h-[70px] lg:min-h-[72px] max-md:landscape:min-h-[52px]"
                >
                  <span className={`relative whitespace-nowrap text-[0.78rem] ${noticeTracking} sm:text-[0.95rem]`}>{tg("abstractNotice")}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        <div ref={countdownRef} className="will-change-transform transform-gpu relative mt-14 w-full px-1 py-4 sm:mt-auto md:portrait:mt-[7vh] lg:portrait:mt-[7vh] sm:px-5 sm:py-5 md:portrait:pb-[1.8vh] min-[1280px]:mt-[clamp(1.75rem,3.8vh,3.5rem)] min-[1280px]:mb-3 min-[1280px]:max-[1439px]:landscape:mt-[6vh] max-md:landscape:mt-8 max-md:landscape:py-2" style={{ opacity: 0 }}>
          <div className="relative flex flex-col items-center gap-3 max-md:landscape:gap-2">
            <p className={`text-center text-[1.08rem] font-bold uppercase ${countdownTracking} text-white sm:text-[1.22rem] md:text-[1.32rem] lg:text-[1.1rem] max-md:landscape:text-[0.88rem]`}>
              {t("countdownLabel")}
            </p>
            <Countdown className="mx-auto" />
          </div>
        </div>
      </div>

      {/* Text Mask – mix-blend-mode:screen for pixel-perfect crisp edges */}
      <div
        ref={maskRef}
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none overflow-hidden will-change-transform transform-gpu"
        style={{ backfaceVisibility: "hidden", mixBlendMode: "screen" }}
      >
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            ref={mainTextRef}
            className="font-black text-[17vw] sm:text-[14.5vw] md:text-[12.5vw] tracking-tighter leading-none select-none"
            style={{ color: "black", textRendering: "geometricPrecision" }}
          >
            {INTRO_CHARS.map((char, i) => (
              <span
                key={`char-${char}-${i}`}
                ref={char === "S" ? zoomTargetRef : null}
                className="gradient-letter inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={hintRef}
        className="absolute bottom-8 md:bottom-12 left-0 w-full flex flex-col items-center justify-center z-[2] transition-opacity duration-300"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-1.5 px-4 text-center text-black">
          <span className={`text-[11px] sm:text-xs font-semibold leading-none ${scrollTracking}`}>
            {t('scrollDown')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold leading-none tracking-[0.28em]">
            {t('scrollDownSecondary')}
          </span>
          <ChevronDown className="mt-1 w-4 h-4 text-black animate-pulse opacity-80" />
        </div>
      </div>

      {/* Intro Subtext */}
      <div
        ref={subtextRef}
        className="absolute left-1/2 -translate-x-1/2 z-[2] pointer-events-none transition-opacity duration-300 flex justify-center"
      >
        <div ref={subtextInnerRef} className="text-black/90 font-medium whitespace-nowrap text-3xl tracking-tight origin-top flex">
          {organizerParts.map((part, i) => (
            <React.Fragment key={`sub-${i}`}>
              <span className="subtext-part inline-block">
                {part}
              </span>
              {i < organizerParts.length - 1 && <span className="inline-block">&nbsp;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
