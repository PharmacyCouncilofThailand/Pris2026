"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { submissionGuidelines } from "@/data/abstractData";

export default function AbstractGuidelines() {
  const locale = useLocale();
  const t = useTranslations("abstractGuidelines");

  const guidelines = locale === "th" ? submissionGuidelines.guidelinesTh : submissionGuidelines.guidelines;

  return (
    <div className="bg-white">
      {/* General Information moved to Submission Guidelines */}

      {/* ══════ SUBMISSION GUIDELINES ══════ */}
      <section className="relative px-6 md:px-12 py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">
                {locale === "th" ? "กฎที่ต้องปฏิบัติตาม" : "Submission Rules"}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900">
              {locale === "th" ? "คำแนะนำการส่งผลงาน" : "Submission Guidelines"}
            </h2>
          </div>

          <div className="border-t border-gray-200">
            {guidelines.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-4 py-5 border-b border-gray-100">
                <span className="text-blue-200 text-sm font-bold tracking-widest shrink-0 pt-0.5">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-slate-600 text-base leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>

          {/* Callouts */}
          <div className="mt-12 space-y-4 max-w-4xl">
            <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
              <p className="text-red-700 text-sm md:text-base font-medium">
                {locale === "th" ? submissionGuidelines.noMediaNoteTh : submissionGuidelines.noMediaNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Abstract structure removed per user request */}

      {/* Policies & Declaration removed per user request */}
    </div>
  );
}
