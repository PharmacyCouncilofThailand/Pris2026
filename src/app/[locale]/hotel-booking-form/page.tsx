"use client";

import React, { useEffect } from "react";
import { Download, FileText, Hotel } from "lucide-react";
import { useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/routing";

const HOTEL_FORMS = [
  {
    key: "ibis",
    filePath:
      "/assets/documents/form_hotel/Ibis - แบบฟอร์มการจองห้องพัก งานประชุมวิชาการ.pdf",
  },
  {
    key: "novotel",
    filePath:
      "/assets/documents/form_hotel/Novotel - แบบฟอร์มการจองห้องพัก งานประชุมวิชากา.pdf",
  },
] as const;

export default function HotelBookingFormPage() {
  const t = useTranslations("hotelBookingForm");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <main className="bg-white text-gray-900 overflow-hidden selection:bg-blue-500/20 min-h-screen">
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />

      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-6 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Hotel className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                {t("sectionTitle")}
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-light md:text-lg">
              {t("sectionDescription")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {HOTEL_FORMS.map((form) => (
              <article
                key={form.key}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 mb-2">
                      {t(`cards.${form.key}.label`)}
                    </p>
                    <h3 className="text-2xl font-black tracking-tight text-gray-900">
                      {t(`cards.${form.key}.hotel`)}
                    </h3>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                    <FileText className="w-5 h-5" />
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  {t(`cards.${form.key}.description`)}
                </p>

                <a
                  href={form.filePath}
                  download
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-blue-600"
                >
                  <Download className="w-4 h-4" />
                  {t("downloadButton")}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
