"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Maximize2, UserRound, Download, Scissors } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { loadEntryTickets, type EntryTicket } from "@/lib/entryTicket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;

export default function TicketPage() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ticket");
  const dialog = useRef<HTMLDialogElement>(null);
  const downloadCanvas = useRef<HTMLCanvasElement>(null);
  const [downloadError, setDownloadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestKey = (token || "") + ":" + attempt;
  const [result, setResult] = useState<{ key: string; tickets?: EntryTicket[]; error?: boolean } | null>(null);
  const [profile, setProfile] = useState<{ token: string; name: string } | null>(null);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login?redirect=%2Fticket");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !token || !EVENT_CODE) return;
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => controller.abort(), 15_000);
    const expire = () => {
      logout();
      router.replace("/login?redirect=%2Fticket");
    };
    loadEntryTickets(API_URL, token, EVENT_CODE, controller.signal)
      .then((tickets) => {
        if (!cancelled) setResult({ key: requestKey, tickets });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof Error && error.cause === 401) expire();
        else setResult({ key: requestKey, error: true });
      });
    fetch(API_URL.replace(/\/$/, "") + "/api/users/profile", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store", signal: controller.signal,
    }).then(async (response) => {
      if (cancelled) return;
      if (response.status === 401) { expire(); return; }
      if (!response.ok) return;
      const body = await response.json();
      if (cancelled || !body.success || body.user?.id !== user?.id) return;
      const name = [body.user.firstName, body.user.lastName]
        .filter((part: unknown) => typeof part === "string" && part.trim()).join(" ");
      if (name) setProfile({ token, name });
    }).catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isAuthenticated, token, user?.id, requestKey, logout, router]);

  if (!isAuthenticated) return null;
  const current = result?.key === requestKey ? result : null;
  const tickets = current?.tickets || [];
  const ticket = tickets.find((row) => String(row.registrationId) === selectedId) || tickets[0];
  const name = (profile?.token === token ? profile.name : "")
    || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || t("attendee");
  const date = (value: string | null, endValue: string | null = null) => {
    if (!value) return t("notAvailable");
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return t("notAvailable");
    const formatter = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
      dateStyle: "medium", timeZone: "Asia/Bangkok",
    });
    const end = endValue ? new Date(endValue) : null;
    return end && end.getTime() >= parsed.getTime()
      ? formatter.formatRange(parsed, end) : formatter.format(parsed);
  };
  const action = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0d1f4a] px-4 py-2 text-sm hover:bg-[#162e5c] transition-colors font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600";
  const links = (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      <Link href="/profile" className="inline-flex min-h-11 items-center justify-center gap-2 px-1 py-2 text-sm font-bold text-slate-900 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4"><UserRound aria-hidden="true" size={18} />{t("profile")}</Link>
      <Link href="/registration" className="inline-flex min-h-11 items-center justify-center text-center text-xs font-bold text-[#0d1f4a] underline underline-offset-4">{t("registration")}</Link>
    </div>
  );

  return (
    <main className="min-h-[100svh] bg-[#f4f6f8] px-4 pb-8 pt-20 text-slate-900 sm:px-6">

      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight leading-tight">{t("title")}</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">PRIS 2026 Digital Attendance E-Stub</p>
        </div>
        {!EVENT_CODE ? (
          <p role="alert">{t("configuration")}</p>
        ) : !current ? (
          <p role="status" aria-live="polite" className="py-12 text-center">{t("loading")}</p>
        ) : current.error ? (
          <div className="space-y-5 rounded-3xl bg-white p-6 text-center">
            <p role="alert">{t("loadError")}</p>
            <button className={action} onClick={() => setAttempt((value) => value + 1)}>{t("retry")}</button>
          </div>
        ) : !ticket ? (
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-center">
            <h2 className="text-lg font-bold">{t("empty")}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{t("emptyHint")}</p>
            {links}
          </div>
        ) : (
          <>
            {tickets.length > 1 && (
              <label className="mb-2 block text-xs font-semibold">
                {t("select")}
                <select value={String(ticket.registrationId)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                  onChange={(event) => { dialog.current?.close(); setSelectedId(event.target.value); }}>
                  {tickets.map((row) => <option key={row.registrationId} value={row.registrationId}>{row.ticketName + " — " + row.regCode}</option>)}
                </select>
              </label>
            )}
            <article id="entry-ticket" className="@container flex aspect-[9/16] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50">
              <section aria-label={t("details")} tabIndex={0} className="max-h-[62%] shrink-0 overflow-y-auto bg-white p-4 text-[clamp(12px,3.5cqw,14px)] focus-visible:outline-2 focus-visible:outline-inset sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words text-[clamp(16px,4.8cqw,20px)] font-bold tracking-tight leading-tight">{ticket.eventName || EVENT_CODE}</h2>
                  <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[clamp(10px,2.9cqw,12px)] font-bold text-emerald-700"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />{t("confirmedShort")}</p>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-slate-200/70 pt-4">
                  <div className="col-span-2 min-w-0"><dt className="text-[clamp(10px,2.9cqw,12px)] font-semibold text-slate-500">HALL / ROOM · {t("venue")}</dt><dd className="mt-1 break-words font-bold leading-snug">{ticket.eventLocation || t("notAvailable")}</dd></div>
                  <div className="min-w-0"><dt className="text-[clamp(10px,2.9cqw,12px)] font-semibold text-slate-500">DATE · {t("date")}</dt><dd className="mt-1 font-bold leading-snug">{date(ticket.eventStartDate, ticket.eventEndDate)}</dd></div>
                  <div className="min-w-0"><dt className="text-[clamp(10px,2.9cqw,12px)] font-semibold text-slate-500">ATTENDEE · {t("attendee")}</dt><dd className="mt-1 break-words font-bold leading-snug">{name}</dd></div>
                  <div className="min-w-0"><dt className="text-[clamp(10px,2.9cqw,12px)] font-semibold text-slate-500">TIER · {t("type")}</dt><dd className="mt-1 inline-block max-w-full break-words rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{ticket.ticketName}</dd></div>
                  <div className="min-w-0"><dt className="text-[clamp(10px,2.9cqw,12px)] font-semibold text-slate-500">TICKET NO / REG ID</dt><dd className="mt-1 break-all font-mono font-bold leading-snug">{ticket.regCode}</dd></div>
                </dl>
              </section>
              <div aria-hidden="true" className="relative mt-3 shrink-0 border-t-2 border-dashed border-slate-300 before:absolute before:-left-3 before:-top-3 before:h-6 before:w-6 before:rounded-full before:bg-[#f4f6f8] after:absolute after:-right-3 after:-top-3 after:h-6 after:w-6 after:rounded-full after:bg-[#f4f6f8]">
                <div className="absolute inset-x-5 -top-4 flex items-center justify-between text-[8px] font-medium tracking-wider text-slate-500"><span>STUB COUPON · ENTRY SCAN</span><span className="inline-flex items-center gap-1">TEAR HERE <Scissors size={9} /></span></div>
              </div>
              <section aria-label={t("scan")} className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] justify-items-center gap-3 p-4">
                <div className="grid h-full w-full min-w-0 place-items-center [container-type:size]">
                  <div className="aspect-square w-[min(100cqw,100cqh)] rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <QRCodeSVG value={ticket.regCode} size={230} level="M" marginSize={4} bgColor="#ffffff" fgColor="#0f172a" className="h-full w-full" role="img" aria-label={t("qrAlt", { code: ticket.regCode })} />
                  </div>
                </div>
                <p className="text-center text-[clamp(10px,2.9cqw,12px)] font-medium leading-snug text-slate-500">{t("scan")}</p>
              </section>
            </article>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4" onClick={() => dialog.current?.showModal()}><Maximize2 size={17} aria-hidden="true" />{t("enlarge")}</button>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/15 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4" onClick={() => {
                try {
                  const canvas = downloadCanvas.current;
                  if (!canvas) throw new Error("QR is not ready");
                  const link = document.createElement("a");
                  link.download = "PRIS2026-QR.png";
                  link.href = canvas.toDataURL("image/png");
                  document.body.append(link);
                  link.click();
                  link.remove();
                  setDownloadError(false);
                } catch {
                  setDownloadError(true);
                }
              }}><Download size={17} className="shrink-0 text-white" aria-hidden="true" />{t("downloadQr")}</button>
            </div>
            <div className="hidden" aria-hidden="true"><QRCodeCanvas ref={downloadCanvas} value={ticket.regCode} size={1024} level="M" marginSize={4} bgColor="#ffffff" fgColor="#0f172a" /></div>
            {downloadError && <p role="alert" className="mt-2 text-sm text-red-700">{t("downloadError")}</p>}
            <div className="mt-2">{links}</div>
            {ticket.details.length > 0 && (
              <details className="mt-2 rounded-lg border border-slate-200 bg-white px-3">
                <summary className="min-h-11 cursor-pointer py-3 text-xs font-semibold">{t("details")}</summary>
                <ul className="mb-3 list-disc space-y-2 pl-5 text-xs leading-relaxed">
                  {ticket.details.map((label) => <li key={label}>{label}</li>)}
                </ul>
              </details>
            )}
            <dialog ref={dialog} aria-labelledby="ticket-qr-heading" className="m-auto w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-5 text-slate-900 backdrop:bg-black/60">
              <h2 id="ticket-qr-heading" className="mb-4 text-lg font-bold">{t("enlarge")}</h2>
              <QRCodeSVG value={ticket.regCode} size={360} level="M" marginSize={4} bgColor="#ffffff" fgColor="#0f172a"
                className="h-auto w-full" role="img" aria-label={t("qrAlt", { code: ticket.regCode })} />
              <p className="my-4 break-all text-center font-mono font-bold">{ticket.regCode}</p>
              <form method="dialog"><button autoFocus className={action + " w-full"}>{t("close")}</button></form>
            </dialog>
          </>
        )}
      </div>
    </main>
  );
}
