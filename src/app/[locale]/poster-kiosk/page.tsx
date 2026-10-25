import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Poster Kiosk | PRIS 2026",
  robots: { index: false, follow: false },
};

export default async function PosterKioskPage() {
  const t = await getTranslations("posterKiosk");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#050a1c] px-[6vw] text-center text-white">
      <h1 className="text-[8vw] font-bold leading-[1.1]">
        <span className="block">{t("headingLine1")}</span>
        <span className="block bg-gradient-to-r from-[#2563eb] via-[#7c6fd6] to-[#f97316] bg-clip-text text-transparent">
          {t("headingLine2")}
        </span>
      </h1>
    </main>
  );
}
