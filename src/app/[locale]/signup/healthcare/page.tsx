"use client";

import React, { useRef, useEffect, useState , useTransition } from "react";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE || '';

export default function HealthcareSignUpPage() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isPendingLang, startTransitionLang] = useTransition();
  const router = useRouter();
  const switchLocale = () => {
    const nextLocale = locale === "en" ? "th" : "en";
    startTransitionLang(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };
  const t = useTranslations("auth");
  const { login, isAuthenticated } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {locale === "en" ? "TH" : "EN"}
        </button>
      </div>
      <div 
        
        className="w-full max-w-[1240px] bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-2 lg:p-3 shadow-[0_20px_80px_rgba(0,0,0,0.06)] flex gap-4 min-h-[85vh] lg:min-h-[760px] relative z-10"
      >
        {/* Abstract Background Left Side */}
        <div className="hidden lg:flex w-[40%] xl:w-[45%] relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-90"
            style={{ backgroundImage: "url('/assets/Img/BG/BG-29-30.webp')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          
          <div className="relative z-10 fade-in-up">
            <Link href="/signup" className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{t("back")}</span>
            </Link>
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
                <span className="text-[11px] uppercase tracking-widest font-bold">{t("back")}</span>
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-10 fade-in-up">
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

            <div className="text-center mb-10 fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3 leading-tight">
                {t("joinAsHealthcare")}
              </h1>
              <p className="text-sm font-medium text-gray-500">
                {t("fillDetails")}
              </p>
            </div>

            <form className="space-y-5 fade-in-up" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
              const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
              const idInput = (form.elements.namedItem('idCard') as HTMLInputElement).value;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const organization = (form.elements.namedItem('organization') as HTMLInputElement).value;
              const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

              if (password !== confirmPassword) {
                toast.error('Passwords do not match.');
                return;
              }

              setIsLoading(true);
              try {
                const fd = new FormData();
                fd.append('firstName', firstName);
                fd.append('lastName', lastName);
                fd.append('email', email);
                fd.append('password', password);
                fd.append('accountType', 'medicalProfessional');
                if (organization) fd.append('organization', organization);
                if (phone) fd.append('phone', phone);
                if (turnstileToken) fd.append('recaptchaToken', turnstileToken);
                if (EVENT_CODE) fd.append('eventCode', EVENT_CODE);

                // Auto-detect: 13 digit number = idCard, otherwise = passportId
                if (idInput) {
                  if (/^\d{13}$/.test(idInput)) {
                    fd.append('idCard', idInput);
                  } else {
                    fd.append('passportId', idInput);
                  }
                }

                const res = await fetch(`${API_URL}/auth/register`, {
                  method: 'POST',
                  body: fd,
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                  toast.error(data.error || 'Registration failed. Please try again.');
                  turnstileRef.current?.reset();
                  setTurnstileToken(null);
                  return;
                }

                // Defensive: handle pending_approval if backend policy changes
                if (data.user?.status === 'pending_approval') {
                  router.push('/signup/pending');
                  return;
                }

                toast.success('Account created successfully!');
                login(data.user, data.token);
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || '/';
                router.push(redirect);
              } catch {
                toast.error('Network error. Please check your connection.');
                turnstileRef.current?.reset();
                setTurnstileToken(null);
              } finally {
                setIsLoading(false);
              }
            }}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="firstName">
                    {t("firstName")} <span className="text-red-500">*</span>
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
                    {t("lastName")} <span className="text-red-500">*</span>
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
                  {t("nationalId")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="idCard"
                  placeholder="e.g. 1234567890123 or AB1234567"
                  maxLength={13}
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">
                  {t("emailAddress")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder={t("emailPlaceholder")}
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="organization">
                  Organization / Affiliation
                </label>
                <input
                  type="text"
                  id="organization"
                  placeholder="Organization or Affiliation"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="phone">
                  {t("phoneNumber")}
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
                    {t("confirmPassword")} <span className="text-red-500">*</span>
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

              {/* Cloudflare Turnstile */}
              {turnstileSiteKey && (
              <div className="pt-2 pb-2 flex justify-start">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              </div>
              )}

              {/* Terms and conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black" 
                    required
                  />
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors select-none">
                    {t("iAgree")} <Link href="#" className="font-bold text-gray-900 hover:underline">{t("tos")}</Link> {t("and")} <Link href="#" className="font-bold text-gray-900 hover:underline">{t("privacy")}</Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? t("creatingAcc") : t("createBtn")}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">{t("alreadyHaveAccount")} {" "}
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
