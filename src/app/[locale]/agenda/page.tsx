"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import AgendaSchedule from "@/components/sections/AgendaSchedule";
import AgendaPrintDocument from "@/components/sections/AgendaPrintDocument";

export default function AgendaPage() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const [preparingPrint, setPreparingPrint] = useState(false);

  async function printAgenda() {
    if (preparingPrint) return;
    setPreparingPrint(true);
    try {
      await document.fonts.ready;
      const logo =
        document.querySelector<HTMLImageElement>(".agenda-print-logo");
      if (logo) await logo.decode().catch(() => undefined);
      window.print();
    } finally {
      setPreparingPrint(false);
    }
  }

  return (
    <main
      lang={locale}
      className="agenda-page min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900"
    >
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
        action={
          <button
            type="button"
            onClick={printAgenda}
            disabled={preparingPrint}
            aria-busy={preparingPrint}
            aria-label={t("printAgendaPdf")}
            className="page-hero-sub mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            {t(preparingPrint ? "preparingPrint" : "printAgendaPdf")}
          </button>
        }
      />
      <AgendaPrintDocument locale={locale} />
      <AgendaSchedule />
    </main>
  );
}
