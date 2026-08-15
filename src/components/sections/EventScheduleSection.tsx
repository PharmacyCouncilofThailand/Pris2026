"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  Clock,
  Layers,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import { SectionTitle } from "@/components/elements/SectionTitle";
import { scheduleData } from "@/data/scheduleData";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function formatSpeakerName(value: string) {
  const text = value.trim();
  let depth = 0;

  for (let index = text.length - 1; index >= 0; index -= 1) {
    const character = text[index];

    if (character === ")") {
      depth += 1;
    } else if (character === "(") {
      depth -= 1;

      if (depth === 0 && index > 0) {
        const name = text.slice(0, index).trim();
        const position = text.slice(index + 1, -1).trim();

        if (name && position) {
          return `${name}\n${position}`;
        }

        break;
      }
    }
  }

  return value;
}

const EVENT_TONES = {
  ceremony: {
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    card: "border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-[#0b1c47]/95 to-[#06122d] shadow-[inset_3px_0_0_rgba(251,191,36,0.9)] hover:border-amber-300/50 hover:shadow-amber-500/10",
  },
  keynote: {
    badge: "border-orange-400/30 bg-orange-400/10 text-orange-300",
    dot: "bg-orange-400",
    card: "border-orange-400/25 bg-gradient-to-br from-orange-500/10 via-[#0b1c47]/95 to-[#06122d] shadow-[inset_3px_0_0_rgba(249,115,22,0.9)] hover:border-orange-300/50 hover:shadow-orange-500/10",
  },
  workshop: {
    badge: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    dot: "bg-cyan-400",
    card: "border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 via-[#0b1c47]/95 to-[#06122d] shadow-[inset_3px_0_0_rgba(6,182,212,0.9)] hover:border-cyan-300/50 hover:shadow-cyan-500/10",
  },
  presentation: {
    badge: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    dot: "bg-rose-400",
    card: "border-rose-400/25 bg-gradient-to-br from-rose-500/10 via-[#0b1c47]/95 to-[#06122d] shadow-[inset_3px_0_0_rgba(244,63,94,0.9)] hover:border-rose-300/50 hover:shadow-rose-500/10",
  },
  break: {
    badge: "border-stone-400/25 bg-stone-300/10 text-stone-300",
    dot: "bg-stone-400",
    card: "border-stone-400/20 bg-gradient-to-br from-stone-500/10 via-[#0b1c47]/95 to-[#06122d] shadow-[inset_3px_0_0_rgba(214,211,209,0.7)] hover:border-stone-300/40",
  },
  session: {
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    dot: "bg-sky-400",
    card: "border-sky-400/25 bg-gradient-to-br from-sky-500/10 via-[#0b1c47]/95 to-[#06122d] shadow-[inset_3px_0_0_rgba(56,189,248,0.9)] hover:border-sky-300/50 hover:shadow-sky-500/10",
  },
} as const;

function getEventTone(type: string) {
  if (type === "Ceremony" || type === "Registration") {
    return EVENT_TONES.ceremony;
  }
  if (type === "Keynote" || type === "Lecture" || type === "Lunch") {
    return EVENT_TONES.keynote;
  }
  if (type === "Workshop" || type === "Activity") {
    return EVENT_TONES.workshop;
  }
  if (
    type === "Poster Presentation" ||
    type === "Oral Presentation" ||
    type === "Student Presentation"
  ) {
    return EVENT_TONES.presentation;
  }
  if (type === "Break") {
    return EVENT_TONES.break;
  }
  return EVENT_TONES.session;
}

