"use client";

import React, { useEffect, useTransition } from "react";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
export default function PendingApprovalPage() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPendingLang, startTransitionLang] = useTransition();
  const switchLocale = () => {
    const nextLocale = locale === "en" ? "th" : "en";
    startTransitionLang(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };
  const t = useTranslations("auth");
    useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-black selection:text-white pt-24 lg:pt-8 relative z-40">
      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={switchLocale}
          disabled={isPendingLang}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {locale === "en" ? "TH" : "EN"}
        </button>
      </div>
      <div
        
        className="w-full max-w-[600px] bg-white rounded-[2.5rem] p-10 lg:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.06)] text-center relative z-10"
      >
        <div className="flex justify-center mb-10 ">
          <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-70">
            <Image
              src="/assets/Img/logo/LOGO1.png"
              alt="PRIS 2026 Logo"
              width={200}
              height={80}
              className="h-9 w-auto object-contain brightness-0"
              priority
            />
          </Link>
        </div>

        <div className=" mb-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif tracking-tight text-gray-900 mb-4 leading-tight">
            {t("accountPending")}
          </h1>
          <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-md mx-auto">
            Your account has been created successfully! It is currently under review by our admin team. 
            {t("notifyEmail")}
          </p>
        </div>

        <div className=" bg-[#f8f9fc] rounded-2xl p-6 mb-8">
          <p className="text-sm font-medium text-gray-600">
            {t("processTakes")} <span className="font-bold text-gray-900">{t("businessDays")}</span>. 
            Please check your email for updates.
          </p>
        </div>

        <div className="">
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
