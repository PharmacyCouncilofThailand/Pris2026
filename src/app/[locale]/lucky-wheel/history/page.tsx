"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CircleMinus, Loader2, Trophy } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { loadEntryTickets } from "@/lib/entryTicket";
import {
  LuckyWheelApiError,
  loadOwnSpins,
  type LuckyWheelHistoryResponse,
} from "@/lib/luckyWheel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;
const PAGE_SIZE = 10;

export default function LuckyWheelHistoryPage() {
  const t = useTranslations("luckyWheel");
  const locale = useLocale();
  const router = useRouter();
  const { token, isAuthenticated, logout } = useAuth();
  const [eventId, setEventId] = useState<number | null>(null);
  const [history, setHistory] = useState<LuckyWheelHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(Boolean(EVENT_CODE));
  const [error, setError] = useState(!EVENT_CODE);
  const [missingRegistration, setMissingRegistration] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login?redirect=%2Flucky-wheel%2Fhistory");
  }, [isAuthenticated, router]);

  const expire = useCallback(() => {
    logout();
    router.replace("/login?redirect=%2Flucky-wheel%2Fhistory");
  }, [logout, router]);

  useEffect(() => {
    if (!isAuthenticated || !token || !EVENT_CODE) return;
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        let targetEventId = eventId;
        if (!targetEventId) {
          const tickets = await loadEntryTickets(
            API_URL,
            token,
            EVENT_CODE,
            controller.signal,
          );
          if (cancelled) return;
          const ticket = tickets[0];
          if (!ticket) {
            setMissingRegistration(true);
            setLoading(false);
            return;
          }
          targetEventId = ticket.eventId;
          setEventId(targetEventId);
        }
        const next = await loadOwnSpins(
          API_URL,
          token,
          targetEventId,
          page,
          PAGE_SIZE,
          controller.signal,
        );
        if (!cancelled) setHistory(next);
      } catch (cause) {
        if (cancelled) return;
        if (
          (cause instanceof Error && cause.cause === 401) ||
          (cause instanceof LuckyWheelApiError && cause.status === 401)
        ) {
          expire();
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
  }, [attempt, eventId, expire, isAuthenticated, page, token]);

  const formatter = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-[100svh] bg-[#fafafa] px-3 pb-12 pt-24 text-zinc-950 sm:px-6 sm:pt-28">
      <div className="mx-auto w-full max-w-[680px]">
        <nav
          aria-label={t("title")}
          className="mb-4 flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-zinc-950 bg-white p-1"
        >
          <Link
            href="/lucky-wheel"
            className="flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-sm font-extrabold text-zinc-800 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {t("navWheel")}
          </Link>
          <Link
            href="/lucky-wheel/history"
            aria-current="page"
            className="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-zinc-950 px-3 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {t("navHistory")}
          </Link>
        </nav>

        <section className="overflow-hidden rounded-[22px] border-2 border-zinc-950 bg-white shadow-[0_18px_42px_rgba(24,24,27,0.10)]">
          <div className="h-[7px] bg-[#ea580c]" />
          <div className="p-5 sm:p-7">
            <h1 className="text-[clamp(1.5rem,6vw,2rem)] font-black tracking-[-0.025em]">
              {t("historyTitle")}
            </h1>

            {loading ? (
              <div role="status" className="flex min-h-56 items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-orange-700" />
                <span className="font-bold text-zinc-600">{t("loading")}</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p role="alert" className="font-extrabold">{t("historyLoadError")}</p>
                <button
                  type="button"
                  className="mt-4 min-h-11 rounded-lg border-2 border-zinc-950 px-4 font-extrabold"
                  onClick={() => {
                    setLoading(true);
                    setError(false);
                    setAttempt((value) => value + 1);
                  }}
                >
                  {t("retry")}
                </button>
              </div>
            ) : missingRegistration ? (
              <div className="py-12 text-center">
                <p className="font-extrabold">{t("registrationRequired")}</p>
                <Link
                  href="/ticket"
                  className="mt-4 inline-flex min-h-11 items-center rounded-lg border-2 border-zinc-950 px-4 font-extrabold"
                >
                  {t("checkTicket")}
                </Link>
              </div>
            ) : history && history.items.length === 0 ? (
              <p className="py-14 text-center text-sm font-semibold text-zinc-600">
                {t("historyEmpty")}
              </p>
            ) : (
              <ol className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
                {history?.items.map((item) => (
                  <li key={item.spinId} className="py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-zinc-950 ${
                          item.outcomeKind === "prize" ? "bg-orange-50" : "bg-zinc-100"
                        }`}
                      >
                        {item.outcomeKind === "prize" ? (
                          <Trophy className="h-5 w-5 text-orange-800" aria-hidden="true" />
                        ) : (
                          <CircleMinus className="h-5 w-5 text-zinc-600" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-black text-zinc-950">
                          {item.prize.name[locale === "th" ? "th" : "en"]}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-zinc-500">
                          {formatter.format(new Date(item.prize.awardedAt))}
                        </p>
                        <p className="mt-2 text-sm font-bold text-zinc-700">
                          {item.outcomeKind === "no_prize"
                            ? t("notApplicable")
                            : item.status === "redeemed"
                              ? t("claimed")
                              : t("unclaimed")}
                        </p>
                      </div>
                      {item.outcomeKind === "prize" && (
                        <Link
                          href={`/lucky-wheel/rewards/${item.spinId}`}
                          className="inline-flex min-h-11 shrink-0 items-center rounded-lg border-2 border-zinc-950 px-3 text-xs font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          {t("viewProof")}
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {history && history.pagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg border-2 border-zinc-950 px-3 text-sm font-extrabold disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => {
                    setLoading(true);
                    setError(false);
                    setPage((value) => Math.max(1, value - 1));
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </button>
                <p className="text-xs font-bold tabular-nums text-zinc-600">
                  {t("page", {
                    page: history.pagination.page,
                    total: history.pagination.totalPages,
                  })}
                </p>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg border-2 border-zinc-950 px-3 text-sm font-extrabold disabled:opacity-40"
                  disabled={page >= history.pagination.totalPages}
                  onClick={() => {
                    setLoading(true);
                    setError(false);
                    setPage((value) => value + 1);
                  }}
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