export default function EventScheduleSection() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentDay = scheduleData[activeTab];

  // Select top featured/keynote/ceremony events for preview (excluding minor breaks/posters to keep it concise and punchy)
  const previewEvents = useMemo(() => {
    return currentDay.events
      .filter((ev) => ev.type !== "Break" && ev.track !== "INNOVATION ZONE")
      .slice(0, 6);
  }, [currentDay.events]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.fromTo(
            ".agenda-title",
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power4.out",
              force3D: true,
              scrollTrigger: { trigger: ".agenda-title", start: "top 80%" },
            }
          );
        }
      );

      return () => media.revert();
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          containerRef.current?.querySelectorAll(".preview-card") ?? [],
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: "power3.out",
            force3D: true,
          }
        );
      });

      return () => media.revert();
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[2] overflow-hidden bg-[linear-gradient(to_bottom,#020617_0%,#091842_40%,#1e1005_75%,#020617_100%)] py-20 text-white md:py-28 lg:py-36"
    >
      {/* Background Decorative Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(212,175,55,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      <div className="container relative z-[1] mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12">
        {/* Section Header */}
        <div className="agenda-title mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
              <Sparkles className="h-3 w-3" />
              {t("previewTag")}
            </div>
            <SectionTitle title={t("sectionTitle")} align="left" theme="dark" />
          </div>

          <p className="max-w-md border-l border-amber-400/40 pl-4 text-xs leading-relaxed text-slate-300 md:text-sm">
            {t("previewSubtitle")}
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div
          className="mb-8 flex flex-wrap gap-4 border-b border-white/10 pb-6 sm:gap-8"
          role="tablist"
          aria-label={t("dayNavigationLabel")}
        >
          {scheduleData.map((day, index) => {
            const date = locale === "th" && day.dateTh ? day.dateTh : day.date;
            const isActive = activeTab === index;

            return (
              <button
                key={day.day}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(index)}
                className="group relative cursor-pointer pb-2 text-left transition-all focus-visible:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black transition-all",
                      isActive
                        ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                        : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white"
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <span
                      className={cn(
                        "block text-lg font-black tracking-tight transition-colors sm:text-2xl",
                        isActive
                          ? "text-white"
                          : "text-white/40 group-hover:text-white/80"
                      )}
                    >
                      {t(`day${index + 1}`)}
                    </span>
                    <span
                      className={cn(
                        "block text-xs font-semibold uppercase tracking-wider transition-colors",
                        isActive ? "text-amber-300" : "text-white/30"
                      )}
                    >
                      {date}
                    </span>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-[1px] h-0.5 origin-left bg-amber-400 transition-transform duration-300",
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-40"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Highlight Sessions Preview Cards Grid */}
        <div ref={containerRef} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {previewEvents.map((event) => {
            const tone = getEventTone(event.type);
            const title =
              locale === "th" && event.titleTh ? event.titleTh : event.title;
            const location =
              locale === "th" && event.locationTh
                ? event.locationTh
                : event.location;
            const type =
              locale === "th" && event.typeTh ? event.typeTh : event.type;

            return (
              <article
                key={event.id}
                className={cn(
                  "preview-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  tone.card
                )}
              >
                <div>
                  {/* Card Meta Row */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]",
                          tone.dot
                        )}
                      />
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {event.time}
                      </span>
                    </div>

                    {type && (
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          tone.badge
                        )}
                      >
                        {type}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-heading text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-200 sm:text-lg">
                    {title}
                  </h4>

                  {/* Location */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300/70">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span>{location}</span>
                  </div>
                </div>

                {/* Speakers */}
                {event.speakers.length > 0 && (
                  <div className="mt-5 border-t border-white/10 pt-3">
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <div className="text-xs text-slate-200">
                        {event.speakers.map((speaker, index) => {
                          const name =
                            locale === "th" && speaker.nameTh
                              ? speaker.nameTh
                              : speaker.name;
                          return (
                            <p
                              key={`${speaker.name}-${index}`}
                              className="whitespace-pre-line leading-relaxed font-medium"
                            >
                              {formatSpeakerName(name)}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Prominent Bottom CTA Bar (Redirects to /agenda) */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-r from-[#0b1e4c] via-[#0d2766] to-[#241306] p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-black text-white sm:text-xl md:text-2xl">
                  {t("viewFullSchedule")}
                </h3>
              </div>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm font-normal">
                {t("viewFullScheduleDesc")}
              </p>
            </div>

            <Link
              href="/agenda"
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-amber-400 px-7 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-400/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-amber-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span>{t("viewFullSchedule")}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
