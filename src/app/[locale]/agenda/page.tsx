"use client";

import { useLocale, useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";
import AgendaSchedule from "@/components/sections/AgendaSchedule";

export default function AgendaPage() {
  const t = useTranslations("schedule");
  const locale = useLocale();

  return (
    <main
      lang={locale}
      className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900"
    >
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />
      <AgendaSchedule />
    </main>
  );
}
