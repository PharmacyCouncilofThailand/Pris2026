"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown, MapPin } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { scheduleData } from "@/data/scheduleData";
import { useTranslations, useLocale } from "next-intl";
import { SectionTitle } from "@/components/elements/SectionTitle";
import { EventSpeaker } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function EventRow({ event, locale }: { event: any; locale: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="schedule-row group border-b border-white/10 py-8 sm:py-10 md:py-14 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 relative hover:bg-white/[0.02] transition-colors duration-500">
      {/* Time & Type */}
      <div className="lg:w-1/4 flex-shrink-0 flex flex-row lg:flex-col justify-between lg:justify-start items-baseline lg:items-start gap-3 sm:gap-4">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gold tracking-tight">
          {event.time}
        </h3>
        <span className="px-2.5 sm:px-3 py-1 rounded-full border border-white/20 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/50">
          {locale === "th" && event.typeTh ? event.typeTh : event.type}
        </span>
      </div>

      {/* Event Content */}
      <div className="lg:w-2/4 flex flex-col">
        <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 leading-snug group-hover:text-gold transition-colors duration-300">
          {locale === "th" && event.titleTh ? event.titleTh : event.title}
        </h4>
        {(locale === "th" ? event.descriptionTh : event.description) && (
          <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed mb-5 sm:mb-6 max-w-2xl whitespace-pre-wrap">
            {locale === "th" ? event.descriptionTh : event.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-sm text-white/40 uppercase tracking-widest mt-auto">
          {locale === "th" && event.locationTh ? event.locationTh : event.location}
        </div>
      </div>

      {/* Speaker Slots (Supports Multiple Speakers) */}
      <div className="lg:w-1/4 flex-shrink-0 flex flex-col gap-3">
        {event.speakers && event.speakers.length > 0 ? (
          <>
            {event.speakers
              .slice(0, isExpanded ? event.speakers.length : 2)
              .map((speaker: EventSpeaker, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 py-2 group/speaker transition-opacity duration-300 hover:opacity-80"
                >
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover/speaker:border-white/20 transition-all duration-300">
                    <Image 
                      src={speaker.image} 
                      alt={speaker.name}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-500 group-hover/speaker:scale-110"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white mb-0.5">
                      {speaker.name}
                    </h5>
                    <span className="text-[10px] md:text-xs text-gold uppercase tracking-wider block">
                      {locale === "th" && speaker.roleTh ? speaker.roleTh : speaker.role}
                    </span>
                  </div>
                </div>
              ))}
            {event.speakers.length > 2 && (
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 flex items-center justify-between gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gold hover:text-white transition-colors duration-300 w-full px-2 py-1 h-auto"
              >
                {isExpanded 
                  ? (locale === "th" ? "แสดงน้อยลง" : "Show Less") 
                  : `${locale === "th" ? "ดูวิทยากรทั้งหมด" : "View all"} ${event.speakers.length} ${locale === "th" ? "ท่าน" : "speakers"}`}
                <ChevronDown 
                  className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} 
                />
              </Button>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-start">
              {/* Empty slot placeholder */}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventScheduleSection() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(0);
  const [showAfternoon, setShowAfternoon] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset afternoon toggle when tab changes
  React.useEffect(() => {
    setShowAfternoon(false);
  }, [activeTab]);

  useGSAP(
    () => {
      // Animate Section Title
      gsap.fromTo(
        ".agenda-title",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power4.out",
          force3D: true,
          scrollTrigger: { trigger: ".agenda-title", start: "top 80%" },
        }
      );

      // Animate Day Tabs
      gsap.fromTo(
        ".day-tab",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          force3D: true,
          scrollTrigger: { trigger: ".day-tabs-container", start: "top 85%" },
        }
      );
    },
    { scope: sectionRef }
  );

  // Re-animate list when tab changes
  useGSAP(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".schedule-row");
    
    gsap.fromTo(
      items,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        force3D: true,
      }
    );
  }, [activeTab]);

  const currentDay = scheduleData[activeTab];

  // Split events into morning and afternoon (starting 13:00 or later)
  const splitIndex = currentDay.events.findIndex(e => {
    // Try to handle different dash characters safely
    const timeStr = e.time.replace("–", "-"); 
    const startTimeStr = timeStr.split("-")[0].trim();
    const startTimeHours = parseInt(startTimeStr.split(":")[0], 10);
    return startTimeHours >= 13 && !isNaN(startTimeHours);
  });

  const actualSplitIndex = splitIndex === -1 ? currentDay.events.length : splitIndex;
  const morningEvents = currentDay.events.slice(0, actualSplitIndex);
  const afternoonEvents = currentDay.events.slice(actualSplitIndex);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-40 bg-[linear-gradient(to_bottom,black_0%,#0b1a4a_35%,#451a03_65%,black_100%)] text-white overflow-hidden z-[2]"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-[1]">
        
        {/* Header - Editorial Style */}
        <div className="mb-12 sm:mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 agenda-title">
            <SectionTitle
              subtitle={t('sectionSubtitle')}
              title={t('sectionTitle')}
              align="left"
              theme="dark"
            />
        </div>

        {/* ─── Day Selector (Mobile-First scrollable, Large typography) ─── */}
        <div className="day-tabs-container flex overflow-x-auto sm:flex-wrap gap-6 sm:gap-8 md:gap-16 mb-10 md:mb-20 border-b border-white/10 pb-6 sm:pb-8 no-scrollbar">
          {scheduleData.map((day, index) => (
            <Button
              key={index}
              onClick={() => setActiveTab(index)}
              variant="ghost"
              className="day-tab group flex flex-col items-start justify-start text-left cursor-pointer flex-shrink-0 h-auto p-0 hover:bg-transparent"
            >
              <div className="flex flex-col items-start gap-1 sm:gap-2">
                <span 
                  className={cn(
                    "text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight transition-colors duration-500",
                    activeTab === index ? "text-white" : "text-white/20 group-hover:text-white/60"
                  )}
                >
                  {t(`day${index + 1}`)}
                </span>
                <span 
                  className={cn(
                    "text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-500",
                    activeTab === index ? "text-gold" : "text-white/20 group-hover:text-white/60"
                  )}
                >
                  {locale === "th" && day.dateTh ? day.dateTh : day.date}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* ─── Event List (Clean layout without confining cards) ─── */}
        <div ref={listRef} className="flex flex-col">
          {/* Morning Events */}
          {morningEvents.map((event: any) => <EventRow key={event.id} event={event} locale={locale} />)}

          {/* Toggle Button for Afternoon Events */}
          {afternoonEvents.length > 0 && (
            <div className="py-8 flex justify-center border-b border-white/10">
              <Button
                onClick={() => setShowAfternoon(!showAfternoon)}
                variant="outline"
                className="rounded-full px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white border border-solid transition-all duration-300"
              >
                <span className="text-sm uppercase tracking-widest font-semibold flex items-center gap-3">
                  {locale === "th" ? "ตารางเวลาเพิ่มเติม" : "View More Schedule"}
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", showAfternoon && "rotate-180")} />
                </span>
              </Button>
            </div>
          )}

          {/* Afternoon Events Accordion */}
          <div 
            className={cn(
              "grid transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)]",
              showAfternoon ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col">
                {afternoonEvents.map((event: any) => <EventRow key={event.id} event={event} locale={locale} />)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
