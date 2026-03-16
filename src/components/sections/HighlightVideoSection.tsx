"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Play, Pause } from "lucide-react";

// ลงทะเบียน ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HighlightVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskTextRef = useRef<HTMLHeadingElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useGSAP(
    () => {
      // 1. ซ่อนข้อความย่อเริ่มต้นไว้ข้างล่างกรอบทันที (ช่วยป้องกันไม่ให้พังจากการใส่ Style Inline)
      gsap.set(subTextRef.current, { yPercent: 150 });
      gsap.set(maskTextRef.current, { y: "0vh" });

      // สร้าง Timeline สำหรับแอนิเมชันหลายจังหวะ
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,          // ตรึงหน้าจอ
          scrub: 1,           // ผูกเวลากับการสโครลเมาส์
          start: "top top",
          end: "+=2500",      // ระยะการสโครล ให้ยาวหน่อย
        },
      });

      // Step 1: ย่อคำว่า "Recent Memories" ลงมาจากขนาดใหญ่มาก
      tl.fromTo(
        maskTextRef.current,
        { scale: 350, transformOrigin: "center center" },
        { scale: 1, duration: 2, ease: "power1.inOut" }
      )
      // Step 2: หยุดนิ่งระยะสั้นๆ ให้อ่านคำชัดเจน
      .to({}, { duration: 0.5 })
      // Step 3: เลื่อนคำว่า "Recent Memories" ขึ้นข้างบนนิดนึง 
      // และดึง Subtext ปรากฏขึ้นมาในจังหวะเดียวกัน
      .to(
        maskTextRef.current,
        { y: "-12vh", duration: 1, ease: "power2.out" },
        "moveUp" // ผูกตำแหน่งเวลาให้ขยับพร้อมกัน
      )
      .to(
        subTextRef.current,
        { yPercent: 0, duration: 1, ease: "power2.out" },
        "moveUp"
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex justify-center items-center bg-black"
    >
      {/* Layer 1: วิดีโอหลัก */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover z-[1]"
      >
        <source
          src="/assets/Img/PSIS_Higlight/Highlight PRIS 2025 - Day 1 - สภาเภสัชกรรม Pharmacy Council (720p, h264).mp4"
          type="video/mp4"
        />
      </video>

      {/* Layer 2: Mask (เจาะช่องตัวหนังสือ) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black flex justify-center items-center z-[2] mix-blend-multiply pointer-events-none">
        <h2
          ref={maskTextRef}
          className="text-white text-center leading-none select-none font-black whitespace-nowrap"
          style={{ 
            fontFamily: "'Arial Black', sans-serif",
            fontSize: "clamp(2rem, 8vw, 10rem)" 
          }}
        >
          Recent Memories
        </h2>
      </div>

      {/* Layer 3: ข้อความย่อย (ไล่สีขาว-ฟ้า ไม่ใช้ mix-blend) */}
      <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center z-[3] pointer-events-none">
        {/* ดันกรอบให้ลงมาอยู่ต่ำกว่าแนวกึ่งกลาง (เว้นระยะจาก Recent Memories หน้าต่างหลักจะอยู่ใกล้ๆ กัน) */}
        <div className="h-[15vh]"></div>

        {/* ตัดขอบข้อความตอนสไลด์ขึ้นมา */}
        <div className="overflow-hidden">
          <p
            ref={subTextRef}
            className="text-xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400 text-center max-w-[90vw] md:max-w-4xl py-2"
          >
            Relive the highlights from the Pharmaceutical Research and Innovation Symposium 2025
          </p>
        </div>
      </div>

      {/* Play/Pause Button */}
      {/* ขยับลงมาจากด้านบน (top-24 = 96px) เพื่อไม่ให้ถูก Navbar บัง และให้ z-index สูงๆ */}
      <div className="absolute top-24 right-6 md:top-28 md:right-10 z-[40]">
        <button
          onClick={togglePlay}
          className="bg-black/40 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-md transition-all border border-white/20 hover:scale-105"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
      </div>
    </section>
  );
}
