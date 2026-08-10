import assert from "node:assert/strict";
import test from "node:test";
import { fetchAbstractWordCount } from "./abstractWordCount.js";

const responseFixture = {
  success: true as const,
  policy: "ensemble-intl-pythainlp-50-50-v1",
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

const input = {
  title: "Clinical pharmacy outcomes",
  keywords: "Pharmacy, Outcomes",
  background: "background",
  objective: "objective",
  methods: "methods",
  results: "results",
  conclusion: "conclusion",
};

test("posts the exact authenticated request and returns server counts", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fakeFetch: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(responseFixture), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await fetchAbstractWordCount(
    "https://api.example.test",
    "jwt-token",
    input,
    undefined,
    fakeFetch,
  );

  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    "https://api.example.test/api/abstracts/word-count",
  );
  assert.equal(calls[0].init?.method, "POST");
  assert.deepEqual(calls[0].init?.headers, {
    Authorization: "Bearer jwt-token",
    "Content-Type": "application/json",
  });
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), input);
  assert.deepEqual(result, responseFixture);
});

test("throws the server error message for a non-success response", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: "Invalid count payload",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );

  await assert.rejects(
    fetchAbstractWordCount(
      "https://api.example.test",
      "jwt-token",
      input,
      undefined,
      fakeFetch,
    ),
    /Invalid count payload/,
  );
});

test("rejects counts produced by an outdated backend policy", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        ...responseFixture,
        policy: "intl-segmenter-th-en-v1",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );

  await assert.rejects(
    fetchAbstractWordCount(
      "https://api.example.test",
      "jwt-token",
      input,
      undefined,
      fakeFetch,
    ),
    /Unsupported abstract word count policy/,
  );
});
