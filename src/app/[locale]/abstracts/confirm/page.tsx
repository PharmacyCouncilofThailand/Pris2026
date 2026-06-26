"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { REGISTRATION_OPEN, REGISTRATION_NOTICE } from "@/lib/registrationGate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

type LookupState =
  | "loading"
  | "valid"
  | "already_confirmed"
  | "expired"
  | "invalid"
  | "error";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface AbstractSummary {
  id: number;
  trackingId: string | null;
  title: string;
  presentationType: "poster" | "oral";
  confirmedAt: string | null;
  deadline: string;
  presenterFirstName?: string | null;
}

function ConfirmAbstractContent() {
  const t = useTranslations("abstractsConfirm");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [state, setState] = useState<LookupState>("loading");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [abstract, setAbstract] = useState<AbstractSummary | null>(null);

  // Initial token validation (read-only)
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setState("invalid");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/abstracts/confirm?token=${encodeURIComponent(token)}`,
          { method: "GET", headers: { Accept: "application/json" } },
        );
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState("error");
          return;
        }
        const s = (data?.state as LookupState) ?? "error";
        setState(s === "loading" ? "error" : s);
        if (data?.abstract) setAbstract(data.abstract as AbstractSummary);
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleConfirm = async () => {
    if (!token || submitState === "submitting") return;
    setSubmitState("submitting");
    try {
      const res = await fetch(`${API_URL}/api/abstracts/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitState("error");
        toast.error(t("toastError"));
        return;
      }

      const next = data?.state as LookupState | "success";
      if (next === "success") {
        setSubmitState("success");
        setState("already_confirmed");
        if (data?.abstract) setAbstract(data.abstract as AbstractSummary);
        toast.success(t("toastSuccess"));
      } else if (next === "already_confirmed") {
        setSubmitState("success");
        setState("already_confirmed");
        if (data?.abstract) setAbstract(data.abstract as AbstractSummary);
      } else if (next === "expired") {
        setState("expired");
        setSubmitState("idle");
      } else {
        setState("invalid");
        setSubmitState("idle");
      }
    } catch {
      setSubmitState("error");
      toast.error(t("toastError"));
    }
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString(locale === "th" ? "th-TH" : "en-US", {
        dateStyle: "long",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  const presentationLabel = (type: "poster" | "oral") =>
    type === "poster" ? t("typePoster") : t("typeOral");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-24 pb-12 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        {state === "loading" && (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-slate-400" />
            <p className="text-slate-600">{t("loading")}</p>
          </div>
        )}

        {state === "valid" && abstract && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl font-bold text-slate-900">{t("validTitle")}</h1>
            </div>
            <p className="mb-6 text-slate-600">
              {abstract.presenterFirstName
                ? t("validGreetingNamed", { name: abstract.presenterFirstName })
                : t("validGreeting")}
            </p>

            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <dl className="space-y-2">
                <div>
                  <dt className="text-slate-500">{t("fieldTitle")}</dt>
                  <dd className="font-medium text-slate-900">{abstract.title}</dd>
                </div>
                {abstract.trackingId && (
                  <div>
                    <dt className="text-slate-500">{t("fieldCode")}</dt>
                    <dd className="font-mono text-slate-900">{abstract.trackingId}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-500">{t("fieldType")}</dt>
                  <dd className="text-slate-900">
                    {presentationLabel(abstract.presentationType)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("fieldDeadline")}</dt>
                  <dd className="text-slate-900">{formatDateTime(abstract.deadline)}</dd>
                </div>
              </dl>
            </div>

            <p className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              {t("validHint")}
            </p>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitState === "submitting"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitState === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("confirmCta")
              )}
            </button>
          </div>
        )}

        {state === "already_confirmed" && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              {submitState === "success" ? t("successTitle") : t("alreadyConfirmedTitle")}
            </h1>
            <p className="mb-6 text-slate-600">
              {submitState === "success" ? t("successBody") : t("alreadyConfirmedBody")}
            </p>
            {abstract && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-left text-sm">
                <p className="font-medium text-emerald-900">{abstract.title}</p>
                {abstract.trackingId && (
                  <p className="font-mono text-emerald-800">{abstract.trackingId}</p>
                )}
                {abstract.confirmedAt && (
                  <p className="mt-2 text-emerald-700">
                    {t("confirmedAtLabel")}: {formatDateTime(abstract.confirmedAt)}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/profile"
                className="inline-block rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("ctaProfile")}
              </Link>
              {REGISTRATION_OPEN ? (
                <Link
                  href="/registration"
                  className="inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  {t("ctaRegister")}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  title={REGISTRATION_NOTICE}
                  className="inline-block rounded-lg bg-slate-900/60 px-5 py-2 text-sm font-medium text-white cursor-not-allowed select-none"
                >
                  {REGISTRATION_NOTICE}
                </span>
              )}
            </div>
          </div>
        )}

        {state === "expired" && (
          <div className="text-center">
            <Clock className="mx-auto mb-4 h-14 w-14 text-amber-500" />
            <h1 className="mb-2 text-2xl font-bold text-slate-900">{t("expiredTitle")}</h1>
            <p className="mb-6 text-slate-600">{t("expiredBody")}</p>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "pr@pharmacycouncil.org"}`}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Mail className="h-4 w-4" />
              {t("contactSupport")}
            </a>
          </div>
        )}

        {state === "invalid" && (
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-slate-900">{t("invalidTitle")}</h1>
            <p className="mb-6 text-slate-600">{t("invalidBody")}</p>
            <Link
              href="/profile"
              className="inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {t("ctaProfile")}
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
            <h1 className="mb-2 text-2xl font-bold text-slate-900">{t("errorTitle")}</h1>
            <p className="mb-6 text-slate-600">{t("errorBody")}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {t("retry")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ConfirmAbstractPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <ConfirmAbstractContent />
    </Suspense>
  );
}
