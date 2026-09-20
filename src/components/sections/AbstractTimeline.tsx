"use client";

import React from "react";
import { abstractTimeline } from "@/data/abstractData";
import { useLocale, useTranslations } from "next-intl";

export default function AbstractTimeline() {
  const tp = useTranslations("abstractPage");
  const locale = useLocale();

  return (
    <section className="py-20 md:py-32 bg-[#FAFBFF] md:bg-white text-slate-900 overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Header Section */}
        <div className="mb-14 md:mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-[2px] bg-[#0055FF]"></div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0055FF]">
              {tp("timeline")}
            </p>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[0.9]">
            {tp("importantDates")}
          </h2>
        </div>

        {/* Timeline List */}
        <div className="flex flex-col border-t border-slate-200">
          {abstractTimeline.map((item, index) => {
            const isClosed = item.status === "closed";
            const isCompleted = item.status === "completed";
            const isUpcoming = item.status === "upcoming";

            return (
              <div
                key={index}
                className="flex flex-col justify-between py-6 md:py-8 border-b border-slate-200 md:flex-row md:items-center transition-colors duration-300 hover:bg-slate-50"
              >
                <div className="mb-3 md:mb-0 md:w-1/2 flex items-center gap-3 flex-wrap">
                  <h3 className={`text-base md:text-lg transition-colors duration-300 ${isUpcoming ? "text-blue-600 font-bold" : "text-slate-800 font-medium"}`}>
                    {locale === "th" && item.labelTh ? item.labelTh : item.label}
                  </h3>
                  {isClosed && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-200">
                      {locale === "th" ? "ปิดรับแล้ว" : "Closed"}
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200">
                      {locale === "th" ? "ประกาศแล้ว" : "Announced"}
                    </span>
                  )}
                </div>

                <div className="md:w-1/2 md:text-right">
                  <p className={`text-sm md:text-[0.95rem] transition-colors duration-300 ${isUpcoming ? "text-blue-600 font-semibold" : "text-slate-400 font-medium"}`}>
                    {locale === "th" && item.dateTh ? item.dateTh : item.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
