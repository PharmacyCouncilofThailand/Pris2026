"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  requestInvitation,
  type InvitationDecision,
  type InvitationErrorDto,
  type PublicInvitationDto,
} from "@/lib/sessionInvitation";

type ErrorKey =
  "invalid" | "networkError" | "serverError" | "rateLimited" | "unavailable";

const tokenPattern = /^[a-f0-9]{64}$/;

function isInvitation(
  body: PublicInvitationDto | InvitationErrorDto,
): body is PublicInvitationDto {
  return "invitationId" in body && "status" in body && "session" in body;
}

function bangkokDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SessionInvitationResponse() {
  const t = useTranslations("sessionInvitations");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  const [invitation, setInvitation] = useState<PublicInvitationDto | null>(
    null,
  );
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const applyResponse = useCallback(
    (httpStatus: number, body: PublicInvitationDto | InvitationErrorDto) => {
      if (isInvitation(body)) {
        setInvitation(body);
        setErrorKey(null);
        return true;
      }
      if (body.invitation) {
        setInvitation(body.invitation);
        setErrorKey(null);
        return true;
      }
      if (httpStatus === 429) setErrorKey("rateLimited");
      else if (httpStatus >= 500) setErrorKey("serverError");
      else if (body.code === "INVALID_INVITATION_TOKEN") setErrorKey("invalid");
      else setErrorKey("unavailable");
      return false;
    },
    [],
  );

  const lookup = useCallback(
    async (signal?: AbortSignal) => {
      if (!tokenPattern.test(token) || !apiOrigin) {
        setInvitation(null);
        setErrorKey("invalid");
        return false;
      }
      try {
        const result = await requestInvitation(apiOrigin, token, null, signal);
        return applyResponse(result.httpStatus, result.body);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          throw error;
        setErrorKey("networkError");
        return false;
      }
    },
    [apiOrigin, applyResponse, token],
  );

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      await Promise.resolve();
      setLoading(true);
      try {
        await lookup(controller.signal);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setErrorKey("networkError");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [lookup]);

  const submitDecision = async (decision: InvitationDecision) => {
    if (!tokenPattern.test(token) || !apiOrigin || submitting) return;
    setSubmitting(true);
    setErrorKey(null);
    try {
      const result = await requestInvitation(apiOrigin, token, decision);
      if (result.httpStatus === 409) {
        await lookup();
        return;
      }
      if (result.httpStatus >= 500) {
        const discovered = await lookup();
        if (!discovered) setErrorKey("serverError");
        return;
      }
      applyResponse(result.httpStatus, result.body);
    } catch {
      const discovered = await lookup();
      if (!discovered) setErrorKey("networkError");
    } finally {
      setSubmitting(false);
    }
  };

  const retryLookup = async () => {
    setLoading(true);
    setErrorKey(null);
    try {
      await lookup();
    } finally {
      setLoading(false);
    }
  };

  const statusText = invitation
    ? {
        pending: t("pending"),
        accepted: t("accepted"),
        declined: t("declined"),
        expired: t("expired"),
        revoked: t("unavailable"),
      }[invitation.status]
    : null;

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="session-invitation-title"
    >
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          PRIS 2026
        </p>
        <h1
          id="session-invitation-title"
          className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl"
        >
          {t("title")}
        </h1>
        {invitation?.recipientFirstName && (
          <p className="mt-2 text-slate-600">
            {t("greeting", { name: invitation.recipientFirstName })}
          </p>
        )}
      </div>

      {loading ? (
        <div
          className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-slate-600"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin" /> {t("loading")}
        </div>
      ) : errorKey && !invitation ? (
        <div className="space-y-4">
          <p className="rounded-2xl bg-red-50 p-4 text-red-700" role="alert">
            {t(errorKey)}
          </p>
          {(errorKey === "networkError" ||
            errorKey === "serverError" ||
            errorKey === "rateLimited") && (
            <button
              type="button"
              onClick={() => void retryLookup()}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t("retry")}
            </button>
          )}
        </div>
      ) : invitation ? (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("session")}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950">
                  {invitation.session.sessionName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("dateTime")}
                </dt>
                <dd className="mt-1 text-slate-800">
                  {bangkokDateTime(invitation.session.startTime, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("room")}
                </dt>
                <dd className="mt-1 text-slate-800">
                  {invitation.session.room || t("roomNotSpecified")}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm font-medium text-amber-700">
              {t("deadline", {
                dateTime: bangkokDateTime(invitation.effectiveDeadline, locale),
              })}{" "}
              · {t("timeZone")}
            </p>
          </div>

          <div
            className="rounded-2xl border border-slate-200 p-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {invitation.status === "accepted" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              ) : invitation.status === "declined" ? (
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              ) : null}
              <div>
                <p className="font-semibold text-slate-900">{statusText}</p>
                {invitation.respondedAt && (
                  <p className="mt-1 text-sm text-slate-500">
                    {t("recordedAt", {
                      dateTime: bangkokDateTime(invitation.respondedAt, locale),
                    })}
                  </p>
                )}
                {invitation.status !== "pending" && (
                  <p className="mt-2 text-sm text-slate-600">
                    {t("finalNotice")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {errorKey && (
            <p className="rounded-2xl bg-red-50 p-4 text-red-700" role="alert">
              {t(errorKey)}
            </p>
          )}

          {invitation.status === "pending" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitDecision("accepted")}
                className="rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("submitting") : t("accept")}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitDecision("declined")}
                className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("submitting") : t("decline")}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-8 border-t border-slate-100 pt-5">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          {t("home")}
        </Link>
      </div>
    </section>
  );
}
