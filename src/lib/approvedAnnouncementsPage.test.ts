import assert from "node:assert/strict";
import test from "node:test";
import { createRequire, Module } from "node:module";
import type { EffectCallback, DependencyList } from "react";
import type { ReactTestRenderer } from "react-test-renderer";
import type { Announcement } from "../types/presentations";
import { createTranslator } from "next-intl";
import thMessages from "../../messages/th.json";
import enMessages from "../../messages/en.json";

const require = createRequire(import.meta.url);
const testGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

test("latest round selects its document and notice, resets filters, and clamps pagination after reload", async () => {
  const React = require("react") as typeof import("react");
  const { act, create } =
    require("react-test-renderer") as typeof import("react-test-renderer");
  const originalEffect = React.useEffect;
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const originalAct = testGlobal.IS_REACT_ACT_ENVIRONMENT;
  const intlPath = require.resolve("next-intl");
  const heroPath = require.resolve("../components/sections/PageHero");
  const previousIntl = require.cache[intlPath];
  const previousHero = require.cache[heroPath];
  let reloadEffect: EffectCallback | undefined;
  let rows: Announcement[] = Array.from({ length: 21 }, (_, i) => ({
    id: i + 1,
    trackingId: `SYNTHETIC-${i + 1}`,
    title: `Synthetic ${i + 1}`,
    presentationType: "poster",
    categoryId: 1,
    categoryName: "Synthetic",
    submitterName: null,
    affiliation: null,
    round: 2,
  }));
  rows.push({ ...rows[0], id: 99, title: "Historical Round 1", round: 1 });
  let renderer: ReactTestRenderer | undefined;
  try {
    testGlobal.IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.document = {
      body: { classList: { remove() {} } },
      addEventListener() {},
      removeEventListener() {},
      getElementById() {
        return null;
      },
    } as unknown as Document;
    const intlModule = new Module(intlPath);
    intlModule.exports = { useTranslations: () => (key: string) => key };
    require.cache[intlPath] = intlModule;
    const heroModule = new Module(heroPath);
    heroModule.exports = { __esModule: true, default: () => null };
    require.cache[heroPath] = heroModule;
    React.useEffect = (callback: EffectCallback, deps?: DependencyList) => {
      // Replay only the API effect, preserving pagination and filter state.
      if (callback.toString().includes("AbortController"))
        reloadEffect = callback;
      return originalEffect(callback, deps);
    };
    globalThis.fetch = async () => Response.json({ success: true, data: rows });
    const Page = require("../app/[locale]/approved-abstracts/page").default;
    await act(async () => {
      renderer = create(React.createElement(Page));
    });
    assert.ok(renderer);
    const pdfUrl =
      "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Completed%20%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8%E0%B8%9C%E0%B8%A5%20PRIS2026%20Presentation%20%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%97%E0%B8%B5%E0%B9%88%202.pdf";
    const pdfLinks = () => renderer!.root.findAllByType("a");
    assert.equal(pdfLinks().length, 2);
    assert.ok(pdfLinks().every((node) => node.props.href === pdfUrl));
    assert.equal(
      pdfLinks()[1].props.download,
      "approved-abstracts-round-2.pdf",
    );
    assert.ok(
      renderer.root
        .findAllByType("div")
        .some((node) => node.children.includes("round2PublishedDesc")),
    );
    assert.ok(
      !renderer.root
        .findAllByType("div")
        .some((node) => node.children.includes("round2EmptyDesc")),
    );
    const round1 = renderer.root
      .findAllByType("button")
      .find((node) => node.children.includes("filterRound1"));
    assert.ok(round1);
    await act(async () => {
      round1.props.onClick();
    });
    assert.equal(renderer.root.findAllByType("article").length, 1);
    assert.ok(
      renderer.root
        .findAllByType("article")[0]
        .findAllByType("h2")[0]
        .children.includes("Historical Round 1"),
    );
    assert.ok(
      pdfLinks().every(
        (node) =>
          node.props.href === "/documents/approved-abstracts-round-1.pdf",
      ),
    );
    assert.equal(
      pdfLinks()[1].props.download,
      "approved-abstracts-round-1.pdf",
    );
    assert.ok(
      renderer.root
        .findAllByType("p")
        .some((node) => node.children.includes("round1HistoricalDesc")),
    );
    await act(async () => {
      renderer!.root
        .findByType("input")
        .props.onChange({ target: { value: "no matching work" } });
    });
    const reset = renderer.root
      .findAllByType("button")
      .find((node) => node.children.includes("resetFilters"));
    assert.ok(reset);
    await act(async () => {
      reset.props.onClick();
    });
    assert.ok(pdfLinks().every((node) => node.props.href === pdfUrl));
    assert.equal(renderer.root.findAllByType("article").length, 10);
    const page3 = renderer.root
      .findAllByType("button")
      .find((node) => node.children.length === 1 && node.children[0] === "3");
    assert.ok(page3);
    await act(async () => {
      page3.props.onClick();
    });
    assert.equal(renderer.root.findAllByType("article").length, 1);
    assert.ok(
      renderer.root
        .findAllByType("article")[0]
        .findAllByType("h2")[0]
        .children.includes("Synthetic 21"),
    );
    rows = rows.slice(0, 3);
    const replay: { cleanup: ReturnType<EffectCallback> } = {
      cleanup: undefined,
    };
    assert.ok(reloadEffect);
    await act(async () => {
      replay.cleanup = reloadEffect!();
    });
    assert.equal(renderer.root.findAllByType("article").length, 3);
    assert.ok(
      renderer.root
        .findAllByType("article")[0]
        .findAllByType("h2")[0]
        .children.includes("Synthetic 1"),
    );
    assert.equal(renderer.root.findAllByType("nav").length, 0);
    rows = [{ ...rows[0], round: 1 }];
    await act(async () => {
      reloadEffect!();
    });
    assert.equal(renderer.root.findAllByType("article").length, 0);
    assert.ok(
      renderer.root
        .findAllByType("h2")
        .some((node) => node.children.includes("round2EmptyTitle")),
    );
    assert.ok(
      !renderer.root
        .findAllByType("div")
        .some((node) => node.children.includes("round2PublishedDesc")),
    );
    if (typeof replay.cleanup === "function") replay.cleanup();
  } finally {
    if (renderer) await act(async () => renderer?.unmount());
    React.useEffect = originalEffect;
    globalThis.fetch = originalFetch;
    globalThis.document = originalDocument;
    testGlobal.IS_REACT_ACT_ENVIRONMENT = originalAct;
    if (previousIntl) require.cache[intlPath] = previousIntl;
    else delete require.cache[intlPath];
    if (previousHero) require.cache[heroPath] = previousHero;
    else delete require.cache[heroPath];
  }
});

test("both locales interpolate document rounds and describe the current and historical announcements", () => {
  for (const [locale, messages] of [
    ["th", thMessages],
    ["en", enMessages],
  ] as const) {
    const t = createTranslator({
      locale,
      messages,
      namespace: "approvedAbstracts",
    });
    for (const round of ["1", "2"]) {
      assert.ok(t("pdfDocumentTitle", { round }).includes(round));
      assert.ok(t("pdfActionsLabel", { round }).includes(round));
    }
    assert.ok(t("round2PublishedDesc").includes("1"));
    assert.ok(t("round1HistoricalDesc").includes("2"));
    assert.ok(t("desc").includes("2"));
    assert.ok(!t("round2EmptyDesc").includes("30"));
  }
});
