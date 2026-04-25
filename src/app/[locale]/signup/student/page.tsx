"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { UploadCloud } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE || '';

export default function StudentSignUpPage() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { login } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [studentLevel, setStudentLevel] = useState("");
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const levelRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) {
        setIsLevelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useGSAP(() => {
      gsap.fromTo(
        ".fade-in-up",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
  }, { scope: containerRef });

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-black selection:text-white pt-24 lg:pt-8 relative z-40">
      <div 
        ref={containerRef}
        className="w-full max-w-[1240px] bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-2 lg:p-3 shadow-[0_20px_80px_rgba(0,0,0,0.06)] flex gap-4 min-h-[85vh] lg:min-h-[760px] relative z-10"
      >
        {/* Abstract Background Left Side */}
        <div className="hidden lg:flex w-[40%] xl:w-[45%] relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-90"
            style={{ backgroundImage: "url('/assets/Img/Pris%202026%20bg%20login.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          
          <div className="relative z-10 fade-in-up">
            <Link href="/signup" className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back</span>
            </Link>
          </div>

          <div className="relative z-10 fade-in-up">
            <h2 className="text-white text-5xl xl:text-6xl font-serif tracking-tight leading-[1.05] mb-6">
              Empowering<br />Medical Horizons
            </h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
              Discover breakthroughs and connect with leading minds by joining PRIS 2026.
            </p>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="w-full lg:w-[60%] xl:w-[55%] flex flex-col justify-start items-center py-8 px-6 sm:px-12 lg:px-16 xl:px-20 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto custom-scrollbar max-h-[85vh] lg:max-h-[800px]">
          
          <div className="w-full max-w-[460px] py-2 lg:py-4">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex justify-start mb-6 fade-in-up">
              <Link href="/signup" className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold">Back</span>
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-10 fade-in-up">
              <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-70">
                <Image
                  src="/assets/Img/logo/Pris2026-logo.svg"
                  alt="PRIS 2026 Logo"
                  width={140}
                  height={56}
                  className="h-9 w-auto object-contain brightness-0"
                  priority
                />
              </Link>
            </div>

            <div className="text-center mb-10 fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-serif tracking-tight text-gray-900 mb-3 leading-tight">
                Join as Student
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Please fill in your details to register your account
              </p>
            </div>

            <form className="space-y-5 fade-in-up" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
              const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
              const idInput = (form.elements.namedItem('idCard') as HTMLInputElement).value;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const organization = (form.elements.namedItem('organization') as HTMLInputElement).value;
              const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

              if (password !== confirmPassword) {
                toast.error('Passwords do not match.');
                return;
              }
              if (!studentLevel) {
                toast.error('Please select a student level.');
                return;
              }

              setIsLoading(true);
              try {
                const fd = new FormData();
                fd.append('firstName', firstName);
                fd.append('lastName', lastName);
                fd.append('email', email);
                fd.append('password', password);
                fd.append('accountType', studentLevel);
                if (organization) fd.append('organization', organization);
                if (phone) fd.append('phone', phone);
                if (turnstileToken) fd.append('recaptchaToken', turnstileToken);
                if (EVENT_CODE) fd.append('eventCode', EVENT_CODE);

                // Auto-detect: 13 digit number = idCard, otherwise = passportId
                if (idInput) {
                  if (/^\d{13}$/.test(idInput)) {
                    fd.append('idCard', idInput);
                  } else {
                    fd.append('passportId', idInput);
                  }
                }

                // File upload
                const file = fileRef.current?.files?.[0];
                if (file) fd.append('verificationDoc', file);

                const res = await fetch(`${API_URL}/auth/register`, {
                  method: 'POST',
                  body: fd,
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                  toast.error(data.error || 'Registration failed. Please try again.');
                  turnstileRef.current?.reset();
                  setTurnstileToken(null);
                  return;
                }

                if (data.user?.status === 'pending_approval') {
                  router.push('/signup/pending');
                } else {
                  login(data.user, data.token);
                  const urlParams = new URLSearchParams(window.location.search);
                  const redirect = urlParams.get('redirect') || '/';
                  router.push(redirect);
                }
              } catch {
                toast.error('Network error. Please check your connection.');
                turnstileRef.current?.reset();
                setTurnstileToken(null);
              } finally {
                setIsLoading(false);
              }
            }}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First Name"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last Name"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="idCard">
                  National ID / Passport Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="idCard"
                  placeholder="e.g. 1234567890123 or AB1234567"
                  maxLength={13}
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="organization">
                  University / Institution
                </label>
                <input
                  type="text"
                  id="organization"
                  placeholder="e.g. Chulalongkorn University"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                />
              </div>

              <div className="relative" ref={levelRef}>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Student Level <span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="studentLevel" value={studentLevel} required />
                <button
                  type="button"
                  onClick={() => setIsLevelOpen(!isLevelOpen)}
                  className={`w-full text-left bg-[#f8f9fc] border rounded-2xl py-3.5 px-5 text-sm font-medium outline-none transition-all flex items-center justify-between ${
                    isLevelOpen ? "bg-white border-gray-200 ring-4 ring-gray-100" : "border-transparent"
                  } ${studentLevel ? "text-gray-900" : "text-gray-400"}`}
                >
                  <span>{studentLevel === "undergraduateStudent" ? "Undergraduate" : studentLevel === "postgraduateStudent" ? "Postgraduate" : "Select student level"}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isLevelOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLevelOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {[
                      { value: "undergraduateStudent", label: "Undergraduate" },
                      { value: "postgraduateStudent", label: "Postgraduate" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setStudentLevel(opt.value); setIsLevelOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                          studentLevel === opt.value
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-[#f8f9fc]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Student Verification Document (PDF, JPG, PNG) <span className="text-red-500">*</span>
                </label>
                <div className="relative group cursor-pointer">
                  <input ref={fileRef} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || '')} />
                  <div className={`w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed rounded-2xl transition-all ${selectedFileName ? 'border-black bg-gray-50' : 'border-gray-300 bg-[#f8f9fc] group-hover:bg-gray-50 group-hover:border-black'}`}>
                    <UploadCloud className={`w-5 h-5 transition-colors ${selectedFileName ? 'text-black' : 'text-gray-400 group-hover:text-black'}`} />
                    <span className={`text-sm font-medium transition-colors truncate max-w-[80%] ${selectedFileName ? 'text-black' : 'text-gray-500 group-hover:text-black'}`}>{selectedFileName || 'Choose File'}</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 mt-2">{selectedFileName ? 'Click to change file' : 'Select student certificate or related document'}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <div className="flex">
                  <div className="flex items-center justify-center px-4 rounded-l-2xl border border-transparent bg-gray-100 text-gray-700 text-sm font-bold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://flagcdn.com/w20/th.png" alt="TH" width={20} height={15} className="mr-2" />
                    +66
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="08X XXX XXXX"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-r-2xl py-3.5 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-black text-gray-900 placeholder:text-gray-400 outline-none transition-all tracking-widest focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-3.5 px-5 text-sm font-black text-gray-900 placeholder:text-gray-400 outline-none transition-all tracking-widest focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                    required
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              {turnstileSiteKey && (
              <div className="pt-2 pb-2 flex justify-start">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              </div>
              )}

              {/* Terms and conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black" 
                    required
                  />
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors select-none">
                    I agree to the <Link href="#" className="font-bold text-gray-900 hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-gray-900 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
