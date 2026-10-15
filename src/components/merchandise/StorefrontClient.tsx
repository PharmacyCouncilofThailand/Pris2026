"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { StorefrontView } from "@conference/merchandise-storefront-view";
import { Link, useRouter } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
import { MerchandiseIntentResume } from "./MerchandiseAuthBoundary";
import { merchandiseFailure } from "@/lib/merchandiseApi";
import {
  merchandiseLoginPath,
  merchandiseReturnPath,
} from "@/lib/merchandiseRoutes";
import {
  purchaseIntentReturnPath,
  writePurchaseIntent,
  type IntentResult,
  type PurchaseIntent,
} from "@/lib/merchandiseIntent";
import toast from "react-hot-toast";

const storeLabels = {
  unconfigured: "ยังไม่กำหนดช่วงเปิดรับพรีออเดอร์",
  disabled: "ปิดรับคำสั่งซื้อในขณะนี้",
  not_open: "ยังไม่ถึงเวลาเปิดรับพรีออเดอร์",
  closed: "ปิดรับพรีออเดอร์แล้ว",
  open: "",
} satisfies Record<import("@/types/merchandise").StoreState, string>;
export default function StorefrontClient() {
  const { store, api, eventCode, token, cart } = useMerchandise(),
    router = useRouter(),
    params = useSearchParams(),
    search = params.toString();
  const canonical = useMemo(
    () => merchandiseReturnPath("/souvenirs" + (search ? "?" + search : "")),
    [search],
  );
  const filters = useMemo(() => {
    const q = new URL(canonical ?? "/souvenirs", "https://internal.invalid")
      .searchParams;
    return {
      query: q.get("q") ?? "",
      categoryId: q.get("categoryId") ?? undefined,
      kind: q.get("kind") as "single" | "bundle" | null,
      page: Number(q.get("page") ?? 1),
      intentId: q.get("intentId"),
    };
  }, [canonical]);
  const [draft, setDraft] = useState({ source: search, value: filters.query });
  const query = draft.source === search ? draft.value : filters.query;
  const pendingQuery = useRef<URLSearchParams | null>(null);
  const change = useCallback(
    (patch: Record<string, string | null>) => {
      const current = pendingQuery.current ?? new URLSearchParams(search);
      const fresh = pendingQuery.current === null;
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") current.delete(key);
        else current.set(key, value);
      }
      if (!Object.hasOwn(patch, "page")) current.delete("page");
      pendingQuery.current = current;
      if (fresh)
        queueMicrotask(() => {
          const next = pendingQuery.current;
          pendingQuery.current = null;
          if (next)
            router.replace(
              merchandiseReturnPath("/souvenirs?" + next) ?? "/souvenirs",
              { scroll: false },
            );
        });
    },
    [search, router],
  );
  useEffect(() => {
    if (!canonical) router.replace("/souvenirs", { scroll: false });
  }, [canonical, router]);
  useEffect(() => {
    if (query === filters.query) return;
    const timer = setTimeout(() => change({ q: query }), 200);
    return () => clearTimeout(timer);
  }, [query, filters.query, change]);
  const eventId = store.data?.eventId;
  const scope = useMemo(
    () =>
      eventId
        ? {
            eventId,
            eventCode,
            q: filters.query,
            categoryId: filters.categoryId,
            kind: filters.kind,
            page: filters.page,
          }
        : null,
    [
      eventId,
      eventCode,
      filters.query,
      filters.categoryId,
      filters.kind,
      filters.page,
    ],
  );
  const load = useCallback(
    async (signal: AbortSignal) => {
      const result = await api.products(
        eventCode,
        {
          search: filters.query || undefined,
          categoryId: filters.categoryId,
          kind: filters.kind ?? undefined,
          page: filters.page,
          limit: 24,
        },
        signal,
      );
      if (result.items.some((p) => p.eventId !== eventId))
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      return result;
    },
    [
      api,
      eventCode,
      eventId,
      filters.query,
      filters.categoryId,
      filters.kind,
      filters.page,
    ],
  );
  const products = useMerchandiseResource(scope, load);
  const [resolution, setResolution] = useState<{
    id: string;
    uncertain: boolean;
  } | null>(null);
  const addStarted = useRef<string | null>(null);
  const pending = useCallback(
    (id: string) => setResolution({ id, uncertain: true }),
    [],
  );
  const resolved = useCallback((id: string, result: IntentResult) => {
    const uncertain = result.kind === "error" && result.uncertain;
    if (!uncertain) addStarted.current = null;
    setResolution({ id, uncertain });
  }, []);
  const { reload: reloadCart } = cart;
  const added = useCallback(() => reloadCart(), [reloadCart]);
  const purchaseBusy = Boolean(
    token &&
    filters.intentId &&
    (resolution?.id !== filters.intentId || resolution.uncertain),
  );
  const canBuy =
    store.data?.state === "open" &&
    Boolean(products.data?.items.some((product) => product.purchasable));
  const viewRoot = useRef<HTMLDivElement>(null),
    swipe = useRef<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const bar = viewRoot.current?.querySelector(".merch-bottom-bar");
    if (!bar) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--merch-host-bar-height",
        `${bar.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--merch-host-bar-height");
    };
  }, [store.status, products.status]);
  const startSwipe = (e: PointerEvent<HTMLDivElement>) => {
    if (
      e.pointerType === "touch" &&
      (e.target as HTMLElement).closest(".merch-banner-art")
    )
      swipe.current = { x: e.clientX, y: e.clientY };
  };
  const endSwipe = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
      viewRoot.current
        ?.querySelector<HTMLButtonElement>(
          dx < 0 ? ".merch-banner-next" : ".merch-banner-prev",
        )
        ?.click();
  };
  if (!store.data || products.error)
    return (
      <main
        className="merchandise-host-message"
        aria-busy={store.status === "loading"}
      >
        {store.error || products.error ? (
          <>
            <p role="alert">{(store.error ?? products.error)!.message}</p>
            <button
              className="mt-4 min-h-11 rounded-xl bg-[#0055ff] px-5 font-semibold text-white"
              onClick={store.error ? store.reload : products.reload}
            >
              ลองโหลดอีกครั้ง
            </button>
          </>
        ) : (
          <p role="status">กำลังโหลดร้านของที่ระลึก</p>
        )}
      </main>
    );
  const add = (productId: string) => {
    if (addStarted.current) return;
    try {
      const destination = new URL(
        canonical ?? "/souvenirs",
        "https://internal.invalid",
      );
      destination.searchParams.delete("intentId");
      const intent: PurchaseIntent = {
        id: crypto.randomUUID(),
        eventCode,
        returnPath: destination.pathname + destination.search,
        selection: { productId, variantId: null, bundleSelections: [] },
        quantity: 1,
      };
      addStarted.current = intent.id;
      writePurchaseIntent(window.sessionStorage, intent);
      const path = purchaseIntentReturnPath(intent);
      router.push(token ? path : merchandiseLoginPath(path), { scroll: false });
    } catch {
      addStarted.current = null;
      toast.error(
        "ไม่สามารถเก็บรายการที่เลือกได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์",
      );
    }
  };
  const withDraft = (patch: Record<string, string | null>) =>
    change(pendingQuery.current ? patch : { q: query, ...patch });
  const header = (
    <>
      {store.data.state !== "open" && (
        <p className="merchandise-store-status" role="status">
          {storeLabels[store.data.state]}
        </p>
      )}
      {filters.kind === "single" && (
        <p className="merchandise-store-status">แสดงเฉพาะสินค้ารายชิ้น</p>
      )}
      <div className="mx-auto max-w-[1600px] px-4">
        <MerchandiseIntentResume
          intentId={filters.intentId}
          onAdded={added}
          onResult={resolved}
          onPending={pending}
        />
      </div>
    </>
  );
  return (
    <div
      ref={viewRoot}
      onPointerDown={startSwipe}
      onPointerUp={endSwipe}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      <StorefrontView
        mode="storefront"
        store={store.data}
        products={(products.data?.items ?? []).map((product) =>
          store.data!.state === "open"
            ? product
            : { ...product, purchasable: false },
        )}
        headerSlot={header}
        query={query}
        activeCategory={filters.categoryId ?? "all"}
        activeKind={filters.kind === "bundle" ? "bundle" : "all"}
        busy={products.status === "loading" || purchaseBusy}
        errorMessage={null}
        noMatches={Boolean(filters.query || filters.categoryId || filters.kind)}
        pagination={products.data?.pagination ?? null}
        primaryLabel={
          canBuy
            ? token
              ? "ดูตะกร้า"
              : "เข้าสู่ระบบเพื่อสั่งซื้อ"
            : storeLabels[store.data.state] || "ยังไม่มีสินค้าที่เปิดขาย"
        }
        primaryDisabled={!canBuy}
        onQuery={(value) => {
          setDraft({ source: search, value: value.slice(0, 200) });
          if (!value) change({ q: null });
        }}
        onCategory={(value) =>
          withDraft(
            value === "all"
              ? { categoryId: null, kind: null }
              : { categoryId: value },
          )
        }
        onKind={(value) =>
          withDraft({ kind: value === "all" ? null : "bundle" })
        }
        onPage={(page) =>
          withDraft({ page: String(query === filters.query ? page : 1) })
        }
        onProduct={(id) => router.push(`/souvenirs/products/${id}`)}
        onAdd={add}
        onPrimary={() =>
          router.push(
            token
              ? "/souvenirs/cart"
              : merchandiseLoginPath(canonical ?? "/souvenirs"),
          )
        }
        onRetry={products.reload}
      />
      {token && (
        <div className="merchandise-history-link">
          <Link href="/souvenirs/orders">คำสั่งซื้อของฉัน</Link>
        </div>
      )}
    </div>
  );
}
