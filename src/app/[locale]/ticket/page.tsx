"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Maximize2, Download, Scissors } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./ticket.module.css";
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
  const ticketElement = useRef<HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
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
  const title = (
    <div className="mb-2 text-center min-[375px]:mb-3">
      <h1 className="text-[clamp(20px,5.7cqw,24px)] font-black tracking-tight leading-tight">{t("title")}</h1>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">PRIS 2026 Digital Attendance E-Stub</p>
    </div>
  );

  return (
    <main className="min-h-[100svh] bg-[#fafafa] px-4 pb-8 pt-20 text-zinc-950 sm:px-6">

      <div className="mx-auto w-full max-w-[420px]">
        {!ticket && title}
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
            <Link href="/registration" className={action}>{t("buyTicket")}</Link>
          </div>
        ) : (
          <>
            {tickets.length > 1 && (
              <label className="mb-2 block text-xs font-semibold">
                {t("select")}
                <select value={String(ticket.registrationId)} className="mt-1 min-h-11 w-full rounded-2xl border-2 border-zinc-950 bg-white px-3"
                  onChange={(event) => { dialog.current?.close(); setSelectedId(event.target.value); }}>
                  {tickets.map((row) => <option key={row.registrationId} value={row.registrationId}>{row.ticketName + " — " + row.regCode}</option>)}
                </select>
              </label>
            )}
            <article ref={ticketElement} id="entry-ticket" className={styles.ticket + " @container flex aspect-[9/16] w-full flex-col"}>
              <section aria-label={t("details")} tabIndex={0} className="max-h-[62%] shrink-0 overflow-y-auto bg-white px-3 pb-2 pt-5 min-[375px]:px-5 min-[375px]:pb-4 min-[375px]:pt-7 text-[clamp(12px,3.5cqw,14px)] focus-visible:outline-2 focus-visible:outline-inset">
                {title}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words text-[clamp(16px,4.8cqw,20px)] font-black tracking-tight leading-tight">{ticket.eventName || EVENT_CODE}</h2>
                  <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-950 bg-zinc-950 px-2 py-1.5 text-[clamp(10px,2.9cqw,12px)] font-bold text-white"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />{t("confirmedShort")}</p>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 border-t-2 border-zinc-950 pt-2 min-[375px]:mt-4 min-[375px]:gap-y-4 min-[375px]:pt-4">
                  <div className="col-span-2 min-w-0 rounded-xl border-l-[5px] border-[#ea580c] bg-zinc-50 p-2 min-[375px]:p-3"><dt className="text-[clamp(10px,2.9cqw,12px)] font-bold text-zinc-500">HALL / ROOM · {t("venue")}</dt><dd className="mt-1 break-words font-extrabold leading-snug">{ticket.eventLocation || t("notAvailable")}</dd></div>
                  <div className="min-w-0 border-l-2 border-zinc-200 pl-1.5"><dt className="text-[clamp(10px,2.9cqw,12px)] font-bold text-zinc-500">DATE · {t("date")}</dt><dd className="mt-1 font-bold leading-snug">{date(ticket.eventStartDate, ticket.eventEndDate)}</dd></div>
                  <div className="min-w-0 border-l-2 border-zinc-200 pl-1.5"><dt className="text-[clamp(10px,2.9cqw,12px)] font-bold text-zinc-500">ATTENDEE · {t("attendee")}</dt><dd className="mt-1 break-words font-extrabold leading-snug">{name}</dd></div>
                  <div className="min-w-0 border-l-2 border-zinc-200 pl-1.5"><dt className="text-[clamp(10px,2.9cqw,12px)] font-bold text-zinc-500">TIER · {t("type")}</dt><dd className="mt-1 inline-block max-w-full break-words rounded-sm bg-[#ea580c] px-2 py-1 text-xs font-extrabold uppercase text-white">{ticket.ticketName}</dd></div>
                  <div className="min-w-0 border-l-2 border-zinc-200 pl-1.5"><dt className="text-[clamp(10px,2.9cqw,12px)] font-bold text-zinc-500">TICKET NO / REG ID</dt><dd className="mt-1 break-all font-mono font-bold leading-snug">{ticket.regCode}</dd></div>
                </dl>
              </section>
              <div aria-hidden="true" className={styles.perforation + " relative shrink-0"}>
                <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 flex items-center justify-between text-[7px] font-bold font-mono tracking-wide text-[#c2410c]"><span className="border border-[#ea580c] bg-white px-1 py-0.5">STUB COUPON · ENTRY SCAN</span><span className="inline-flex items-center gap-1 border border-zinc-950 bg-white px-1 py-0.5 text-zinc-950">TEAR HERE <Scissors size={9} /></span></div>
              </div>
              <section aria-label={t("scan")} className={styles.scanSection}>
                <div className={styles.qrSlot}>
                  <div className={styles.qr + " bg-white p-2"}>
                    <QRCodeSVG value={ticket.regCode} size={230} level="M" marginSize={4} bgColor="#ffffff" fgColor="#09090b" className="h-full w-full" role="img" aria-label={t("qrAlt", { code: ticket.regCode })} />
                  </div>
                </div>
                <div className={styles.scanHint + " flex flex-col items-center gap-1.5 text-center"}>
                  <p className="max-w-full rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[clamp(10px,2.9cqw,12px)] font-bold leading-snug text-zinc-700">{t("scan")}</p>
                  <p className="text-[clamp(10px,2.9cqw,12px)] leading-relaxed text-zinc-600">{t("sessionNote")}</p>
                </div>
              </section>
            </article>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-zinc-950 bg-white px-3 py-3 text-xs font-bold text-zinc-950 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4" onClick={() => dialog.current?.showModal()}><Maximize2 size={17} aria-hidden="true" />{t("enlarge")}</button>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#ea580c] px-3 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/25 hover:bg-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-4" disabled={downloading} aria-busy={downloading} onClick={async () => {
                if (downloading) return;
                setDownloading(true);
                let clone: HTMLElement | null = null;
                try {
                  const node = ticketElement.current;
                  if (!node) throw new Error("Ticket is not ready");
                  await document.fonts.ready;
                  const { toPng, getFontEmbedCSS } = await import("html-to-image");
                  const info = node.querySelector("section");
                  const exportHeight = node.getBoundingClientRect().height + (info ? Math.max(0, info.scrollHeight - info.clientHeight) : 0);
                  clone = node.cloneNode(true) as HTMLElement;
                  clone.removeAttribute("id");
                  Object.assign(clone.style, {
                    position: "fixed", left: "0", top: "0", transform: "translateX(-10000px)",
                    width: exportHeight * 9 / 16 + "px",
                    height: exportHeight + "px",
                    filter: "none",
                  });
                  const cloneInfo = clone.querySelector<HTMLElement>("section");
                  if (cloneInfo) cloneInfo.style.maxHeight = "none";
                  node.parentElement?.append(clone);
                  const png = await toPng(clone, {
                    pixelRatio: 3,
                    fontEmbedCSS: await getFontEmbedCSS(clone),
                    style: { position: "relative", left: "0", top: "0", transform: "none" },
                  });
                  const link = document.createElement("a");
                  link.download = "PRIS2026-Ticket.png";
                  link.href = png;
                  document.body.append(link);
                  link.click();
                  link.remove();
                  setDownloadError(false);
                } catch {
                  setDownloadError(true);
                } finally {
                  clone?.remove();
                  setDownloading(false);
                }
              }}><Download size={17} className="shrink-0 text-white" aria-hidden="true" />{t(downloading ? "downloading" : "downloadTicket")}</button>
            </div>
            {downloadError && <p role="alert" className="mt-2 text-sm text-red-700">{t("downloadError")}</p>}

            {ticket.details.length > 0 && (
              <details className="mt-2 rounded-lg border border-slate-200 bg-white px-3">
                <summary className="min-h-11 cursor-pointer py-3 text-xs font-semibold">{t("details")}</summary>
                <ul className="mb-3 list-disc space-y-2 pl-5 text-xs leading-relaxed">
                  {ticket.details.map((label) => <li key={label}>{label}</li>)}
                </ul>
              </details>
            )}
            <dialog ref={dialog} aria-labelledby="ticket-qr-heading" className="m-auto w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-5 text-zinc-950 backdrop:bg-black/60">
              <h2 id="ticket-qr-heading" className="mb-4 text-lg font-bold">{t("enlarge")}</h2>
              <QRCodeSVG value={ticket.regCode} size={360} level="M" marginSize={4} bgColor="#ffffff" fgColor="#09090b"
                className="h-auto w-full" role="img" aria-label={t("qrAlt", { code: ticket.regCode })} />
              <p className="my-4 break-all text-center font-mono font-bold">{ticket.regCode}</p>
              <form method="dialog"><button autoFocus className="min-h-11 w-full rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#c2410c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">{t("close")}</button></form>
            </dialog>
          </>
        )}
      </div>
    </main>
  );
}
