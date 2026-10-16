"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { MerchandiseApiError, merchandiseFailure } from "@/lib/merchandiseApi";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { canCheckout, unavailableMessage } from "@/lib/merchandiseSelection";
import type {
  CartDto,
  CartItemPatch,
  CartLine,
  StoreDto,
} from "@/types/merchandise";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import CartRow from "./CartRow";
import { CheckoutBar } from "./CheckoutBar";
import { ShopToolbar } from "./ShopToolbar";

export default function CartScreen() {
  return (
    <MerchandiseAuthBoundary>
      <CartLoader />
    </MerchandiseAuthBoundary>
  );
}
function CartLoader() {
  const { cart, store } = useMerchandise();
  const error = cart.error ?? store.error;
  if (error || !cart.data || !store.data)
    return (
      <main className="merchandise-host-message">
        <Link href="/souvenirs">กลับหน้าร้าน</Link>
        {error ? (
          <>
            <p role="alert">{error.message}</p>
            {error.status === 401 ? (
              <Link
                className="merch-cart-secondary"
                href={merchandiseLoginPath("/souvenirs/cart", true)}
              >
                เข้าสู่ระบบอีกครั้ง
              </Link>
            ) : (
              <button
                className="merch-cart-secondary"
                onClick={() => {
                  cart.reload();
                  store.reload();
                }}
              >
                ลองโหลดอีกครั้ง
              </button>
            )}
          </>
        ) : (
          <p role="status">กำลังโหลดตะกร้า</p>
        )}
      </main>
    );
  return <CartWorkspace />;
}
function CartWorkspace() {
  const { api, eventCode, token, cart, store, setCart } = useMerchandise(),
    router = useRouter();
  const data = cart.data!,
    settings = store.data!;
  const acceptStore = store.accept;
  const [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false),
    [notice, setNotice] = useState<string | null>(null),
    [unauthorized, setUnauthorized] = useState(false);
  const [reset, setReset] = useState(0),
    [priceChanges, setPriceChanges] = useState<
      Record<string, { from: number; to: number }>
    >({});
  const pending = useRef(false),
    active = useRef(false),
    epoch = useRef(0),
    latest = useRef(data);
  const focusAfterWrite = useRef<{
    id: string;
    label: string | null;
    quantityId: string;
  } | null>(null);
  useEffect(() => {
    latest.current = data;
  });
  useLayoutEffect(() => {
    if (busy || !focusAfterWrite.current) return;
    const target = focusAfterWrite.current;
    focusAfterWrite.current = null;
    const matchingLabel = target.label
      ? Array.from(
          document.querySelectorAll<HTMLButtonElement>(
            ".merch-cart button[aria-label]",
          ),
        ).find(
          (button) =>
            !button.disabled &&
            button.getAttribute("aria-label") === target.label,
        )
      : null;
    const element = [
      target.id ? document.getElementById(target.id) : null,
      matchingLabel,
      document.getElementById(target.quantityId),
      document.getElementById("merch-cart-title"),
    ].find((candidate) => candidate && !candidate.matches(":disabled"));
    element?.focus();
  }, [busy, data.cartVersion, reset]);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  // Re-read cart and store. A write that starts meanwhile wins (epoch).
  const refresh = useCallback(async (): Promise<{
    cart: CartDto;
    store: StoreDto;
  } | null> => {
    const started = epoch.current;
    const [fresh, freshStore] = await Promise.all([
      api.cart(eventCode, token!),
      api.store(eventCode),
    ]);
    if (!active.current || epoch.current !== started) return null;
    const changes: Record<string, { from: number; to: number }> = {};
    for (const line of fresh.items) {
      const old = latest.current.items.find((i) => i.id === line.id);
      if (
        old?.unitPriceBaht != null &&
        line.unitPriceBaht !== null &&
        old.unitPriceBaht !== line.unitPriceBaht
      )
        changes[line.id] = {
          from: old.unitPriceBaht,
          to: line.unitPriceBaht,
        };
    }
    setPriceChanges((previous) => ({ ...previous, ...changes }));
    setCart(fresh);
    acceptStore(freshStore);
    return { cart: fresh, store: freshStore };
  }, [api, eventCode, token, setCart, acceptStore]);
  const run = useCallback(
    async (operation: () => Promise<void>, remember = true) => {
      if (pending.current || !token) return;
      pending.current = true;
      if (remember) {
        const element = document.activeElement as HTMLElement | null;
        focusAfterWrite.current = {
          id: element?.id ?? "",
          label: element?.getAttribute("aria-label") ?? null,
          quantityId:
            element?.closest("article")?.querySelector("input")?.id ?? "",
        };
      }
      setBusy(true);
      try {
        await operation();
      } catch (error) {
        if (!active.current) return;
        const failure =
          error instanceof MerchandiseApiError ? error : merchandiseFailure();
        setNotice(failure.message);
        setUnauthorized(failure.status === 401);
        setReset((v) => v + 1);
        if (failure.status === 401) setBlocked(true);
        else {
          try {
            await refresh();
            if (active.current) setBlocked(false);
          } catch {
            if (active.current) {
              setBlocked(true);
              setNotice(
                "ยังตรวจสอบตะกร้าล่าสุดไม่ได้ กรุณาลองโหลดอีกครั้งก่อนแก้ไขหรือดำเนินการต่อ",
              );
            }
          }
        }
      } finally {
        if (active.current) {
          pending.current = false;
          setBusy(false);
        }
      }
    },
    [token, refresh],
  );
  useEffect(() => {
    const quiet = () => {
      if (document.visibilityState !== "visible" || pending.current) return;
      refresh().catch((error: unknown) => {
        if (error instanceof MerchandiseApiError && error.status === 401) {
          setUnauthorized(true);
          setNotice(error.message);
        }
      });
    };
    window.addEventListener("focus", quiet);
    window.addEventListener("pageshow", quiet);
    document.addEventListener("visibilitychange", quiet);
    return () => {
      window.removeEventListener("focus", quiet);
      window.removeEventListener("pageshow", quiet);
      document.removeEventListener("visibilitychange", quiet);
    };
  }, [refresh]);
  const write = (op: () => Promise<CartDto>, done: string) =>
    void run(async () => {
      epoch.current++;
      const value = await op();
      if (!active.current) return;
      setCart(value);
      setReset((v) => v + 1);
      setNotice(done);
    });
  const update = (line: CartLine, patch: CartItemPatch) =>
    write(
      () => api.updateCartItem(eventCode, token!, line.id, patch),
      "บันทึกตะกร้าแล้ว",
    );
  const remove = (line: CartLine) =>
    write(
      () => api.removeCartItem(eventCode, token!, line.id),
      "นำสินค้าออกจากตะกร้าแล้ว",
    );
  const reload = () =>
    void run(async () => {
      const fresh = await refresh();
      if (fresh && active.current) setBlocked(false);
    }, false);
  const proceed = () =>
    void run(async () => {
      const fresh = await refresh();
      if (!fresh || !active.current) return;
      setBlocked(false);
      if (canCheckout(fresh.cart, fresh.store))
        router.push("/souvenirs/checkout");
      else
        setNotice(
          "กรุณาตรวจสอบรายการและสถานะเปิดรับพรีออเดอร์ก่อนดำเนินการต่อ",
        );
    }, false);
  const allowed =
    canCheckout(data, settings) && !busy && !blocked && !unauthorized;
  return (
    <main className="merch-cart">
      <ShopToolbar
        start={
          <Link href="/souvenirs" className="merch-cart-back">
            <ArrowLeft size={18} aria-hidden="true" />
            กลับ
          </Link>
        }
      />
      <h1 id="merch-cart-title" tabIndex={-1}>
        ตะกร้าสินค้า
      </h1>
      <p className="merch-cart-muted">{data.items.length} รายการ</p>
      <ol className="merch-checkout-steps" aria-label="ขั้นตอนสั่งซื้อ">
        {["ตะกร้า", "ที่อยู่", "ตรวจสอบ", "ชำระเงิน"].map((label, index) => (
          <li key={label} aria-current={index === 0 ? "step" : undefined}>
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {notice && (
        <div className="merch-cart-notice" role="status">
          <p>{notice}</p>
          {unauthorized ? (
            <Link
              className="merch-cart-secondary"
              href={merchandiseLoginPath("/souvenirs/cart", true)}
            >
              เข้าสู่ระบบอีกครั้ง
            </Link>
          ) : (
            <button
              className="merch-cart-secondary"
              disabled={busy}
              onClick={reload}
            >
              ลองโหลดอีกครั้ง
            </button>
          )}
        </div>
      )}
      {data.items.some((line) => !line.valid) && (
        <p className="merch-cart-notice" role="alert">
          มีรายการที่ไม่พร้อมขาย ระบบจะไม่เปลี่ยนตัวเลือกให้อัตโนมัติ
          กรุณาตรวจสอบรายการด้านล่าง
        </p>
      )}
      {settings.state !== "open" && (
        <p role="status">
          {unavailableMessage("STORE_NOT_OPEN", settings.state)} ·
          ยังดูตะกร้าและประวัติคำสั่งซื้อได้
        </p>
      )}
      <div className="merch-cart-grid merch-cart-grid-single">
        <section aria-label="รายการสินค้า">
          {data.items.length ? (
            data.items.map((line) => (
              <CartRow
                key={`${line.id}:${data.cartVersion}:${reset}`}
                line={line}
                storeState={settings.state}
                busy={busy || blocked || unauthorized}
                onUpdate={(patch) => update(line, patch)}
                onRemove={() => remove(line)}
                priceChange={priceChanges[line.id]}
              />
            ))
          ) : (
            <div className="merch-cart-empty">
              <h2>ยังไม่มีสินค้าในตะกร้า</h2>
              <Link className="merch-cart-secondary" href="/souvenirs">
                เลือกสินค้า
              </Link>
            </div>
          )}
        </section>
      </div>
      <CheckoutBar totalBaht={data.amounts?.totalBaht ?? null}>
        <button type="button" disabled={!allowed} onClick={proceed}>
          {busy ? "กำลังตรวจสอบตะกร้า" : "ดำเนินการสั่งซื้อ"}
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </CheckoutBar>
    </main>
  );
}
