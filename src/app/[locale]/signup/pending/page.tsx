"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function PendingApprovalPage() {
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
        className="w-full max-w-[600px] bg-white rounded-[2.5rem] p-10 lg:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.06)] text-center relative z-10"
      >
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

        <div className="fade-in-element mb-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif tracking-tight text-gray-900 mb-4 leading-tight">
            Account Pending Approval
          </h1>
          <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-md mx-auto">
            Your account has been created successfully! It is currently under review by our admin team. 
            You will receive an email notification once your account has been approved.
          </p>
        </div>

        <div className="fade-in-element bg-[#f8f9fc] rounded-2xl p-6 mb-8">
          <p className="text-sm font-medium text-gray-600">
            This process usually takes <span className="font-bold text-gray-900">5-7 business days</span>. 
            Please check your email for updates.
          </p>
        </div>

        <div className="fade-in-element">
          <Link
            href="/"
            className="inline-block bg-black hover:bg-gray-900 text-white font-bold text-base py-4 px-10 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
