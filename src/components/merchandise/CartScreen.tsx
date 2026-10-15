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
import { canCheckout } from "@/lib/merchandiseCart";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import type { CartLine, LineSelection } from "@/types/merchandise";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import CartRow from "./CartRow";

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
  const { api, eventCode, token, ownerId, cart, store } = useMerchandise(),
    router = useRouter();
  const data = cart.data!,
    settings = store.data!;
  const acceptCart = cart.accept,
    acceptStore = store.accept;
  const [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false),
    [notice, setNotice] = useState<string | null>(null),
    [unauthorized, setUnauthorized] = useState(false);
  const [reset, setReset] = useState(0),
    [priceChanges, setPriceChanges] = useState<
      Record<string, { from: string; to: string }>
    >({});
  const pending = useRef(false),
    active = useRef(false),
    session = useRef({ token, ownerId, eventCode }),
    bar = useRef<HTMLDivElement>(null);
  const focusAfterWrite = useRef<{
    id: string;
    label: string | null;
    quantityId: string;
  } | null>(null);
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
  }, [busy, data.revision, reset]);
  useLayoutEffect(() => {
    active.current = true;
    session.current = { token, ownerId, eventCode };
    return () => {
      active.current = false;
    };
  }, [token, ownerId, eventCode]);
  const current = useCallback(
    () =>
      active.current &&
      session.current.token === token &&
      session.current.ownerId === ownerId &&
      session.current.eventCode === eventCode,
    [token, ownerId, eventCode],
  );
  useLayoutEffect(() => {
    const element = bar.current;
    if (!element) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--merch-host-bar-height",
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--merch-host-bar-height");
    };
  }, []);
  const synchronize = useCallback(async () => {
    const [fresh, freshStore] = await Promise.all([
      api.cart(eventCode, token!),
      api.store(eventCode),
    ]);
    if (!current()) return null;
    if (
      fresh.eventId !== settings.eventId ||
      freshStore.eventId !== settings.eventId
    )
      throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
    const changes: Record<string, { from: string; to: string }> = {};
    for (const line of fresh.items) {
      const old = data.items.find((i) => i.id === line.id);
      if (
        old?.unitPriceMinor !== null &&
        old?.unitPriceMinor !== undefined &&
        line.unitPriceMinor !== null &&
        old.unitPriceMinor !== line.unitPriceMinor
      )
        changes[line.id] = {
          from: old.unitPriceMinor,
          to: line.unitPriceMinor,
        };
    }
    setPriceChanges((previous) => ({ ...previous, ...changes }));
    acceptCart(fresh);
    acceptStore(freshStore);
    return { cart: fresh, store: freshStore };
  }, [
    api,
    eventCode,
    token,
    current,
    settings.eventId,
    data.items,
    acceptCart,
    acceptStore,
  ]);
  const run = useCallback(
    async (
      operation: (() => Promise<void>) | null = null,
      checkout = false,
    ) => {
      if (pending.current || !token) return;
      pending.current = true;
      if (operation) {
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
        if (operation) await operation();
        else {
          const fresh = await synchronize();
          if (!fresh || !current()) return;
          setBlocked(false);
          if (checkout && canCheckout(fresh.cart, fresh.store))
            router.push("/souvenirs/checkout");
          else if (checkout)
            setNotice(
              "กรุณาตรวจสอบรายการและสถานะเปิดรับพรีออเดอร์ก่อนดำเนินการต่อ",
            );
        }
      } catch (error) {
        if (!current()) return;
        const failure =
          error instanceof MerchandiseApiError ? error : merchandiseFailure();
        setNotice(
          failure.status === 409
            ? "ข้อมูลตะกร้ามีการเปลี่ยนแปลง โหลดข้อมูลล่าสุดแล้ว กรุณาตรวจสอบอีกครั้ง"
            : "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลตะกร้าล่าสุดก่อนลองอีกครั้ง",
        );
        setUnauthorized(failure.status === 401);
        setReset((v) => v + 1);
        if (operation && failure.status !== 401) {
          try {
            await synchronize();
            if (current()) setBlocked(false);
          } catch {
            if (current()) {
              setBlocked(true);
              setNotice(
                "ยังตรวจสอบตะกร้าล่าสุดไม่ได้ กรุณาลองโหลดอีกครั้งก่อนแก้ไขหรือดำเนินการต่อ",
              );
            }
          }
        } else setBlocked(true);
      } finally {
        if (current()) {
          pending.current = false;
          setBusy(false);
        }
      }
    },
    [token, synchronize, current, router],
  );
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void run();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [run]);
  const update = (
    line: CartLine,
    quantity: number,
    selection?: LineSelection,
  ) =>
    void run(async () => {
      const value = await api.update(eventCode, token!, line.id, {
        quantity,
        variantId: selection?.variantId ?? line.variantId,
        bundleSelections: selection?.bundleSelections ?? line.bundleSelections,
        expectedRevision: data.revision,
      });
      if (!current()) return;
      if (value.eventId !== settings.eventId)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE", true);
      cart.accept(value);
      setReset((v) => v + 1);
      setNotice("บันทึกตะกร้าแล้ว");
    });
  const remove = (line: CartLine) =>
    void run(async () => {
      const value = await api.remove(eventCode, token!, line.id, data.revision);
      if (!current()) return;
      if (value.eventId !== settings.eventId)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE", true);
      cart.accept(value);
      setNotice("นำสินค้าออกจากตะกร้าแล้ว");
    });
  const allowed =
    canCheckout(data, settings) && !busy && !blocked && !unauthorized;
  return (
    <main className="merch-cart">
      <Link href="/souvenirs" className="merch-cart-back">
        <ArrowLeft size={18} aria-hidden="true" />
        กลับ
      </Link>
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
              onClick={() => void run()}
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
          {settings.state === "closed"
            ? "ปิดรับพรีออเดอร์แล้ว"
            : "ยังไม่เปิดรับพรีออเดอร์"}{" "}
          · ยังดูตะกร้าและประวัติคำสั่งซื้อได้
        </p>
      )}
      <div className="merch-cart-grid">
        <section aria-label="รายการสินค้า">
          {data.items.length ? (
            data.items.map((line) => (
              <CartRow
                key={`${line.id}:${data.revision}:${reset}`}
                line={line}
                busy={busy || blocked || unauthorized}
                onUpdate={(quantity, selection) =>
                  update(line, quantity, selection)
                }
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
        <aside className="merch-cart-summary" aria-label="สรุปคำสั่งซื้อ">
          <h2>สรุปคำสั่งซื้อ</h2>
          {data.amounts ? (
            <dl>
              <div>
                <dt>ค่าสินค้า</dt>
                <dd>{formatMinorBaht(data.amounts.subtotalMinor)}</dd>
              </div>
              <div>
                <dt>ค่าจัดส่ง</dt>
                <dd>{formatMinorBaht(data.amounts.shippingMinor)}</dd>
              </div>
              <div className="merch-cart-total">
                <dt>ยอดชำระรวม</dt>
                <dd>{formatMinorBaht(data.amounts.totalMinor)}</dd>
              </div>
            </dl>
          ) : (
            <p>
              ยังสรุปยอดไม่ได้
              {data.items.length
                ? " กรุณาตรวจสอบรายการที่ไม่พร้อมขาย"
                : " กรุณาเลือกสินค้าก่อน"}
            </p>
          )}
          <p className="merch-cart-muted">
            จัดส่งภายในประเทศไทย
            <br />
            รวมสินค้าทุกรายการในออเดอร์เดียวกัน
            <br />
            จัดส่งพร้อมกันเมื่อสินค้าพร้อมครบ
            <br />
            ค่าจัดส่ง 50 บาทต่อออเดอร์
          </p>
        </aside>
      </div>
      <Link className="merch-cart-secondary" href="/souvenirs/orders">
        คำสั่งซื้อของฉัน
      </Link>
      <div className="merch-cart-bar" ref={bar}>
        <button
          type="button"
          disabled={!allowed}
          onClick={() => void run(null, true)}
        >
          {busy ? "กำลังตรวจสอบตะกร้า" : "ดำเนินการต่อ"}
          {data.amounts && <> · {formatMinorBaht(data.amounts.totalMinor)}</>}
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
