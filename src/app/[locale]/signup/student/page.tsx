"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { UploadCloud } from "lucide-react";

export default function StudentSignUpPage() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
      gsap.fromTo(
        ".fade-in-up",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
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
        <div className="hidden lg:flex w-[40%] xl:w-[45%] relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-90"
            style={{ backgroundImage: "url('/assets/Img/Pris%202026%20bg%20login.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          
          <div className="relative z-10 fade-in-up">
            <Link href="/signup" className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back</span>
            </Link>
          </div>

          <div className="relative z-10 fade-in-up">
            <h2 className="text-white text-5xl xl:text-6xl font-serif tracking-tight leading-[1.05] mb-6">
              Empowering<br />Medical Horizons
            </h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
              Discover breakthroughs and connect with leading minds by joining PRIS 2026.
            </p>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="w-full lg:w-[60%] xl:w-[55%] flex flex-col justify-start items-center py-8 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto custom-scrollbar max-h-[85vh] lg:max-h-[800px]">
          
          <div className="w-full max-w-[460px] py-2 lg:py-4">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex justify-start mb-6 fade-in-up">
              <Link href="/signup" className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold">Back</span>
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-10 fade-in-up">
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

            <div className="text-center mb-10 fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-serif tracking-tight text-gray-900 mb-3 leading-tight">
                Join as Student
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Please fill in your details to register your account
              </p>
            </div>

            <form className="space-y-5 fade-in-up" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
              const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
              login({ firstName, lastName, email }, "demo-token");
              const urlParams = new URLSearchParams(window.location.search);
              const redirect = urlParams.get('redirect') || '/';
              router.push(redirect);
            }}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First Name"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last Name"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="idCard">
                  National ID / Passport Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="idCard"
                  placeholder="Enter ID or Passport Number"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="organization">
                  University / Institution
                </label>
                <input
                  type="text"
                  id="organization"
                  placeholder="e.g. Chulalongkorn University"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Student Verification Document (PDF, JPG, PNG) <span className="text-red-500">*</span>
                </label>
                <div className="relative group cursor-pointer">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required accept=".pdf,.jpg,.jpeg,.png" />
                  <div className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 bg-[#f8f9fc] rounded-2xl group-hover:bg-gray-50 group-hover:border-black transition-all">
                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-sm font-medium text-gray-500 group-hover:text-black transition-colors">Choose File</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 mt-2">Select student certificate or related document</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <div className="flex">
                  <div className="flex items-center justify-center px-4 rounded-l-2xl border border-transparent bg-gray-100 text-gray-700 text-sm font-bold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://flagcdn.com/w20/th.png" alt="TH" width={20} height={15} className="mr-2" />
                    +66
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="08X XXX XXXX"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-r-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-black text-gray-900 placeholder:text-gray-400 outline-none transition-all tracking-widest focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-black text-gray-900 placeholder:text-gray-400 outline-none transition-all tracking-widest focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
              </div>

              {/* Recaptcha Mock */}
              <div className="pt-2 pb-2 flex justify-start">
                <div className="w-[300px] h-[74px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[28px] h-[28px] rounded-[2px] border-[2px] border-[#c1c1c1] bg-white cursor-pointer hover:border-[#b2b2b2]"></div>
                    <span className="text-[14px] font-medium text-gray-600">I&apos;m not a robot</span>
                  </div>
                  <div className="flex flex-col items-center justify-center pt-1">
                    <svg className="w-[28px] h-[28px] opacity-70 mb-0.5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6ZM24 9.6C31.9529 9.6 38.4 16.0471 38.4 24C38.4 31.9529 31.9529 38.4 24 38.4C16.0471 38.4 9.6 31.9529 9.6 24C9.6 16.0471 16.0471 9.6 24 9.6Z" fill="#1A73E8"/>
                      <path d="M28.8 19.2C28.8 16.549 26.651 14.4 24 14.4C21.349 14.4 19.2 16.549 19.2 19.2C19.2 21.851 21.349 24 24 24C26.651 24 28.8 21.851 28.8 19.2Z" fill="#1A73E8"/>
                      <path d="M16.8 33.6C16.8 29.6235 20.0235 26.4 24 26.4C27.9765 26.4 31.2 29.6235 31.2 33.6H16.8Z" fill="#1A73E8"/>
                    </svg>
                    <span className="text-[10px] text-gray-500 opacity-80 leading-none">reCAPTCHA</span>
                  </div>
                </div>
              </div>

              {/* Terms and conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black" 
                    required
                  />
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors select-none">
                    I agree to the <Link href="#" className="font-bold text-gray-900 hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-gray-900 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                >
                  Create Account
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
