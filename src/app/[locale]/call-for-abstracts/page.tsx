"use client";

import React, { useEffect, useState } from "react";
import { MoveUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";
import { getAbstractGateState } from "@/lib/registrationGate";

// Dynamic imports for the sections
const AbstractTimeline = dynamic(() => import("@/components/sections/AbstractTimeline"), { ssr: false });
const AbstractTopicList = dynamic(() => import("@/components/sections/AbstractTopicList"), { ssr: false });
const AbstractGuidelines = dynamic(() => import("@/components/sections/AbstractGuidelines"), { ssr: false });
    

export default function CallForAbstractsPage() {
  const t = useTranslations("cfa");
  const tg = useTranslations("registrationGate");

  const [isCtaDocked, setIsCtaDocked] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(true);

  React.useEffect(() => {
    document.body.classList.remove("hero-playing");
    window.requestAnimationFrame(() => setAbstractOpen(getAbstractGateState().open));
  }, []);

  useEffect(() => {
    let rafId = 0;

    const updateCtaPosition = () => {
      const footer = document.querySelector("footer");
      if (!footer) {
        setIsCtaDocked(false);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      setIsCtaDocked(footerRect.top <= window.innerHeight);
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateCtaPosition);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* ══════ HERO ══════ */}
      <PageHero
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("ctaDesc")}
      />

      {/* ── Content Sections ── */}
      <div>
        <AbstractTimeline />
        <AbstractTopicList />
        <AbstractGuidelines />
      </div>

      {/* ── CTA Section ── */}
      <section className="pt-24 pb-24 md:pt-32 md:pb-32 lg:pb-36 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
            {t("ctaTitle1")} <span className="text-blue-600">{t("ctaTitle2")}</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            {t("ctaDesc")}
          </p>
        </div>
      </section>

      {/* Floating CTA Button */}
      <div
        className={`cfa-floating-cta ${isCtaDocked ? "absolute" : "fixed"} inset-x-0 z-40 flex justify-center px-3`}
      >
        <div className="cfa-floating-cta-inner flex flex-col items-center">
          {abstractOpen ? (
            <Link
              href="/abstract-submission"
              className="cfa-floating-cta-button group relative inline-flex items-center justify-center overflow-hidden rounded-full text-white shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(0,85,255,0.35)] active:scale-[0.98] cursor-pointer"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0055FF] via-[#FF5A00] to-[#0055FF] bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite] rounded-full" />
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

              <span className="cfa-floating-cta-text relative z-10 font-black uppercase">
                {t("submitAbstract")}
              </span>
              <div className="cfa-floating-cta-icon relative z-10 flex items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm transition-all duration-500 group-hover:rotate-45 group-hover:bg-white/30">
                <MoveUpRight className="h-[52%] w-[52%]" />
              </div>
            </Link>
          ) : (
            <div
              aria-disabled="true"
              title={tg("abstractNotice")}
              className="cfa-floating-cta-button relative inline-flex items-center justify-center overflow-hidden rounded-full text-white shadow-2xl cursor-not-allowed select-none opacity-95"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0055FF]/70 via-[#FF5A00]/70 to-[#0055FF]/70" />
              <span className="cfa-floating-cta-text relative z-10 font-black">
                {tg("abstractNotice")}
              </span>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .cfa-floating-cta {
          bottom: max(env(safe-area-inset-bottom), 0.875rem);
        }
        .cfa-floating-cta-inner {
          gap: clamp(0.35rem, 1.1svh, 0.75rem);
          max-width: min(100%, 34rem);
        }
        .cfa-floating-cta-button {
          min-height: clamp(3.25rem, 7.5svh, 4.25rem);
          gap: clamp(0.75rem, 3vw, 1.35rem);
          padding: clamp(0.75rem, 1.6svh, 1.15rem) clamp(1.6rem, 7vw, 3rem);
        }
        .cfa-floating-cta-text {
          font-size: clamp(0.78rem, 3.6vw, 1rem);
          letter-spacing: clamp(0.14em, 0.8vw, 0.22em);
          white-space: nowrap;
        }
        .cfa-floating-cta-icon {
          width: clamp(2.25rem, 9.5vw, 3rem);
          height: clamp(2.25rem, 9.5vw, 3rem);
          flex: 0 0 auto;
        }
        @media (min-width: 640px) {
          .cfa-floating-cta {
            bottom: max(env(safe-area-inset-bottom), 1.5rem);
            padding-inline: 1rem;
          }
          .cfa-floating-cta-button {
            min-height: clamp(4rem, 7svh, 5rem);
            padding-inline: clamp(2.5rem, 6vw, 4rem);
          }
          .cfa-floating-cta-icon {
            width: clamp(2.75rem, 5vw, 3.5rem);
            height: clamp(2.75rem, 5vw, 3.5rem);
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
          .cfa-floating-cta {
            bottom: max(env(safe-area-inset-bottom), 1rem);
          }
          .cfa-floating-cta-button {
            min-height: 3.65rem;
            gap: 1rem;
            padding: 0.9rem 2.25rem;
          }
          .cfa-floating-cta-text {
            font-size: 0.9rem;
            letter-spacing: 0.18em;
          }
          .cfa-floating-cta-icon {
            width: 2.55rem;
            height: 2.55rem;
          }
        }
        @media (min-width: 1024px) {
          .cfa-floating-cta-button {
            min-height: 5rem;
            gap: 2rem;
            padding: 1.5rem 4rem;
          }
          .cfa-floating-cta-text {
            font-size: 1.25rem;
            letter-spacing: 0.25em;
          }
          .cfa-floating-cta-icon {
            width: 3.5rem;
            height: 3.5rem;
          }
        }
        @media (max-height: 620px) {
          .cfa-floating-cta {
            bottom: max(env(safe-area-inset-bottom), 0.5rem);
          }
          .cfa-floating-cta-inner {
            gap: 0.25rem;
          }
          .cfa-floating-cta-button {
            min-height: 2.85rem;
            padding-block: 0.55rem;
          }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}} />
    </main>
  );
}
