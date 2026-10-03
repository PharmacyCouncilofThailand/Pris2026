"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, CircleAlert, History, Loader2, Ticket, Trophy } from "lucide-react";
import { Link } from "@/i18n/routing";
import type {
  LuckyWheelEligibility,
  LuckyWheelSegment,
  LuckyWheelSpin,
} from "@/lib/luckyWheel";
import { Wheel } from "./Wheel";
import styles from "./wheel.module.css";

export type WheelActionPhase =
  | "idle"
  | "submitting"
  | "reconciling"
  | "unknown"
  | "updated";

type Props = {
  eligibility: LuckyWheelEligibility;
  segments: LuckyWheelSegment[];
  result: LuckyWheelSpin | null;
  phase: WheelActionPhase;
  animateResult: boolean;
  reducedMotion: boolean;
  onSpin: () => void;
  onReconcile: () => void;
  onAnimationComplete: () => void;
};

function blockKey(code: LuckyWheelEligibility["blockCode"]) {
  switch (code) {
    case "CHECKIN_REQUIRED":
      return "checkinRequired";
    case "REGISTRATION_REQUIRED":
      return "registrationRequired";
    case "SESSION_CLOSED":
      return "sessionClosed";
    case "DAY_WINDOW_CLOSED":
      return "outsideWindow";
    case "NO_CREDIT":
      return "noCredit";
    case "WHEEL_PAUSED":
      return "paused";
    case "OUT_OF_STOCK":
      return "outOfStock";
    default:
      return "notReady";
  }
}

