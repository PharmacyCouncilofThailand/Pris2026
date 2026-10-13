"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { loadOwnBoothMembership, type BoothMembership } from "@/lib/booths";
export default function BoothMembershipNote({
  api,
  eventCode,
  eventId,
  variant = "profile",
}: {
  api: string;
  eventCode: string;
  eventId?: number;
  variant?: "profile" | "ticket";
}) {
  const { token, user, logout } = useAuth();
  const t = useTranslations("booth");
  const typeLabel = useTranslations("auth.boothTypes");
  const onTicket = variant === "ticket";
  const [attempt, setAttempt] = useState(0);
  const key = `${token}:${eventCode}:${attempt}`;
  const [result, setResult] = useState<{
    key: string;
    membership: BoothMembership | null;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    if (!token || !eventCode) return;
    const c = new AbortController();
    loadOwnBoothMembership(api, eventCode, token, c.signal)
      .then((membership) => {
        if (!c.signal.aborted) setResult({ key, membership, error: false });
      })
      .catch((error) => {
        if (c.signal.aborted) return;
        if (error instanceof Error && error.cause === 401) {
          logout();
          return;
        }
        setResult({ key, membership: null, error: true });
      });
    return () => c.abort();
  }, [api, eventCode, token, key, logout]);
  if (!token || !eventCode) return null;
  if (result?.key !== key)
    return (
      <p
        role="status"
        className={
          onTicket
            ? "mt-2 text-[clamp(10px,2.9cqw,12px)] leading-snug text-zinc-500"
            : "mt-2 text-sm text-slate-500"
        }
      >
        {t("loading")}
      </p>
    );
  if (result.error)
    return (
      <div
        className={
          onTicket
            ? "mt-2 text-[clamp(10px,2.9cqw,12px)] leading-snug text-zinc-500"
            : "mt-2 text-sm"
        }
        role="status"
      >
        {t("error")}{" "}
        <button
          type="button"
          className="underline underline-offset-2"
          onClick={() => setAttempt((x) => x + 1)}
        >
          {t("retry")}
        </button>
      </div>
    );
  const m = result.membership;
  if (
    !m ||
    m.userId !== user?.id ||
    (eventId !== undefined && eventId !== m.eventId)
  )
    return null;
  return (
    <div
      className={
        onTicket
          ? "mt-3 w-full rounded-lg bg-orange-50 px-3 py-1.5 text-[clamp(10px,2.9cqw,12px)] leading-snug text-zinc-950"
          : "mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
      }
    >
      {!onTicket && (
        <p className="min-w-0 break-words font-semibold">
          {m.booth.name} · {typeLabel(m.booth.type)}
        </p>
      )}
      <p
        className={
          onTicket
            ? m.mealCouponEligible === true
              ? "font-bold text-[#c2410c]"
              : "text-zinc-500"
            : m.mealCouponEligible === true
              ? "mt-1 font-bold text-amber-800"
              : "mt-1 text-slate-600"
        }
      >
        {t(
          m.mealCouponEligible === true
            ? "eligible"
            : m.mealCouponEligible === false
              ? "overQuota"
              : "pending",
        )}
      </p>
    </div>
  );
}
