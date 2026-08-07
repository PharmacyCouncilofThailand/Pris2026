"use client";

import { useEffect } from "react";
import { Download, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/routing";

const INVITE_LETTER_FILE =
  "/assets/documents/invite_letter/ว.160 ปชสและอนุมัติ PRIS2026.pdf";
const INVITE_LETTER_DOWNLOAD_NAME = "ว.160 ปชสและอนุมัติ PRIS2026.pdf";

export default function InviteLetterPage() {
  const t = useTranslations("inviteLetter");
  const locale = useLocale();
  const isThai = locale === "th";
  const eyebrowTracking = isThai ? "tracking-normal" : "tracking-[0.28em]";
  const metaTracking = isThai ? "tracking-normal" : "tracking-[0.2em]";
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <main lang={locale} className="min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900 selection:bg-blue-500/20 selection:text-blue-950">
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />

      <section className="relative px-6 pb-28 md:px-12 md:pb-40">
        <div className="pointer-events-none absolute -right-40 top-0 h-[28rem] w-[28rem] rounded-full bg-blue-500/[0.07] blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[24rem] w-[24rem] rounded-full bg-orange-500/[0.07] blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#07101f] p-px shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(22,143,255,0.7),transparent_35%,rgba(255,106,0,0.55))]" />

            <div className="relative grid overflow-hidden rounded-[calc(2rem-1px)] bg-white lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[430px] overflow-hidden bg-[#07101f] p-8 md:p-12">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]" />

                <div className="relative z-10 flex h-full min-h-[365px] flex-col justify-between">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[10px] font-bold uppercase ${eyebrowTracking} text-white/60`}>
                      {t("sectionEyebrow")}
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-blue-200">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative mx-auto mt-10 w-full max-w-[290px] flex-1">
                    <div className="absolute inset-x-5 top-3 h-full rotate-[-5deg] rounded-xl bg-blue-400/20 shadow-2xl" />
                    <div className="absolute inset-x-2 top-1 h-full rotate-[4deg] rounded-xl bg-white/10" />
                    <div className="relative overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/30">
                      <Image
                        src="/assets/documents/invite_letter/invite-letter-preview.png"
                        alt={t("cardTitle")}
                        width={935}
                        height={1210}
                        priority
                        sizes="(min-width: 1024px) 290px, 78vw"
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    <span>PRIS 2026</span>
                    <span>Official</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
                <div className={`flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase ${metaTracking} text-blue-600`}>
                  <span>{t("documentType")}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-400">{t("documentMeta")}</span>
                </div>

                <h2 className="mt-6 max-w-xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                  {t("cardTitle")}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
                  {t("sectionDescription")}
                </p>

                <a
                  href={INVITE_LETTER_FILE}
                  download={INVITE_LETTER_DOWNLOAD_NAME}
                  className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#07101f] px-6 py-4 text-center text-sm font-black text-white shadow-[0_15px_30px_rgba(7,16,31,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:shadow-[0_18px_38px_rgba(22,143,255,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  {t("downloadButton")}
                </a>
                <p className="mt-4 text-center text-xs font-medium text-slate-400">
                  {t("fileNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
