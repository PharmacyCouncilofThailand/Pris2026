"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { loadBooths, type BoothOption } from "@/lib/booths";
import SignupDropdown from "./SignupDropdown";
export default function BoothSelector({
  api,
  eventCode,
  onReady,
}: {
  api: string;
  eventCode: string;
  onReady: (ready: boolean) => void;
}) {
  const t = useTranslations("auth");
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState({ key: "", value: "" });
  const key = `${api}:${eventCode}:${attempt}`;
  const [result, setResult] = useState<{
    key: string;
    rows: BoothOption[];
    error: boolean;
  } | null>(null);
  const current = result?.key === key ? result : null;
  const rows = current?.rows ?? [];
  const state = current ? (current.error ? "error" : "ready") : "loading";
  const selected =
    selection.key === key &&
    rows.some((row) => String(row.id) === selection.value)
      ? selection.value
      : "";
  useEffect(() => {
    const c = new AbortController();
    onReady(false);
    loadBooths(api, eventCode, c.signal)
      .then((data) => {
        if (!c.signal.aborted) {
          setResult({ key, rows: data, error: false });
          onReady(data.length > 0);
        }
      })
      .catch(() => {
        if (!c.signal.aborted) setResult({ key, rows: [], error: true });
      });
    return () => c.abort();
  }, [api, eventCode, onReady, key]);
  return (
    <div>
      <SignupDropdown
        key={key}
        id="boothId"
        label={t("boothName")}
        placeholder={t("selectBooth")}
        value={selected}
        onChange={(value) => setSelection({ key, value })}
        disabled={state !== "ready" || !rows.length}
        describedBy="booth-coupon-note"
        options={rows.map((row) => ({
          value: String(row.id),
          label: row.name,
        }))}
      />
      <aside
        id="booth-coupon-note"
        className="mt-3 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3"
        aria-labelledby="booth-coupon-title"
      >
        <Info
          size={16}
          className="mt-0.5 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3
            id="booth-coupon-title"
            className="text-xs font-semibold leading-5 text-blue-900"
          >
            {t("boothCouponTitle")}
          </h3>
          <dl className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5">
            {(
              [
                ["symposium", 8],
                ["premium", 4],
                ["standard", 2],
              ] as const
            ).map(([type, count], index) => (
              <div
                key={type}
                className="inline-flex items-baseline gap-1.5 whitespace-nowrap"
              >
                <dt className="text-blue-800">{t(`boothTypes.${type}`)}</dt>
                <dd className="font-semibold tabular-nums text-blue-950">
                  {t("boothCouponCount", { count })}
                  {index < 2 && (
                    <span
                      aria-hidden="true"
                      className="ml-3 font-normal text-blue-400"
                    >
                      |
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
      <input type="hidden" name="boothId" value={selected} />
      <div
        className="mt-2 text-sm text-gray-500"
        role="status"
        aria-live="polite"
      >
        {state === "loading"
          ? t("boothsLoading")
          : state === "error"
            ? t("boothsLoadFailed")
            : !rows.length
              ? t("boothsEmpty")
              : null}
      </div>
      {state === "error" && (
        <button
          type="button"
          onClick={() => setAttempt((x) => x + 1)}
          className="mt-2 text-sm underline"
        >
          {t("boothsRetry")}
        </button>
      )}
    </div>
  );
}
