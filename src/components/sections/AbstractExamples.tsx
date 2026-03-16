"use client";

import React from "react";
import { abstractExample } from "@/data/abstractData";

export default function AbstractExamples() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white text-slate-900 p-8 md:p-12 border border-slate-200 shadow-sm rounded-xl font-sans">
          {/* Title */}
          <h4 className="text-[17px] font-bold text-slate-900 mb-5 leading-snug">
            {abstractExample.title}
          </h4>
          
          {/* Authors */}
          <div className="mb-4 text-[13px] text-slate-800">
            {abstractExample.authors.map((author, i) => (
              <span key={i} className={`${author.isPresenter ? 'underline text-slate-900' : ''}`}>
                {author.name}<sup className="text-[10px]">{author.affiliation}</sup>{i < abstractExample.authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          {/* Affiliations */}
          <div className="space-y-1.5 mb-6">
            {abstractExample.affiliations.map((aff) => (
              <p key={aff.id} className="text-[11px] text-slate-700">
                <sup className="text-[9px] mr-1">{aff.id}</sup>{aff.name}
              </p>
            ))}
          </div>
          
          {/* Corresponding Author (Mocked for visual accuracy) */}
          <p className="text-[11px] text-slate-700 italic mb-8">
            Corresponding Author: {abstractExample.authors[0].name}, elida-z@ff.unair.ac.id
          </p>

          <hr className="border-slate-100 my-8" />

          {/* Body Sections */}
          <div className="space-y-5">
            {abstractExample.sections.map((sec, i) => (
              <p key={i} className="text-[13px] text-slate-700 leading-relaxed text-justify">
                <strong className="text-slate-900 mr-2">{sec.heading}:</strong>
                {sec.content}
              </p>
            ))}
            
            {/* Keywords */}
            <p className="text-[13px] text-slate-700 leading-relaxed mt-6">
              <strong className="text-slate-900 mr-2">Keywords:</strong>
              {abstractExample.keywords.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
