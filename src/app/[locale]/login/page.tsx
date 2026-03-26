"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import gsap from "gsap";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();

  useEffect(() => {
    document.body.classList.remove("hero-playing");

    const ctx = gsap.context(() => {
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
    }, containerRef);

    return () => ctx.revert();
  }, []);

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
              Empowering<br />Medical Horizons
            </h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
              You can achieve significant breakthroughs when you connect, explore, and commit to the vision of PRIS 2026.
            </p>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-10 px-6 sm:px-12 lg:px-20 xl:px-28 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto">
          
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
                Login
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Enter your email and password to access your account
              </p>
            </div>

            <form className="space-y-6 fade-in-element" onSubmit={(e) => { 
              e.preventDefault(); 
              localStorage.setItem('isLoggedIn', 'true'); 
              const urlParams = new URLSearchParams(window.location.search);
              const redirect = urlParams.get('redirect') || '/';
              router.push(redirect); 
            }}>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black" 
                  />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors select-none">
                    Remember me
                  </span>
                </label>
                <Link href="#" className="text-sm font-bold text-gray-900 hover:underline underline-offset-4">
                  Forgot Password
                </Link>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                >
                  Sign In
                </button>
              </div>
            </form>

            <div className="mt-12 text-center fade-in-element">
              <p className="text-sm font-medium text-gray-500">
                Don't have an account?{" "}
                <Link href="/signup" className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
