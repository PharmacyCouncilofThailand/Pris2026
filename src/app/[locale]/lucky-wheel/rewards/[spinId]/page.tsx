"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { loadEntryTickets } from "@/lib/entryTicket";
import {
  LuckyWheelApiError,
  loadOwnSpin,
  type OwnedLuckyWheelSpin,
} from "@/lib/luckyWheel";
import { RewardProof } from "@/components/lucky-wheel/RewardProof";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;

export default function LuckyWheelRewardPage() {
  const t = useTranslations("luckyWheel");
  const params = useParams<{ spinId: string }>();
  const spinId = params.spinId;
  const router = useRouter();
  const { token, isAuthenticated, logout } = useAuth();
  const [detail, setDetail] = useState<OwnedLuckyWheelSpin | null>(null);
  const [loading, setLoading] = useState(Boolean(EVENT_CODE));
  const [error, setError] = useState(!EVENT_CODE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAuthenticated && spinId) {
      const redirect = encodeURIComponent(`/lucky-wheel/rewards/${spinId}`);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, router, spinId]);

  useEffect(() => {
    if (!isAuthenticated || !token || !spinId || !EVENT_CODE) return;
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        const tickets = await loadEntryTickets(
          API_URL,
          token,
          EVENT_CODE,
          controller.signal,
        );
        if (cancelled) return;
        const ticket = tickets[0];
        if (!ticket) {
          setError(true);
          return;
        }
        const next = await loadOwnSpin(
          API_URL,
          token,
          ticket.eventId,
          spinId,
          controller.signal,
        );
        if (!cancelled) setDetail(next);
      } catch (cause) {
        if (cancelled) return;
        if (
          (cause instanceof Error && cause.cause === 401) ||
          (cause instanceof LuckyWheelApiError && cause.status === 401)
        ) {
          logout();
          const redirect = encodeURIComponent(`/lucky-wheel/rewards/${spinId}`);
          router.replace(`/login?redirect=${redirect}`);
          return;
        }
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt, isAuthenticated, logout, router, spinId, token]);

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-[100svh] bg-[#fafafa] px-3 pb-12 pt-24 text-zinc-950 sm:px-6 sm:pt-28">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-4 flex gap-2">
          <Link
            href="/lucky-wheel"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-zinc-950 bg-white px-3 text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backWheel")}
          </Link>
          <Link
            href="/lucky-wheel/history"
            className="inline-flex min-h-11 items-center rounded-lg border-2 border-zinc-950 bg-white px-3 text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {t("navHistory")}
          </Link>
        </div>

        {loading ? (
          <div
            role="status"
            className="flex min-h-72 items-center justify-center gap-3 rounded-[22px] border-2 border-zinc-950 bg-white"
          >
            <Loader2 className="h-6 w-6 animate-spin text-orange-700" />
            <span className="font-bold text-zinc-600">{t("loading")}</span>
          </div>
        ) : error || !detail ? (
          <div className="rounded-[22px] border-2 border-zinc-950 bg-white p-6 text-center">
            <p role="alert" className="font-extrabold">{t("proofLoadError")}</p>
            <button
              type="button"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-zinc-950 px-4 font-extrabold"
              onClick={() => {
                setLoading(true);
                setError(false);
                setAttempt((value) => value + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              {t("retry")}
            </button>
          </div>
        ) : (
          <RewardProof detail={detail} />
        )}
      </div>
    </main>
  );
}
