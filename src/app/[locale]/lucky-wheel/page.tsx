"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { loadEntryTickets } from "@/lib/entryTicket";
import {
  LuckyWheelApiError,
  clearPendingSpinRequest,
  getOrCreatePendingSpinRequest,
  loadEligibility,
  loadPendingSpinRequest,
  submitSpin,
  type LuckyWheelEligibility,
  type LuckyWheelSegment,
  type LuckyWheelSpin,
} from "@/lib/luckyWheel";
import {
  ActivityTicket,
  type WheelActionPhase,
} from "@/components/lucky-wheel/ActivityTicket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;

function renderSegments(
  eligibility: LuckyWheelEligibility,
): LuckyWheelSegment[] {
  if (eligibility.availability.length > 0) {
    return [...eligibility.availability].sort(
      (a, b) => a.position - b.position,
    );
  }
  return (eligibility.configuration?.segments ?? [])
    .map((segment) => ({
      id: segment.id,
      kind: segment.kind,
      name: segment.name,
      imageKey: null,
      enabled: segment.enabled,
      position: segment.position,
      remaining: null,
    }))
    .sort((a, b) => a.position - b.position);
}

export default function LuckyWheelPage() {
  const t = useTranslations("luckyWheel");
  const router = useRouter();
  const { token, isAuthenticated, logout } = useAuth();
  const [eventId, setEventId] = useState<number | null>(null);
  const [eligibility, setEligibility] = useState<LuckyWheelEligibility | null>(
    null,
  );
  const [phase, setPhase] = useState<WheelActionPhase>("idle");
  const [result, setResult] = useState<LuckyWheelSpin | null>(null);
  const [frozenSegments, setFrozenSegments] = useState<
    LuckyWheelSegment[] | null
  >(null);
  const [animateResult, setAnimateResult] = useState(false);
  const [loadError, setLoadError] = useState(!EVENT_CODE);
  const [missingRegistration, setMissingRegistration] = useState(false);
  const [loading, setLoading] = useState(Boolean(EVENT_CODE));
  const [attempt, setAttempt] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=%2Flucky-wheel");
    }
  }, [isAuthenticated, router]);

  const expireAuth = useCallback(() => {
    logout();
    router.replace("/login?redirect=%2Flucky-wheel");
  }, [logout, router]);

  const refreshEligibility = useCallback(
    async (targetEventId: number, preserveResult = false) => {
      if (!token) return null;
      try {
        const next = await loadEligibility(API_URL, token, targetEventId);
        setEligibility(next);
        const pending = loadPendingSpinRequest(
          sessionStorage,
          next.userId,
          targetEventId,
        );
        if (pending) {
          setPhase("unknown");
        } else {
          if (!preserveResult) setResult(null);
          setFrozenSegments(null);
          setPhase("idle");
        }
        return next;
      } catch (error) {
        if (error instanceof LuckyWheelApiError && error.status === 401) {
          expireAuth();
          return null;
        }
        throw error;
      }
    },
    [expireAuth, token],
  );

  useEffect(() => {
    if (!isAuthenticated || !token || !EVENT_CODE) return;

    const controller = new AbortController();
    let cancelled = false;

    loadEntryTickets(API_URL, token, EVENT_CODE, controller.signal)
      .then(async (tickets) => {
        if (cancelled) return;
        const ticket = tickets[0];
        if (!ticket) {
          setMissingRegistration(true);
          setLoading(false);
          return;
        }
        setEventId(ticket.eventId);
        await refreshEligibility(ticket.eventId);
        if (!cancelled) setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof Error && error.cause === 401) {
          expireAuth();
          return;
        }
        setLoadError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt, expireAuth, isAuthenticated, refreshEligibility, token]);

  useEffect(() => {
    if (
      !eventId ||
      !isAuthenticated ||
      animateResult ||
      phase === "submitting" ||
      phase === "reconciling"
    )
      return;
    const refreshOnReturn = () => {
      void refreshEligibility(eventId).catch(() => setLoadError(true));
    };
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") refreshOnReturn();
    };
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [eventId, isAuthenticated, animateResult, phase, refreshEligibility]);

  const currentSegments = useMemo(
    () => (eligibility ? renderSegments(eligibility) : []),
    [eligibility],
  );
  const displayedSegments = frozenSegments ?? currentSegments;

  const handleSpinError = useCallback(
    async (error: unknown, userId: number, activeEventId: number) => {
      if (error instanceof LuckyWheelApiError && error.status === 401) {
        expireAuth();
        return;
      }
      if (
        error instanceof LuckyWheelApiError &&
        error.code === "WHEEL_UPDATED"
      ) {
        clearPendingSpinRequest(sessionStorage, userId, activeEventId);
        setFrozenSegments(null);
        setResult(null);
        const next = await refreshEligibility(activeEventId);
        if (next) setPhase("updated");
        return;
      }
      if (
        error instanceof LuckyWheelApiError &&
        (error.status === 0 || error.status >= 500)
      ) {
        setPhase("unknown");
        return;
      }

      clearPendingSpinRequest(sessionStorage, userId, activeEventId);
      setFrozenSegments(null);
      setResult(null);
      setPhase("idle");
      try {
        await refreshEligibility(activeEventId);
      } catch {
        setLoadError(true);
      }
      toast.error(error instanceof Error ? error.message : t("loadError"));
    },
    [expireAuth, refreshEligibility, t],
  );

  const spin = async () => {
    if (
      !eligibility ||
      !token ||
      !eventId ||
      animateResult ||
      phase === "submitting" ||
      phase === "reconciling" ||
      phase === "unknown"
    ) {
      return;
    }
    let latest: LuckyWheelEligibility;
    try {
      latest = await loadEligibility(API_URL, token, eventId);
      setEligibility(latest);
    } catch (error) {
      await handleSpinError(error, eligibility.userId, eventId);
      return;
    }
    if (
      !latest.eligible ||
      latest.configurationVersion === null ||
      latest.poolRevision === null ||
      !latest.currentWindow
    ) {
      setPhase("idle");
      return;
    }
    if (loadPendingSpinRequest(sessionStorage, latest.userId, eventId)) {
      setPhase("unknown");
      return;
    }
    const request = getOrCreatePendingSpinRequest(
      sessionStorage,
      latest.userId,
      eventId,
      latest.configurationVersion,
      latest.poolRevision,
      latest.currentWindow.version,
    );
    setFrozenSegments(renderSegments(latest));
    setResult(null);
    setAnimateResult(false);
    setPhase("submitting");
    try {
      const committed = await submitSpin(API_URL, token, request);
      clearPendingSpinRequest(sessionStorage, latest.userId, eventId);
      setResult(committed.spin);
      setAnimateResult(true);
      setPhase("idle");
    } catch (error) {
      await handleSpinError(error, latest.userId, eventId);
    }
  };

  const reconcile = async () => {
    if (!eligibility || !eventId || !token) return;
    const pending = loadPendingSpinRequest(
      sessionStorage,
      eligibility.userId,
      eventId,
    );
    if (!pending) {
      await refreshEligibility(eventId);
      return;
    }
    setPhase("reconciling");
    try {
      const committed = await submitSpin(API_URL, token, pending);
      clearPendingSpinRequest(sessionStorage, eligibility.userId, eventId);
      setResult(committed.spin);
      setAnimateResult(true);
      setPhase("idle");
    } catch (error) {
      await handleSpinError(error, eligibility.userId, eventId);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-[100svh] bg-[#fafafa] px-3 pb-12 pt-24 text-zinc-950 sm:px-6 sm:pt-28">
      <div className="mx-auto w-full max-w-[560px]">
        <nav
          aria-label={t("title")}
          className="mb-4 grid grid-cols-2 border-y border-zinc-200 bg-white"
        >
          <Link
            href="/lucky-wheel"
            aria-current="page"
            className="relative flex min-h-12 items-center justify-center px-3 text-base font-extrabold after:absolute after:inset-x-5 after:bottom-0 after:h-1 after:rounded-full after:bg-[#f45100] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {t("wheelTab")}
          </Link>
          <Link
            href="/lucky-wheel/history"
            className="flex min-h-12 items-center justify-center px-3 text-base font-bold text-zinc-500 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {t("myRewardsTab")}
          </Link>
        </nav>

        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-zinc-950 bg-white p-8 text-center"
          >
            <Loader2
              className="h-7 w-7 animate-spin text-orange-700"
              aria-hidden="true"
            />
            <p className="font-bold text-zinc-700">{t("loading")}</p>
          </div>
        ) : loadError ? (
          <div className="rounded-[22px] border-2 border-zinc-950 bg-white p-6 text-center">
            <p role="alert" className="font-extrabold">
              {t("loadError")}
            </p>
            <button
              type="button"
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-zinc-950 px-4 font-extrabold"
              onClick={() => {
                setLoading(true);
                setLoadError(false);
                setMissingRegistration(false);
                setAttempt((value) => value + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              {t("retry")}
            </button>
          </div>
        ) : missingRegistration ? (
          <div className="rounded-[22px] border-2 border-zinc-950 bg-white p-6 text-center">
            <p className="font-extrabold">{t("registrationRequired")}</p>
            <Link
              href="/ticket"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-zinc-950 px-4 font-extrabold"
            >
              {t("checkTicket")}
            </Link>
          </div>
        ) : eligibility ? (
          <ActivityTicket
            eligibility={eligibility}
            segments={displayedSegments}
            result={result}
            phase={phase}
            animateResult={animateResult}
            reducedMotion={reducedMotion}
            onSpin={() => void spin()}
            onReconcile={() => void reconcile()}
            onAnimationComplete={() => {
              setAnimateResult(false);
              setFrozenSegments(null);
              if (eventId)
                void refreshEligibility(eventId, true).catch(() =>
                  setLoadError(true),
                );
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
