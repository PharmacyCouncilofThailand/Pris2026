"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Loader2, Ticket } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { loadEntryTickets } from "@/lib/entryTicket";
import {
  LuckyWheelApiError,
  captureQrClaimFromFragment,
  claimQrCredit,
  clearPendingQrClaim,
  loadQrPreview,
  luckyWheelBlockMessageKey,
  type WheelQrClaim,
  type WheelQrPreview,
} from "@/lib/luckyWheel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;
const LOGIN_RETURN = "/login?redirect=%2Flucky-wheel%2Fclaim";

function formatBangkok(
  value: string,
  locale: string,
  dateOnly = false,
): string {
  const date = new Date(dateOnly ? `${value}T12:00:00+07:00` : value);
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit", hour12: false }),
  }).format(date);
}

export default function WheelClaimPage() {
  const t = useTranslations("luckyWheel");
  const locale = useLocale();
  const router = useRouter();
  const { token, isAuthenticated, logout } = useAuth();
  const [ready, setReady] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);
  const [claimEventId, setClaimEventId] = useState<number | null>(null);
  const [preview, setPreview] = useState<WheelQrPreview | null>(null);
  const [claim, setClaim] = useState<WheelQrClaim | null>(null);
  const [deadlineChanged, setDeadlineChanged] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    try {
      const pending = captureQrClaimFromFragment(
        sessionStorage,
        window.location.hash,
      );
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search,
        );
      }
      setQrId(pending);
    } catch {
      setQrId(null);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && qrId && !isAuthenticated) router.replace(LOGIN_RETURN);
  }, [ready, qrId, isAuthenticated, router]);

  useEffect(() => {
    if (!ready || !qrId || !isAuthenticated || !token || !EVENT_CODE) return;
    const controller = new AbortController();
    let active = true;
    setErrorCode(null);
    setUncertain(false);
    setClaim(null);

    const run = async () => {
      try {
        const tickets = await loadEntryTickets(
          API_URL,
          token,
          EVENT_CODE,
          controller.signal,
        );
        if (!active) return;
        const ticket = tickets[0];
        if (!ticket) {
          clearPendingQrClaim(sessionStorage);
          setErrorCode("REGISTRATION_REQUIRED");
          return;
        }
        setClaimEventId(ticket.eventId);
        try {
          const nextPreview = await loadQrPreview(
            API_URL,
            token,
            ticket.eventId,
            qrId,
            controller.signal,
          );
          if (active) setPreview(nextPreview);
        } catch (error) {
          if (error instanceof LuckyWheelApiError && error.status === 401)
            throw error;
          // The claim POST remains authoritative when preview cannot be loaded.
        }
        const result = await claimQrCredit(
          API_URL,
          token,
          ticket.eventId,
          qrId,
          controller.signal,
        );
        if (!active) return;
        clearPendingQrClaim(sessionStorage);
        setClaim(result);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        if (error instanceof LuckyWheelApiError && error.status === 401) {
          logout();
          router.replace(LOGIN_RETURN);
          return;
        }
        if (error instanceof Error && error.cause === 401) {
          logout();
          router.replace(LOGIN_RETURN);
          return;
        }
        if (
          error instanceof LuckyWheelApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 429
        ) {
          if (error.code !== "ATTENDANCE_SETUP_REQUIRED")
            clearPendingQrClaim(sessionStorage);
          setErrorCode(error.code);
          return;
        }
        setUncertain(true);
        setErrorCode("NETWORK_ERROR");
      }
    };
    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [ready, qrId, isAuthenticated, token, attempt, logout, router]);

  useEffect(() => {
    if (!claim || !claimEventId || !qrId || !token) return;
    let active = true;
    let controller: AbortController | null = null;
    const refreshDeadline = () => {
      controller?.abort();
      controller = new AbortController();
      void loadQrPreview(API_URL, token, claimEventId, qrId, controller.signal)
        .then((latest) => {
          if (!active) return;
          setPreview(latest);
          setDeadlineChanged(latest.currentDeadline !== claim.currentDeadline);
        })
        .catch(() => undefined);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshDeadline();
    };
    window.addEventListener("focus", refreshDeadline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      controller?.abort();
      window.removeEventListener("focus", refreshDeadline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [claim, claimEventId, qrId, token]);

  const invalid = ready && !qrId;
  const loading =
    !ready || (Boolean(qrId) && !claim && !errorCode && Boolean(EVENT_CODE));
  const statusText = !EVENT_CODE
    ? t("claimUnavailable")
    : invalid
      ? t("claimInvalid")
      : errorCode === "ATTENDANCE_SETUP_REQUIRED"
        ? t(luckyWheelBlockMessageKey(errorCode))
        : errorCode === "CHECKIN_REQUIRED"
          ? t("checkinRequired")
          : errorCode === "REGISTRATION_REQUIRED"
            ? t("registrationRequired")
            : errorCode === "SESSION_CLOSED" ||
                errorCode === "DAY_WINDOW_CLOSED"
              ? t("claimOutsideWindow")
              : errorCode === "WHEEL_PAUSED"
                ? t("paused")
                : errorCode === "OUT_OF_STOCK"
                  ? t("outOfStock")
                  : errorCode === "WHEEL_NOT_READY"
                    ? t("claimClosed")
                    : errorCode
                      ? t("claimError")
                      : claim?.created
                        ? t("claimReceived")
                        : claim
                          ? t("claimAlreadyReceived")
                          : t("claimChecking");

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 pb-16 pt-28 text-[#111827] sm:px-6">
      <div className="mx-auto max-w-lg">
        <nav
          className="mb-5 flex gap-5 text-sm font-semibold"
          aria-label={t("claimNavigation")}
        >
          <Link
            href="/lucky-wheel"
            className="text-[#c2410c] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
          >
            {t("navWheel")}
          </Link>
          <Link
            href="/lucky-wheel/history"
            className="text-[#374151] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
          >
            {t("navHistory")}
          </Link>
        </nav>
        <article className="overflow-hidden rounded-[22px] border-2 border-[#111827] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.08)]">
          <div className="h-2 bg-[#ea580c]" aria-hidden="true" />
          <div className="px-5 pb-7 pt-7 sm:px-8">
            <div className="mb-6 flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff1e6] text-[#c2410c]"
                aria-hidden="true"
              >
                <Ticket size={25} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">
                  {t("claimTitle")}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  {t("claimDescription")}
                </p>
              </div>
            </div>

            <div
              role="status"
              aria-live="polite"
              className="rounded-xl bg-[#fafafa] px-4 py-5"
            >
              <div className="flex items-start gap-3">
                {loading ? (
                  <Loader2
                    className="mt-0.5 shrink-0 animate-spin text-[#c2410c]"
                    size={22}
                    aria-hidden="true"
                  />
                ) : claim ? (
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-[#047857]"
                    size={22}
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="mt-0.5 shrink-0 text-[#b45309]"
                    size={22}
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-semibold leading-relaxed">{statusText}</p>
                  {claim && (
                    <p className="mt-2 text-sm leading-relaxed text-[#374151]">
                      {claim.qrName} · {formatBangkok(claim.date, locale, true)}
                    </p>
                  )}
                  {!claim && preview && (
                    <p className="mt-2 text-sm leading-relaxed text-[#374151]">
                      {preview.name} ·{" "}
                      {formatBangkok(preview.date, locale, true)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {(claim || preview) && (
              <p className="mt-5 text-sm leading-relaxed text-[#374151]">
                {t("claimDeadline", {
                  dateTime: formatBangkok(
                    (preview?.currentDeadline ??
                      claim?.currentDeadline) as string,
                    locale,
                  ),
                })}
              </p>
            )}
            {deadlineChanged && (
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[#9a3412]">
                {t("claimDeadlineChanged")}
              </p>
            )}
            {claim && claim.state !== "spendable" && (
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                {claim.state === "prior_day_expired"
                  ? t("claimPriorDayExpired")
                  : claim.state === "spent"
                    ? t("claimSpent")
                    : claim.state === "revoked"
                      ? t("claimRevoked")
                      : t("claimTemporarilyUnavailable")}
              </p>
            )}
            {uncertain && (
              <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">
                {t("claimRetryHint")}
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3">
              {(uncertain || errorCode === "ATTENDANCE_SETUP_REQUIRED") && (
                <button
                  type="button"
                  onClick={() => setAttempt((value) => value + 1)}
                  className="min-h-12 rounded-xl bg-[#ea580c] px-5 py-3 text-center font-bold text-white hover:bg-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
                >
                  {t("retry")}
                </button>
              )}
              {claim && (
                <Link
                  href="/lucky-wheel"
                  className="flex min-h-12 items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-center font-bold text-white hover:bg-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
                >
                  {t("claimGoWheel")}
                </Link>
              )}
              {errorCode === "CHECKIN_REQUIRED" && (
                <Link
                  href="/ticket"
                  className="flex min-h-12 items-center justify-center rounded-xl border border-[#111827] px-5 py-3 text-center font-semibold text-[#111827] hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
                >
                  {t("checkTicket")}
                </Link>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
