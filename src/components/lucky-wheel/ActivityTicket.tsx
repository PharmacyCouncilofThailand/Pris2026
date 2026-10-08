"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  Gift,
  History,
  Loader2,
  Ticket,
  Trophy,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  luckyWheelBlockMessageKey,
  resolveWheelImageUrl,
} from "@/lib/luckyWheel";
import type {
  LuckyWheelEligibility,
  LuckyWheelSegment,
  LuckyWheelSpin,
} from "@/lib/luckyWheel";
import { Wheel } from "./Wheel";
import styles from "./wheel.module.css";
import ticketStyles from "@/app/[locale]/ticket/ticket.module.css";

export type WheelActionPhase =
  "idle" | "submitting" | "reconciling" | "unknown" | "updated";

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
    ? eligibility.blockCode === "NO_CREDIT" &&
      eligibility.hasExpiredPriorDayCredit
      ? t("priorDayExpired")
      : t(luckyWheelBlockMessageKey(eligibility.blockCode))
    : null;

  return (
    <>
      <article className={`${ticketStyles.ticket} ${styles.activityTicket}`}>
        <section className="px-3 pb-3 pt-7 sm:px-5 sm:pb-4 sm:pt-9">
          <div className="text-center">
            <h1 className="text-balance text-[clamp(1.65rem,6vw,2.25rem)] font-black leading-tight tracking-[-0.025em] text-zinc-950">
              {t("wheelHeading")}
            </h1>
            <div
              className="mx-auto mt-3 flex w-fit max-w-full items-center justify-center gap-2 text-sm font-bold text-zinc-950 sm:text-lg"
              role="status"
              aria-live="polite"
            >
              {eligibility.eligible ? (
                <Check
                  className="h-6 w-6 shrink-0 rounded-full bg-[#f45100] p-1 text-white"
                  aria-hidden="true"
                />
              ) : (
                <CircleAlert
                  className="h-4 w-4 shrink-0 text-orange-700"
                  aria-hidden="true"
                />
              )}
              <span>
                {eligibility.eligible
                  ? t("todayCredits", { count: eligibility.spendableCredits })
                  : blockedMessage}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Wheel
              segments={segments}
              winningSegmentId={winningId}
              snapshotVersion={
                result?.configurationVersion ?? eligibility.configurationVersion
              }
              reducedMotion={reducedMotion}
              onAnimationComplete={onAnimationComplete}
              ariaLabel={t("title")}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm font-extrabold sm:text-lg">
              {t("equalChance")}
            </p>
            <p className="mt-1 text-xs text-zinc-500 sm:text-base">
              {t("soldOutChance")}
            </p>
          </div>
        </section>

        <div
          className={`${ticketStyles.perforation} ${styles.activitySeam}`}
          aria-hidden="true"
        />

        <section className="px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
          <div aria-live="assertive" className="space-y-3">
            {phase === "unknown" ? (
              <div className="rounded-xl bg-amber-50 p-4 text-amber-950">
                <p className="font-extrabold">{t("unknown")}</p>
                <p className="mt-1 text-sm leading-6">{t("unknownHint")}</p>
                <button
                  type="button"
                  className={`${styles.action} mt-4`}
                  onClick={onReconcile}
                >
                  {t("reconcile")}
                </button>
              </div>
            ) : phase === "updated" ? (
              <div className="space-y-4 rounded-xl bg-orange-50 p-4 text-orange-950">
                <p className="font-extrabold">{t("updated")}</p>
                {eligibility.eligible && (
                  <button
                    type="button"
                    className={styles.action}
                    onClick={onSpin}
                  >
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
                    <Trophy
                      className="mx-auto h-8 w-8 text-orange-700"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-lg font-black text-zinc-950">
                      {t("prizeWon")}
                    </p>
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
                    <p className="text-lg font-black text-zinc-950">
                      {t("noPrize")}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {t("creditSpent")}
                    </p>
                    <Link
                      href="/lucky-wheel/history"
                      className={`${styles.secondaryAction} mt-4`}
                    >
                      <History className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t("viewHistory")}
                    </Link>
                  </>
                )}
                {eligibility.eligible && (
                  <button
                    type="button"
                    className={`${styles.action} mt-4`}
                    onClick={onSpin}
                  >
                    {t("spinAgain")}
                  </button>
                )}
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
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
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
          <p className="mt-2 text-center text-xs text-zinc-500 sm:text-sm">
            {t("spinCost")}
          </p>
        </section>
      </article>

      <section aria-labelledby="wheel-availability" className="mt-5">
        <h2
          id="wheel-availability"
          className="px-3 text-lg font-extrabold text-zinc-950"
        >
          {t("prizeListTitle")}
        </h2>
        <ul className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-200">
          {segments
            .filter((segment) => segment.kind === "prize")
            .map((segment) => {
              const soldOut =
                segment.remaining !== null && segment.remaining <= 0;
              const imageUrl = resolveWheelImageUrl(
                segment.imageKey,
                process.env.NEXT_PUBLIC_LUCKY_WHEEL_IMAGE_BASE_URL,
              );
              return (
                <li
                  key={segment.id}
                  className="flex min-h-14 items-center gap-3 px-3 py-2 sm:min-h-16 sm:px-4"
                >
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center sm:h-12 sm:w-12">
                    <Gift
                      className="h-7 w-7 text-zinc-400"
                      aria-hidden="true"
                    />
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full bg-white object-contain"
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-bold text-zinc-900 sm:text-base">
                      {segment.name[locale === "th" ? "th" : "en"]}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:px-4 sm:text-sm ${
                      soldOut || !segment.enabled
                        ? "bg-zinc-400 text-white"
                        : "bg-orange-50 text-[#c2410c]"
                    }`}
                  >
                    {!segment.enabled
                      ? t("unavailableSegment")
                      : soldOut
                        ? t("soldOutPrize")
                        : t("readyPrize")}
                  </span>
                </li>
              );
            })}
        </ul>
      </section>

      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-200">
        <Link
          href="/lucky-wheel/history"
          className="flex min-h-14 items-center gap-4 px-4 py-3 text-sm hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-inset sm:text-base"
        >
          <Gift className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span className="flex-1">{t("historyAndRewards")}</span>
          <ChevronRight className="h-5 w-5 text-zinc-500" aria-hidden="true" />
        </Link>
        <details className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-4 py-3 text-sm hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-inset sm:text-base [&::-webkit-details-marker]:hidden">
            <FileText className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="flex-1">{t("playRules")}</span>
            <ChevronRight
              className="h-5 w-5 text-zinc-500 transition-transform group-open:rotate-90"
              aria-hidden="true"
            />
          </summary>
          <ul className="list-disc space-y-2 px-5 pb-4 pl-10 text-sm leading-6 text-zinc-700">
            <li>{t("ruleDaily")}</li>
            <li>{t("ruleCheckin")}</li>
            <li>{t("ruleServer")}</li>
            <li>{t("fairness")}</li>
          </ul>
          <div className="space-y-1 border-t border-zinc-100 px-4 py-3 text-xs leading-5 text-zinc-500">
            <p>{t("serverTime", { date: eligibility.playDate })}</p>
            <p>
              {t("creditCounts", {
                held: eligibility.unspentCredits,
                spendable: eligibility.spendableCredits,
              })}
            </p>
            {eligibility.currentWindow && (
              <p>
                {t("wheelDeadline", {
                  dateTime: new Intl.DateTimeFormat(
                    locale === "th" ? "th-TH" : "en-GB",
                    {
                      timeZone: "Asia/Bangkok",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    },
                  ).format(new Date(eligibility.currentWindow.endAt)),
                })}
              </p>
            )}
          </div>
        </details>
      </div>
    </>
  );
}
