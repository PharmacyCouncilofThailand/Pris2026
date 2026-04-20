"use client";

import dynamic from "next/dynamic";

export const PrisIntroSection = dynamic(
  () => import("@/components/sections/PrisIntroSection"),
  { ssr: false }
);

export const WelcomeSection = dynamic(
  () => import("@/components/sections/WelcomeSection"),
  { ssr: false }
);

export const EventScheduleSection = dynamic(
  () => import("@/components/sections/EventScheduleSection"),
  { ssr: false }
);

export const SpeakerSection = dynamic(
  () => import("@/components/sections/SpeakerSection"),
  { ssr: false }
);

export const SponsorSection = dynamic(
  () => import("@/components/sections/SponsorSection"),
  { ssr: false }
);

export const HighlightVideoSection = dynamic(
  () => import("@/components/sections/HighlightVideoSection"),
  { ssr: false }
);

export const RecentMemoriesSection = dynamic(
  () => import("@/components/sections/RecentMemoriesSection"),
  { ssr: false }
);