export function ActivityTicket({
  eligibility,
  segments,
  result,
  phase,
  animateResult,
  reducedMotion,
  onSpin,
  onReconcile,
  onAnimationComplete,
}: Props) {
  const t = useTranslations("luckyWheel");
  const locale = useLocale();
  const resultRef = useRef<HTMLDivElement>(null);
  const wasAnimatingResult = useRef(false);

  useEffect(() => {
    if (animateResult) {
      wasAnimatingResult.current = true;
      return;
    }
    if (result && phase === "idle" && wasAnimatingResult.current) {
      wasAnimatingResult.current = false;
      resultRef.current?.focus({ preventScroll: false });
    }
  }, [animateResult, phase, result]);

  const winningId =
    phase === "idle" && result && animateResult ? result.segmentId : null;
  const blockedMessage = !eligibility.eligible
    ? eligibility.blockCode === "NO_CREDIT" && eligibility.hasExpiredPriorDayCredit
      ? t("priorDayExpired")
      : t(blockKey(eligibility.blockCode) as Parameters<typeof t>[0])
    : null;

  return (
    <article className={styles.ticket}>
      <div className="px-4 pb-5 pt-5 sm:px-7 sm:pb-7">
        <div className="text-center">
          <h1 className="text-balance text-[clamp(1.55rem,7vw,2rem)] font-black leading-tight tracking-[-0.025em] text-zinc-950">
            {t("title")}
          </h1>
          <div
            className="mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-700"
            role="status"
            aria-live="polite"
          >
            {eligibility.eligible ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            ) : (
              <CircleAlert className="h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
            )}
            <span>
              {eligibility.eligible
                ? t("readyCredits", { count: eligibility.spendableCredits })
                : blockedMessage}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-zinc-500">
            {t("serverTime", { date: eligibility.playDate })}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">
            {t("creditCounts", { held: eligibility.unspentCredits, spendable: eligibility.spendableCredits })}
          </p>
          {eligibility.currentWindow && <p className="mt-1 text-sm text-zinc-700">
            {t("wheelDeadline", { dateTime: new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
              timeZone: "Asia/Bangkok", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
            }).format(new Date(eligibility.currentWindow.endAt)) })}
          </p>}
        </div>

        <div className="mt-5">
          <Wheel
            segments={segments}
            winningSegmentId={winningId}
            snapshotVersion={result?.configurationVersion ?? eligibility.configurationVersion}
            reducedMotion={reducedMotion}
            onAnimationComplete={onAnimationComplete}
            ariaLabel={t("title")}
          />
        </div>

        <p className="mx-auto mt-3 max-w-[36rem] text-center text-sm leading-6 text-zinc-700">
          {t("fairness")}
        </p>
      </div>

      <div className={styles.seam} aria-hidden="true" />

      <div className="space-y-5 px-4 py-5 sm:px-7 sm:py-7">
        <div aria-live="assertive" className="space-y-3">
          {phase === "unknown" ? (
            <div className="rounded-xl bg-amber-50 p-4 text-amber-950">
              <p className="font-extrabold">{t("unknown")}</p>
              <p className="mt-1 text-sm leading-6">{t("unknownHint")}</p>
              <button type="button" className={`${styles.action} mt-4`} onClick={onReconcile}>
                {t("reconcile")}
              </button>
            </div>
          ) : phase === "updated" ? (
            <div className="space-y-4 rounded-xl bg-orange-50 p-4 text-orange-950">
              <p className="font-extrabold">{t("updated")}</p>
              {eligibility.eligible && (
                <button type="button" className={styles.action} onClick={onSpin}>
                  {t("spin")}
                </button>
              )}
            </div>
          ) : phase === "reconciling" ? (
            <div
              className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-zinc-50 p-4 text-zinc-800"
              role="status"
            >
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="font-extrabold">{t("reconciling")}</span>
            </div>
          ) : animateResult && result ? (
            <div
              className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-zinc-50 p-4 text-zinc-800"
              role="status"
            >
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="font-extrabold">{t("spinning")}</span>
            </div>
          ) : result ? (
            <div
              ref={resultRef}
              tabIndex={-1}
              className="rounded-xl bg-zinc-50 p-4 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {result.outcomeKind === "prize" ? (
                <>
                  <Trophy className="mx-auto h-8 w-8 text-orange-700" aria-hidden="true" />
                  <p className="mt-2 text-lg font-black text-zinc-950">{t("prizeWon")}</p>
                  <p className="mt-1 text-xl font-black text-orange-800">
                    {result.awardedName[locale === "th" ? "th" : "en"]}
                  </p>
                  <Link
                    href={`/lucky-wheel/rewards/${result.id}`}
                    className={`${eligibility.eligible ? styles.secondaryAction : styles.action} mt-4 inline-flex items-center justify-center`}
                  >
                    {t("viewProof")}
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-lg font-black text-zinc-950">{t("noPrize")}</p>
                  <p className="mt-1 text-sm text-zinc-600">{t("creditSpent")}</p>
                  <Link
                    href="/lucky-wheel/history"
                    className={`${styles.secondaryAction} mt-4`}
                  >
                    <History className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("viewHistory")}
                  </Link>
                </>
              )}
              {eligibility.eligible && <button type="button" className={`${styles.action} mt-4`} onClick={onSpin}>
                {t("spinAgain")}
              </button>}
            </div>
          ) : eligibility.eligible ? (
            <button
              type="button"
              className={styles.action}
              onClick={onSpin}
              disabled={phase === "submitting"}
            >
              {phase === "submitting" ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  {t("spinning")}
                </span>
              ) : (
                t("spin")
              )}
            </button>
          ) : (
            <div className="space-y-3 text-center">
              <p className="font-extrabold text-zinc-900">{blockedMessage}</p>
              {eligibility.blockCode === "OUT_OF_STOCK" && (
                <p className="text-sm text-zinc-600">{t("waitRestock")}</p>
              )}
              {(eligibility.blockCode === "CHECKIN_REQUIRED" ||
                eligibility.blockCode === "REGISTRATION_REQUIRED") && (
                <Link href="/ticket" className={styles.secondaryAction}>
                  <Ticket className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("checkTicket")}
                </Link>
              )}
            </div>
          )}
        </div>

        <section aria-labelledby="wheel-availability">
          <h2 id="wheel-availability" className="text-base font-black text-zinc-950">
            {t("availabilityTitle")}
          </h2>
          <ol className="mt-3 divide-y divide-zinc-200 border-y border-zinc-200">
            {segments.map((segment, index) => {
              const soldOut =
                segment.kind === "prize" &&
            segment.remaining !== null &&
            segment.remaining <= 0;
              return (
                <li key={segment.id} className="flex min-h-12 items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-zinc-950 bg-white text-xs font-black tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-extrabold text-zinc-900">
                      {segment.name.th}
                    </span>
                    <span className="block break-words text-xs text-zinc-500">
                      {segment.name.en}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs font-extrabold ${
                      soldOut ? "text-zinc-600" : "text-emerald-800"
                    }`}
                  >
                    {segment.kind === "no_prize"
                      ? t("unlimited")
                      : soldOut
                        ? t("soldOut")
                        : t("available", { count: segment.remaining ?? 0 })}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <details className="group border-t border-zinc-200 pt-4">
          <summary className="min-h-11 cursor-pointer py-2 font-extrabold text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {t("rulesTitle")}
          </summary>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700">
            <li>{t("ruleDaily")}</li>
            <li>{t("ruleCheckin")}</li>
            <li>{t("ruleServer")}</li>
          </ul>
        </details>
      </div>
    </article>
  );
}
