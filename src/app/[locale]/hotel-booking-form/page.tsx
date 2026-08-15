"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Hotel,
  Landmark,
  Building2,
  CheckCircle2,
  Info,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/routing";

type OrganizationCategory = "government" | "private";

interface HotelDoc {
  key: "ibis" | "novotel";
  filePath: string;
  downloadFileName: string;
  hotelBadge: string;
  brandColor: {
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    buttonHover: string;
    borderHover: string;
  };
}

const HOTEL_FORMS_BY_CATEGORY: Record<OrganizationCategory, HotelDoc[]> = {
  government: [
    {
      key: "ibis",
      filePath:
        "/assets/documents/form_hotel/Ibis - แบบฟอร์มการจองห้องพัก_หน่วยงานราชการ PRIS .pdf",
      downloadFileName:
        "Ibis - แบบฟอร์มการจองห้องพัก_หน่วยงานราชการ PRIS .pdf",
      hotelBadge: "Ibis Bangkok IMPACT",
      brandColor: {
        badgeBg: "bg-red-50 text-red-700 border-red-200",
        badgeText: "text-red-600",
        iconBg: "bg-red-50 text-red-600 border-red-100",
        iconColor: "text-red-600",
        buttonHover: "hover:bg-red-600 hover:shadow-red-500/25",
        borderHover: "hover:border-red-200 hover:shadow-red-500/5",
      },
    },
    {
      key: "novotel",
      filePath:
        "/assets/documents/form_hotel/Novotel - แบบฟอร์มการจองห้องพัก_หน่วยงานราชการ PR.pdf",
      downloadFileName:
        "Novotel - แบบฟอร์มการจองห้องพัก_หน่วยงานราชการ PR.pdf",
      hotelBadge: "Novotel Bangkok IMPACT",
      brandColor: {
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        badgeText: "text-blue-600",
        iconBg: "bg-blue-50 text-blue-600 border-blue-100",
        iconColor: "text-blue-600",
        buttonHover: "hover:bg-blue-600 hover:shadow-blue-500/25",
        borderHover: "hover:border-blue-200 hover:shadow-blue-500/5",
      },
    },
  ],
  private: [
    {
      key: "ibis",
      filePath:
        "/assets/documents/form_hotel/Ibis - แบบฟอร์มการจองห้องพัก_ภาคเอกชน PRIS 28-30 ต.ค. 256.pdf",
      downloadFileName:
        "Ibis - แบบฟอร์มการจองห้องพัก_ภาคเอกชน PRIS 28-30 ต.ค. 256.pdf",
      hotelBadge: "Ibis Bangkok IMPACT",
      brandColor: {
        badgeBg: "bg-red-50 text-red-700 border-red-200",
        badgeText: "text-red-600",
        iconBg: "bg-red-50 text-red-600 border-red-100",
        iconColor: "text-red-600",
        buttonHover: "hover:bg-red-600 hover:shadow-red-500/25",
        borderHover: "hover:border-red-200 hover:shadow-red-500/5",
      },
    },
    {
      key: "novotel",
      filePath:
        "/assets/documents/form_hotel/Novotel - แบบฟอร์มการจองห้องพัก_ภาคเอกชน PRIS 28-30 ต.ค. .pdf",
      downloadFileName:
        "Novotel - แบบฟอร์มการจองห้องพัก_ภาคเอกชน PRIS 28-30 ต.ค. .pdf",
      hotelBadge: "Novotel Bangkok IMPACT",
      brandColor: {
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        badgeText: "text-blue-600",
        iconBg: "bg-blue-50 text-blue-600 border-blue-100",
        iconColor: "text-blue-600",
        buttonHover: "hover:bg-blue-600 hover:shadow-blue-500/25",
        borderHover: "hover:border-blue-200 hover:shadow-blue-500/5",
      },
    },
  ],
};

