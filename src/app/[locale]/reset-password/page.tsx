"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

function ResetPasswordContent() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPendingLang, startTransitionLang] = useTransition();
  const switchLocale = () => {
    const nextLocale = locale === "en" ? "th" : "en";
    startTransitionLang(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };
  const t = useTranslations("auth");
  const { isAuthenticated } = useAuth();

  const token = searchParams.get("token") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // Validate that token exists in URL
  useEffect(() => {
    if (!token) {
      setTokenError("missing");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (newPassword.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("passNotMatch"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Token invalid/expired → show invalid token state instead of toast
        if (res.status === 400 && data.error?.toLowerCase().includes("token")) {
          setTokenError("invalid");
          return;
        }
        toast.error(data.error || "Failed to reset password. Please try again.");
        return;
      }

      toast.success(t("resetSuccess"));
      setSuccess(true);
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

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

            {success ? (
              /* Success State */
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.75} />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                    {t("resetSuccess")}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {t("resetSuccessDesc")}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                >
                  {t("goToLogin")}
                </Link>
              </div>
            ) : tokenError ? (
              /* Invalid / Missing Token State */
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.75} />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                    {t("invalidToken")}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {tokenError === "missing" ? t("missingToken") : t("invalidTokenDesc")}
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <Link
                    href="/forgot-password"
                    className="block w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    {t("requestNewLink")}
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full text-sm font-bold text-gray-500 hover:text-black transition-colors py-2"
                  >
                    {t("backToLogin")}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3 leading-tight">
                    {t("resetPasswordTitle")}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {t("resetPasswordDesc")}
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="newPassword">
                      {t("newPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        placeholder={t("newPasswordPlaceholder")}
                        minLength={6}
                        className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 pr-12 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                        required
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="confirmPassword">
                      {t("confirmNewPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder={t("newPasswordPlaceholder")}
                        minLength={6}
                        className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 pr-12 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? t("resetting") : t("resetPasswordBtn")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
