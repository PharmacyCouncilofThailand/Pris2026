import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { test as base, expect } from "./fixtures";
interface MerchandiseFixture {
  buyerToken: string;
  otherBuyerToken: string;
  origin: string;
  command<T = unknown>(action: string, payload?: unknown): Promise<T>;
  login(page: Page, other?: boolean): Promise<void>;
  mockLogin(page: Page): Promise<void>;
}
export const test = base.extend<{ merchandise: MerchandiseFixture }>({
  merchandise: async ({}, provide) => {
    const api = resolve("../conference-api");
    const child = spawn(
      process.execPath,
      [
        `--env-file=${resolve(api, ".env.merchandise.local")}`,
        "--import",
        pathToFileURL(resolve(api, "node_modules/tsx/dist/loader.mjs")).href,
        resolve("scripts/merchandise-browser-fixture.mjs"),
      ],
      { cwd: api, stdio: ["ignore", "pipe", "pipe", "ipc"] },
    );
    let diagnostics = "";
    child.stderr?.on("data", (chunk) => {
      diagnostics = (diagnostics + String(chunk)).slice(-1500);
    });
    const pending = new Map<
      string,
      {
        resolve: (v: unknown) => void;
        reject: (e: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >();
    const ready = await new Promise<{
      origin: string;
      buyerToken: string;
      otherBuyerToken: string;
    }>((resolveReady, reject) => {
      const timeout = setTimeout(
        () => reject(Error("Isolated merchandise fixture startup timed out")),
        20000,
      );
      child.once("exit", (code) => {
        clearTimeout(timeout);
        reject(Error(`Isolated fixture exited ${code}: ${diagnostics}`));
      });
      child.on(
        "message",
        (message: {
          ready?: boolean;
          id?: string;
          data?: unknown;
          error?: string;
          origin: string;
          buyerToken: string;
          otherBuyerToken: string;
        }) => {
          if (message.ready) {
            clearTimeout(timeout);
            resolveReady(message);
          }
          if (message.id) {
            const request = pending.get(message.id);
            if (!request) return;
            pending.delete(message.id);
            clearTimeout(request.timer);
            if (message.error) request.reject(Error(message.error));
            else request.resolve(message.data);
          }
        },
      );
    });
    const command = <T>(action: string, payload?: unknown) =>
      new Promise<T>((resolveResult, reject) => {
        const id = randomUUID();
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(Error(`Fixture ${action} timed out`));
        }, 20000);
        pending.set(id, {
          resolve: (v) => resolveResult(v as T),
          reject,
          timer,
        });
        child.send({ id, action, payload });
      });
    const user = (other = false) => ({
      id: other ? 2 : 1,
      firstName: "ผู้ซื้อ",
      lastName: "ทดสอบ",
      email: other ? "other@example.test" : "buyer@example.test",
      role: "general",
      phone: "0812345678",
    });
    try {
      await provide({
        ...ready,
        command,
        async login(page, other = false) {
          await page.addInitScript(
            ({ token, user }) => {
              sessionStorage.setItem("pris_user", JSON.stringify(user));
              sessionStorage.setItem("pris_token", token);
            },
            {
              token: other ? ready.otherBuyerToken : ready.buyerToken,
              user: user(other),
            },
          );
        },
        async mockLogin(page) {
          await page.route(ready.origin + "/auth/login", (route) =>
            route.fulfill({
              status: route.request().method() === "OPTIONS" ? 204 : 200,
              headers: {
                "access-control-allow-origin": "*",
                "access-control-allow-headers": "Content-Type",
              },
              contentType: "application/json",
              body:
                route.request().method() === "OPTIONS"
                  ? ""
                  : JSON.stringify({
                      success: true,
                      user: user(),
                      token: ready.buyerToken,
                    }),
            }),
          );
        },
      });
    } finally {
      await new Promise<void>((resolveExit) => {
        if (child.exitCode !== null) return resolveExit();
        const timer = setTimeout(() => {
          child.kill();
          resolveExit();
        }, 10000);
        child.once("exit", () => {
          clearTimeout(timer);
          resolveExit();
        });
        if (child.connected) child.send("close");
        else child.kill();
      });
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(Error("Fixture closed"));
      }
    }
  },
});
export { expect };
