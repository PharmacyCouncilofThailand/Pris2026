import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import type {
  AbstractWordCountRequest,
  AbstractWordCountResponse,
  fetchAbstractWordCount,
} from "@/lib/abstractWordCount";
import { useAuthoritativeWordCount } from "./useAuthoritativeWordCount.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const input: AbstractWordCountRequest = {
  title: "Clinical pharmacy outcomes",
  keywords: "Pharmacy, Outcomes",
  background: "background",
  objective: "objective",
  methods: "methods",
  results: "results",
  conclusion: "conclusion",
};

const response: AbstractWordCountResponse = {
  success: true,
  policy: "intl-segmenter-th-en-v1",
  limits: { titleMax: 30, keywordMax: 6, sectionMin: 10, totalMax: 300 },
  counts: {
    title: 3,
    keywords: 2,
    sections: {
      background: 10,
      objective: 10,
      methods: 10,
      results: 10,
      conclusion: 10,
    },
    total: 50,
  },
  issues: [],
};

type HookResult = ReturnType<typeof useAuthoritativeWordCount>;

test("debounces input and exposes the authoritative result", async () => {
  const calls: AbstractWordCountRequest[] = [];
  const request: typeof fetchAbstractWordCount = async (
    _apiUrl,
    _token,
    nextInput,
  ) => {
    calls.push(nextInput);
    return response;
  };
  let latest: HookResult | null = null;

  function Probe() {
    latest = useAuthoritativeWordCount({
      apiUrl: "https://api.example.test",
      token: "jwt-token",
      input,
      enabled: true,
      debounceMs: 5,
      request,
    });
    return null;
  }

  let renderer: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(createElement(Probe));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], input);
  const current = latest as HookResult | null;
  assert.ok(current);
  assert.equal(current.status, "ready");
  assert.equal(current.result?.counts.total, 50);
  assert.equal(current.isStale, false);

  await act(async () => renderer.unmount());
});

test("refresh bypasses a pending debounce", async () => {
  let calls = 0;
  const request: typeof fetchAbstractWordCount = async () => {
    calls += 1;
    return response;
  };
  let latest: HookResult | null = null;

  function Probe() {
    latest = useAuthoritativeWordCount({
      apiUrl: "https://api.example.test",
      token: "jwt-token",
      input,
      enabled: true,
      debounceMs: 60_000,
      request,
    });
    return null;
  }

  let renderer: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(createElement(Probe));
  });
  await act(async () => {
    await latest?.refresh();
  });

  assert.equal(calls, 1);
  const current = latest as HookResult | null;
  assert.ok(current);
  assert.equal(current.status, "ready");
  assert.equal(current.isStale, false);

  await act(async () => renderer.unmount());
});
