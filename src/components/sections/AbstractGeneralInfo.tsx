"use client";

import React from "react";
import { submissionGuidelines } from "@/data/abstractData";
import { useLocale } from "next-intl";

export default function AbstractGeneralInfo() {
  const locale = useLocale();

  return (
    <section className="bg-white px-6 md:px-12 py-20 md:py-28 border-b border-slate-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-blue-600" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
              {locale === "th" ? "ภาพรวม" : "Overview"}
            </span>
          </div>
          <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-gray-900 sm:text-5xl md:text-7xl">
            {locale === "th" ? "ข้อมูลทั่วไป" : "General Information"}
          </h2>
        </div>

        {/* Content List */}
        <div className="border-t border-gray-200">
          {submissionGuidelines.generalInformation.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 border-b border-gray-200 py-5 md:flex-row md:items-baseline md:gap-8"
            >
              <span className="text-base font-medium text-gray-900 lg:w-[45%]">
                {locale === "th" && item.labelTh ? item.labelTh : item.label}
              </span>
              <span className="text-sm text-gray-500 md:text-base">
                {locale === "th" && item.valueTh ? item.valueTh : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
