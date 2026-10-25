"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { getPosterKiosk } from "@/lib/presentationApi";
import {
  ROSTER_REFRESH_MS,
  ROSTER_RETRY_MS,
  canRefreshRoster,
  initialKioskState,
  kioskReducer,
  secondsUntilReset,
} from "@/lib/posterKioskState";
import { POSTER_SEARCH_LIMIT, searchPosters } from "@/lib/posterKioskSearch";
import type { PosterKioskItem } from "@/types/presentations";
import { IdleCountdown } from "./IdleCountdown";
import { PosterResultCard } from "./PosterResultCard";
import { PosterViewer } from "./PosterViewer";
import { PosterWall } from "./PosterWall";
import styles from "./posterKiosk.module.css";

export function PosterKiosk() {
  const t = useTranslations("posterKiosk");
  const [state, dispatch] = useReducer(kioskReducer, initialKioskState);
  const [roster, setRoster] = useState<PosterKioskItem[] | null>(null);
  const [rosterVersion, setRosterVersion] = useState(0);
  const [rosterFailed, setRosterFailed] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(false);
  // Snapshot of the opened poster, so a roster refresh cannot pull it away mid-view.
  const [viewed, setViewed] = useState<PosterKioskItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const wasViewing = useRef(false);
  const stateRef = useRef(state);
  const rosterRef = useRef(roster);
  useEffect(() => {
    stateRef.current = state;
    rosterRef.current = roster;
  });

  const loadRoster = useCallback((signal: AbortSignal) => {
    getPosterKiosk(signal).then(
      (items) => {
        if (signal.aborted) return;
        setRoster(items);
        setRosterVersion((v) => v + 1);
        setRosterFailed(false);
      },
      () => {
        if (signal.aborted) return;
        // A failed refresh keeps the previous roster.
        if (rosterRef.current === null) setRosterFailed(true);
      },
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRoster(controller.signal);
    return () => controller.abort();
  }, [loadRoster, retryTick]);

  useEffect(() => {
    if (!rosterFailed || roster !== null) return;
    const id = setTimeout(() => setRetryTick((n) => n + 1), ROSTER_RETRY_MS);
    return () => clearTimeout(id);
  }, [rosterFailed, roster, retryTick]);

  useEffect(() => {
    const controller = new AbortController();
    const id = setInterval(() => {
      if (canRefreshRoster(stateRef.current)) loadRoster(controller.signal);
    }, ROSTER_REFRESH_MS);
    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, [loadRoster]);

  useEffect(() => {
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      dispatch({ type: "tick", now: current });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(
    () => (roster ? searchPosters(roster, state.query) : null),
    [roster, state.query],
  );
  const seconds = secondsUntilReset(state, now);
  const queryText = state.query.trim();
  const atTop = state.mode !== "idle" || focused;
  const loading = roster === null && !rosterFailed && queryText.length >= 2;
  const viewingItem =
    state.mode === "viewing" && viewed?.trackingId === state.viewingTrackingId ? viewed : null;

  const isViewing = viewingItem?.file != null;
  useEffect(() => {
    // Return focus to the root once the viewer is gone, never to the search input
    // (that would summon the on-screen keyboard).
    if (wasViewing.current && !isViewing) rootRef.current?.focus({ preventScroll: true });
    wasViewing.current = isViewing;
  }, [isViewing]);

  const announce = loading
    ? t("loadingRoster")
    : result?.status === "found"
      ? t("resultCount", { count: result.total, query: queryText })
      : result?.status === "none"
        ? t("notListed")
        : "";

  const markActivity = () => dispatch({ type: "activity", now: Date.now() });

  return (
    <main
      ref={rootRef}
      tabIndex={-1}
      className={`${styles.root} ${atTop ? styles.atTop : ""}`}
      onPointerDown={markActivity}
      onKeyDown={markActivity}
    >
      <div className={styles.beams} aria-hidden="true" />
      <div className={styles.stage}>
      {state.mode === "idle" && roster ? <PosterWall key={rosterVersion} items={roster} /> : null}
      <div className={styles.fade} aria-hidden="true" />
      <Image
        src="/assets/Img/logo/Logo-Final .png"
        alt=""
        width={760}
        height={300}
        className={styles.logo}
        priority
      />
      <div className={styles.head}>
        <h1 className={styles.title}>
          <span className={styles.titleLine1}>{t("headingLine1")}</span>
          <span className={styles.titleLine2}>{t("headingLine2")}</span>
        </h1>
        <p>{t("intro")}</p>
      </div>

      <form
        className={styles.search}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <label htmlFor="poster-search" className={styles.srOnly}>
          {t("searchLabel")}
        </label>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="poster-search"
          ref={inputRef}
          type="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className={styles.input}
          value={state.query}
          placeholder={t("searchPlaceholder")}
          onChange={(e) => dispatch({ type: "query", query: e.target.value, now: Date.now() })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button type="submit" className={styles.searchButton}>
          {t("searchButton")}
        </button>
      </form>

      <p className={styles.opts}>{t("searchHint")}</p>

      {rosterFailed && roster === null ? (
        <div className={styles.rosterError} role="alert">
          <p>{t("rosterError")}</p>
          <button type="button" className={styles.retry} onClick={() => setRetryTick((n) => n + 1)}>
            {t("retry")}
          </button>
        </div>
      ) : null}

      <section className={styles.results}>
        <p className={styles.resultsNote} aria-live="polite">
          {announce}
        </p>
        {result?.status === "found" ? (
          <div className={styles.list}>
            {result.items.map((item) => (
              <PosterResultCard
                key={item.trackingId}
                item={item}
                onView={() => {
                  setViewed(item);
                  dispatch({ type: "view", trackingId: item.trackingId, now: Date.now() });
                }}
              />
            ))}
            {result.total > POSTER_SEARCH_LIMIT ? (
              <p className={styles.capped}>{t("resultCapped", { total: result.total })}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      {viewingItem?.file ? (
        <PosterViewer
          item={{ ...viewingItem, file: viewingItem.file }}
          countdownSeconds={seconds}
          onClose={() => dispatch({ type: "close" })}
        />
      ) : null}

      {seconds !== null && !isViewing ? <IdleCountdown seconds={seconds} /> : null}
      </div>
    </main>
  );
}
