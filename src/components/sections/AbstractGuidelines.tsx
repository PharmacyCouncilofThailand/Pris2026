"use client";

import React from "react";
import { submissionGuidelines } from "@/data/abstractData";

export default function AbstractGuidelines() {
  return (
    <section className="py-20 md:py-28 border-b border-slate-200">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 font-outfit tracking-tight">
            Submission Guidelines
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Please follow these instructions carefully to ensure your abstract is considered for review.
          </p>
        </div>

        <div className="space-y-12">
          {/* General Rules */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">
              General Format
            </h3>
            <ul className="list-disc list-outside pl-5 space-y-3 text-slate-600 leading-relaxed">
              {submissionGuidelines.general.map((rule, i) => (
                <li key={i}>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          {/* Important Note */}
          <section className="bg-orange-50 p-8 border-l-4 border-orange-500">
            <h4 className="text-orange-900 font-bold uppercase tracking-widest text-sm mb-3">
              Important Note
            </h4>
            <p className="text-orange-800 leading-relaxed">
              {submissionGuidelines.importantNote}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