export default function HotelBookingFormPage() {
  const t = useTranslations("hotelBookingForm");
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] =
    useState<OrganizationCategory | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const currentForms = selectedCategory
    ? HOTEL_FORMS_BY_CATEGORY[selectedCategory]
    : null;

  return (
    <main
      lang={locale}
      className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20 selection:text-blue-950"
    >
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />

      <section className="relative px-6 pb-28 md:px-12 md:pb-40">
        {/* Subtle Ambient Lighting Accents */}
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-500/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 top-80 h-96 w-96 rounded-full bg-indigo-500/[0.05] blur-[120px]" />

        <div className="relative mx-auto max-w-5xl space-y-10">
          {/* Header Overview Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm md:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/10">
                  <Hotel className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      <Sparkles className="h-3 w-3" />
                      PRIS 2026 Special Rates
                    </span>
                  </div>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                    {t("sectionTitle")}
                  </h2>
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base font-normal">
              {t("sectionDescription")}
            </p>
          </div>

          {/* STEP 1: Select Organization Type */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-black tracking-wide text-white shadow-sm shadow-blue-500/30">
                  {t("step1Badge")}
                </span>
                <h3 className="text-lg font-black tracking-tight text-slate-900 md:text-xl">
                  {t("step1Title")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 md:text-sm">
                {t("step1Subtitle")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Option 1: หน่วยงานราชการ (Government Sector) */}
              <button
                type="button"
                onClick={() => setSelectedCategory("government")}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selectedCategory === "government"
                    ? "border-blue-600 bg-gradient-to-b from-blue-50/60 to-white shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                      selectedCategory === "government"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    <Landmark className="h-6 w-6" aria-hidden="true" />
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        selectedCategory === "government"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t("categories.government.badge")}
                    </span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        selectedCategory === "government"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedCategory === "government" && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-lg font-black text-slate-900">
                    {t("categories.government.title")}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">
                    {t("categories.government.subtitle")}
                  </p>
                </div>
              </button>

              {/* Option 2: ภาคเอกชน (Private Sector) */}
              <button
                type="button"
                onClick={() => setSelectedCategory("private")}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selectedCategory === "private"
                    ? "border-blue-600 bg-gradient-to-b from-blue-50/60 to-white shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                      selectedCategory === "private"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    <Building2 className="h-6 w-6" aria-hidden="true" />
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        selectedCategory === "private"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t("categories.private.badge")}
                    </span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        selectedCategory === "private"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedCategory === "private" && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-lg font-black text-slate-900">
                    {t("categories.private.title")}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">
                    {t("categories.private.subtitle")}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Hotel Forms & Downloads (Shown only when category is selected) */}
          {selectedCategory && currentForms && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black tracking-wide text-white shadow-sm">
                      {t("step2Badge")}
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 md:text-xl">
                      {t("step2Title")}
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-800">
                    <span className="font-bold">{t("currentSelection")}:</span>
                    <span className="font-extrabold text-blue-900">
                      {t(`categories.${selectedCategory}.title`)}
                    </span>
                  </div>
                </div>

                {/* Hotel Cards Grid - Ibis is always on the left, Novotel on the right */}
                <div className="grid gap-6 md:grid-cols-2">
                  {currentForms.map((form) => (
                    <article
                      key={`${selectedCategory}-${form.key}`}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${form.brandColor.borderHover}`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${form.brandColor.badgeBg}`}
                              >
                                {t(`cards.${selectedCategory}.${form.key}.label`)}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                {t("fileType")}
                              </span>
                            </div>
                            <h4 className="text-2xl font-black tracking-tight text-slate-900">
                              {t(`cards.${selectedCategory}.${form.key}.hotel`)}
                            </h4>
                          </div>

                          <span
                            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${form.brandColor.iconBg}`}
                          >
                            <FileText className="h-5 w-5" aria-hidden="true" />
                          </span>
                        </div>

                        <p className="mt-4 text-xs leading-relaxed text-slate-600 md:text-sm">
                          {t(`cards.${selectedCategory}.${form.key}.description`)}
                        </p>
                      </div>

                      <div className="relative z-10 mt-6 pt-5 border-t border-slate-100">
                        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-emerald-600">
                            <FileCheck className="h-3.5 w-3.5" />
                            {t("readyToDownload")}
                          </span>
                          <span className="font-mono text-[11px]">PDF</span>
                        </div>

                        <a
                          href={form.filePath}
                          download={form.downloadFileName}
                          className={`inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-slate-900 px-6 py-3.5 text-center text-xs font-black uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 ${form.brandColor.buttonHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900`}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          {t("downloadButton")}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* STEP 3 / Guidance Notice Box */}
              <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm md:p-8">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900 md:text-base">
                      {t("submissionNotice.title")}
                    </h4>
                    <div className="space-y-1.5 text-xs leading-relaxed text-slate-600 md:text-sm">
                      <p>{t("submissionNotice.step1")}</p>
                      <p>{t("submissionNotice.step2")}</p>
                      <p>{t("submissionNotice.step3")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

