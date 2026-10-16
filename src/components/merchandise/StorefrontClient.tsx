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
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
import { MerchandiseIntentResume } from "./MerchandiseAuthBoundary";
import { StorefrontView } from "./StorefrontView";
import { filterCatalog } from "@/lib/merchandiseCatalog";
import { formatMerchandiseTime } from "@/lib/merchandiseFormat";
import {
  savePurchaseIntent,
  type PurchaseIntent,
} from "@/lib/merchandiseIntent";
import {
  merchandiseLoginPath,
  merchandiseReturnPath,
} from "@/lib/merchandiseRoutes";
import {
  defaultSelection,
  selectionComplete,
  unavailableMessage,
} from "@/lib/merchandiseSelection";
import type { ProductDto } from "@/types/merchandise";

const PAGE_SIZE = 12;
const MAX_PAGES = 50;

export default function StorefrontClient() {
  const { store, api, eventCode, token } = useMerchandise(),
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

  // Search and filters run on the full published catalog, loaded once (spec 6.1).
  const loadAll = useCallback(
    async (signal: AbortSignal) => {
      const first = await api.products(
        eventCode,
        { limit: 100, page: 1 },
        signal,
      );
      const items: ProductDto[] = [...first.items];
      const pages = Math.min(first.pagination.totalPages, MAX_PAGES);
      for (let page = 2; page <= pages; page++)
        items.push(
          ...(await api.products(eventCode, { limit: 100, page }, signal))
            .items,
        );
      return items;
    },
    [api, eventCode],
  );
  const catalog = useMerchandiseResource(eventCode, loadAll);
  const view = useMemo(
    () =>
      filterCatalog(
        catalog.data ?? [],
        {
          q: query,
          categoryId: filters.categoryId,
          kind: filters.kind ?? undefined,
          page: filters.page,
        },
        PAGE_SIZE,
      ),
    [catalog.data, query, filters.categoryId, filters.kind, filters.page],
  );

  const addStarted = useRef(false);
  useEffect(() => {
    if (!filters.intentId) addStarted.current = false;
  }, [filters.intentId]);
  const purchaseBusy = Boolean(token && filters.intentId);
  const canBuy =
    store.data?.state === "open" &&
    Boolean(catalog.data?.some((product) => product.purchasable));
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
  }, [store.status, catalog.status]);
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
  if (!store.data || catalog.error)
    return (
      <main
        className="merchandise-host-message"
        aria-busy={store.status === "loading"}
      >
        {store.error || catalog.error ? (
          <>
            <p role="alert">{(store.error ?? catalog.error)!.message}</p>
            <button
              className="mt-4 min-h-11 rounded-xl bg-[#0055ff] px-5 font-semibold text-white"
              onClick={store.error ? store.reload : catalog.reload}
            >
              ลองโหลดอีกครั้ง
            </button>
          </>
        ) : (
          <p role="status">กำลังโหลดร้านของที่ระลึก</p>
        )}
      </main>
    );
  const state = store.data.state;
  const add = (productId: string) => {
    if (addStarted.current) return;
    const product = catalog.data?.find((p) => p.id === productId);
    if (!product) return;
    const selection = defaultSelection(product);
    if (!selectionComplete(product, selection)) {
      router.push(`/souvenirs/products/${productId}`);
      return;
    }
    try {
      const destination = new URL(
        canonical ?? "/souvenirs",
        "https://internal.invalid",
      );
      const id = crypto.randomUUID();
      destination.searchParams.set("intentId", id);
      const returnPath = destination.pathname + destination.search;
      const intent: PurchaseIntent = {
        id,
        eventCode,
        returnPath,
        productId,
        selection,
        quantity: 1,
      };
      savePurchaseIntent(window.sessionStorage, intent);
      addStarted.current = true;
      router.push(token ? returnPath : merchandiseLoginPath(returnPath), {
        scroll: false,
      });
    } catch {
      addStarted.current = false;
      toast.error(
        "ไม่สามารถเก็บรายการที่เลือกได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์",
      );
    }
  };
  const withDraft = (patch: Record<string, string | null>) =>
    change(pendingQuery.current ? patch : { q: query, ...patch });
  const header = (
    <>
      {state !== "open" && (
        <p className="merchandise-store-status" role="status">
          {unavailableMessage("STORE_NOT_OPEN", state)}
        </p>
      )}
      {state === "not_open" && store.data.opensAt && (
        <p className="merchandise-store-note merchandise-store-opens">
          เปิดรับ {formatMerchandiseTime(store.data.opensAt)}
        </p>
      )}
      {store.data.productionInfoTh && (
        <p className="merchandise-store-note">{store.data.productionInfoTh}</p>
      )}
      {store.data.shippingInfoTh && (
        <p className="merchandise-store-note">{store.data.shippingInfoTh}</p>
      )}
      <div className="mx-auto max-w-[1600px] px-4">
        <MerchandiseIntentResume intentId={filters.intentId} />
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
        store={store.data}
        products={view.items}
        headerSlot={header}
        query={query}
        activeCategory={filters.categoryId ?? "all"}
        activeKind={filters.kind === "bundle" ? "bundle" : "all"}
        busy={catalog.status === "loading" || purchaseBusy}
        errorMessage={null}
        noMatches={Boolean(query || filters.categoryId || filters.kind)}
        pagination={
          catalog.data
            ? {
                page: view.page,
                limit: PAGE_SIZE,
                total: view.total,
                totalPages: view.totalPages,
              }
            : null
        }
        primaryLabel={
          canBuy
            ? token
              ? "ดูตะกร้า"
              : "เข้าสู่ระบบเพื่อสั่งซื้อ"
            : state !== "open"
              ? unavailableMessage("STORE_NOT_OPEN", state)
              : "ยังไม่มีสินค้าที่เปิดขาย"
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
        onPage={(page) => withDraft({ page: String(page) })}
        onProduct={(id) => router.push(`/souvenirs/products/${id}`)}
        onAdd={add}
        onPrimary={() =>
          router.push(
            token
              ? "/souvenirs/cart"
              : merchandiseLoginPath(canonical ?? "/souvenirs"),
          )
        }
        onRetry={catalog.reload}
      />
      {token && (
        <div className="merchandise-history-link">
          <Link href="/souvenirs/orders">คำสั่งซื้อของฉัน</Link>
        </div>
      )}
    </div>
  );
}
