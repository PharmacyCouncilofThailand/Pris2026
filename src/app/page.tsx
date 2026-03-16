"use client";

import Hero from "@/components/sections/Hero";
import StickyStackWrapper from "@/components/layout/StickyStackWrapper";
import dynamic from "next/dynamic";

const WelcomeSection = dynamic(
  () => import("@/components/sections/WelcomeSection"),
  { ssr: false }
);

const EventScheduleSection = dynamic(
  () => import("@/components/sections/EventScheduleSection"),
  { ssr: false }
);

const SpeakerSection = dynamic(
  () => import("@/components/sections/SpeakerSection"),
  { ssr: false }
);

const SponsorSection = dynamic(
  () => import("@/components/sections/SponsorSection"),
  { ssr: false }
);

const RecentMemoriesSection = dynamic(
  () => import("@/components/sections/RecentMemoriesSection"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero with sticky stacking: pins & scale-down/fade as Welcome slides over */}
      <StickyStackWrapper>
        <Hero />
      </StickyStackWrapper>

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

      {/* Blur transition removed as Sponsor is now dark theme */}

      {/* Recent Memories 2024 */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <RecentMemoriesSection />
      </div>

      {/* Dynamic Blur Transition (Black Fade) */}
      <div className="w-full h-24 md:h-32 -mt-12 md:-mt-16 relative z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-black via-black/60 to-transparent" />
      </div>

      {/* Sponsor Marquee */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <SponsorSection />
      </div>

      {/* Dynamic Blur Transition (Sponsor to Footer) */}
      <div className="w-full h-24 md:h-32 -mt-12 md:-mt-16 relative z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-transparent via-black/60 to-black" />
      </div>
    </main>
  );
}
