"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  FileText, 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  ClipboardCheck, 
  ArrowLeft,
  ChevronRight,
  Printer
} from "lucide-react";
import { submissionGuidelines } from "@/data/abstractData";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DetailedGuidelines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Fade in sections on scroll
    const sections = containerRef.current?.querySelectorAll(".guide-section");
    sections?.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          },
        }
      );
    });
  }, { scope: containerRef });

  const handlePrint = () => {
    window.print();
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-slate-50 pt-20">
      <Header />
      
      {/* Premium Header */}
      <section className="bg-blue-900 overflow-hidden relative py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/assets/Img/BG/BG-4500x2281.webp')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900 to-slate-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-gold/60 text-xs font-bold uppercase tracking-widest mb-8">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/call-for-abstracts" className="hover:text-gold transition-colors">Call for Abstracts</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Detailed Guidelines</span>
            </nav>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white font-outfit uppercase tracking-tighter leading-none mb-8">
              Submission <span className="text-gold">Deep-Dive</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mb-10">
              {submissionGuidelines.intro}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                href="/abstract-submission" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-black font-black uppercase tracking-wider text-sm rounded-full hover:bg-white transition-all transform hover:-translate-y-1 shadow-xl shadow-gold/20"
              >
                Go to submission form
              </Link>
              <button 
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 font-black uppercase tracking-wider text-sm rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Printer className="w-4 h-4" />
                Print Guidelines
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 -mt-20 relative z-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* General Rules */}
          <div className="guide-section bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-slate-200 border border-white">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-3xl bg-gold flex items-center justify-center text-black">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-blue-900 uppercase">General Rules</h2>
                <div className="w-20 h-1 bg-gold mt-2 rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {submissionGuidelines.general.map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="shrink-0 w-1.5 h-auto bg-slate-100 group-hover:bg-gold transition-colors rounded-full" />
                  <p className="text-slate-600 font-medium text-lg leading-relaxed pt-1">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Formatting Requirements */}
          <div className="guide-section bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-slate-200 border border-white">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-3xl bg-blue-900 flex items-center justify-center text-gold">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-blue-900 uppercase">Formatting</h2>
                <div className="w-20 h-1 bg-blue-900 mt-2 rounded-full" />
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10">
              <ul className="space-y-6">
                {submissionGuidelines.formatting.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 shrink-0 mt-1 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <span className="text-slate-700 font-semibold leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ethics & Declaration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="guide-section bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200 border border-white h-full">
              <div className="flex items-center gap-4 mb-8">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
                <h3 className="text-xl font-black text-blue-900 uppercase">Declaration</h3>
              </div>
              <ul className="space-y-4">
                {submissionGuidelines.policies.declaration.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                    <span className="text-slate-600 font-medium text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="guide-section bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200 border border-white h-full">
              <div className="flex items-center gap-4 mb-8">
                <ClipboardCheck className="w-10 h-10 text-blue-500" />
                <h3 className="text-xl font-black text-blue-900 uppercase">Reviewing</h3>
              </div>
              <ul className="space-y-4">
                {submissionGuidelines.policies.acceptance.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                    <span className="text-slate-600 font-medium text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Withdrawal & Contact */}
          <div className="guide-section bg-[#0a0f1d] rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-2/3">
                <div className="flex items-center gap-4 mb-6">
                  <AlertTriangle className="w-10 h-10 text-gold" />
                  <h3 className="text-2xl font-black uppercase font-outfit">Withdrawal Policy</h3>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                  {submissionGuidelines.policies.withdrawal}
                </p>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">
                    Need technical support with the submission system? <br />
                    Contact: <span className="text-gold">support@pris2026.com</span>
                  </p>
                </div>
              </div>
              <div className="md:w-1/3 text-center">
                <Link 
                  href="/call-for-abstracts"
                  className="inline-flex flex-col items-center gap-4 group"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all">
                    <ArrowLeft className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[3px] text-gold">Back to overview</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
