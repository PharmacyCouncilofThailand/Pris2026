"use client";

import Hero from "@/components/sections/Hero";
import StickyStackWrapper from "@/components/layout/StickyStackWrapper";
import dynamic from "next/dynamic";

const PrisIntroSection = dynamic(
  () => import("@/components/sections/PrisIntroSection")
);

const WelcomeSection = dynamic(
  () => import("@/components/sections/WelcomeSection")
);

const EventScheduleSection = dynamic(
  () => import("@/components/sections/EventScheduleSection")
);

const SpeakerSection = dynamic(
  () => import("@/components/sections/SpeakerSection")
);

const SponsorSection = dynamic(
  () => import("@/components/sections/SponsorSection")
);

const HighlightVideoSection = dynamic(
  () => import("@/components/sections/HighlightVideoSection")
);

const RecentMemoriesSection = dynamic(
  () => import("@/components/sections/RecentMemoriesSection")
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero with sticky stacking: pins & scale-down/fade as Welcome slides over */}
      <StickyStackWrapper>
        <Hero />
      </StickyStackWrapper>

      {/* What is PRIS */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <PrisIntroSection />
      </div>

      {/* Welcome Section - slides over the Hero */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <WelcomeSection />
      </div>

      {/* Speaker Section */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <SpeakerSection />
      </div>

      {/* Event Schedule */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <EventScheduleSection />
      </div>

      {/* Sponsor Marquee */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <SponsorSection />
      </div>

      {/* Highlight Video */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <HighlightVideoSection />
      </div>

      {/* Recent Memories 2024 */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <RecentMemoriesSection />
      </div>


    </main>
  );
}
