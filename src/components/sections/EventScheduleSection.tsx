"use client";

import React, { useState, useRef, useMemo } from "react";
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
import { EventSpeaker, Event } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TRACKS = [
  { id: "JUPITER 4-7", label: "JUPITER 4-7", labelTh: "ห้อง JUPITER 4-7" },
  { id: "JUPITER 11", label: "JUPITER 11", labelTh: "ห้อง JUPITER 11" },
  { id: "JUPITER 12", label: "JUPITER 12", labelTh: "ห้อง JUPITER 12" },
  { id: "JUPITER 13", label: "JUPITER 13", labelTh: "ห้อง JUPITER 13" },
  { id: "INNOVATION ZONE", label: "INNOVATION ZONE", labelTh: "INNOVATION ZONE" },
];

function getTrackColor(track?: string) {
  switch (track) {
    case "JUPITER 4-7": 
      return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", strip: "bg-amber-500" };
    case "JUPITER 11": 
      return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-300", strip: "bg-blue-500" };
    case "JUPITER 12": 
      return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", strip: "bg-emerald-500" };
    case "JUPITER 13": 
      return { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300", strip: "bg-purple-500" };
    case "INNOVATION ZONE":
      return { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", strip: "bg-rose-500" };
    case "Common":
    default: 
      return { bg: "bg-white/5", border: "border-white/10", text: "text-white/60", strip: "bg-gold" };
  }
}

function EventCard({ event, locale }: { event: Event; locale: string }) {
  const tColors = getTrackColor(event.track);
  const title = locale === 'th' && event.titleTh ? event.titleTh : event.title;
  const description = locale === 'th' ? event.descriptionTh : event.description;
  const location = locale === 'th' ? event.locationTh : event.location;
  const type = locale === 'th' ? event.typeTh : event.type;
  const trackName = locale === 'th' ? event.trackTh : event.track;

  return (
    <div className="group relative bg-[#0b1a4a]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-[#0b1a4a]/60 hover:border-white/20 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] transition-all duration-500 overflow-hidden w-full">
       {/* Left Color Strip Indicator */}
       <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-colors duration-500", tColors.strip)}></div>
       


       {/* Title & Description */}
       <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-gold transition-colors leading-snug lg:leading-tight pr-4">
          {title}
       </h4>
       
       {description && (
          <p className="text-white/60 text-sm md:text-base font-light leading-relaxed mb-6 max-w-4xl whitespace-pre-wrap">
             {description}
          </p>
       )}

       <div className={cn(
          "flex items-center gap-2 text-[10px] md:text-xs text-white/40 uppercase tracking-widest",
          event.speakers && event.speakers.length > 0 ? "mb-6 border-b border-white/10 pb-6" : "mt-8"
       )}>
          <MapPin className="w-3.5 h-3.5" />
          {location}
       </div>

       {/* Speakers (Always visible, clean grid layout) */}
       {event.speakers && event.speakers.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
             {event.speakers.map((sp, idx) => (
                 <div key={idx} className="flex items-center gap-4 group/speaker">
                    {sp.image ? (
                      <div className="w-12 h-12 md:w-14 md:h-14 relative rounded-full overflow-hidden border-2 border-white/10 group-hover/speaker:border-white/40 transition-colors shrink-0">
                         <Image src={sp.image} alt={sp.name} fill sizes="56px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 md:w-14 md:h-14 relative rounded-full overflow-hidden border-2 border-white/10 group-hover/speaker:border-white/40 transition-colors shrink-0 bg-white/5 flex items-center justify-center">
                         <span className="text-white/40 font-bold text-lg">
                           {(locale === 'th' && sp.nameTh ? sp.nameTh : sp.name).charAt(0)}
                         </span>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                       <span className={`font-bold text-sm md:text-base text-white group-hover/speaker:text-gold transition-colors block ${event.id === 3 || event.id === 1202 || event.id === 14 ? "whitespace-nowrap" : "whitespace-pre-line"}`}>
                          {locale === 'th' && sp.nameTh ? sp.nameTh : sp.name}
                       </span>
                       <span className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-wider block mt-0.5">
                          {locale === 'th' && sp.roleTh ? sp.roleTh : sp.role}
                       </span>
                    </div>
                 </div>
             ))}
         </div>
       )}
    </div>
  )
}

export default function EventScheduleSection() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(0);
  const [activeTrack, setActiveTrack] = useState("JUPITER 4-7");
  const [activeGroup, setActiveGroup] = useState("GROUP 1");
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const INNOVATION_GROUPS = ["GROUP 1", "GROUP 2", "GROUP 3", "GROUP 4"];

  // Reset track when day changes
  React.useEffect(() => {
    setActiveTrack("JUPITER 4-7");
  }, [activeTab]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
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
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Re-animate the timeline block when data changes
  useGSAP(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(".timeline-row");
    
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          force3D: true,
        }
      );
    }
  }, [activeTab, activeTrack]);

  const currentDay = scheduleData[activeTab];

  // Filter events based on selected track
  const filteredEvents = useMemo(() => {
    return currentDay.events.filter(e => {
      if (activeTrack === "INNOVATION ZONE") {
        return e.track === "INNOVATION ZONE" && e.group === activeGroup;
      }
      return e.track === activeTrack;
    });
  }, [currentDay, activeTrack, activeGroup]);

  // Group filtered events by time
  const timeGroups = useMemo(() => {
    const groups: { time: string, events: Event[] }[] = [];
    filteredEvents.forEach(event => {
      let group = groups.find(g => g.time === event.time);
      if (!group) {
        group = { time: event.time, events: [] };
        groups.push(group);
      }
      group.events.push(event);
    });
    return groups;
  }, [filteredEvents]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 lg:py-32 bg-[linear-gradient(to_bottom,black_0%,#0b1a4a_35%,#451a03_65%,black_100%)] text-white overflow-hidden z-[2]"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl relative z-[1]">
        
        {/* Header */}
        <div className="mb-12 sm:mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 agenda-title">
            <SectionTitle
              title={t('sectionTitle')}
              align="left"
              theme="dark"
            />
        </div>

        {/* ─── Level 1 Navigation: Day Tabs ─── */}
        <div className="day-tabs-container flex overflow-x-auto sm:flex-wrap gap-6 sm:gap-8 md:gap-16 pb-6 no-scrollbar">
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
                    "text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight transition-colors duration-500 leading-normal pt-2",
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

        {/* ─── Level 2 Navigation: Track Chips Filter ─── */}
        <div className="flex overflow-x-auto gap-3 pb-8 mb-8 border-b border-white/10 no-scrollbar snap-x">
          {TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={cn(
                "snap-start whitespace-nowrap px-5 py-3 md:px-6 md:py-3.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 border flex-shrink-0",
                activeTrack === track.id 
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
              )}
            >
              {locale === 'th' ? track.labelTh : track.label}
            </button>
          ))}
        </div>

        {/* ─── Level 3 Navigation: Innovation Zone Groups ─── */}
        {activeTrack === "INNOVATION ZONE" && (
          <div className="flex overflow-x-auto gap-3 pb-8 mb-8 border-b border-white/10 no-scrollbar snap-x">
            {INNOVATION_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={cn(
                  "snap-start whitespace-nowrap px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 border flex-shrink-0",
                  activeGroup === group 
                    ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
                )}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        {/* ─── The Ultimate Vertical Timeline ─── */}
        <div ref={containerRef} className="w-full flex flex-col gap-10 md:gap-20">
          
          {timeGroups.length > 0 ? (
            timeGroups.map((group, groupIdx) => (
              <div 
                key={groupIdx} 
                className="timeline-row grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr] gap-4 md:gap-10 lg:gap-12 pt-6 md:pt-0 relative"
              >
                {/* Time Column (Sticky on Desktop) */}
                <div className="relative">
                  {/* Vertical Line Connector (Desktop only) */}
                  <div className="hidden lg:block absolute right-[-40px] xl:right-[-32px] top-4 bottom-[-100px] w-px bg-gradient-to-b from-white/20 to-transparent"></div>
                  
                  <div className="lg:sticky lg:top-32 lg:py-2 flex items-center lg:items-start gap-4">
                     {/* Node dot (Desktop only) */}
                     <div className="hidden lg:block absolute right-[-44px] xl:right-[-36px] top-6 w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
                     <div className="flex flex-row items-baseline gap-2 text-gold">
                       <span className="text-4xl md:text-5xl font-black tracking-tighter">
                         {group.time.split(" – ")[0]}
                       </span>
                       {group.time.split(" – ")[1] && (
                         <span className="text-2xl md:text-3xl font-bold opacity-60 tracking-tight whitespace-nowrap">
                           – {group.time.split(" – ")[1]}
                         </span>
                       )}
                     </div>
                  </div>
                </div>

                {/* Cards Column */}
                <div className="flex flex-col gap-6 md:gap-8">
                  {group.events.map(event => (
                    <EventCard key={event.id} event={event} locale={locale} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-6">
                 <MapPin className="w-8 h-8 text-white/40" />
              </div>
              <h4 className="text-2xl font-bold mb-2">No Active Sessions</h4>
              <p className="max-w-md text-white/60">
                {locale === 'th' 
                  ? 'ไม่มีการจัดประชุมหรือกิจกรรมในห้องที่ท่านเลือกสำหรับวันนี้' 
                  : 'There are no sessions scheduled in this room for the selected day.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
