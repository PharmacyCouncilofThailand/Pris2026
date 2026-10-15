import test from "node:test";
import assert from "node:assert/strict";
import { createElement, useEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  MerchandiseSessionProvider,
  type MerchandiseSession,
} from "../components/merchandise/MerchandiseProvider";
import { useMerchandiseCart } from "../components/merchandise/useMerchandiseCart";
import { useMerchandiseOrder } from "../components/merchandise/useMerchandiseOrder";
import { createMerchandiseApi, type MerchandiseApi } from "./merchandiseApi";
import { ids, store, cart, order } from "../../tests/merchandise/data";
import type { MerchandiseResource } from "../components/merchandise/useMerchandiseResource";
import type { CartDto, OrderDetail } from "../types/merchandise";
const environment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const session = (
  id: number | null,
  token: string | null,
): MerchandiseSession => ({
  isAuthenticated: id !== null && token !== null,
  token,
  user: id === null ? null : { id, email: `buyer-${id}@example.test` },
});
const json = (data: unknown) => Response.json({ success: true, data });
const flush = () => new Promise<void>((done) => setTimeout(done, 0));
test("anonymous browsing never reads owner resources, including a stale token on an unauthenticated session", async () => {
  const calls: string[] = [];
  const api = createMerchandiseApi({
    fetcher: async (url) => {
      calls.push(String(url));
      return json(store);
    },
  });
  let current: MerchandiseResource<CartDto> | undefined;
  function Probe() {
    const value = useMerchandiseCart();
    useEffect(() => {
      current = value;
    }, [value]);
    return null;
  }
  let tree: ReactTestRenderer | undefined;
  const old = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(async () => {
      tree = create(
        createElement(
          MerchandiseSessionProvider,
          {
            api,
            session: {
              isAuthenticated: false,
              token: "expired-synthetic",
              user: { id: 11, email: "buyer@example.test" },
            },
          },
          createElement(Probe),
        ),
      );
      await flush();
    });
    assert.equal(current?.status, "idle");
    assert.equal(current?.data, null);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].endsWith("/store"));
  } finally {
    await act(async () => tree?.unmount());
    environment.IS_REACT_ACT_ENVIRONMENT = old;
  }
});
test("account changes and logout abort old private reads; late old recipient data never replaces the new owner", async () => {
  const pending: {
    token: string;
    signal: AbortSignal;
    resolve(response: Response): void;
  }[] = [];
  const api = createMerchandiseApi({
    fetcher: async (url, init) =>
      String(url).endsWith("/store")
        ? json(store)
        : String(url).endsWith("/cart")
          ? json(cart)
          : new Promise<Response>((resolve) =>
              pending.push({
                token: new Headers(init?.headers).get("authorization")!,
                signal: init?.signal as AbortSignal,
                resolve,
              }),
            ),
  });
  let current: MerchandiseResource<OrderDetail> | undefined;
  const snapshot = () => current;
  function Probe() {
    const value = useMerchandiseOrder(ids.order);
    useEffect(() => {
      current = value;
    }, [value]);
    return createElement(
      "output",
      null,
      value.data?.effective.recipient.fullName ?? value.status,
    );
  }
  const render = (value: MerchandiseSession) =>
    createElement(
      MerchandiseSessionProvider,
      {
        api,
        session: value,
      },
      createElement(Probe),
    );
  let tree: ReactTestRenderer | undefined;
  const old = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(async () => {
      tree = create(render(session(11, "token-A")));
      await flush();
    });
    await act(flush);
    assert.equal(pending.length, 1);
    await act(async () => {
      tree!.update(render(session(22, "token-B")));
      await flush();
    });
    assert.equal(pending[0].signal.aborted, true);
    assert.equal(pending.length, 2);
    assert.equal(current?.data, null);
    assert.equal(pending[1].token, "Bearer token-B");
    const other = structuredClone(order);
    other.buyer.id = 22;
    other.effective.recipient.fullName = "ผู้รับบัญชี B";
    await act(async () => {
      pending[1].resolve(json(other));
      await flush();
    });
    assert.equal(
      snapshot()?.data?.effective.recipient.fullName,
      "ผู้รับบัญชี B",
    );
    await act(async () => {
      pending[0].resolve(json(order));
      await flush();
    });
    assert.equal(snapshot()?.data?.buyer.id, 22);
    await act(async () => {
      tree!.update(render(session(22, "token-B2")));
      await flush();
    });
    assert.equal(pending.length, 3);
    assert.equal(pending[1].signal.aborted, true);
    assert.equal(pending[2].token, "Bearer token-B2");
    assert.equal(snapshot()?.data, null);
    await act(async () => {
      tree!.update(render(session(null, null)));
      await flush();
    });
    assert.equal(pending[1].signal.aborted, true);
    assert.equal(current?.data, null);
    assert.equal(current?.status, "idle");
    assert.equal(pending[2].signal.aborted, true);
    await act(async () => {
      pending[2].resolve(json(other));
      await flush();
    });
    assert.equal(snapshot()?.data, null);
    assert.equal(snapshot()?.status, "idle");
    assert.doesNotMatch(
      JSON.stringify(tree!.toJSON()),
      /ผู้รับบัญชี B|ผู้รับสังเคราะห์/,
    );
  } finally {
    await act(async () => tree?.unmount());
    environment.IS_REACT_ACT_ENVIRONMENT = old;
  }
});

