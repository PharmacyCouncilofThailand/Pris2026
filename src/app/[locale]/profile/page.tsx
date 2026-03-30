"use client";

import React, { useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { QrCode, LogOut, Mail, Briefcase, BadgeCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useGSAP(() => {
      gsap.fromTo(
        ".fade-in-stagger",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
      );
  }, { scope: containerRef });

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-[#f4f6f8] text-slate-900 pt-24 pb-20 px-6 sm:px-10 selection:bg-blue-600 selection:text-white relative overflow-hidden"
    >
      <div className="w-full max-w-5xl relative z-10 flex flex-col">
        
        {/* Top Action Bar */}
        <div className="w-full flex justify-between items-end mb-6 fade-in-stagger pl-2">
          <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : "Dr. Emily Chen"}
                </h1>
                <p className="text-[#0d1f4a] font-semibold tracking-wide uppercase text-sm mt-1.5 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-blue-500" /> Confirmed Delegate
                </p>
              </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
          >
            <span>Sign Out</span>
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Horizontal Ticket Layout */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex flex-col md:flex-row fade-in-stagger relative">
          
          {/* Subtle Perforation Line on Mobile */}
          <div className="block md:hidden absolute left-0 right-0 top-[60%] border-t-2 border-dashed border-slate-200 z-20" />

          {/* LEFT PANEL: User Info */}
          <div className="w-full md:w-[65%] p-10 md:p-14 lg:p-16 flex flex-col justify-between relative bg-white z-10">
            
            {/* Minimalist Watermark */}
            <div className="absolute top-12 right-12 opacity-5 pointer-events-none select-none">
               <span className="text-9xl font-black tracking-tighter mix-blend-multiply">PRIS</span>
            </div>

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-md border border-emerald-100 shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Payment Confirmed
                 </span>
                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-md border border-slate-200 shadow-sm">
                    Tier: Early Bird
                 </span>
              </div>
              
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-none mb-6">
                 John Doe
              </h2>
              <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-blue-600 mb-12 uppercase tracking-wide">
                 <Briefcase className="w-5 h-5 hidden sm:block" /> Pharmacist
              </div>
              
              <div className="flex items-center gap-5 border-l-2 border-slate-200 pl-5 py-1">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact Details</p>
                   <p className="text-sm md:text-base font-semibold text-slate-800 tracking-wide">johndoe@example.com</p>
                </div>
              </div>
            </div>

            {/* Footer Branding bg-white */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between opacity-80">
              <div>
                 <p className="font-bold text-[10px] tracking-widest uppercase text-slate-400 mb-1">Event Name</p>
                 <p className="font-black text-sm md:text-base tracking-widest uppercase text-slate-900">PRIS 2026</p>
              </div>
              <div className="text-right">
                 <p className="font-bold text-[10px] tracking-widest uppercase text-slate-400 mb-1">Pass Type</p>
                 <p className="font-black text-sm md:text-base tracking-widest uppercase text-slate-900">All Access</p>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: QR Code (Dark Mode) */}
          <div className="w-full md:w-[35%] bg-slate-900 border-l border-slate-800 p-10 md:p-14 flex flex-col items-center justify-center relative overflow-hidden z-10 shrink-0">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)]" />
            
            {/* Subtly Cutout edges effect to simulate ticket perforation */}
            <div className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#f4f6f8] rounded-full shadow-[inset_-5px_0px_10px_rgba(0,0,0,0.05)] border-r border-[#f4f6f8]" />

            <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 text-center bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                Scan at Entrance
              </p>
              
              <div className="bg-white p-6 rounded-3xl shadow-2xl mb-10 relative group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 ring-4 ring-white/10 rounded-3xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <QrCode className="w-36 h-36 md:w-48 md:h-48 text-slate-900" strokeWidth={1} />
              </div>
              
              <div className="text-center w-full mt-auto">
                <p className="font-mono text-xl md:text-2xl font-bold tracking-[0.2em] text-white">PRIS-8X9V</p>
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-6" />
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </main>
  );
}
