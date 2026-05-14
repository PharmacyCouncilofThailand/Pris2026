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
      const gradientLetters = svgRef.current.querySelectorAll(".gradient-letter");
      
      if (isMobile) {
        // Mobile optimization: Skip SVG Mask and Scroll Zoom entirely for performance
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
      <div className="hero-shell relative z-[2] w-full min-h-[100svh] grid grid-rows-[minmax(0,1fr)_auto] content-stretch gap-0 items-stretch pointer-events-auto text-center">

        {/* Main Content Wrapper (Centered) */}
        <div className="hero-main min-h-0 w-full max-w-6xl mx-auto flex flex-col justify-center items-center">

        <div
          ref={logoRef}
          className="z-[2] will-change-transform transform-gpu flex flex-col items-center"
          style={{ opacity: 0 }}
        >
          <Image
            src="/assets/Img/logo/LOGO1.png"
            alt="PRIS 2026 Logo"
            width={400}
            height={500}
            className="hero-logo-image h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Thin divider */}
        <div
          ref={infoRef}
          className="hero-info z-[2] w-full flex flex-col items-center"
          style={{ opacity: 0 }}
        >
          {/* Horizontal rule */}
          <div className="w-24 h-px bg-white/20" />

          {/* Date + Location */}
          <div className="hero-event-copy flex flex-col items-center text-white/90 uppercase font-semibold text-center drop-shadow-md">
            <span>29 – 30 October 2026</span>
            <span>IMPACT Challenger, Muang Thong Thani</span>
          </div>

          {/* Organizer — subtle, small */}
          <p className="hero-organizer text-white/75 uppercase font-semibold text-center drop-shadow-md">
            Organized by The Pharmacy Council of Thailand
          </p>
        </div>

        <div
          ref={countdownRef}
          className="hero-countdown w-full flex justify-center z-[2]"
          style={{ opacity: 0 }}
        >
          <div className="[&>*]:max-w-full">
            <Countdown />
          </div>
        </div>

        {/* Register Button */}
        <div
          ref={buttonsRef}
          className="hero-register z-[2] flex flex-col items-center"
          style={{ opacity: 0 }}
        >
          <Link
            href="/registration"
            onClick={handleRegisterClick}
            className="hero-register-link group relative inline-flex items-center rounded-full text-white transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] z-10"
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
            
            <span className="hero-register-text relative z-10 font-bold uppercase text-white/90 group-hover:text-white transition-colors">
              {t("registerNow")}
            </span>
            <span className="hero-register-icon relative z-10 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white/25 group-hover:translate-x-[4px] transition-all duration-300 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
        </div>

        {/* ── Official Partners ── */}
        <div
          ref={partnersRef}
          className="hero-partners w-full flex justify-center flex-col items-center overflow-hidden"
          style={{ opacity: 0 }}
        >
          {/* Subtle top border */}
          <div className="w-full border-t border-white/8 mb-2" />

          <span className="hero-partners-label text-white/40 font-bold uppercase">
            Official Partners
          </span>

          {/* Partner logos marquee — full width edge-to-edge */}
          <div className="relative w-full overflow-hidden">
            <div className="inline-flex animate-partner-scroll items-center py-1">
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
                      className="hero-partner-item flex items-center justify-center flex-shrink-0"
                    >
                      <div className="hero-partner-logo relative flex items-center justify-center">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          sizes="64px"
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
          .hero-shell {
            --hero-x: clamp(1rem, 3.2vw, 2.5rem);
            --hero-top: clamp(5.5rem, 12svh, 8rem);
            --hero-bottom: max(env(safe-area-inset-bottom), 0.75rem);
            padding: var(--hero-top) var(--hero-x) var(--hero-bottom);
          }
          .hero-main {
            gap: clamp(0.55rem, 1.25svh, 1.35rem);
            padding-block: clamp(0.15rem, 1.1svh, 0.85rem);
          }
          .hero-logo-image {
            width: clamp(18.5rem, 86vw, 52.5rem);
            max-height: clamp(6.25rem, 24svh, 16.5rem);
          }
          .hero-info {
            max-width: min(92vw, 42rem);
            gap: clamp(0.35rem, 0.9svh, 0.75rem);
            margin-bottom: clamp(0.1rem, 0.65svh, 0.55rem);
          }
          .hero-event-copy {
            gap: clamp(0.22rem, 0.6svh, 0.55rem);
            font-size: clamp(0.64rem, 1.65vw, 1rem);
            letter-spacing: clamp(0.08em, 0.55vw, 0.2em);
            line-height: 1.45;
          }
          .hero-organizer {
            max-width: min(88vw, 34rem);
            font-size: clamp(0.56rem, 1.35vw, 0.875rem);
            letter-spacing: clamp(0.06em, 0.45vw, 0.16em);
            line-height: 1.5;
          }
          .hero-countdown {
            margin-top: clamp(0.05rem, 0.45svh, 0.35rem);
          }
          .hero-register {
            margin-top: clamp(0.95rem, 2.2svh, 2rem);
          }
          .hero-register-link {
            min-height: clamp(2.75rem, 6.2svh, 4rem);
            gap: clamp(0.6rem, 1.25vw, 1rem);
            padding: clamp(0.65rem, 1.45svh, 1.25rem) clamp(1.45rem, 4.2vw, 3.5rem);
          }
          .hero-register-text {
            font-size: clamp(0.78rem, 1.55vw, 1.05rem);
            letter-spacing: clamp(0.13em, 0.45vw, 0.2em);
          }
          .hero-register-icon {
            width: clamp(1.75rem, 4.6vw, 2.5rem);
            height: clamp(1.75rem, 4.6vw, 2.5rem);
          }
          .hero-partners {
            margin-top: clamp(0.35rem, 1.1svh, 1.5rem);
            padding-bottom: var(--hero-bottom);
          }
          .hero-partners-label {
            font-size: clamp(0.48rem, 1.05vw, 0.625rem);
            letter-spacing: clamp(0.2em, 0.65vw, 0.35em);
            margin-bottom: clamp(0.35rem, 0.9svh, 0.65rem);
          }
          .hero-partner-item {
            margin-inline: clamp(0.75rem, 3vw, 2rem);
          }
          .hero-partner-logo {
            width: clamp(2.25rem, 9.8vw, 4rem);
            height: clamp(2.25rem, 9.8vw, 4rem);
          }
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
          @media (max-width: 430px) and (orientation: portrait) {
            .hero-shell {
              --hero-top: clamp(5.75rem, 13svh, 7.25rem);
              --hero-x: clamp(0.85rem, 4vw, 1rem);
            }
            .hero-main {
              gap: clamp(0.45rem, 1svh, 0.75rem);
            }
            .hero-logo-image {
              width: min(93vw, 26rem);
              max-height: 22svh;
            }
            .hero-info {
              max-width: min(92vw, 22rem);
              gap: 0.32rem;
            }
            .hero-event-copy {
              font-size: clamp(0.58rem, 2.65vw, 0.7rem);
              letter-spacing: 0.08em;
            }
            .hero-organizer {
              max-width: min(88vw, 19rem);
              font-size: clamp(0.5rem, 2.35vw, 0.62rem);
              letter-spacing: 0.055em;
            }
            .hero-register {
              margin-top: clamp(0.8rem, 1.8svh, 1.15rem);
            }
            .hero-register-link {
              min-height: 2.95rem;
              padding: 0.7rem 1.45rem;
            }
            .hero-partner-item {
              margin-inline: clamp(0.65rem, 3.2vw, 0.95rem);
            }
          }
          @media (max-height: 700px) {
            .hero-shell {
              --hero-top: clamp(4.75rem, 11svh, 6rem);
            }
            .hero-main {
              gap: clamp(0.35rem, 0.8svh, 0.65rem);
              padding-block: 0;
            }
            .hero-logo-image {
              max-height: 20svh;
            }
            .hero-info {
              gap: 0.25rem;
              margin-bottom: 0;
            }
            .hero-register {
              margin-top: clamp(0.65rem, 1.5svh, 1rem);
            }
            .hero-partners {
              margin-top: 0.25rem;
            }
          }
          @media (max-height: 540px) {
            .hero-info {
              display: none;
            }
            .hero-logo-image {
              max-height: 24svh;
            }
            .hero-register {
              margin-top: 0.65rem;
            }
            .hero-partners-label {
              display: none;
            }
          }
          @media (max-height: 500px) {
            .hero-shell {
              grid-template-rows: minmax(0, 1fr);
            }
            .hero-partners {
              display: none;
            }
          }
          @media (min-width: 768px) {
            .hero-shell {
              --hero-top: clamp(6.5rem, 13svh, 9rem);
              --hero-bottom: max(env(safe-area-inset-bottom), 1rem);
            }
            .hero-main {
              gap: clamp(0.8rem, 1.45svh, 1.5rem);
            }
            .hero-logo-image {
              width: clamp(32rem, 64vw, 52.5rem);
              max-height: clamp(9rem, 26svh, 17rem);
            }
          }
          @media (min-width: 1024px) {
            .hero-logo-image {
              width: clamp(36rem, 48vw, 52.5rem);
            }
            .hero-partner-logo {
              width: clamp(3.25rem, 3.6vw, 4rem);
              height: clamp(3.25rem, 3.6vw, 4rem);
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
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="white"
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
            {"PRIS 2026".split("").map((char, i) => (
              <tspan key={i} className="gradient-letter">
                {char}
              </tspan>
            ))}
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
            {"PRIS 2026".split("").map((char, i) => (
              <tspan 
                key={i} 
                ref={char === "S" ? zoomTargetRef : null}
              >
                {char}
              </tspan>
            ))}
          </text>
        </svg>
      </div>

      {/* Scroll indicator */}
      <div
        ref={hintRef}
        className="absolute bottom-8 md:bottom-12 left-0 w-full flex flex-col items-center justify-center z-[2] transition-opacity duration-300"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2 text-black text-xs sm:text-sm font-semibold uppercase tracking-widest px-4 text-center">
          <span>{t('scrollDown')}</span>
          <ChevronDown className="w-4 h-4 text-black animate-bounce" />
        </div>
      </div>
    </section>
  );
}
