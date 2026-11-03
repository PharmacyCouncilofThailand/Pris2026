"use client";

import Image from "next/image";
import { ArrowUpRight, Camera } from "lucide-react";
import { useTranslations } from "next-intl";

const albums = [
  {
    dayKey: "eventGalleryDay1",
    dateKey: "eventGalleryDay1Date",
    image: "/assets/Img/PRIS_Higlight/PRISHL-47.jpg",
    href: "https://photos.app.goo.gl/8LyX4zJF2j6KzLjv9",
    albumName: "PRIS2026-Day1_HL",
  },
  {
    dayKey: "eventGalleryDay2",
    dateKey: "eventGalleryDay2Date",
    image: "/assets/Img/PRIS_Higlight/PRIS30HL-2-5.jpg",
    href: "https://photos.app.goo.gl/iJ89uSGoX8kUxWei7",
    albumName: "PRIS2026-Day2_HL",
  },
] as const;

export default function EventGalleryPage() {
  const t = useTranslations("common");

  return (
    <main className="min-h-screen overflow-hidden bg-[#090b10] px-5 pb-24 pt-32 text-white sm:px-8 sm:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[34rem] bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,128,52,0.2),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-12 max-w-3xl sm:mb-16">
          <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            <Camera className="h-4 w-4" aria-hidden="true" />
            <span>PRIS 2026</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            {t("eventGallery")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            {t("eventGalleryIntro")}
          </p>
        </header>

        <section
          aria-label={t("eventGallery")}
          className="grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          {albums.map((album, index) => (
            <a
              key={album.albumName}
              href={album.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("eventGalleryOpenAlbum")}: ${t(album.dayKey)}`}
              className="group relative isolate min-h-[25rem] overflow-hidden rounded-2xl border border-white/10 bg-[#15171c] shadow-2xl shadow-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:min-h-[31rem]"
            >
              <Image
                src={album.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-9">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                    {t(album.dateKey)}
                  </p>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {t(album.dayKey)}
                  </h2>
                  <p className="mt-3 text-sm text-white/70">
                    {t("eventGalleryOpenAlbum")}
                  </p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur transition-colors group-hover:border-amber-300 group-hover:bg-amber-300 group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
