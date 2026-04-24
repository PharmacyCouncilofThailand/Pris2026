"use client";

import React, { useState, useEffect } from "react";
import { abstractTimeline, submissionGuidelines } from "@/data/abstractData";
import { useLocale } from "next-intl";

export default function AbstractTimeline() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date());
  }, []);

  const locale = useLocale();
  const reservationNote =
    locale === "th"
      ? submissionGuidelines.importantDatesReservationNoteTh
      : submissionGuidelines.importantDatesReservationNote;
  const reviewNote =
    locale === "th"
      ? submissionGuidelines.presenterRegistrationNoteTh
      : submissionGuidelines.presenterRegistrationNote;
  const reviewNoteTitle = locale === "th" ? "หมายเหตุการพิจารณา" : "Review Note";

  return (
    <section className="py-20 md:py-32 bg-[#FAFBFF] md:bg-white text-slate-900 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 md:px-8">
        
        {/* Header Section */}
        <div className="mb-14 md:mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-[2px] bg-[#0055FF]"></div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0055FF]">
              {locale === "th" ? "กำหนดการ" : "Timeline"}
            </p>
          </div>
          <h2 className="font-outfit text-5xl sm:text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[0.9]">
            {locale === "th" ? "วันสำคัญ" : "Important Dates"}
          </h2>
        </div>

        {/* Timeline List */}
        <div className="flex flex-col border-t border-slate-200">
          {abstractTimeline.map((item, index) => {
            let isPastOrCurrent = false;
            if (currentDate) {
              const itemDate = new Date(item.date);
              isPastOrCurrent = currentDate.getTime() >= itemDate.getTime();
            }
            
            // First item gets specific red styling according to the design
            const isFirstItem = index === 0;

            return (
              <div
                key={index}
                className="flex flex-col justify-between py-6 md:py-8 border-b border-slate-200 md:flex-row md:items-center transition-colors duration-300 hover:bg-slate-50"
              >
                <div className="mb-3 md:mb-0 md:w-1/2">
                  <h3 className={`text-base md:text-lg transition-colors duration-300 ${isFirstItem ? "text-red-600 font-bold" : "text-slate-800 font-medium"}`}>
                    {locale === "th" && item.labelTh ? item.labelTh : item.label}
                  </h3>
                </div>

                <div className="md:w-1/2 md:text-right">
                  <p className={`font-outfit text-sm md:text-[0.95rem] transition-colors duration-300 ${isFirstItem ? "text-red-500 font-semibold" : "text-slate-400 font-medium"}`}>
                    {locale === "th" && item.dateTh ? item.dateTh : item.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Requirements Box */}
        <div className={`mt-12 md:mt-16 border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg ${locale === "th" ? "w-fit overflow-x-auto max-w-full" : "max-w-4xl"}`}>
          <p className={`text-red-700 text-sm md:text-base font-medium ${locale === "th" ? "whitespace-nowrap" : ""}`}>
            {reviewNote}
          </p>
        </div>
      </div>
    </section>
  );
}
