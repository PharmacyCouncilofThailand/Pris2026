import Hero from "@/components/sections/Hero";
import WelcomeSection from "@/components/sections/WelcomeSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* 
        Phase 3: The newly migrated Hero component with GSAP Text Mask animation 
      */}
      <Hero />

      {/* 
        Phase 4: Welcome Section (Animated speaker intros)
      */}
      <div className="w-full">
        <WelcomeSection />
      </div>
    </main>
  );
}
