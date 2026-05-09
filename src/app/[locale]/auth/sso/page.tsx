"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

function sanitizeRedirect(redirect: string | null, locale: string): string {
    if (!redirect) return `/${locale}`;
    if (!redirect.startsWith("/") || redirect.startsWith("//")) return `/${locale}`;
    return redirect;
}

function SSOCallbackInner() {
    const params = useParams<{ locale: string }>();
    const locale = params?.locale || "en";
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);
    const verifiedRef = useRef(false);

    useEffect(() => {
        if (verifiedRef.current) return;

        const ssoToken = searchParams.get("sso");
        const redirectTo = sanitizeRedirect(searchParams.get("redirect"), locale);

        if (isAuthenticated && !ssoToken) {
            router.replace(redirectTo);
            return;
        }

        if (!ssoToken) {
            setError("ไม่พบข้อมูล SSO token");
            setIsVerifying(false);
            return;
        }

        verifiedRef.current = true;

        const verifySSO = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/sso-verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ssoToken }),
                });

                const data = await res.json();

                if (data.success && data.token && data.user) {
                    login(data.user, data.token, true);
                    router.replace(redirectTo);
                } else {
                    verifiedRef.current = false;
                    setError(data.error || "SSO verification failed");
                }
            } catch {
                verifiedRef.current = false;
                setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
            } finally {
                setIsVerifying(false);
            }
        };

        verifySSO();
    }, [searchParams, router, login, locale, isAuthenticated]);

    if (isVerifying) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-600">กำลังเข้าสู่ระบบ...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
                <div className="text-center max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">เข้าสู่ระบบไม่สำเร็จ</h2>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">{error}</p>
                    <button
                        onClick={() => router.push(`/${locale}/login`)}
                        className="w-full bg-black hover:bg-gray-900 text-white font-bold text-sm py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        ไปยังหน้า Login
                    </button>
                </div>
            </main>
        );
    }

    return null;
}

export default function SSOCallbackPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-medium text-gray-600">กำลังเข้าสู่ระบบ...</p>
                    </div>
                </main>
            }
        >
            <SSOCallbackInner />
        </Suspense>
    );
}
