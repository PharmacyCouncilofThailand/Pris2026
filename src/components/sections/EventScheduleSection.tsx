"use client";

import React, { useMemo, useRef, useState } from "react";
import { CalendarClock, MapPin, Users } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import { SectionTitle } from "@/components/elements/SectionTitle";
import { Button } from "@/components/ui/button";
import { scheduleData } from "@/data/scheduleData";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import {
  buildScheduleLayout,
  buildVenueColumns,
  formatMinutes,
  groupEventsForMobile,
  resolveVenueKey,
} from "./eventScheduleLayout";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EVENT_TONES = {
  ceremony: {
    badge: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    dot: "bg-amber-300",
    card: "border-amber-300/25 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(13,36,85,0.94)_46%)] shadow-[inset_3px_0_0_rgba(252,211,77,0.9)] hover:border-amber-300/45",
    mobile: "border-l-amber-300/85 bg-amber-300/[0.035]",
  },
  keynote: {
    badge: "border-orange-300/25 bg-orange-300/10 text-orange-200",
    dot: "bg-orange-300",
    card: "border-orange-300/25 bg-[linear-gradient(135deg,rgba(234,88,12,0.13),rgba(13,36,85,0.94)_46%)] shadow-[inset_3px_0_0_rgba(251,146,60,0.9)] hover:border-orange-300/45",
    mobile: "border-l-orange-300/85 bg-orange-300/[0.035]",
  },
  workshop: {
    badge: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    dot: "bg-cyan-300",
    card: "border-cyan-300/25 bg-[linear-gradient(135deg,rgba(8,145,178,0.13),rgba(13,36,85,0.94)_46%)] shadow-[inset_3px_0_0_rgba(103,232,249,0.85)] hover:border-cyan-300/45",
    mobile: "border-l-cyan-300/85 bg-cyan-300/[0.035]",
  },
  presentation: {
    badge: "border-rose-300/25 bg-rose-300/10 text-rose-100",
    dot: "bg-rose-300",
    card: "border-rose-300/25 bg-[linear-gradient(135deg,rgba(225,29,72,0.12),rgba(13,36,85,0.94)_46%)] shadow-[inset_3px_0_0_rgba(253,164,175,0.88)] hover:border-rose-300/45",
    mobile: "border-l-rose-300/85 bg-rose-300/[0.035]",
  },
  break: {
    badge: "border-stone-300/20 bg-stone-200/8 text-stone-200",
    dot: "bg-stone-300",
    card: "border-stone-300/20 bg-[linear-gradient(135deg,rgba(168,162,158,0.09),rgba(13,36,85,0.94)_46%)] shadow-[inset_3px_0_0_rgba(214,211,209,0.72)] hover:border-stone-300/35",
    mobile: "border-l-stone-300/70 bg-stone-200/[0.025]",
  },
  session: {
    badge: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    dot: "bg-sky-300",
    card: "border-sky-300/20 bg-[linear-gradient(135deg,rgba(14,116,144,0.1),rgba(13,36,85,0.94)_46%)] shadow-[inset_3px_0_0_rgba(125,211,252,0.8)] hover:border-sky-300/40",
    mobile: "border-l-sky-300/80 bg-sky-300/[0.03]",
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

  if (type === "Poster Presentation") {
    return EVENT_TONES.presentation;
  }

  if (type === "Break") {
    return EVENT_TONES.break;
  }

  return EVENT_TONES.session;
}

function EventContent({
  event,
  locale,
  compact = false,
}: {
  event: Event;
  locale: string;
  compact?: boolean;
}) {
  const title = locale === "th" && event.titleTh ? event.titleTh : event.title;
  const description =
    locale === "th" && event.descriptionTh ? event.descriptionTh : event.description;
  const location =
    locale === "th" && event.locationTh ? event.locationTh : event.location;
  const type = locale === "th" && event.typeTh ? event.typeTh : event.type;
  const tone = getEventTone(event.type);

  return (
    <article className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full shadow-[0_0_10px_currentColor]", tone.dot)}
        />
        <span className="tabular-nums">{event.time}</span>
        {type && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[9px]",
              tone.badge,
            )}
          >
            {type}
          </span>
        )}
        {event.group && (
          <span className="rounded-full border border-white/14 bg-white/6 px-2 py-0.5 text-[9px] text-white/55">
            {event.group}
          </span>
        )}
      </div>

      <h4
        className={cn(
          "font-heading font-bold leading-snug text-white",
          compact ? "text-[13px]" : "text-base sm:text-lg",
        )}
      >
        {title}
      </h4>

      {description && (
        <p
          className={cn(
            "mt-2 whitespace-pre-wrap font-light leading-relaxed text-white/58",
            compact ? "line-clamp-5 text-[11px]" : "text-sm",
          )}
        >
          {description}
        </p>
      )}

      <div className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-white/45">
        <MapPin aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-gold/70" />
        <span>{location}</span>
      </div>

      {event.speakers.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
          {event.speakers.map((speaker, index) => {
            const name =
              locale === "th" && speaker.nameTh ? speaker.nameTh : speaker.name;
            const role =
              locale === "th" && speaker.roleTh ? speaker.roleTh : speaker.role;

            return (
              <div
                key={`${speaker.name}-${index}`}
                className="flex gap-2 text-[11px] leading-relaxed"
              >
                <Users
                  aria-hidden="true"
                  className="mt-0.5 size-3 shrink-0 text-gold/65"
                />
                <span className="whitespace-pre-line text-white/72">
                  {name}
                  {role && <span className="text-white/38">{" · "}{role}</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function EventScheduleSection() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentDay = scheduleData[activeTab];

  const columns = useMemo(
    () => buildVenueColumns(currentDay.events, locale),
    [currentDay.events, locale],
  );
  const layout = useMemo(
    () => buildScheduleLayout(currentDay.events),
    [currentDay.events],
  );
  const mobileGroups = useMemo(
    () => groupEventsForMobile(currentDay.events),
    [currentDay.events],
  );
  const columnIndex = useMemo(
    () => new Map(columns.map((column, index) => [column.key, index + 2])),
    [columns],
  );
  const innovationColumns = columns.filter((column) => column.kind === "innovation");
  const innovationStart = columns.findIndex((column) => column.kind === "innovation") + 2;
  const tableColumns = `116px repeat(${columns.length}, minmax(210px, 1fr))`;

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".agenda-title",
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power4.out",
            force3D: true,
            scrollTrigger: { trigger: ".agenda-title", start: "top 80%" },
          },
        );
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          containerRef.current?.querySelectorAll(".schedule-reveal") ?? [],
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.025,
            ease: "power3.out",
            force3D: true,
          },
        );
      });

      return () => media.revert();
    },
    { scope: containerRef, dependencies: [activeTab] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-[2] overflow-hidden bg-[linear-gradient(to_bottom,black_0%,#0b1a4a_35%,#451a03_65%,black_100%)] py-16 text-white md:py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(202,155,82,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(202,155,82,0.04)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      <div className="container relative z-[1] mx-auto max-w-[1800px] px-4 md:px-8 lg:px-10">
        <div className="agenda-title mb-12 flex flex-col gap-6 sm:mb-16 md:mb-18 md:flex-row md:items-end md:justify-between">
          <SectionTitle title={t("sectionTitle")} align="left" theme="dark" />
          <p className="max-w-sm border-l border-gold/35 pl-4 text-xs leading-relaxed text-white/45">
            <span className="md:hidden">{t("mobileHint")}</span>
            <span className="hidden md:inline">{t("tableHint")}</span>
          </p>
        </div>

        <div
          className="day-tabs-container mb-8 flex gap-8 overflow-x-auto border-b border-white/10 pb-6 sm:flex-wrap md:mb-10 md:gap-14"
          role="tablist"
          aria-label={t("dayNavigationLabel")}
        >
          {scheduleData.map((day, index) => {
            const date = locale === "th" && day.dateTh ? day.dateTh : day.date;

            return (
              <Button
                key={day.day}
                onClick={() => setActiveTab(index)}
                variant="ghost"
                role="tab"
                aria-selected={activeTab === index}
                aria-controls="conference-schedule-panel"
                aria-label={`${t(`day${index + 1}`)} — ${date}`}
                className="day-tab group h-auto shrink-0 cursor-pointer justify-start rounded-none p-0 text-left hover:bg-transparent focus-visible:ring-gold"
              >
                <span className="flex flex-col items-start gap-1 sm:gap-2">
                  <span
                    className={cn(
                      "pt-2 text-3xl font-black uppercase leading-normal tracking-tight transition-colors duration-500 sm:text-4xl md:text-5xl",
                      activeTab === index
                        ? "text-white"
                        : "text-white/20 group-hover:text-white/60",
                    )}
                  >
                    {t(`day${index + 1}`)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 sm:text-xs md:text-sm",
                      activeTab === index
                        ? "text-gold"
                        : "text-white/20 group-hover:text-white/60",
                    )}
                  >
                    {date}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        <div
          id="conference-schedule-panel"
          ref={containerRef}
          role="tabpanel"
          className="relative"
        >
          {currentDay.events.length > 0 ? (
            <>
              <div
                className="relative hidden md:block"
                role="region"
                aria-label={t("scheduleTableLabel")}
              >
                <div
                  className="schedule-scroll max-h-[78vh] overflow-auto overscroll-contain rounded-[1.75rem] border border-gold/25 bg-[#061332]/88 shadow-[0_30px_90px_rgba(0,0,0,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                  tabIndex={0}
                >
                  <div
                    role="table"
                    aria-label={t("scheduleTableLabel")}
                    className="w-full"
                    style={{ minWidth: `${116 + columns.length * 210}px` }}
                  >
                    <div
                      role="row"
                      className="sticky top-0 z-30 grid border-b border-gold/30 bg-[#091943]/96 backdrop-blur-xl"
                      style={{
                        gridTemplateColumns: tableColumns,
                        gridTemplateRows: "32px 54px",
                      }}
                    >
                      <div
                        role="columnheader"
                        className="sticky left-0 z-40 flex items-center gap-2 border-r border-gold/25 bg-[#0b1d4d] px-4 text-xs font-black uppercase tracking-[0.16em] text-gold"
                        style={{ gridColumn: 1, gridRow: "1 / 3" }}
                      >
                        <CalendarClock aria-hidden="true" className="size-4" />
                        {t("time")}
                      </div>

                      {columns
                        .filter((column) => column.kind !== "innovation")
                        .map((column) => {
                          const gridColumn = columnIndex.get(column.key);

                          return (
                            <div
                              key={column.key}
                              role="columnheader"
                              className="flex items-center justify-center border-r border-white/10 px-4 text-center"
                              style={{ gridColumn, gridRow: "1 / 3" }}
                            >
                              <span className="text-xs font-black uppercase tracking-[0.08em] text-white">
                                {column.label}
                              </span>
                            </div>
                          );
                        })}

                      {innovationColumns.length > 0 && (
                        <div
                          role="columnheader"
                          className="flex items-center justify-center border-b border-r border-white/10 bg-gold/8 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-gold"
                          style={{
                            gridColumn: `${innovationStart} / span ${innovationColumns.length}`,
                            gridRow: 1,
                          }}
                        >
                          {t("innovationZone")}
                        </div>
                      )}

                      {innovationColumns.map((column) => (
                        <div
                          key={column.key}
                          role="columnheader"
                          className="flex items-center justify-center border-r border-white/10 px-3 text-center text-[11px] font-black uppercase tracking-[0.08em] text-white"
                          style={{
                            gridColumn: columnIndex.get(column.key),
                            gridRow: 2,
                          }}
                        >
                          {column.label}
                        </div>
                      ))}
                    </div>

                    <div
                      role="rowgroup"
                      className="relative grid"
                      style={{
                        gridTemplateColumns: tableColumns,
                        gridTemplateRows: `repeat(${Math.max(
                          layout.boundaries.length - 1,
                          1,
                        )}, minmax(54px, auto))`,
                      }}
                    >
                      {layout.boundaries.slice(0, -1).map((boundary, index) => (
                        <React.Fragment key={boundary}>
                          <div
                            role="rowheader"
                            className="schedule-reveal sticky left-0 z-20 border-r border-b border-white/10 bg-[#08173b]/98 px-4 py-3 text-xs font-black tabular-nums text-gold"
                            style={{ gridColumn: 1, gridRow: index + 1 }}
                          >
                            {formatMinutes(boundary)}
                          </div>
                          <div
                            aria-hidden="true"
                            className="pointer-events-none z-0 border-b border-white/8"
                            style={{
                              gridColumn: `2 / ${columns.length + 2}`,
                              gridRow: index + 1,
                            }}
                          />
                        </React.Fragment>
                      ))}

                      {layout.cells.map((cell) => {
                        const gridColumn = columnIndex.get(cell.columnKey);
                        const cellTone = getEventTone(cell.events[0].type);

                        if (!gridColumn) return null;

                        return (
                          <div
                            key={cell.key}
                            role="cell"
                            className={cn(
                              "schedule-reveal z-10 m-1.5 self-stretch overflow-hidden rounded-xl border p-3 transition-colors duration-300",
                              cellTone.card,
                            )}
                            style={{
                              gridColumn,
                              gridRow: `${cell.startLine} / ${cell.endLine}`,
                            }}
                          >
                            <div className="divide-y divide-white/10">
                              {cell.events.map((event, index) => (
                                <div
                                  key={event.id}
                                  className={cn(index > 0 && "pt-4", index > 0 && "mt-4")}
                                >
                                  <EventContent event={event} locale={locale} compact />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {layout.fallbackEvents.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-gold/20 bg-[#08173b]/85 p-5">
                    <h3 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-gold">
                      {t("otherVenue")}
                    </h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {layout.fallbackEvents.map((event) => {
                        const tone = getEventTone(event.type);

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "schedule-reveal rounded-xl border p-4",
                              tone.card,
                            )}
                          >
                            <EventContent event={event} locale={locale} compact />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 md:hidden">
                {mobileGroups.map((group, groupIndex) => {
                  const headingId = `mobile-time-${activeTab}-${groupIndex}`;

                  return (
                    <section
                      key={`${group.timeLabel}-${groupIndex}`}
                      className="schedule-reveal overflow-hidden rounded-2xl border border-white/10 bg-[#091943]/72 shadow-[0_18px_48px_rgba(0,0,0,0.2)]"
                      aria-labelledby={headingId}
                    >
                      <div className="flex items-center gap-3 border-b border-gold/20 bg-[#0c2250]/82 px-4 py-3">
                        <span
                          className="h-7 w-1 rounded-full bg-gold"
                          aria-hidden="true"
                        />
                        <h3
                          id={headingId}
                          className="font-heading text-lg font-black tabular-nums text-gold"
                        >
                          {group.timeLabel}
                        </h3>
                      </div>

                      <div className="divide-y divide-white/10">
                        {group.events.map((event) => {
                          const venue = columns.find(
                            (column) => column.key === resolveVenueKey(event),
                          );
                          const tone = getEventTone(event.type);

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "border-l-[3px] px-4 py-5",
                                tone.mobile,
                              )}
                            >
                              <div className="mb-3 inline-flex rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-white/68">
                                {venue?.label ?? t("otherVenue")}
                              </div>
                              <EventContent event={event} locale={locale} />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-24 text-center">
              <MapPin aria-hidden="true" className="mx-auto mb-5 size-9 text-gold/55" />
              <h4 className="font-heading text-2xl font-bold text-white">
                {t("emptyTitle")}
              </h4>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
                {t("emptyDescription")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