test("Header and page cart consumers share one owner read", async () => {
  let reads = 0;
  const api = createMerchandiseApi({
    fetcher: async (url) => {
      if (String(url).endsWith("/store")) return json(store);
      reads++;
      return json(cart);
    },
  });
  function Probe() {
    const c = useMerchandiseCart();
    return createElement("output", null, c.data?.unitCount ?? c.status);
  }
  const previous = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  let tree: ReactTestRenderer | undefined;
  try {
    await act(async () => {
      tree = create(
        createElement(
          MerchandiseSessionProvider,
          { api, session: session(11, "token") },
          createElement(Probe),
          createElement(Probe),
        ),
      );
      await flush();
    });
    await act(flush);
    assert.equal(reads, 1);
    assert.equal(tree!.root.findAllByType("output").length, 2);
  } finally {
    await act(async () => tree?.unmount());
    environment.IS_REACT_ACT_ENVIRONMENT = previous;
  }
});
test("event changes reject foreign cart data and a denied reload hides previously displayed recipient data", async () => {
  let deny = false,
    currentOrder: MerchandiseResource<OrderDetail> | undefined,
    currentCart: MerchandiseResource<CartDto> | undefined;
  const api: MerchandiseApi = createMerchandiseApi({
    fetcher: async (url) => {
      const path = String(url);
      if (path.endsWith("/store"))
        return json(
          path.includes("/OTHER/")
            ? { ...store, eventCode: "OTHER", eventId: 2 }
            : store,
        );
      if (path.endsWith("/cart")) return json(cart);
      return deny
        ? Response.json(
            {
              success: false,
              code: "MERCH_AUTH_REQUIRED",
              error: "private-message",
              requestId: "req-1",
            },
            { status: 401 },
          )
        : json(order);
    },
  });
  function Probe() {
    const orderValue = useMerchandiseOrder(ids.order),
      cartValue = useMerchandiseCart();
    useEffect(() => {
      currentOrder = orderValue;
      currentCart = cartValue;
    }, [orderValue, cartValue]);
    return createElement(
      "output",
      null,
      orderValue.data?.buyer.name ?? orderValue.status,
    );
  }
  const render = (eventCode: string) =>
    createElement(
      MerchandiseSessionProvider,
      {
        api,
        eventCode,
        session: session(11, "token-A"),
      },
      createElement(Probe),
    );
  let tree: ReactTestRenderer | undefined;
  const old = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(async () => {
      tree = create(render("PRIS-2026"));
      await flush();
    });
    await act(flush);
    assert.equal(currentOrder?.status, "ready");
    assert.equal(currentCart?.status, "ready");
    deny = true;
    await act(async () => {
      currentOrder!.reload();
      await flush();
    });
    assert.equal(currentOrder?.status, "error");
    assert.equal(currentOrder?.data, null);
    assert.equal(currentOrder?.error?.status, 401);
    assert.doesNotMatch(
      JSON.stringify(tree!.toJSON()),
      /ผู้ซื้อสังเคราะห์|private-message/,
    );
    await act(async () => {
      tree!.update(render("OTHER"));
      await flush();
    });
    await act(flush);
    assert.equal(currentCart?.status, "error");
    assert.equal(currentCart?.data, null);
    assert.equal(currentCart?.error?.body.code, "MERCH_BAD_RESPONSE");
  } finally {
    await act(async () => tree?.unmount());
    environment.IS_REACT_ACT_ENVIRONMENT = old;
  }
});
