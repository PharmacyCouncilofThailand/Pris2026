"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { login } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const [isLoading, setIsLoading] = useState(false);
  const [pendingModal, setPendingModal] = useState(false);
  const [rejectedModal, setRejectedModal] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
      gsap.fromTo(
        ".fade-in-element",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
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
        <div className="hidden lg:flex w-1/2 relative bg-[#08111f] rounded-[2rem] overflow-hidden flex-col justify-between p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110 opacity-90"
            style={{ backgroundImage: "url('/assets/Img/Pris%202026%20bg%20login.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          
          <div className="relative z-10 fade-in-element">
            <Link href="/" className="inline-flex items-center gap-4 group text-white hover:text-white/80 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/5 group-hover:bg-white/10 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back</span>
            </Link>
          </div>

          <div className="relative z-10 fade-in-element">
            <h2 className="text-white text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              PRIS 2026
            </h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
              You can achieve significant breakthroughs when you connect, explore, and commit to the vision of PRIS 2026.
            </p>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-10 px-6 sm:px-12 lg:px-20 xl:px-28 bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-y-auto">
          
          <div className="w-full max-w-[420px] py-4">
            {/* Mobile Back Button */}
            <div className="lg:hidden flex justify-start mb-6 fade-in-element">
              <Link href="/" className="inline-flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold">Back</span>
              </Link>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-10 fade-in-element">
              <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-70">
                <Image
                  src="/assets/Img/logo/Pris2026-logo.svg"
                  alt="PRIS 2026 Logo"
                  width={140}
                  height={56}
                  className="h-14 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="text-center mb-12 fade-in-element">
              <h1 className="text-4xl lg:text-[2.75rem] font-bold tracking-tight text-gray-900 mb-3 leading-tight">
                Login
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Enter your email and password to access your account
              </p>
            </div>

            <form className="space-y-6 fade-in-element" onSubmit={async (e) => { 
              e.preventDefault();
              setIsLoading(true);
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const rememberMe = (form.elements.namedItem('rememberMe') as HTMLInputElement).checked;

              try {
                const res = await fetch(`${API_URL}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email,
                    password,
                    recaptchaToken: turnstileToken || undefined,
                  }),
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                  if (data.error === 'ACCOUNT_PENDING') {
                    setPendingModal(true);
                  } else if (data.error === 'ACCOUNT_REJECTED') {
                    setRejectedModal(data.rejectionReason || '');
                  } else {
                    toast.error(data.error || 'Login failed. Please try again.');
                  }
                  turnstileRef.current?.reset();
                  setTurnstileToken(null);
                  return;
                }

                toast.success('Login successful!');
                login(data.user, data.token, rememberMe);
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || '/';
                router.push(redirect);
              } catch {
                toast.error('Network error. Please check your connection.');
                turnstileRef.current?.reset();
                setTurnstileToken(null);
              } finally {
                setIsLoading(false);
              }
            }}>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="w-full bg-[#f8f9fc] border border-transparent rounded-2xl py-4 px-5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    name="rememberMe"
                    defaultChecked
                    className="w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black" 
                  />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors select-none">
                    Remember me
                  </span>
                </label>
                <Link href="#" className="text-sm font-bold text-gray-900 hover:underline underline-offset-4">
                  Forgot Password
                </Link>
              </div>

              {/* Cloudflare Turnstile */}
              {turnstileSiteKey && (
              <div className="flex justify-start">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-900 text-white font-bold text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center fade-in-element">
              <p className="text-sm font-medium text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-black font-bold hover:underline underline-offset-4 decoration-2 ml-1">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Pending Approval Modal */}
      {pendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 lg:p-10 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Account Pending Approval</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
              Your account is currently under review by our admin team. You will receive an email notification once your account has been approved.
            </p>
            <div className="bg-[#f8f9fc] rounded-2xl p-4 mb-6">
              <p className="text-xs font-medium text-gray-500">
                This process usually takes <span className="font-bold text-gray-900">5-7 business days</span>
              </p>
            </div>
            <button
              onClick={() => setPendingModal(false)}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold text-sm py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Rejected Account Modal */}
      {rejectedModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 lg:p-10 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Account Rejected</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-4">
              Your account registration has been rejected by the admin team.
            </p>
            {rejectedModal && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-red-800 mb-1">Reason:</p>
                <p className="text-sm font-medium text-red-700">{rejectedModal}</p>
              </div>
            )}
            <p className="text-xs font-medium text-gray-400 mb-6">
              If you believe this is an error, please contact our support team.
            </p>
            <button
              onClick={() => setRejectedModal(null)}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold text-sm py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
