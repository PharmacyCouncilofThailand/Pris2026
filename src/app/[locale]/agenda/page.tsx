"use client";

import { useLocale, useTranslations } from "next-intl";
import { Download } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import AgendaSchedule from "@/components/sections/AgendaSchedule";
import { scheduleData } from "@/data/scheduleData";

export default function AgendaPage() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const isThai = locale === "th";

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
        action={
          <button
            type="button"
            onClick={() => window.print()}
            aria-label={t("printAgendaPdf")}
            className="page-hero-sub mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            {t("printAgendaPdf")}
          </button>
        }
      />
      <article className="agenda-print-document" aria-hidden="true">
        <header className="agenda-print-header">
          <p>PRIS 2026</p>
          <h1>{isThai ? "กำหนดการประชุม" : "Conference Agenda"}</h1>
          <span>
            {isThai
              ? "การประชุมวิชาการ วิจัย และนวัตกรรมทางเภสัชกรรมระดับชาติ"
              : "National Conference on Pharmacy Research and Innovation"}
          </span>
        </header>
        {scheduleData.map((day) => (
          <section className="agenda-print-day" key={day.day}>
            <h2>
              {isThai ? day.dayTh : day.day} · {isThai ? day.dateTh : day.date}
            </h2>
            {day.events.map((event) => (
              <article className="agenda-print-event" key={event.id}>
                <div className="agenda-print-event-heading">
                  <time>{event.time}</time>
                  <span>{isThai ? event.locationTh : event.location}</span>
                </div>
                <h3>{isThai ? event.titleTh : event.title}</h3>
                {(isThai ? event.descriptionTh : event.description) && (
                  <p>{isThai ? event.descriptionTh : event.description}</p>
                )}
                {event.speakers.length > 0 && (
                  <ul>
                    {event.speakers.map((speaker, index) => (
                      <li key={`${event.id}-${speaker.name}-${index}`}>
                        {isThai && speaker.nameTh
                          ? speaker.nameTh
                          : speaker.name}
                        {speaker.roleTh || speaker.role
                          ? ` · ${
                              isThai && speaker.roleTh
                                ? speaker.roleTh
                                : speaker.role
                            }`
                          : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
        ))}
      </article>
      <AgendaSchedule />
    </main>
  );
}
