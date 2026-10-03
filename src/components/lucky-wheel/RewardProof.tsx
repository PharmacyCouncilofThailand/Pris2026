"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Clipboard, Clock3, MapPin, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  resolveWheelImageUrl,
  type OwnedLuckyWheelSpin,
} from "@/lib/luckyWheel";
import styles from "./wheel.module.css";

type Props = {
  detail: OwnedLuckyWheelSpin;
};

export function RewardProof({ detail }: Props) {
  const t = useTranslations("luckyWheel");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const imageUrl = !imageFailed
    ? resolveWheelImageUrl(
        detail.prize.imageKey,
        process.env.NEXT_PUBLIC_LUCKY_WHEEL_IMAGE_BASE_URL,
      )
    : null;
  const formatter = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const deadlinePassed = Boolean(
    detail.collectionDeadline &&
      renderedAt >= new Date(detail.collectionDeadline).getTime(),
  );

  if (!detail.rewardProof) {
    return (
      <section className={`${styles.ticket} p-6 text-center`}>
        <h1 className="text-2xl font-black text-zinc-950">{t("rewardProofTitle")}</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-700">{t("noProof")}</p>
      </section>
    );
  }

  return (
    <article className={styles.ticket}>
      <div className="px-5 pb-5 pt-5 sm:px-7">
        <h1 className="text-center text-[clamp(1.5rem,7vw,2rem)] font-black tracking-[-0.025em] text-zinc-950">
          {t("rewardProofTitle")}
        </h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
          <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-xl border-2 border-zinc-950 bg-zinc-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="px-2 text-center text-xs font-bold text-zinc-500">
                {t("imageUnavailable")}
              </span>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xl font-black text-zinc-950">{detail.prize.name.th}</p>
            <p className="mt-1 text-sm text-zinc-500">{detail.prize.name.en}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-center gap-2 sm:justify-start">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
                <div>
                  <dt className="sr-only">{t("owner")}</dt>
                  <dd className="font-bold text-zinc-800">
                    {detail.owner.firstName} {detail.owner.lastName}
                  </dd>
                </div>
              </div>
              <div className="flex items-start justify-center gap-2 sm:justify-start">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
                <div>
                  <dt className="sr-only">{t("awardedAt")}</dt>
                  <dd className="text-zinc-700">{formatter.format(new Date(detail.prize.awardedAt))}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className={styles.seam} aria-hidden="true" />

      <div className="space-y-5 px-5 py-6 sm:px-7">
        <div className={styles.proofQr}>
          <QRCodeSVG
            value={detail.rewardProof.qrPayload}
            size={260}
            level="M"
            marginSize={4}
            bgColor="#ffffff"
            fgColor="#18181b"
            className="h-full w-full"
            role="img"
            aria-label={t("qrAlt")}
          />
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-zinc-500">{t("manualCode")}</p>
          <p className="mt-1 break-all text-xl font-black tracking-[0.08em] text-zinc-950">
            {detail.rewardProof.displayCode}
          </p>
          <button
            type="button"
            className={`${styles.secondaryAction} mt-3`}
            onClick={async () => {
              await navigator.clipboard.writeText(detail.rewardProof!.displayCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
            {copied ? t("copied") : t("copyCode")}
          </button>
        </div>

        <dl className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-3 py-3">
            <dt className="font-bold text-zinc-500">{t("claimStatus")}</dt>
            <dd className="font-extrabold text-zinc-900">
              {detail.status === "redeemed" ? t("claimed") : t("unclaimed")}
            </dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 py-3">
            <dt className="font-bold text-zinc-500">{t("collectionInstructions")}</dt>
            <dd className="flex gap-2 text-zinc-800">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
              <span>
                {detail.collectionInstructions
                  ? locale === "th"
                    ? detail.collectionInstructions.th
                    : detail.collectionInstructions.en
                  : "—"}
              </span>
            </dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 py-3">
            <dt className="font-bold text-zinc-500">{t("deadline")}</dt>
            <dd className={deadlinePassed ? "font-bold text-rose-800" : "text-zinc-800"}>
              {detail.collectionDeadline
                ? formatter.format(new Date(detail.collectionDeadline))
                : "—"}
            </dd>
          </div>
        </dl>

        {deadlinePassed && detail.status !== "redeemed" && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-950" role="alert">
            <p className="font-black">{t("expired")}</p>
            <p className="mt-1">{t("expiredHint")}</p>
          </div>
        )}
      </div>
    </article>
  );
}
