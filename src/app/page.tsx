import Hero from "@/components/sections/Hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* 
        Phase 3: The newly migrated Hero component with GSAP Text Mask animation 
      */}
      <Hero />

      {/* 
        Temporary spacer to allow scrolling, proving that the GSAP ScrollTrigger 
        zoom animation works correctly. We will replace this with the real 
        Welcome Section in Phase 4.
      */}
      <div className="w-full h-[150vh] bg-black text-white flex items-center justify-center border-t border-white/10">
        <div className="text-center">
          <h2 className="text-4xl font-outfit mb-4 text-gold">Welcome to PRIS 2026</h2>
          <p className="text-gray-400">Scroll down further to see how the sticky Header reacts.</p>
        </div>
      </div>
    </main>
  );
}
