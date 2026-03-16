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

const RegistrationCTASection = dynamic(
  () => import("@/components/sections/RegistrationCTASection"),
  { ssr: false }
);

const SponsorSection = dynamic(
  () => import("@/components/sections/SponsorSection"),
  { ssr: false }
);

const HighlightVideoSection = dynamic(
  () => import("@/components/sections/HighlightVideoSection"),
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

      {/* Highlight Video */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <HighlightVideoSection />
      </div>

      {/* Recent Memories 2024 */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <RecentMemoriesSection />
      </div>

      {/* Registration CTA before Sponsors */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <RegistrationCTASection />
      </div>

      {/* Sponsor Marquee */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <SponsorSection />
      </div>
    </main>
  );
}
