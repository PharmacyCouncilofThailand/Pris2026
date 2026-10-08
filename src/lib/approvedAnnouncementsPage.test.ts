import assert from "node:assert/strict";
import test from "node:test";
import { createRequire, Module } from "node:module";
import type { EffectCallback, DependencyList } from "react";
import type { ReactTestRenderer } from "react-test-renderer";
import type { Announcement } from "../types/presentations";

const require = createRequire(import.meta.url);
const testGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

test("announcement reload clamps the last page after the API source shrinks", async () => {
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
    round: 1,
  }));
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
