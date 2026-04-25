"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function SignUpTypePage() {
  const containerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
      gsap.fromTo(
        ".fade-in-element",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
  }, { scope: containerRef });

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-black selection:text-white pt-24 lg:pt-8 relative z-40">
      <div 
        ref={containerRef}
        className="w-full max-w-[1240px] bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-2 lg:p-3 shadow-[0_20px_80px_rgba(0,0,0,0.06)] flex gap-4 min-h-[85vh] lg:min-h-[760px] relative z-10"
      >
        {/* Abstract Background Left Side */}
        <div className="hidden lg:flex w-1/2 relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-90"
            style={{ backgroundImage: "url('/assets/Img/Pris%202026%20bg%20login.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          
          <div className="relative z-10 fade-in-element">
            <Link href="/" className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back</span>
            </Link>
          </div>

          <div className="relative z-10 fade-in-element">
            <h2 className="text-white text-6xl font-serif tracking-tight leading-[1.05] mb-6">
              Join the<br />Evolution
            </h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
              Create an account to securely access submissions, schedules, and personalized conference experiences.
            </p>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-10 px-6 sm:px-12 lg:px-20 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto">
          
          <div className="w-full max-w-[420px] py-4">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex justify-start mb-6 fade-in-element">
              <Link href="/" className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold">Back</span>
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-10 fade-in-element">
              <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-70">
                <Image
                  src="/assets/Img/logo/Pris2026-logo.svg"
                  alt="PRIS 2026 Logo"
                  width={140}
                  height={56}
                  className="h-9 w-auto object-contain brightness-0"
                  priority
                />
              </Link>
            </div>

            <div className="text-center mb-12 fade-in-element">
              <h1 className="text-4xl lg:text-[2.75rem] font-serif tracking-tight text-gray-900 mb-3 leading-tight">
                Create Account
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Select your academic or professional profile
              </p>
            </div>

            <div className="space-y-4 fade-in-element">
              <Link 
                href="/signup/student" 
                className="group flex items-center justify-between p-6 rounded-2xl bg-[#f8f9fc] border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-black">Student</h3>
                  <p className="text-sm font-medium text-gray-500">For academic attendees</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all text-black border border-gray-100 group-hover:border-black">
                   <div className="text-[10px] font-bold uppercase tracking-widest">Go</div>
                </div>
              </Link>

              <Link 
                href="/signup/pharmacist" 
                className="group flex items-center justify-between p-6 rounded-2xl bg-[#f8f9fc] border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-black">Pharmacist</h3>
                  <p className="text-sm font-medium text-gray-500">For licensed pharmacists</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all text-black border border-gray-100 group-hover:border-black">
                   <div className="text-[10px] font-bold uppercase tracking-widest">Go</div>
                </div>
              </Link>

              <Link 
                href="/signup/healthcare" 
                className="group flex items-center justify-between p-6 rounded-2xl bg-[#f8f9fc] border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-black">Healthcare Professional</h3>
                  <p className="text-sm font-medium text-gray-500">For healthcare personnel</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all text-black border border-gray-100 group-hover:border-black">
                   <div className="text-[10px] font-bold uppercase tracking-widest">Go</div>
                </div>
              </Link>
            </div>

            <div className="mt-12 text-center fade-in-element">
              <p className="text-sm font-medium text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
