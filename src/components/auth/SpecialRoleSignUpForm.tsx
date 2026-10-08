"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import toast from "react-hot-toast";
import { eventReturnQuery, normalizeLocalizedRedirectPath } from "@/lib/localizedRedirect";
import { getHealthHackLevel, HEALTH_HACK_GRADES, type HealthHackGroup } from "@/lib/healthHackLevel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE || "";
const inputClass = "w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100";
const labelClass = "block text-sm font-bold text-gray-900 mb-2";

export default function SpecialRoleSignUpForm({ accountType }: { accountType: "healthhack" | "booth" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("auth");
  const tt = useTranslations("toasts");
  const { login, isAuthenticated } = useAuth();
  const [isPendingLang, startTransitionLang] = useTransition();
  const [group, setGroup] = useState<HealthHackGroup>("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const isHealthHack = accountType === "healthhack";
  const secondaryGrades = group === "lower" || group === "upper" ? HEALTH_HACK_GRADES[group] : null;
  const returnQuery = eventReturnQuery(typeof window === "undefined" ? "" : window.location.search);

  useEffect(() => { document.body.classList.remove("hero-playing"); }, []);
  useEffect(() => {
    if (isAuthenticated) router.replace(normalizeLocalizedRedirectPath(new URLSearchParams(window.location.search).get("redirect")));
  }, [isAuthenticated, router]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirmPassword")) {
      toast.error(t("passNotMatch"));
      return;
    }
    const level = getHealthHackLevel(group, grade);
    if (isHealthHack && !level) {
      toast.error(t("selectHealthHackLevelError"));
      return;
    }
    fd.delete("confirmPassword");
    fd.set("accountType", accountType);
    if (isHealthHack) fd.set("healthHackLevel", level);
    if (turnstileToken) fd.set("recaptchaToken", turnstileToken);
    if (EVENT_CODE) fd.set("eventCode", EVENT_CODE);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || tt("registrationFailed"));
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }
      toast.success(tt("accountCreated"));
      login(data.user, data.token);
      router.push(normalizeLocalizedRedirectPath(new URLSearchParams(window.location.search).get("redirect")));
    } catch {
      toast.error(tt("networkError"));
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-black selection:text-white pt-24 lg:pt-8 relative z-40">
      <div className="absolute top-6 right-6 z-50">
        <button type="button" disabled={isPendingLang} onClick={() => startTransitionLang(() => {
          router.replace({ pathname, query: Object.fromEntries(new URLSearchParams(window.location.search).entries()) }, { locale: locale === "en" ? "th" : "en" });
        })} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-all disabled:opacity-50">
          {locale === "en" ? "TH" : "EN"}
        </button>
      </div>
      <div className="w-full max-w-[1240px] bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-2 lg:p-3 shadow-[0_20px_80px_rgba(0,0,0,0.06)] flex gap-4 min-h-[85vh] lg:min-h-[760px] relative z-10">
        <div className="hidden lg:flex w-[40%] xl:w-[45%] relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-90" style={{ backgroundImage: "url('/assets/Img/BG/BG-29-30.webp')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          <div className="relative z-10">
            <Link href={{ pathname: "/signup", query: returnQuery }} className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm"><ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /></span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{t("back")}</span>
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-[60%] xl:w-[55%] flex flex-col justify-start items-center py-8 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto custom-scrollbar max-h-[85vh] lg:max-h-[800px]">
          <div className="w-full max-w-[460px] py-2 lg:py-4">
            <div className="lg:hidden flex justify-start mb-6">
              <Link href={{ pathname: "/signup", query: returnQuery }} className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm"><ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /></span>
                <span className="text-[11px] uppercase tracking-widest font-bold">{t("back")}</span>
              </Link>
            </div>
            <div className="flex justify-center mb-10">
              <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-70"><Image src="/assets/Img/logo/Logo-Final .png" alt="PRIS 2026 Logo" width={1280} height={356} className="h-[55px] w-auto object-contain brightness-0" priority /></Link>
            </div>
            <div className="text-center mb-10">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3 leading-tight">{t(isHealthHack ? "joinAsHealthHack" : "joinAsBooth")}</h1>
              <p className="text-sm font-medium text-gray-500">{t("fillDetails")}</p>
            </div>
            <form className="space-y-5" onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(["firstName","lastName"] as const).map(name => <div key={name}><label className={labelClass} htmlFor={name}>{t(name)} <span className="text-red-500">*</span></label><input id={name} name={name} className={inputClass} autoComplete={name === "firstName" ? "given-name" : "family-name"} maxLength={100} required /></div>)}
              </div>
              <div><label className={labelClass} htmlFor="email">{t("emailAddress")} <span className="text-red-500">*</span></label><input type="email" id="email" name="email" autoComplete="email" maxLength={255} className={inputClass} placeholder={t("emailPlaceholder")} required /></div>
              {isHealthHack && <>
                <div><label className={labelClass} htmlFor="organization">{t("specialInstitution")} <span className="text-red-500">*</span></label><input id="organization" name="organization" className={inputClass} maxLength={255} required /></div>
                <div><label className={labelClass} htmlFor="educationGroup">{t("healthHackGroup")} <span className="text-red-500">*</span></label><select id="educationGroup" className={inputClass} required value={group} onChange={e => { setGroup(e.target.value as HealthHackGroup); setGrade(""); }}>
                  <option value="">{t("selectLevel")}</option><option value="lower">{t("lowerSecondary")}</option><option value="upper">{t("upperSecondary")}</option><option value="undergraduate">{t("undergrad")}</option>
                </select></div>
                {secondaryGrades && <div><label className={labelClass} htmlFor="educationGrade">{t("healthHackGrade")} <span className="text-red-500">*</span></label><select id="educationGrade" className={inputClass} required value={grade} onChange={e => setGrade(e.target.value)}><option value="">{t("selectHealthHackGrade")}</option>{secondaryGrades.map(value => <option key={value} value={value}>{t(`healthHackLevels.${value}`)}</option>)}</select></div>}
              </>}
              <div><label className={labelClass} htmlFor="phone">{t("phoneNumber")} <span className="text-red-500">*</span></label><div className="flex"><span className="flex items-center justify-center px-4 rounded-l-2xl border border-transparent bg-gray-100 text-gray-700 text-sm font-bold">+66</span><input type="tel" id="phone" name="phone" autoComplete="tel-national" maxLength={20} className={inputClass + " rounded-l-none"} placeholder={t("phonePlaceholder")} required /></div></div>
              {!isHealthHack && <div><label className={labelClass} htmlFor="boothName">{t("boothName")} <span className="text-red-500">*</span></label><input id="boothName" name="boothName" className={inputClass} maxLength={255} required /></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{(["password","confirmPassword"] as const).map(name => <div key={name}><label className={labelClass} htmlFor={name}>{t(name)} <span className="text-red-500">*</span></label><input type="password" id={name} name={name} autoComplete="new-password" minLength={6} className={inputClass} required /></div>)}</div>
              {turnstileSiteKey && <div className="pt-2 pb-2 flex justify-start"><Turnstile ref={turnstileRef} siteKey={turnstileSiteKey} onSuccess={setTurnstileToken} onExpire={() => setTurnstileToken(null)} onError={() => setTurnstileToken(null)} /></div>}
              <label className="flex items-start gap-3 cursor-pointer group"><input type="checkbox" className="mt-0.5 w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black" required /><span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors select-none">{t("iAgree")} {t("tos")} {t("and")} {t("privacy")}</span></label>
              <div className="pt-4 pb-2"><button type="submit" disabled={isLoading} className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">{isLoading ? t("creatingAcc") : t("createBtn")}</button></div>
              <div className="text-center"><p className="text-sm font-medium text-gray-500">{t("alreadyHaveAccount")} <Link href={{ pathname: "/login", query: returnQuery }} className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">{t("signIn")}</Link></p></div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
