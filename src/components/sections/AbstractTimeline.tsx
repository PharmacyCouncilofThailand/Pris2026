"use client";

import React from "react";
import { abstractTimeline } from "@/data/abstractData";
import { useLocale } from "next-intl";

export default function AbstractTimeline() {
  const locale = useLocale();
  return (
    <section className="py-20 md:py-28 border-b border-slate-200">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-outfit tracking-tight">
            {locale === "th" ? "กำหนดการสำคัญ" : "Important Dates"}
          </h2>
        </div>

        <div className="space-y-0">
          {abstractTimeline.map((item, index) => {
            const isCompleted = item.status === "completed";
            const isActive = item.status === "active";

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between py-6 border-t border-slate-200 first:border-t-0"
              >
                <div className="mb-2 md:mb-0 md:w-1/3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    {locale === "th" && item.labelTh ? item.labelTh : item.label}
                  </h3>
                </div>
                
                <div className="md:w-1/3">
                  <p className={`text-xl md:text-2xl font-bold font-outfit ${
                    isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}>
                    {locale === "th" && item.dateTh ? item.dateTh : item.date}
                  </p>
                </div>

                <div className="mt-2 md:mt-0 md:w-1/3 md:text-right">
                  {isActive && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
                      {locale === "th" ? "เปิดรับผลงาน" : "Active Deadline"}
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      {locale === "th" ? "ผ่านไปแล้ว" : "Passed"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
