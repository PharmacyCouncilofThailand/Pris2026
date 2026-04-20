
import Hero from "@/components/sections/Hero";
import StickyStackWrapper from "@/components/layout/StickyStackWrapper";
import {
  PrisIntroSection,
  WelcomeSection,
  EventScheduleSection,
  SpeakerSection,
  SponsorSection,
  HighlightVideoSection,
  RecentMemoriesSection
} from "@/components/sections/LazySections";
import InViewWrapper from "@/components/layout/InViewWrapper";

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
        <InViewWrapper minHeight="100vh">
          <SpeakerSection />
        </InViewWrapper>
      </div>

      {/* Event Schedule */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <InViewWrapper minHeight="800px">
          <EventScheduleSection />
        </InViewWrapper>
      </div>

      {/* Sponsor Marquee */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <InViewWrapper minHeight="400px">
          <SponsorSection />
        </InViewWrapper>
      </div>

      {/* Highlight Video */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <InViewWrapper minHeight="600px">
          <HighlightVideoSection />
        </InViewWrapper>
      </div>

      {/* Recent Memories 2024 */}
      <div className="w-full relative" style={{ zIndex: 2 }}>
        <InViewWrapper minHeight="800px">
          <RecentMemoriesSection />
        </InViewWrapper>
      </div>


    </main>
  );
}
