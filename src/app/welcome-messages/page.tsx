"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Fixed Data Structure with the exact required order
const messagesData = [
  {
    id: "president",
    name: "Mr. Preecha Bhandtivej",
    role: "President, Pharmacy Council of Thailand",
    thaiRole: "นายกสภาเภสัชกรรม",
    image: "/assets/Img/Welcome message/Mr. Preecha Bhandtivej.jpg",
    quote: "A transformative era for clinical pharmacy practice awaits us as we gather for PRIS 2026.",
    message: [
      "On behalf of the Pharmacy Council of Thailand, it is my profound honor to welcome you to the 2nd Pharmacy Research and Innovation Summit (PRIS 2026).",
      "As healthcare continues to evolve at an unprecedented pace, the role of pharmacists expands far beyond traditional boundaries. We are the bridge between cutting-edge medical research and patient-centric care.",
      "This summit serves as a crucial platform for professionals, researchers, and policymakers to exchange visionary ideas, shape clinical guidelines, and foster innovations that will define the future of our profession both locally and globally. I look forward to the inspiring dialogues we will share."
    ]
  },
  {
    id: "secretary",
    name: "Assoc. Prof. Dr. Surasak Saokaew",
    role: "Secretary General, Pharmacy Council of Thailand",
    thaiRole: "เลขาธิการสภาเภสัชกรรม",
    image: "/assets/Img/all-images/memory/memory1.jpg",
    quote: "Empowering our profession through collaborative research, unwavering dedication, and shared vision.",
    message: [
      "Welcome to PRIS 2026. The Pharmacy Council remains deeply committed to advancing the standards of our practice through rigorous scientific engagement and international collaboration.",
      "Over the next three days, you will have the unparalleled opportunity to delve into the latest advancements in pharmacology, precision medicine, and digital health strategies.",
      "Your participation signifies a shared commitment to elevating patient care standards worldwide. I urge you to actively engage, question the status quo, and forge new partnerships that will resonate far beyond this summit."
    ]
  },
  {
    id: "chair",
    name: "Assoc. Prof. Dr. Nattiya Kaprateigpoong",
    role: "Chairperson, PRIS 2026 Organizing Committee",
    thaiRole: "ประธานการจัดงาน PRIS 2026",
    image: "/assets/Img/all-images/bangkok/img2.jpg",
    quote: "Igniting innovation, driving excellence, and uniting minds to champion the future of healthcare.",
    message: [
      "It brings me immense joy to welcome our distinguished colleagues, renowned speakers, and passionate participants to Bangkok for this momentous occasion.",
      "The organizing committee has meticulously curated an agenda that interweaves deep clinical insights with practical innovations. Our focus is not merely on discussing theories, but on actionable strategies that can be implemented in diverse clinical settings.",
      "Let us utilize this gathering to its fullest potential. May PRIS 2026 be a catalyst for groundbreaking research, lifelong friendships, and a renewed passion for the noble profession of pharmacy. Welcome to an unforgettable experience."
    ]
  }
];

export default function WelcomeMessagesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent the layout's default hidden navbar/footer behavior on refresh
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
    // Hero Text Animation
    gsap.fromTo(
      ".welcome-hero-text",
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power4.out", stagger: 0.2 }
    );

    // Parallax & Reveal for Each Speaker Entry
    const entries = gsap.utils.toArray(".speaker-entry") as HTMLElement[];
    entries.forEach((entry) => {
      const img = entry.querySelector(".speaker-img");
      const content = entry.querySelector(".speaker-content");
      
      // Image Parallax Effect
      if (img) {
        gsap.fromTo(
          img,
          { y: -50, scale: 1.1 },
          {
            y: 50,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: entry,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          }
        );
      }

      // Content Fade & Slide up
      if (content) {
        gsap.fromTo(
          content,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: entry,
              start: "top 75%",
            }
          }
        );
      }
    });

  }, { scope: containerRef });

  return (
    <main 
      ref={containerRef} 
      className="min-h-screen text-white selection:bg-gold selection:text-black overflow-hidden relative"
      style={{
        background: "linear-gradient(to bottom, #000000 0%, #0a1931 35%, #2d1806 65%, #000000 100%)"
      }}
    >
      {/* ─── Hero Header ─── */}
      <section className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        
        <h4 className="welcome-hero-text text-gold tracking-[0.3em] uppercase text-xs md:text-sm font-semibold mb-6 flex items-center gap-4">
          <span className="w-8 h-px bg-gold/50" />
          Official Addresses
          <span className="w-8 h-px bg-gold/50" />
        </h4>
        <h1 className="welcome-hero-text text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter leading-none mb-8">
          Welcome <br/> Messages
        </h1>
        <p className="welcome-hero-text text-white/50 max-w-2xl text-lg md:text-xl font-light leading-relaxed">
          Hear from our esteemed leadership as they share their vision and officially welcome you to the PRIS 2026 summit.
        </p>
      </section>

      {/* ─── Speaker Entries (Content Container Layout) ─── */}
      <section className="pb-32 flex flex-col gap-24 md:gap-32 container mx-auto px-4 md:px-8 max-w-7xl">
        {messagesData.map((speaker, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={speaker.id} 
              className={`speaker-entry relative w-full flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-16 items-center group`}
            >
              {/* Image Side - Contained with rounded corners */}
              <div className="w-full lg:w-5/12 aspect-[3/4] md:aspect-[4/5] relative overflow-hidden rounded-2xl bg-[#0d1529] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                <Image
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  className="speaker-img object-cover object-top transition-all duration-1000 scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority={index === 0}
                />
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-7/12 flex flex-col justify-center relative py-8">
                {/* Decorative background typography */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[12vw] lg:text-[10vw] leading-none font-black text-white/[0.02] uppercase select-none pointer-events-none whitespace-nowrap overflow-hidden">
                  Welcome
                </div>

                <div className="speaker-content relative z-10 w-full">
                  <Quote className="w-10 h-10 md:w-12 md:h-12 text-gold/30 mb-6 md:mb-8" />
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                    {speaker.name}
                  </h2>
                  <div className="mb-8 md:mb-10">
                    <p className="text-gold font-semibold uppercase tracking-widest text-xs sm:text-sm mb-1">
                      {speaker.role}
                    </p>
                    <p className="text-white/40 font-light text-sm">
                      {speaker.thaiRole}
                    </p>
                  </div>

                  <blockquote className="text-lg md:text-2xl font-light italic text-white/90 leading-relaxed mb-8 md:mb-10 border-l-2 border-gold pl-6 py-2">
                    &quot;{speaker.quote}&quot;
                  </blockquote>

                  <div className="space-y-4 md:space-y-6">
                    {speaker.message.map((para, i) => (
                      <p key={i} className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Elegant Signature Line */}
                  <div className="mt-10 md:mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
                    <div className="w-12 h-px bg-white/20" />
                    <span className="font-outfit text-white/30 uppercase tracking-[0.2em] text-[10px] md:text-xs">PRIS 2026 Executive</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

    </main>
  );
}
