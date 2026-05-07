"use client";

import React, { useRef, useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { QrCode, LogOut, Mail, Briefcase, BadgeCheck, FileText, User, Phone, Building2, Globe, Ticket, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AbstractTracker from "@/components/profile/AbstractTracker";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;

interface RegistrationInfo {
  isRegistered: boolean;
  regCode: string | null;
}

function getDelegateLabel(delegateType?: string, role?: string): string {
  switch (delegateType) {
    case "thai_student": return "Thai Student";
    case "international_student": return "International Student";
    case "thai_pharmacist": return "Thai Pharmacist";
    case "international_pharmacist": return "International Pharmacist";
    case "medical_professional": return "Medical Professional";
    case "general": return "General Public";
  }
  switch (role) {
    case "student": return "Student";
    case "pharmacist": return "Pharmacist";
    case "medical_professional": return "Medical Professional";
    case "general": return "General Public";
    default: return "Delegate";
  }
}

function getStatusBadge(status?: string) {
  switch (status) {
    case "active":
      return { label: "Active Member", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    case "pending_approval":
      return { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-100" };
    case "rejected":
      return { label: "Account Rejected", className: "bg-red-50 text-red-700 border-red-100" };
    default:
      return { label: "Member", className: "bg-slate-50 text-slate-600 border-slate-200" };
  }
}

export default function ProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { logout, user, token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "abstracts">("profile");
  const [profileData, setProfileData] = useState(user);
  const [registration, setRegistration] = useState<RegistrationInfo | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(!!EVENT_CODE);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setProfileData((prev) => ({ ...prev, ...data.user }));
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !EVENT_CODE) return;
    fetch(`${API_URL}/api/registrations/check?eventCode=${encodeURIComponent(EVENT_CODE)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRegistration({ isRegistered: !!data.isRegistered, regCode: data.regCode ?? null });
        }
      })
      .catch(() => {})
      .finally(() => setRegistrationLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  useGSAP(() => {
    gsap.fromTo(
      ".fade-in-stagger",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
    );
  }, { scope: containerRef });

  if (!isAuthenticated || !profileData) return null;

  const fullName = `${profileData.firstName ?? ""} ${profileData.lastName ?? ""}`.trim() || profileData.email;
  const delegateLabel = getDelegateLabel(profileData.delegateType, profileData.role);
  const org = profileData.institution || profileData.university || null;
  const statusBadge = getStatusBadge(profileData.status);
  const memberCode = registration?.regCode ?? "—";

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex flex-col items-center bg-[#f4f6f8] text-slate-900 pt-20 pb-12 px-4 sm:px-6 lg:px-10 selection:bg-blue-600 selection:text-white relative overflow-hidden"
    >
      <div className="w-full max-w-7xl relative z-10 flex flex-col">

        {/* Top Action Bar */}
        <div className="w-full flex justify-between items-end mb-6 fade-in-stagger pl-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {fullName}
            </h1>
            <p className="text-[#0d1f4a] font-semibold tracking-wide uppercase text-sm mt-1.5 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-blue-500" /> {delegateLabel}
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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 fade-in-stagger pl-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all ${
              activeTab === "profile"
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300 hover:text-slate-600"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("abstracts")}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all ${
              activeTab === "abstracts"
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300 hover:text-slate-600"
            }`}
          >
            <FileText className="w-4 h-4" />
            Abstract Tracker
          </button>
        </div>

        {/* ─── Tab: Profile (Ticket) ─── */}
        {activeTab === "profile" && (
          <div className="w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex flex-col md:flex-row fade-in-stagger relative">

            {/* Subtle Perforation Line on Mobile */}
            <div className="block md:hidden absolute left-0 right-0 top-[60%] border-t-2 border-dashed border-slate-200 z-20" />

            {/* LEFT PANEL: User Info */}
            <div className="w-full md:w-[65%] p-8 md:p-10 lg:p-12 flex flex-col justify-between relative bg-white z-10">

              {/* Minimalist Watermark */}
              <div className="absolute top-8 right-8 opacity-5 pointer-events-none select-none">
                <span className="text-7xl md:text-8xl font-black tracking-tighter mix-blend-multiply">PRIS</span>
              </div>

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md border shadow-sm ${statusBadge.className}`}>
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {statusBadge.label}
                  </span>
                  {profileData.country && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-md border border-slate-200 shadow-sm">
                      <Globe className="w-3 h-3" />
                      {profileData.country}
                    </span>
                  )}
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-none mb-4">
                  {fullName}
                </h2>
                <div className="flex items-center gap-2 text-base md:text-lg font-bold text-blue-600 mb-8 uppercase tracking-wide">
                  <Briefcase className="w-5 h-5 hidden sm:block" /> {delegateLabel}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 border-l-2 border-slate-200 pl-4 py-0.5">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email</p>
                      <p className="text-sm md:text-base font-semibold text-slate-800 tracking-wide break-all">{profileData.email}</p>
                    </div>
                  </div>

                  {profileData.phone && (
                    <div className="flex items-center gap-4 border-l-2 border-slate-200 pl-4 py-0.5">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phone</p>
                        <p className="text-sm md:text-base font-semibold text-slate-800 tracking-wide">{profileData.phone}</p>
                      </div>
                    </div>
                  )}

                  {org && (
                    <div className="flex items-center gap-4 border-l-2 border-slate-200 pl-4 py-0.5">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Organization</p>
                        <p className="text-sm md:text-base font-semibold text-slate-800 tracking-wide">{org}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Branding */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between opacity-80">
                <div>
                  <p className="font-bold text-[10px] tracking-widest uppercase text-slate-400 mb-1">Event</p>
                  <p className="font-black text-sm md:text-base tracking-widest uppercase text-slate-900">PRIS 2026</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[10px] tracking-widest uppercase text-slate-400 mb-1">Delegate Type</p>
                  <p className="font-black text-sm md:text-base tracking-widest uppercase text-slate-900">{delegateLabel}</p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: QR Code / Not-Registered (Dark Mode) */}
            <div className="w-full md:w-[35%] bg-slate-900 border-l border-slate-800 p-8 md:p-10 flex flex-col items-center justify-center relative overflow-hidden z-10 shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)]" />
              <div className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#f4f6f8] rounded-full shadow-[inset_-5px_0px_10px_rgba(0,0,0,0.05)] border-r border-[#f4f6f8]" />

              <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
                {registrationLoading ? (
                  <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                ) : registration?.isRegistered ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 text-center bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                      Scan at Entrance
                    </p>

                    <div className="bg-white p-5 rounded-3xl shadow-2xl mb-6 relative group cursor-pointer hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 ring-4 ring-white/10 rounded-3xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <QrCode className="w-32 h-32 md:w-40 md:h-40 text-slate-900" strokeWidth={1} />
                    </div>

                    <div className="text-center w-full mt-auto">
                      <p className="font-mono text-lg md:text-xl font-bold tracking-[0.2em] text-white break-all">{memberCode}</p>
                      <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-4" />
                    </div>
                  </>
                ) : (
                  <div className="text-center flex flex-col items-center gap-5 py-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
                      <Ticket className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Not Registered</p>
                      <p className="text-base md:text-lg font-bold text-white leading-snug">
                        You haven&apos;t registered<br />for this event yet
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                        Complete your registration to receive your event pass and QR code.
                      </p>
                    </div>
                    <Link
                      href="/registration"
                      className="group inline-flex items-center gap-2 px-5 py-3 mt-2 bg-white text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                    >
                      Register Now
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Abstract Tracker ─── */}
        {activeTab === "abstracts" && (
          <div className="fade-in-stagger">
            <div className="mb-8 pl-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                Abstract <span className="text-blue-600/80">Tracker</span>
              </h2>
              <p className="text-slate-400 font-medium text-sm mt-2">
                Monitor the review status of your submitted abstracts.
              </p>
            </div>
            <AbstractTracker />
          </div>
        )}
      </div>
    </main>
  );
}
