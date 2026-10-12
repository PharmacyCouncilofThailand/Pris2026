import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import type { ReactTestRenderer } from "react-test-renderer";
import th from "../../messages/th.json";

const require = createRequire(import.meta.url);
const React = require("react") as typeof import("react");
const { act, create } =
  require("react-test-renderer") as typeof import("react-test-renderer");
const source = readFileSync(
  new URL("../app/[locale]/profile/page.tsx", import.meta.url),
  "utf8",
);
const globals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const ticket = {
  eventCode: "PRIS-2026",
  eventName: "PRIS 2026",
  regCode: "PAID-REG",
  ticketName: "Regular",
  amount: "2500.00",
  paidAmount: "1250.00",
  receiptUrl: null,
};

async function mount(tickets: unknown[], delayed = false, failed = false) {
  let resolve!: (value: unknown) => void;
  const response = delayed
    ? new Promise((yes) => {
        resolve = yes;
      })
    : Promise.resolve({ success: true, data: tickets });
  const user = {
    id: 1,
    email: "test@example.test",
    firstName: "Test",
    lastName: "User",
    role: "general",
    status: "active",
  };
  const context = {
    exports: {} as { default: React.ComponentType },
    process: { env: { NEXT_PUBLIC_EVENT_CODE: "PRIS-2026" } },
    fetch: async (url: string) => ({
      json: async () => {
        if (url.endsWith("/my-tickets")) {
          if (failed) throw new Error("Unavailable");
          return response;
        }
        return url.includes("/registrations/check")
          ? { success: true, isRegistered: true, regCode: "REG-1" }
          : { success: true, user };
      },
    }),
    require(name: string) {
      if (name === "react" || name === "react/jsx-runtime")
        return require(name);
      if (name === "@/context/AuthContext")
        return {
          useAuth: () => ({
            user,
            token: "test",
            isAuthenticated: true,
            logout() {},
          }),
        };
      if (name === "@/i18n/routing")
        return { Link: "a", useRouter: () => ({ replace() {} }) };
      if (name === "next-intl")
        return {
          useLocale: () => "th",
          useTranslations: (namespace: string) => (key: string) =>
            key
              .split(".")
              .reduce<any>(
                (value, part) => value?.[part],
                (th as any)[namespace],
              ) ?? key,
        };
      if (name === "@gsap/react") return { useGSAP() {} };
      if (name === "@/lib/registrationGate") return { REGISTRATION_OPEN: true };
      if (name === "qrcode.react") return { QRCodeCanvas: () => null };
      if (name === "@/components/profile/AbstractTracker")
        return { __esModule: true, default: () => null };
      if (name === "react-hot-toast")
        return { __esModule: true, default: { error() {}, success() {} } };
      return new Proxy(
        {},
        { get: (_target, key) => (key === "__esModule" ? true : () => null) },
      );
    },
  };
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    context,
  );
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(React.createElement(context.exports.default));
  });
  return {
    renderer,
    text: () => JSON.stringify(renderer.toJSON()),
    finish: async () => {
      await act(async () => {
        resolve({ success: true, data: tickets });
      });
    },
  };
}

test("profile shows documents only for a positive paid order in the current event", async () => {
  const original = globals.IS_REACT_ACT_ENVIRONMENT;
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    for (const [paidAmount, visible] of [
      ["1250.00", true],
      ["0.01", true],
      ["0.00", false],
      [0, false],
      [null, false],
      [undefined, false],
      ["invalid", false],
      ["Infinity", false],
    ] as const) {
      const f = await mount([{ ...ticket, paidAmount }]);
      try {
        assert.equal(
          f.text().includes(th.profile.receipt.eyebrow),
          visible,
          `paidAmount=${paidAmount}`,
        );
        if (visible)
          assert.ok(f.text().includes(th.profile.receipt.unavailableHint));
      } finally {
        await act(async () => f.renderer.unmount());
      }
    }
    for (const rows of [
      [],
      [{ ...ticket, eventCode: "OTHER" }],
      [
        {
          ...ticket,
          paidAmount: "0.00",
          receiptUrl: "https://example.test/free",
        },
      ],
    ]) {
      const f = await mount(rows);
      try {
        assert.equal(f.text().includes(th.profile.receipt.eyebrow), false);
      } finally {
        await act(async () => f.renderer.unmount());
      }
    }
    const f = await mount([
      { ...ticket, paidAmount: "0.00", regCode: "FREE-REG" },
      { ...ticket, receiptUrl: "https://example.test/receipt" },
    ]);
    try {
      assert.ok(f.text().includes(th.profile.receipt.eyebrow));
      assert.ok(f.text().includes("PAID-REG"));
      assert.ok(f.text().includes("https://example.test/receipt"));
      assert.equal(f.text().includes("FREE-REG"), false);
    } finally {
      await act(async () => f.renderer.unmount());
    }
  } finally {
    globals.IS_REACT_ACT_ENVIRONMENT = original;
  }
});

test("profile hides documents while loading or when the ticket lookup fails", async () => {
  const original = globals.IS_REACT_ACT_ENVIRONMENT;
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    const loading = await mount([ticket], true);
    try {
      assert.equal(loading.text().includes(th.profile.receipt.eyebrow), false);
      await loading.finish();
      assert.ok(loading.text().includes(th.profile.receipt.eyebrow));
    } finally {
      await act(async () => loading.renderer.unmount());
    }
    const failed = await mount([ticket], false, true);
    try {
      assert.equal(failed.text().includes(th.profile.receipt.eyebrow), false);
    } finally {
      await act(async () => failed.renderer.unmount());
    }
  } finally {
    globals.IS_REACT_ACT_ENVIRONMENT = original;
  }
});
