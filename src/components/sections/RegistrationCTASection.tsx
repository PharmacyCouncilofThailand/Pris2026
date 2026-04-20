"use client";

import React, { useRef, useState } from "react";
import { MoveUpRight, Sparkles, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import RegistrationPolicyModal from "./RegistrationPolicyModal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RegistrationCTASection() {
  const t = useTranslations("registrationCTA");
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Premium entry animation for massive typography
      gsap.fromTo(
        ".char-anim",
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.5,
          stagger: 0.05,
          ease: "expo.out",
          force3D: true,
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".fade-up",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
          force3D: true,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );

      // Highly engineered line drawing
      gsap.utils.toArray<HTMLElement>(".draw-line-premium").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power4.inOut",
            force3D: true,
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: line,
              start: "top 90%",
            },
          }
        );
      });
    });

    // Sticky timeline effect (Desktop only)
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: ".timeline-container",
        start: "top 20%",
        end: "bottom 80%",
        pin: ".timeline-title",
        pinSpacing: false,
      });
    });

    return () => mm.revert(); // cleanup
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="py-24 md:py-40 bg-white text-black relative font-sans selection:bg-[#0055FF] selection:text-white overflow-hidden"
    >
      {/* Massive Typography Hero */}
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
        <div className="flex flex-col mb-32 md:mb-48" ref={textRef}>
          <p className="fade-up text-[#FF5A00] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-8 ml-2 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#0055FF]" /> 
            {t("pretitle")}
          </p>
          
          <h2 className="text-[clamp(3.5rem,10vw,14rem)] leading-none font-black tracking-tighter uppercase overflow-hidden py-4 -my-4 break-words hyphens-auto">
            <div className="flex flex-wrap">
              {t("title1").split("").map((char, i) => (
                <span key={`sec-${i}`} className="char-anim inline-block">{char}</span>
              ))}
            </div>
          </h2>
          <h2 className="text-[clamp(3.5rem,10vw,14rem)] leading-none font-black tracking-tighter uppercase overflow-hidden py-4 -my-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-12 mt-4 md:mt-2">
            <div className="fade-up w-16 md:w-48 h-[1rem] md:h-[clamp(0.5rem,1.5vw,2rem)] bg-black shrink-0 relative overflow-hidden group mb-2 md:mb-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A00] to-[#0055FF] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
            </div>
            <div className="flex flex-wrap">
              {t("title2").split("").map((char, i) => (
                <span key={`spot-${i}`} className="char-anim inline-block pb-2">{char === " " ? "\u00A0" : char}</span>
              ))}
            </div>
          </h2>

          <div className="mt-16 md:mt-32 fade-up max-w-3xl">
              <p 
                className="text-xl md:text-3xl font-light tracking-tight leading-[1.4] text-black/80"
                dangerouslySetInnerHTML={{ __html: t.raw("description") }}
              />
          </div>
        </div>
      </div>

      <div className="draw-line-premium w-full h-[1px] bg-black/15 my-20" />

      {/* Avant-Garde Timeline & Features Layout */}
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] timeline-container relative">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8">
          
          {/* Sticky Left Column (Responsive) */}
          <div className="w-full lg:w-4/12 relative">
            <div className="timeline-title lg:sticky lg:top-40 mb-8 lg:mb-0 relative z-10 bg-white lg:bg-transparent pb-4 lg:pb-0">
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#FF5A00] mb-6 flex items-center gap-3 fade-up">
                <span className="w-8 h-px bg-[#0055FF]"></span> {t("needToKnow")}
              </p>
              <h3 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter fade-up leading-[0.9] break-words">
                {t.rich("criticalDates", {
                  br: () => <br className="hidden sm:block" />
                })}
              </h3>
            </div>
          </div>

          {/* Right Scroll Column */}
          <div className="w-full lg:w-7/12 lg:ml-auto flex flex-col gap-24 md:gap-32">
            
            {/* Timeline */}
            <div className="flex flex-col gap-12 border-l border-black/15 pl-6 md:pl-12 relative fade-up">
              <div className="relative group">
                <div className="absolute -left-[24.5px] md:-left-[48.5px] top-2 w-3 h-3 rounded-full bg-[#0055FF] group-hover:scale-150 group-hover:bg-[#FF5A00] transition-all duration-300" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF5A00] mb-3 group-hover:text-[#0055FF] transition-colors">{t("periodEarly")}</p>
                <h5 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{t("titleEarly")}</h5>
                <p className="text-lg md:text-xl text-black/60 font-light leading-relaxed max-w-xl">
                  {t("descEarly")}
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -left-[24.5px] md:-left-[48.5px] top-2 w-3 h-3 rounded-full border-2 border-[#0055FF] bg-white group-hover:scale-150 transition-all duration-300 group-hover:bg-[#0055FF]" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/40 mb-3 group-hover:text-[#0055FF] transition-colors">{t("periodRegular")}</p>
                <h5 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{t("titleRegular")}</h5>
                <p className="text-lg md:text-xl text-black/60 font-light leading-relaxed max-w-xl">
                  {t("descRegular")}
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -left-[24.5px] md:-left-[48.5px] top-2 w-3 h-3 rounded-full bg-black/20 group-hover:bg-black transition-all duration-300" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/100 mb-3">{t("periodClosed")}</p>
                <h5 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{t("titleClosed")}</h5>
                <p className="text-lg md:text-xl text-black/60 font-light leading-relaxed max-w-xl">
                  {t("descClosed")}
                </p>
              </div>
            </div>

            <div className="draw-line-premium w-full h-[1px] bg-black/10" />

            {/* Features in Editorial Style */}
            <div className="flex flex-col gap-16 md:gap-24 fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start group">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#0055FF] mb-4 transition-colors">{t("feature1Label")}</p>
                  <h4 className="text-3xl md:text-4xl font-semibold tracking-tighter group-hover:text-[#FF5A00] transition-colors">
                    {t.rich("feature1Title", {
                      br: () => <br/>
                    })}
                  </h4>
                </div>
                <div>
                  <p className="text-lg text-black/60 font-light leading-relaxed">
                    {t("feature1Desc")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start group">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#FF5A00] mb-4 transition-colors">{t("feature2Label")}</p>
                  <h4 className="text-3xl md:text-4xl font-semibold tracking-tighter group-hover:text-[#0055FF] transition-colors">
                    {t.rich("feature2Title", {
                      br: () => <br/>
                    })}  
                  </h4>
                </div>
                <div>
                   <p className="text-lg text-black/60 font-light leading-relaxed">
                    {t("feature2Desc")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="draw-line-premium w-full h-[1px] bg-black/15 my-20 md:my-32" />

      {/* Interactive Pricing Rows (Bespoke Table Layout) */}
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] pricing-wrapper">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 fade-up">
          <h3 className="text-4xl md:text-6xl font-semibold tracking-tighter">
            {t.rich("tiersTitle", { br: () => <br/> })}
          </h3>
          <p className="text-xs uppercase tracking-[0.2em] text-[#0055FF] font-bold mt-6 md:mt-0">{t("tiersSubtitle")}</p>
        </div>

        <div className="flex flex-col [perspective:1000px]">
          {/* Row 1: Early Bird (ORANGE HOVER) */}
          <div className="pricing-row group relative border-t border-black/15 overflow-hidden transition-all duration-700 hover:bg-[#FF5A00] cursor-pointer bg-transparent text-black">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-14 gap-8">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#FF5A00] group-hover:text-black/60 transition-colors duration-500 w-24">01</span>
                <div>
                  <h4 className="text-4xl md:text-6xl font-bold tracking-tighter mb-3 group-hover:text-black transition-colors duration-500">{t("titleEarly")}</h4>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40 group-hover:text-black/70 transition-colors duration-500">{t("tierEarlyLabel")}</p>
                </div>
              </div>
              <div className="text-left md:text-right flex flex-col items-start md:items-end gap-1">
                <div className="text-4xl md:text-6xl font-black tracking-tighter group-hover:text-black transition-colors duration-500">฿1,250</div>
                <div className="text-lg font-medium text-black/30 group-hover:text-black/50 transition-colors duration-500 line-through">฿2,000</div>
              </div>
            </div>
          </div>

          {/* Row 2: Regular (BLUE HOVER) */}
          <div className="pricing-row group relative overflow-hidden transition-all duration-700 hover:bg-[#0055FF] cursor-pointer bg-transparent text-black hover:text-white mt-4 md:mt-8 border-t border-black/15 hover:border-[#0055FF]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-14 gap-8">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#0055FF] group-hover:text-white/60 transition-colors duration-500 w-24">02</span>
                <div>
                  <h4 className="text-4xl md:text-6xl font-bold tracking-tighter mb-3 group-hover:text-white transition-colors duration-500">{t("titleRegular")}</h4>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40 group-hover:text-white/80 transition-colors duration-500">{t("tierRegLabel")}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-4xl md:text-6xl font-black tracking-tighter group-hover:text-white transition-colors duration-500">฿2,000</div>
              </div>
            </div>
          </div>

          {/* Row 3: Late Registration (ORANGE HOVER) */}
          <div className="pricing-row group relative border-t border-black/15 overflow-hidden transition-all duration-700 hover:bg-[#FF5A00] cursor-pointer bg-transparent text-black">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-14 gap-8">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#FF5A00] group-hover:text-black/60 transition-colors duration-500 w-24">03</span>
                <div>
                  <h4 className="text-4xl md:text-6xl font-bold tracking-tighter mb-3 group-hover:text-black transition-colors duration-500">{t("tierLate")}</h4>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40 group-hover:text-black/70 transition-colors duration-500">{t("tierLateLabel")}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-4xl md:text-6xl font-black tracking-tighter group-hover:text-black transition-colors duration-500">฿2,500</div>
              </div>
            </div>
          </div>

          {/* Row 4: Post Grad (BLUE HOVER) */}
          <div className="pricing-row group relative border-t border-black/15 overflow-hidden transition-all duration-700 hover:bg-[#0055FF] cursor-pointer bg-transparent text-black hover:text-white">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-14 gap-8">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-black/30 group-hover:text-white/60 transition-colors duration-500 w-24">04</span>
                <div>
                  <h4 className="text-3xl md:text-5xl font-bold tracking-tighter mb-3 group-hover:text-white transition-colors duration-500">{t("tierPostGrad")}</h4>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40 group-hover:text-white/80 transition-colors duration-500">{t("tierPostGradLabel")}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-4xl md:text-6xl font-black tracking-tighter group-hover:text-white transition-colors duration-500">฿1,000</div>
              </div>
            </div>
          </div>

          {/* Row 5: Under Grad (ORANGE HOVER) */}
          <div className="pricing-row group relative border-y border-black/15 overflow-hidden transition-all duration-700 hover:bg-[#FF5A00] cursor-pointer bg-transparent text-black">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-14 gap-8">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-black/30 group-hover:text-black/60 transition-colors duration-500 w-24">05</span>
                <div>
                  <h4 className="text-3xl md:text-5xl font-bold tracking-tighter mb-3 transition-colors duration-500 group-hover:text-black">{t("tierUnderGrad")}</h4>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40 group-hover:text-black/70 transition-colors duration-500">{t("tierUnderGradLabel")}</p>
                </div>
              </div>
              <div className="text-left md:text-right flex items-baseline gap-3">
                <div className="text-4xl md:text-6xl font-black tracking-tighter transition-colors duration-500 group-hover:text-black">฿500</div>
              </div>
            </div>
          </div>
        </div>

        {/* Register CTA Button & Payment Info */}
        <div className="mt-16 md:mt-24 flex flex-col items-center fade-up gap-6">
          <a
            href="https://conference-web-tawny.vercel.app/events/mock-event-2025"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-6 md:gap-8 text-white px-10 md:px-16 py-6 md:py-8 rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] shadow-2xl hover:shadow-[0_0_60px_rgba(0,85,255,0.4)]"
          >
            {/* Animated gradient background — always visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0055FF] via-[#FF5A00] to-[#0055FF] bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite] rounded-full" />
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            {/* Pulsing glow ring — always subtly visible */}
            <div className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-[#0055FF] to-[#FF5A00] opacity-40 group-hover:opacity-80 animate-pulse blur-sm transition-opacity duration-500 -z-10" />
            
            <span className="relative z-10 text-base md:text-xl font-black uppercase tracking-[0.25em]">
              {t("registerCollection")}
            </span>
            <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 bg-white/20 group-hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:rotate-45 transition-all duration-500 border border-white/30">
              <MoveUpRight className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </a>

          {/* Payment Method Note */}
          <div className="flex items-center gap-2 text-black/50 mt-1">
            <span className="text-sm md:text-base font-medium">{t("paymentNote")}</span>
          </div>
        </div>

        {/* Cancellations & Refund Policy — Prominent Link */}
        <div className="mt-10 md:mt-14 flex justify-center text-center fade-up">
          <button 
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-black/10 hover:border-[#0055FF]/40 bg-transparent hover:bg-[#0055FF]/5 transition-all duration-500"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="text-base md:text-lg font-bold text-black/60 group-hover:text-[#0055FF] tracking-tight transition-colors duration-300">
              {t("cancelTitle")}
            </span>
            <span className="text-[#0055FF] group-hover:translate-x-1 transition-transform duration-300 text-xl">&rarr;</span>
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}} />
      </div>

      <RegistrationPolicyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
