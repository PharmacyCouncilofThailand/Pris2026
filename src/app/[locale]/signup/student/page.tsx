"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import gsap from "gsap";
import { ArrowLeft, UploadCloud } from "lucide-react";

export default function StudentSignUpPage() {
  const containerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    document.body.classList.remove("hero-playing");

    const ctx = gsap.context(() => {
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
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden font-sans pt-28 pb-16">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div ref={containerRef} className="w-full max-w-xl px-4 z-10 relative">
        <div className="bg-white rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 fade-in-up">
          
          {/* Back Button */}
          <div className="mb-6 fade-in-up">
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1e2761] transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              Back
            </Link>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6 fade-in-up">
            <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/assets/Img/logo/Pris2026-logo.svg"
                alt="PRIS 2026 Logo"
                width={140}
                height={56}
                className="h-10 w-auto object-contain brightness-0"
                priority
              />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8 fade-in-up">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm font-medium text-gray-500">
              Please fill in your details to register as a Student
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Split Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-up">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="First Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Last Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* National ID / Passport */}
            <div className="fade-in-up">
              <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="idCard">
                National ID / Passport Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="idCard"
                placeholder="Enter ID or Passport Number"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                required
              />
              <p className="text-[11px] font-semibold text-gray-400 mt-2">Needed for verification and pricing eligibility</p>
            </div>

            {/* Email */}
            <div className="fade-in-up">
              <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                required
              />
            </div>

            {/* Organization */}
            <div className="fade-in-up">
              <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="organization">
                University / Institution
              </label>
              <input
                type="text"
                id="organization"
                placeholder="e.g. Chulalongkorn University"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            {/* Phone Number */}
            <div className="fade-in-up">
              <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="phone">
                Phone Number
              </label>
              <div className="flex">
                <div className="flex items-center justify-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://flagcdn.com/w20/th.png" alt="TH" width={20} height={15} className="mr-2" />
                  +66
                </div>
                <input
                  type="tel"
                  id="phone"
                  placeholder="08X XXX XXXX"
                  className="w-full px-4 py-3 rounded-r-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-up">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-widest"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2" htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-widest"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="fade-in-up">
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                Student Verification Document (PDF, JPG, PNG) <span className="text-red-500">*</span>
              </label>
              <div className="relative group cursor-pointer">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required accept=".pdf,.jpg,.jpeg,.png" />
                <div className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl group-hover:bg-blue-50 group-hover:border-blue-400 transition-all">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">Choose File</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 mt-2">Select student certificate or related document</p>
            </div>

            {/* Recaptcha Mock */}
            <div className="fade-in-up pt-2 pb-2 flex justify-start">
              <div className="w-[300px] h-[74px] rounded-[3px] border border-[#d3d3d3] bg-[#f9f9f9] flex items-center justify-between px-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-[28px] h-[28px] rounded-[2px] border-[2px] border-[#c1c1c1] bg-white cursor-pointer hover:border-[#b2b2b2]"></div>
                  <span className="text-[14px] font-medium text-[#222]">I'm not a robot</span>
                </div>
                <div className="flex flex-col items-center justify-center pt-1">
                  <svg className="w-[28px] h-[28px] opacity-70 mb-0.5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6ZM24 9.6C31.9529 9.6 38.4 16.0471 38.4 24C38.4 31.9529 31.9529 38.4 24 38.4C16.0471 38.4 9.6 31.9529 9.6 24C9.6 16.0471 16.0471 9.6 24 9.6Z" fill="#1A73E8"/>
                    <path d="M28.8 19.2C28.8 16.549 26.651 14.4 24 14.4C21.349 14.4 19.2 16.549 19.2 19.2C19.2 21.851 21.349 24 24 24C26.651 24 28.8 21.851 28.8 19.2Z" fill="#1A73E8"/>
                    <path d="M16.8 33.6C16.8 29.6235 20.0235 26.4 24 26.4C27.9765 26.4 31.2 29.6235 31.2 33.6H16.8Z" fill="#1A73E8"/>
                  </svg>
                  <span className="text-[10px] text-[#555] opacity-80 leading-none">reCAPTCHA</span>
                  <div className="text-[8px] text-[#555] opacity-80 mt-1">Privacy - Terms</div>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="fade-in-up">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1e2761] focus:ring-[#1e2761] cursor-pointer accent-[#1e2761]" 
                  required
                />
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors select-none leading-relaxed">
                  I agree to the <Link href="#" className="font-bold text-[#1e2761] hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-[#1e2761] hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="fade-in-up pt-2">
              <button
                type="submit"
                className="w-full bg-[#1e2761] hover:bg-[#151c48] text-white font-bold text-base py-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(30,39,97,0.25)] hover:shadow-[0_12px_24px_rgba(30,39,97,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              >
                Create Account
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center pt-2 fade-in-up">
              <p className="text-sm font-medium text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-[#1e2761] font-bold hover:underline underline-offset-4 decoration-2">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
