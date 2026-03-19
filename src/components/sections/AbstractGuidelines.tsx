"use client";

import React from "react";
import { useLocale } from "next-intl";
import { submissionGuidelines } from "@/data/abstractData";

export default function AbstractGuidelines() {
  const locale = useLocale();
  const guidelines = locale === "th" ? submissionGuidelines.guidelinesTh : submissionGuidelines.guidelines;
  const reviewNoteSegments =
    locale === "th"
      ? submissionGuidelines.presenterRegistrationNoteSegmentsTh
      : submissionGuidelines.presenterRegistrationNoteSegments;

  return (
    <section className="border-b border-slate-200 py-20 md:py-28">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-outfit text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {locale === "th" ? "คำแนะนำการส่งบทคัดย่อ" : "Submission Guidelines"}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            {locale === "th"
              ? "กรุณาปฏิบัติตามคำแนะนำเหล่านี้อย่างเคร่งครัด เพื่อให้บทคัดย่อของท่านได้รับการพิจารณา"
              : "Please follow these instructions carefully to ensure your abstract is considered for review."}
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h3 className="mb-6 border-b border-slate-200 pb-4 text-xl font-bold uppercase tracking-widest text-slate-900">
              {locale === "th" ? "รูปแบบทั่วไป" : "General Format"}
            </h3>
            <ul className="list-outside list-disc space-y-3 pl-5 leading-relaxed text-slate-600">
              {guidelines.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className="border-l-4 border-orange-500 bg-orange-50 p-8">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-900">
              {locale === "th" ? "หมายเหตุการพิจารณา" : "Review Note"}
            </h4>
            <p className="leading-relaxed text-orange-800">
              {reviewNoteSegments.map((segment: { text: string; accent?: boolean }, index: number) => (
                <span
                  key={`${segment.text}-${index}`}
                  className={segment.accent ? "font-semibold text-red-600" : undefined}
                >
                  {segment.text}
                </span>
              ))}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
