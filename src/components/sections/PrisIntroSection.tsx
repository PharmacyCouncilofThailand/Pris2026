"use client";

import { useTranslations } from "next-intl";

const cards = ["research", "innovation", "connection"] as const;

export default function PrisIntroSection() {
  const t = useTranslations("prisIntro");

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-50 to-white" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-10 bg-blue-500/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                {t("eyebrow")}
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-tighter text-slate-950 sm:text-5xl md:text-6xl">
              {t("title")}
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              {t("intro")}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
              {t("body")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {cards.map((card, index) => (
              <article
                key={card}
                className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur"
              >
                <div
                  className={[
                    "mb-4 h-1.5 w-14 rounded-full",
                    index === 0
                      ? "bg-blue-500"
                      : index === 1
                        ? "bg-orange-500"
                        : "bg-slate-900",
                  ].join(" ")}
                />
                <h3 className="text-lg font-bold tracking-tight text-slate-950">
                  {t(`${card}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {t(`${card}.desc`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
