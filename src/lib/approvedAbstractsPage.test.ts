import assert from "node:assert/strict";
import test from "node:test";
import { createRequire, Module } from "node:module";
import type { ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import type { Announcement } from "../types/presentations";
import en from "../../messages/en.json";

const require = createRequire(import.meta.url);
const globals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

test("student tab separates counts, results, PDFs and pagination while preserving Round 1 and one API request", async () => {
  const React = require("react") as typeof import("react");
  const { act, create } =
    require("react-test-renderer") as typeof import("react-test-renderer");
  const paths = [
    "next-intl",
    "./presentationApi",
    "../components/sections/PageHero",
  ].map((path) => require.resolve(path));
  const saved = paths.map((path) => require.cache[path]);
  const original = {
    document: globalThis.document,
    act: globals.IS_REACT_ACT_ENVIRONMENT,
  };
  const row = (
    id: number,
    type: Announcement["presentationType"],
    student = false,
  ): Announcement => ({
    id,
    sequence: student ? id - 242 : id,
    trackingId: `${student ? "STUDENT" : "GENERAL"}-${id}`,
    title: `${student ? "Student" : "General"} work ${id}`,
    presentationType: type,
    categoryId: student ? 4 : 1,
    categoryName: student ? "Student category" : "General category",
    submitterName: "Synthetic Author",
    affiliation: null,
    round: 2,
    ...(student ? { participantGroup: "student" } : {}),
  });
  const fixture: Announcement[] = [
    ...Array.from({ length: 242 }, (_, i) =>
      row(i + 1, i < 47 ? "oral" : i < 94 ? "highlighted-poster" : "poster"),
    ),
    ...Array.from({ length: 18 }, (_, i) => row(243 + i, "oral", true)),
    {
      ...row(999, "poster"),
      round: 1,
      title: "Historical work",
      trackingId: "HISTORICAL-1",
    },
  ];
  let requests = 0;
  let renderer: ReactTestRenderer | undefined;
  const t = (key: string, values: Record<string, string | number> = {}) =>
    String(
      en.approvedAbstracts[key as keyof typeof en.approvedAbstracts] ?? key,
    ).replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name]));
  const text = (node: ReactTestInstance): string =>
    node.children
      .map((child) => (typeof child === "string" ? child : text(child)))
      .join("");
  const button = (label: string) =>
    renderer!.root
      .findAllByType("button")
      .find((node) => text(node).startsWith(label))!;
  const cards = () => renderer!.root.findAllByType("article").map(text);
  const pdfs = () =>
    renderer!.root.findAllByType("a").map((node) => node.props.href);
  try {
    globals.IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.document = {
      body: { classList: { remove() {} } },
      addEventListener() {},
      removeEventListener() {},
      getElementById() {
        return { scrollIntoView() {} };
      },
    } as unknown as Document;
    const mocks = [
      { useTranslations: () => t },
      {
        getApprovedAnnouncements: async () => {
          requests++;
          return fixture;
        },
      },
      { __esModule: true, default: () => React.createElement("div") },
    ];
    paths.forEach((path, i) => {
      const mock = new Module(path);
      mock.exports = mocks[i];
      require.cache[path] = mock;
    });
    const Page = require("../app/[locale]/approved-abstracts/page").default;
    await act(async () => {
      renderer = create(React.createElement(Page));
    });
    assert.equal(text(button("General works")), "General works242");
    assert.equal(text(button("Student works")), "Student works18");
    assert.equal(text(button("All")), "All242");
    assert.equal(text(button("Oral Presentation")), "Oral Presentation47");
    assert(cards().every((card) => card.includes("GENERAL-")));
    assert(
      pdfs().includes(
        "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Completed%20%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8%E0%B8%9C%E0%B8%A5%20PRIS2026%20Presentation%20%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%97%E0%B8%B5%E0%B9%88%202%20%E0%B9%80%E0%B8%9E%E0%B8%B4%E0%B9%88%E0%B8%A1%E0%B9%80%E0%B8%95%E0%B8%B4%E0%B8%A1.pdf",
      ),
    );

    await act(async () => {
      button("Poster Presentation").props.onClick();
    });
    await act(async () => {
      button("2").props.onClick();
    });
    await act(async () => {
      button("Student works").props.onClick();
    });
    assert.equal(text(button("All")), "All18");
    assert.equal(text(button("Oral Presentation")), "Oral Presentation18");
    assert.equal(button("Poster Presentation"), undefined);
    assert.equal(cards().length, 10);
    assert(cards()[0].includes("STUDENT-243"));
    assert(cards().every((card) => !card.includes("GENERAL-")));
    assert(
      pdfs().includes(
        "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Completed%20%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8%E0%B8%9C%E0%B8%A5%20PRIS2026%20Presentation%20%E0%B8%9C%E0%B8%A5%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%A8%E0%B8%B6%E0%B8%81%E0%B8%A9%E0%B8%B2.pdf",
      ),
    );
    assert(
      !pdfs().includes(
        "https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Completed%20%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8%E0%B8%9C%E0%B8%A5%20PRIS2026%20Presentation%20%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%97%E0%B8%B5%E0%B9%88%202%20%E0%B9%80%E0%B8%9E%E0%B8%B4%E0%B9%88%E0%B8%A1%E0%B9%80%E0%B8%95%E0%B8%B4%E0%B8%A1.pdf",
      ),
    );

    await act(async () => {
      button("2").props.onClick();
    });
    assert.equal(cards().length, 8);
    assert(cards().at(-1)?.includes("STUDENT-260"));
    await act(async () => {
      renderer!.root
        .findByType("input")
        .props.onChange({ target: { value: "STUDENT-260" } });
    });
    assert.equal(cards().length, 1);
    await act(async () => {
      button("General works").props.onClick();
    });
    assert.equal(cards().length, 0);
    await act(async () => {
      renderer!.root
        .findByType("input")
        .props.onChange({ target: { value: "" } });
    });
    assert.equal(cards().length, 10);
    await act(async () => {
      button("Round 1").props.onClick();
    });
    assert.equal(button("Student works"), undefined);
    assert.equal(cards().length, 1);
    assert(cards()[0].includes("HISTORICAL-1"));
    assert(pdfs().includes("/documents/approved-abstracts-round-1.pdf"));
    assert.equal(requests, 1);
  } finally {
    if (renderer) await act(async () => renderer!.unmount());
    paths.forEach((path, i) => {
      if (saved[i]) require.cache[path] = saved[i];
      else delete require.cache[path];
    });
    if (original.document) globalThis.document = original.document;
    else Reflect.deleteProperty(globalThis, "document");
    globals.IS_REACT_ACT_ENVIRONMENT = original.act;
  }
});
