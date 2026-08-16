"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Calendar,
  CalendarClock,
  Clock,
  LayoutGrid,
  List,
  MapPin,
  Sparkles,
  Users,
  X,
  Building,
  Lightbulb,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";
import { scheduleData } from "@/data/scheduleData";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import {
  buildScheduleLayout,
  buildVenueColumns,
  formatMinutes,
  formatVenueGroupLabel,
  groupEventsForMobile,
  resolveVenueKey,
  resolveVenueKeys,
} from "@/components/sections/eventScheduleLayout";

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
    badge: "border-amber-300 bg-amber-50 text-amber-900",
    dot: "bg-amber-500 ring-2 ring-amber-500/20",
    card: "border-amber-200/90 bg-gradient-to-b from-amber-50/60 via-white to-white text-slate-900 shadow-sm hover:shadow-md hover:border-amber-400/80",
    mobile: "bg-amber-50/30 hover:bg-amber-50/60 border-amber-200/60",
  },
  keynote: {
    badge: "border-orange-300 bg-orange-50 text-orange-900",
    dot: "bg-orange-500 ring-2 ring-orange-500/20",
    card: "border-orange-200/90 bg-gradient-to-b from-orange-50/60 via-white to-white text-slate-900 shadow-sm hover:shadow-md hover:border-orange-400/80",
    mobile: "bg-orange-50/30 hover:bg-orange-50/60 border-orange-200/60",
  },
  workshop: {
    badge: "border-teal-300 bg-teal-50 text-teal-900",
    dot: "bg-teal-600 ring-2 ring-teal-600/20",
    card: "border-teal-200/90 bg-gradient-to-b from-teal-50/60 via-white to-white text-slate-900 shadow-sm hover:shadow-md hover:border-teal-400/80",
    mobile: "bg-teal-50/30 hover:bg-teal-50/60 border-teal-200/60",
  },
  presentation: {
    badge: "border-rose-300 bg-rose-50 text-rose-900",
    dot: "bg-rose-500 ring-2 ring-rose-500/20",
    card: "border-rose-200/90 bg-gradient-to-b from-rose-50/60 via-white to-white text-slate-900 shadow-sm hover:shadow-md hover:border-rose-400/80",
    mobile: "bg-rose-50/30 hover:bg-rose-50/60 border-rose-200/60",
  },
  break: {
    badge: "border-slate-300 bg-slate-100 text-slate-700",
    dot: "bg-slate-400 ring-2 ring-slate-400/20",
    card: "border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white text-slate-700 shadow-sm hover:border-slate-300",
    mobile: "bg-slate-50 hover:bg-slate-100/60 border-slate-200/60",
  },
  session: {
    badge: "border-blue-300 bg-blue-50 text-blue-900",
    dot: "bg-blue-600 ring-2 ring-blue-600/20",
    card: "border-blue-200/90 bg-gradient-to-b from-blue-50/60 via-white to-white text-slate-900 shadow-sm hover:shadow-md hover:border-blue-400/80",
    mobile: "bg-blue-50/30 hover:bg-blue-50/60 border-blue-200/60",
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

export default function AgendaPage() {
  const t = useTranslations("schedule");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState(0);
  const [activeVenueGroup, setActiveVenueGroup] = useState<"rooms" | "innovation">("rooms");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [selectedEventModal, setSelectedEventModal] = useState<Event | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDay = scheduleData[activeTab];
  const allEvents = currentDay.events;

  // Desktop Table Columns
  const allColumns = useMemo(
    () => buildVenueColumns(currentDay.events, locale),
    [currentDay.events, locale]
  );

  const desktopColumns = useMemo(
    () =>
      allColumns.filter((column) =>
        activeVenueGroup === "rooms"
          ? column.kind === "room"
          : column.kind !== "room"
      ),
    [activeVenueGroup, allColumns]
  );

  const desktopColumnKeys = useMemo(
    () => new Set(desktopColumns.map((column) => column.key)),
    [desktopColumns]
  );

  const desktopEvents = useMemo(
    () =>
      allEvents.filter((event) =>
        resolveVenueKeys(event).some((key) => desktopColumnKeys.has(key))
      ),
    [allEvents, desktopColumnKeys]
  );

  const desktopLayout = useMemo(
    () => buildScheduleLayout(desktopEvents),
    [desktopEvents]
  );

  const mobileGroups = useMemo(
    () => groupEventsForMobile(allEvents),
    [allEvents]
  );

  const columnIndex = useMemo(
    () =>
      new Map(desktopColumns.map((column, index) => [column.key, index + 2])),
    [desktopColumns]
  );

  const innovationColumns = desktopColumns.filter(
    (column) => column.kind === "innovation"
  );
  const innovationStart =
    desktopColumns.findIndex((column) => column.kind === "innovation") + 2;

  const venueColumnWidth =
    activeVenueGroup === "rooms"
      ? "clamp(150px, 17vw, 220px)"
      : "clamp(110px, 12vw, 190px)";
  const tableColumns = `clamp(92px, 8.5vw, 120px) repeat(${desktopColumns.length}, minmax(${venueColumnWidth}, 1fr))`;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          containerRef.current?.querySelectorAll(".schedule-reveal") ?? [],
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.02,
            ease: "power3.out",
            force3D: true,
          }
        );
      });

      return () => media.revert();
    },
    {
      scope: containerRef,
      dependencies: [activeTab, activeVenueGroup, viewMode],
    }
  );

  return (
    <main
      lang={locale}
      className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900"
    >
      {/* Page Hero Header */}
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />

      {/* Main Agenda Content Section */}
      <section className="relative overflow-hidden px-4 pb-28 sm:px-6 md:px-10 lg:px-12 md:pb-40">
        {/* Subtle Ambient Background Lighting */}
        <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-blue-500/[0.05] blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-96 h-[30rem] w-[30rem] rounded-full bg-orange-500/[0.04] blur-[140px]" />

        <div className="relative mx-auto max-w-[1720px] space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Duration
                </p>
                <p className="text-sm font-black text-slate-900 sm:text-base">
                  {t("statsDays")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Venues
                </p>
                <p className="text-sm font-black text-slate-900 sm:text-base">
                  4 Parallel Halls
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Innovation
                </p>
                <p className="text-sm font-black text-slate-900 sm:text-base">
                  Poster Zone (4 Stn)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sessions
                </p>
                <p className="text-sm font-black text-slate-900 sm:text-base">
                  40+ Sessions
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Control Dashboard */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-8 space-y-6">
            {/* Top Row: Day Tabs & View Switcher */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Day Selector Tabs (2 columns on mobile) */}
              <div
                className="grid w-full grid-cols-2 gap-1 rounded-2xl bg-slate-100/90 p-1.5 shadow-inner sm:w-auto sm:inline-flex"
                role="tablist"
                aria-label={t("dayNavigationLabel")}
              >
                {scheduleData.map((day, index) => {
                  const isActive = activeTab === index;
                  const date =
                    locale === "th" && day.dateTh ? day.dateTh : day.date;

                  return (
                    <button
                      key={day.day}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(index)}
                      className={cn(
                        "relative flex items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:justify-start sm:gap-3 sm:px-5 sm:py-3",
                        isActive
                          ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black sm:h-8 sm:w-8",
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                            : "bg-slate-200/70 text-slate-600"
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-black tracking-tight sm:text-sm">
                          {t(`day${index + 1}`)}
                        </span>
                        <span className="block truncate text-[10px] font-medium text-slate-400 sm:text-[11px]">
                          {date}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle (Desktop only) */}
              <div className="hidden sm:inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                    viewMode === "grid"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {t("viewGrid")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                    viewMode === "timeline"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  {t("viewTimeline")}
                </button>
              </div>
            </div>

            {/* Bottom Row: Venue Category Group (Only for Desktop Grid view) */}
            {viewMode === "grid" && (
              <div className="hidden md:flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveVenueGroup("rooms")}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all text-center",
                    activeVenueGroup === "rooms"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/30 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  )}
                >
                  <Building className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Jupiter 4–7, 11, 12, 13</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVenueGroup("innovation")}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all text-center",
                    activeVenueGroup === "innovation"
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/30 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  )}
                >
                  <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Innovation & Foyer</span>
                </button>
              </div>
            )}
          </div>

          {/* Schedule Display Area (Harmonious Modern Light Surface) */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/40"
          >
            {/* Ambient Background Grid on Light Container */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px]"
            />

            {allEvents.length === 0 ? (
              /* Empty State */
              <div className="relative z-10 py-24 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <CalendarClock className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 md:text-2xl">
                  {t("emptyTitle")}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {t("emptyDescription")}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID MATRIX VIEW (Desktop) */
              <>
                <div className="relative hidden md:block">
                  <div
                    className="schedule-scroll max-h-[80vh] overflow-auto overscroll-contain rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner focus-visible:outline-none"
                    tabIndex={0}
                  >
                    <div role="table" className="w-full">
                      {/* Sticky Table Header */}
                      <div
                        role="row"
                        className="sticky top-0 z-30 grid border-b border-slate-200 bg-slate-100/95 backdrop-blur-md"
                        style={{
                          gridTemplateColumns: tableColumns,
                          gridTemplateRows: "36px 56px",
                        }}
                      >
                        <div
                          role="columnheader"
                          className="sticky left-0 z-40 flex items-center gap-2 border-r border-slate-200 bg-slate-100 px-4 text-xs font-black uppercase tracking-wider text-slate-700"
                          style={{ gridColumn: 1, gridRow: "1 / 3" }}
                        >
                          <CalendarClock className="h-4 w-4 text-blue-600" />
                          {t("time")}
                        </div>

                        {desktopColumns
                          .filter((col) => col.kind !== "innovation")
                          .map((col) => {
                            const gridCol = columnIndex.get(col.key);
                            return (
                              <div
                                key={col.key}
                                role="columnheader"
                                className="flex items-center justify-center border-r border-slate-200 px-4 text-center"
                                style={{ gridColumn: gridCol, gridRow: "1 / 3" }}
                              >
                                <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                                  {col.label}
                                </span>
                              </div>
                            );
                          })}

                        {innovationColumns.length > 0 && (
                          <div
                            role="columnheader"
                            className="flex items-center justify-center border-b border-r border-slate-200 bg-indigo-50/80 px-4 text-center text-[10px] font-black uppercase tracking-widest text-indigo-900"
                            style={{
                              gridColumn: `${innovationStart} / span ${innovationColumns.length}`,
                              gridRow: 1,
                            }}
                          >
                            {t("innovationZone")}
                          </div>
                        )}

                        {innovationColumns.map((col) => (
                          <div
                            key={col.key}
                            role="columnheader"
                            className="flex items-center justify-center border-r border-slate-200 bg-slate-100 px-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-700"
                            style={{
                              gridColumn: columnIndex.get(col.key),
                              gridRow: 2,
                            }}
                          >
                            {col.label}
                          </div>
                        ))}
                      </div>

                      {/* Table Body */}
                      <div
                        role="rowgroup"
                        className="relative grid"
                        style={{
                          gridTemplateColumns: tableColumns,
                          gridTemplateRows: `repeat(${Math.max(
                            desktopLayout.boundaries.length - 1,
                            1
                          )}, minmax(56px, auto))`,
                        }}
                      >
                        {desktopLayout.boundaries
                          .slice(0, -1)
                          .map((boundary, index) => (
                            <React.Fragment key={boundary}>
                              <div
                                role="rowheader"
                                className="schedule-reveal sticky left-0 z-20 flex items-start border-r border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 text-xs font-black tabular-nums text-slate-600"
                                style={{ gridColumn: 1, gridRow: index + 1 }}
                              >
                                {formatMinutes(boundary)}
                              </div>
                              <div
                                aria-hidden="true"
                                className="pointer-events-none z-0 border-b border-slate-200/60"
                                style={{
                                  gridColumn: `2 / ${
                                    desktopColumns.length + 2
                                  }`,
                                  gridRow: index + 1,
                                }}
                              />
                            </React.Fragment>
                          ))}

                        {desktopLayout.cells.map((cell) => {
                          const gridColumnIndexes = cell.columnKeys
                            .map((key) => columnIndex.get(key))
                            .filter(
                              (index): index is number => index !== undefined
                            )
                            .sort((left, right) => left - right);
                          const gridColumnStart = gridColumnIndexes[0];
                          const gridColumnEnd =
                            gridColumnIndexes[gridColumnIndexes.length - 1];
                          const cellTone = getEventTone(cell.events[0].type);

                          if (!gridColumnStart || !gridColumnEnd) return null;

                          return (
                            <div
                              key={cell.key}
                              role="cell"
                              className={cn(
                                "schedule-reveal z-10 m-1.5 self-stretch overflow-hidden rounded-xl border p-3.5 transition-all duration-200 hover:z-20 cursor-pointer shadow-sm hover:shadow-md",
                                cellTone.card
                              )}
                              style={{
                                gridColumn: `${gridColumnStart} / ${
                                  gridColumnEnd + 1
                                }`,
                                gridRow: `${cell.startLine} / ${cell.endLine}`,
                              }}
                              onClick={() => setSelectedEventModal(cell.events[0])}
                            >
                              <div className="divide-y divide-slate-200/80">
                                {cell.events.map((event, index) => (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      index > 0 && "pt-4",
                                      index > 0 && "mt-4"
                                    )}
                                  >
                                    <AgendaEventCardContent
                                      event={event}
                                      locale={locale}
                                      compact
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {desktopLayout.fallbackEvents.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                      <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-800">
                        {t("otherVenue")}
                      </h3>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {desktopLayout.fallbackEvents.map((event) => {
                          const tone = getEventTone(event.type);
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "schedule-reveal rounded-xl border p-4 cursor-pointer transition-all shadow-sm hover:shadow-md",
                                tone.card
                              )}
                              onClick={() => setSelectedEventModal(event)}
                            >
                              <AgendaEventCardContent
                                event={event}
                                locale={locale}
                                compact
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile View (Chronological Cards) */}
                <div className="space-y-4 md:hidden">
                  <MobileTimelineList
                    groups={mobileGroups}
                    allColumns={allColumns}
                    locale={locale}
                    onSelectEvent={(ev) => setSelectedEventModal(ev)}
                    otherVenueLabel={t("otherVenue")}
                  />
                </div>
              </>
            ) : (
              /* TIMELINE VIEW (Detailed List for Desktop & Mobile) */
              <div className="space-y-6">
                <MobileTimelineList
                  groups={mobileGroups}
                  allColumns={allColumns}
                  locale={locale}
                  onSelectEvent={(ev) => setSelectedEventModal(ev)}
                  otherVenueLabel={t("otherVenue")}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Session Details Modal Dialog */}
      {selectedEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedEventModal(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider",
                    getEventTone(selectedEventModal.type).badge
                  )}
                >
                  {locale === "th" && selectedEventModal.typeTh
                    ? selectedEventModal.typeTh
                    : selectedEventModal.type}
                </span>

                {selectedEventModal.group && (
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
                    {formatVenueGroupLabel(selectedEventModal.group)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Title */}
            <h3 className="mt-4 text-xl font-black leading-snug tracking-tight text-slate-950 sm:text-2xl">
              {locale === "th" && selectedEventModal.titleTh
                ? selectedEventModal.titleTh
                : selectedEventModal.title}
            </h3>

            {/* Secondary language title */}
            {selectedEventModal.titleTh && selectedEventModal.title && (
              <p className="mt-1 text-xs text-slate-500 italic">
                {locale === "th"
                  ? selectedEventModal.title
                  : selectedEventModal.titleTh}
              </p>
            )}

            {/* Meta Info Bar */}
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 text-xs font-bold text-blue-700">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{selectedEventModal.time}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  {locale === "th" && selectedEventModal.locationTh
                    ? selectedEventModal.locationTh
                    : selectedEventModal.location}
                </span>
              </div>
            </div>

            {/* Description */}
            {(selectedEventModal.description ||
              selectedEventModal.descriptionTh) && (
              <div className="mt-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {locale === "th" && selectedEventModal.descriptionTh
                    ? selectedEventModal.descriptionTh
                    : selectedEventModal.description}
                </p>
              </div>
            )}

            {/* Speakers List */}
            {selectedEventModal.speakers.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                  <Users className="h-4 w-4 text-blue-600" />
                  {t("speakersTitle")}
                </h4>
                <div className="mt-3 space-y-3">
                  {selectedEventModal.speakers.map((speaker, i) => {
                    const name =
                      locale === "th" && speaker.nameTh
                        ? speaker.nameTh
                        : speaker.name;
                    const role =
                      locale === "th" && speaker.roleTh
                        ? speaker.roleTh
                        : speaker.role;

                    return (
                      <div
                        key={`${speaker.name}-${i}`}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 p-3"
                      >
                        {role && (
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {role}
                          </span>
                        )}
                        <p className="whitespace-pre-line text-sm font-bold text-slate-900">
                          {name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Close Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                {t("closeModal")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AgendaEventCardContent({
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
    locale === "th" && event.descriptionTh
      ? event.descriptionTh
      : event.description;
  const location =
    locale === "th" && event.locationTh ? event.locationTh : event.location;
  const type = locale === "th" && event.typeTh ? event.typeTh : event.type;
  const tone = getEventTone(event.type);

  return (
    <article className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]",
            tone.dot
          )}
        />
        <span className="tabular-nums font-mono text-slate-700 font-black">{event.time}</span>
        {type && (
          <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold", tone.badge)}>
            {type}
          </span>
        )}
        {event.group && (
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
            {formatVenueGroupLabel(event.group)}
          </span>
        )}
      </div>

      <h4
        className={cn(
          "font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600",
          compact ? "text-[13px]" : "text-base sm:text-lg"
        )}
      >
        {title}
      </h4>

      {description && (
        <p
          className={cn(
            "mt-2 whitespace-pre-wrap font-normal leading-relaxed text-slate-600",
            compact ? "line-clamp-4 text-[11px]" : "text-sm"
          )}
        >
          {description}
        </p>
      )}

      <div className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
        <MapPin aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" />
        <span>{location}</span>
      </div>

      {event.speakers.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-slate-200/70 pt-2.5">
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
                <Users aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" />
                <span className="text-slate-700">
                  {role && (
                    <span className="mb-0.5 block font-bold text-[10px] uppercase tracking-wider text-blue-600">
                      {role}
                    </span>
                  )}
                  <span className="block whitespace-pre-line font-medium text-slate-800 text-[11px]">
                    {formatSpeakerName(name)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function MobileTimelineList({
  groups,
  allColumns,
  locale,
  onSelectEvent,
  otherVenueLabel,
}: {
  groups: ReturnType<typeof groupEventsForMobile>;
  allColumns: ReturnType<typeof buildVenueColumns>;
  locale: string;
  onSelectEvent: (event: Event) => void;
  otherVenueLabel: string;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group, groupIndex) => (
        <section
          key={`${group.timeLabel}-${groupIndex}`}
          className="schedule-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Time Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <span className="h-5 w-1 rounded-full bg-blue-600" aria-hidden="true" />
            <h3 className="text-base font-black tabular-nums text-slate-900">
              {group.timeLabel}
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {group.events.map((event) => {
              const isSpanningRooms = (event.spanTracks?.length ?? 0) > 1;
              const venue = allColumns.find(
                (col) => col.key === resolveVenueKey(event)
              );
              const venueLabel = isSpanningRooms
                ? locale === "th"
                  ? event.locationTh
                  : event.location
                : venue?.label ?? otherVenueLabel;
              const tone = getEventTone(event.type);

              return (
                <div
                  key={event.id}
                  className={cn(
                    "px-4 py-4 cursor-pointer transition-all",
                    tone.mobile
                  )}
                  onClick={() => onSelectEvent(event)}
                >
                  <div className="mb-2.5 inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 shadow-2xs">
                    {venueLabel}
                  </div>
                  <AgendaEventCardContent event={event} locale={locale} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
