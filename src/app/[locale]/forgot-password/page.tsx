"use client";

import React, { useRef, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import toast from "react-hot-toast";
import { MailCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [isPendingLang, startTransitionLang] = useTransition();
  const switchLocale = () => {
    const nextLocale = locale === "en" ? "th" : "en";
    startTransitionLang(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };
  const t = useTranslations("auth");
  const { isAuthenticated } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-black selection:text-white pt-24 lg:pt-8 relative z-40">
      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={switchLocale}
          disabled={isPendingLang}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {locale === "en" ? "TH" : "EN"}
        </button>
      </div>
      <div className="w-full max-w-[1240px] bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-2 lg:p-3 shadow-[0_20px_80px_rgba(0,0,0,0.06)] flex gap-4 min-h-[85vh] lg:min-h-[760px] relative z-10">
        {/* Abstract Background Left Side */}
        <div className="hidden lg:flex w-1/2 relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[30s] hover:scale-105 opacity-90"
            style={{ backgroundImage: "url('/assets/Img/BG/BG-no.webp')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

          <div className="relative z-10">
            <Link href="/login" className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{t("backToLogin")}</span>
            </Link>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-10 px-6 sm:px-12 lg:px-20 xl:px-28 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto">
          <div className="w-full max-w-[420px] py-4">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex justify-start mb-6">
              <Link href="/login" className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold">{t("backToLogin")}</span>
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-10">
              <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-70">
                <Image
                  src="/assets/Img/logo/LOGO1.png"
                  alt="PRIS 2026 Logo"
                  width={200}
                  height={80}
                  className="h-[55px] w-auto object-contain brightness-0"
                  priority
                />
              </Link>
            </div>

            {submittedEmail ? (
              /* Success State */
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                  <MailCheck className="w-10 h-10 text-emerald-500" strokeWidth={1.75} />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                    {t("resetLinkSent")}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {t("resetLinkSentDesc")}
                  </p>
                </div>
                <div className="bg-[#f8f9fc] rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">
                    {t("emailAddress")}
                  </p>
                  <p className="text-sm font-bold text-gray-900 break-all">{submittedEmail}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <Link
                    href="/login"
                    className="block w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    {t("backToLogin")}
                  </Link>
                  <button
                    onClick={() => {
                      setSubmittedEmail(null);
                      turnstileRef.current?.reset();
                      setTurnstileToken(null);
                    }}
                    className="w-full text-sm font-bold text-gray-500 hover:text-black transition-colors py-2"
                  >
                    {t("requestNewLink")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3 leading-tight">
                    {t("forgotPasswordTitle")}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {t("forgotPasswordDesc")}
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    const form = e.target as HTMLFormElement;
                    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

                    try {
                      const res = await fetch(`${API_URL}/auth/forgot-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          recaptchaToken: turnstileToken || undefined,
                          eventCode: process.env.NEXT_PUBLIC_EVENT_CODE || undefined,
                        }),
                      });

                      const data = await res.json();

                      if (!res.ok || !data.success) {
                        toast.error(data.error || "Failed to send reset link. Please try again.");
                        turnstileRef.current?.reset();
                        setTurnstileToken(null);
                        return;
                      }

                      toast.success("Reset link sent!");
                      setSubmittedEmail(email);
                    } catch {
                      toast.error("Network error. Please check your connection.");
                      turnstileRef.current?.reset();
                      setTurnstileToken(null);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">
                      {t("emailAddress")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t("emailPlaceholder")}
                      className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  {turnstileSiteKey && (
                    <div className="flex justify-start">
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={turnstileSiteKey}
                        onSuccess={(token) => setTurnstileToken(token)}
                        onExpire={() => setTurnstileToken(null)}
                        onError={() => setTurnstileToken(null)}
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? t("sending") : t("sendResetLink")}
                    </button>
                  </div>
                </form>

                <div className="mt-12 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    {t("rememberPassword")}{" "}
                    <Link href="/login" className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                      {t("signIn")}
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
