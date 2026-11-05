"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, ExternalLink, Eye, Search, Trophy } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getAwardResults } from "@/lib/presentationApi";
import {
  awardGroups,
  awardLevels,
  filterAwards,
  type AwardFilters,
} from "@/lib/awards";
import type { AwardItem, AwardLevel } from "@/types/awards";
import { AwardThumbnail } from "./AwardThumbnail";
import "./awards.css";

const groupLabels = {
  oral: ["generalOral", "shortOral"],
  "highlighted-poster": ["highlight", "shortHighlight"],
  "student-oral": ["student", "shortStudent"],
} as const;
const levelLabels = {
  excellent: "excellent",
  outstanding: "outstanding",
  "very-good": "veryGood",
} as const;
const initialFilters: AwardFilters = {
  group: "oral",
  category: "all",
  level: "all",
  query: "",
};

function AwardWork({ item }: { item: AwardItem }) {
  const t = useTranslations("awards");
  const [expanded, setExpanded] = useState(false);
  const key = `${item.trackingId}:${item.file?.url}:${item.file?.version}`;
  const previewId = `award-preview-${item.trackingId}`;
  return (
    <article className="aw-work">
      <div className="aw-work-copy">
        <span className="aw-code">{item.trackingId}</span>
        <h4>{item.title}</h4>
        <p className="aw-author">{item.submitterName}</p>
        <div className="aw-actions">
          {item.file ? (
            <a
              href={item.file.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("newTab")}: ${item.trackingId}`}
            >
              {t("open")}
              <ExternalLink aria-hidden="true" />
            </a>
          ) : (
            <span>{t("fileUnavailable")}</span>
          )}
          {item.file && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={previewId}
              onClick={() => setExpanded((v) => !v)}
            >
              {t(expanded ? "closePreview" : "preview")}
              <Eye aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className="aw-thumb-button"
        disabled={!item.file}
        aria-expanded={expanded}
        aria-controls={previewId}
        aria-label={`${t("preview")}: ${item.trackingId}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <AwardThumbnail
          key={key}
          file={item.file}
          title={`${item.title} — ${t("firstPage")}`}
        />
      </button>
      <div id={previewId} className="aw-expanded" hidden={!expanded}>
        {expanded && (
          <>
            <AwardThumbnail
              key={`${key}:expanded`}
              file={item.file}
              title={item.title}
              expanded
            />
            <p>
              {t("firstPage")} ·{" "}
              {item.file?.mimeType === "application/pdf" ? "PDF" : "PNG"}
            </p>
          </>
        )}
      </div>
    </article>
  );
}

export function AwardsPage() {
  const t = useTranslations("awards");
  const [items, setItems] = useState<AwardItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState<AwardFilters>(initialFilters);
  useEffect(() => {
    const controller = new AbortController();
    getAwardResults(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) {
          setItems(result);
          setState("ready");
        }
      },
      () => {
        if (!controller.signal.aborted) setState("failed");
      },
    );
    return () => controller.abort();
  }, [attempt]);
  const groupItems = useMemo(
    () => items.filter((r) => r.group === filters.group),
    [items, filters.group],
  );
  const categories = useMemo(
    () => [...new Set(groupItems.map((r) => r.categoryName))],
    [groupItems],
  );
  const matches = useMemo(() => filterAwards(items, filters), [items, filters]);
  const visibleCategories = [...new Set(matches.map((r) => r.categoryName))];
  function selectCategory(category: string) {
    setFilters((v) => ({ ...v, category }));
  }
  return (
    <main className="awards-page">
      <section className="aw-hero">
        <div className="aw-container">
          <h1>
            {t("title")} <span>PRIS 2026</span>
          </h1>
          <p>{t("description")}</p>
          <div className="aw-meta">
            <span>
              <CalendarDays aria-hidden="true" />
              {t("date")}
            </span>
            <span>
              <Trophy aria-hidden="true" />
              {t("works")}
            </span>
          </div>
        </div>
      </section>
      <div className="aw-container">
        <div
          className="aw-tabs"
          role="group"
          aria-label={t("presentationTypes")}
        >
          {awardGroups.map((group) => (
            <button
              key={group}
              type="button"
              aria-pressed={filters.group === group}
              onClick={() => setFilters({ ...initialFilters, group })}
            >
              <span className="aw-tab-full">{t(groupLabels[group][0])}</span>
              <span className="aw-tab-short">{t(groupLabels[group][1])}</span>
              <span className="aw-count">
                {state === "ready"
                  ? items.filter((r) => r.group === group).length
                  : "—"}
              </span>
            </button>
          ))}
        </div>
        <div className="aw-filters">
          <div className="aw-search">
            <label className="aw-sr" htmlFor="award-search">
              {t("search")}
            </label>
            <Search aria-hidden="true" />
            <input
              id="award-search"
              type="search"
              value={filters.query}
              placeholder={t("search")}
              onChange={(e) =>
                setFilters((v) => ({ ...v, query: e.target.value }))
              }
            />
          </div>
          <label className="aw-mobile-category">
            <span className="aw-sr">{t("category")}</span>
            <select
              value={filters.category}
              onChange={(e) => selectCategory(e.target.value)}
            >
              <option value="all">{t("allCategories")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="aw-award-select">
            <span className="aw-sr">{t("awards")}</span>
            <select
              value={filters.level}
              onChange={(e) =>
                setFilters((v) => ({
                  ...v,
                  level: e.target.value as AwardLevel | "all",
                }))
              }
            >
              <option value="all">{t("allAwards")}</option>
              {awardLevels.map((level) => (
                <option key={level} value={level}>
                  {t(levelLabels[level])}
                </option>
              ))}
            </select>
          </label>
          {state === "ready" && (
            <p className="aw-results-count" aria-live="polite">
              <strong>{matches.length}</strong> {t("result")}
            </p>
          )}
        </div>
        {state === "loading" ? (
          <p className="aw-status" role="status">
            {t("loading")}
          </p>
        ) : state === "failed" ? (
          <div className="aw-status" role="alert">
            <p>{t("error")}</p>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setAttempt((v) => v + 1);
              }}
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <div
            className={`aw-reading${filters.category === "all" ? " aw-all-categories" : ""}`}
          >
            <aside className="aw-index" aria-label={t("categoryContents")}>
              <p>
                {t("categoryContents")} <strong>({categories.length})</strong>
              </p>
              <button
                type="button"
                aria-pressed={filters.category === "all"}
                onClick={() => selectCategory("all")}
              >
                <span>{t("allCategories")}</span>
                <span>{groupItems.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filters.category === c}
                  onClick={() => selectCategory(c)}
                >
                  <span>{c}</span>
                  <span>
                    {groupItems.filter((r) => r.categoryName === c).length}
                  </span>
                </button>
              ))}
              <p className="aw-index-note">
                {t("end")}
                <br />
                <Link href="/poster-gallery">
                  {t("allPoster")}
                  <ExternalLink aria-hidden="true" />
                </Link>
              </p>
            </aside>
            <div className="aw-content">
              {matches.length ? (
                visibleCategories.map((category) => {
                  const works = matches.filter(
                    (r) => r.categoryName === category,
                  );
                  return (
                    <section
                      className="aw-category"
                      key={category}
                      aria-label={category}
                    >
                      <div className="aw-category-heading">
                        <h2>{category}</h2>
                        <p>
                          <strong>{works.length}</strong> {t("result")}
                        </p>
                      </div>
                      {awardLevels
                        .filter((level) =>
                          works.some((r) => r.awardLevel === level),
                        )
                        .map((level) => (
                          <section
                            className="aw-level"
                            key={level}
                            aria-label={t(levelLabels[level])}
                          >
                            <div className={`aw-level-heading ${level}`}>
                              <h3>
                                <Trophy aria-hidden="true" />
                                {t(levelLabels[level])}
                              </h3>
                              <span>
                                {
                                  works.filter((r) => r.awardLevel === level)
                                    .length
                                }{" "}
                                {t("result")}
                              </span>
                            </div>
                            {works
                              .filter((r) => r.awardLevel === level)
                              .map((item) => (
                                <AwardWork
                                  key={`${item.trackingId}:${item.file?.url}:${item.file?.version}`}
                                  item={item}
                                />
                              ))}
                          </section>
                        ))}
                    </section>
                  );
                })
              ) : (
                <div className="aw-empty">
                  <h2>{t("none")}</h2>
                  <p>{t("noneDescription")}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({ ...initialFilters, group: filters.group })
                    }
                  >
                    {t("reset")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <p className="aw-end-note">
          {t("end")} · <Link href="/poster-gallery">{t("allPoster")}</Link>
        </p>
      </div>
    </main>
  );
}
