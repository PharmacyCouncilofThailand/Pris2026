"use client";

import React from "react";
import { abstractTimeline, submissionGuidelines } from "@/data/abstractData";
import { useLocale } from "next-intl";

export default function AbstractTimeline() {
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
    <section className="border-b border-slate-200 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-12 md:mb-16">
          <h2 className="font-outfit text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {locale === "th" ? "กำหนดการสำคัญ" : "Important Dates"}
          </h2>
        </div>

        <div className="space-y-0">
          {abstractTimeline.map((item, index) => (
            <div
              key={index}
              className="flex flex-col justify-between border-t border-slate-200 py-6 first:border-t-0 md:flex-row md:items-center"
            >
              <div className="mb-2 md:mb-0 md:w-1/2">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  {locale === "th" && item.labelTh ? item.labelTh : item.label}
                </h3>
              </div>

              <div className="md:w-1/2 md:text-right">
                <p className="font-outfit text-xl font-bold text-slate-900 md:text-2xl">
                  {locale === "th" && item.dateTh ? item.dateTh : item.date}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {reviewNoteTitle}
          </p>
          <p className="text-sm leading-relaxed text-slate-600 md:text-[0.95rem]">
            {reviewNote}
          </p>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-red-700 md:text-[0.95rem]">
            {reservationNote}
          </p>
        </div>
      </div>
    </section>
  );
}
