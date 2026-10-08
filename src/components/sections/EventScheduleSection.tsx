"use client";

import { useTranslations } from "next-intl";
import { SectionTitle } from "@/components/elements/SectionTitle";
import AgendaSchedule from "@/components/sections/AgendaSchedule";

export default function EventScheduleSection() {
  const t = useTranslations("schedule");

  return (
    <section className="relative z-[2] w-full bg-[linear-gradient(to_bottom,#020617_0%,#091842_35%,#1e1005_70%,#020617_100%)] pt-20 text-white md:pt-28">
      <div className="mx-auto mb-10 flex max-w-[1720px] flex-col gap-6 px-4 sm:px-6 md:mb-14 md:flex-row md:items-end md:justify-between md:px-10 lg:px-12">
        <SectionTitle title={t("sectionTitle")} align="left" theme="dark" />
        <p className="max-w-md border-l border-amber-400/40 pl-4 text-sm leading-relaxed text-slate-300">
          {t("previewSubtitle")}
        </p>
      </div>
      <AgendaSchedule />
    </section>
  );
}
