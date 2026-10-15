"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import {
  defaultRecipient,
  validateRecipientDraft,
  type RecipientErrors,
} from "@/lib/merchandiseRecipient";
import { canCheckout } from "@/lib/merchandiseCart";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import { MerchandiseApiError, merchandiseFailure } from "@/lib/merchandiseApi";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import type { QuoteDto, Amounts } from "@/types/merchandise";
import RecipientForm from "./RecipientForm";

export default function CheckoutScreen({
  onConfirm,
}: {
  onConfirm?: (quote: QuoteDto) => void;
}) {
  return (
    <MerchandiseAuthBoundary>
      <CheckoutLoader onConfirm={onConfirm} />
    </MerchandiseAuthBoundary>
  );
}
function CheckoutLoader({
  onConfirm,
}: {
  onConfirm?: (quote: QuoteDto) => void;
}) {
  const { cart, store } = useMerchandise();
  const error = cart.error ?? store.error;
  if (error || !cart.data || !store.data)
    return (
      <main className="merchandise-host-message">
        <Link href="/souvenirs/cart">กลับตะกร้า</Link>
        {error ? (
          <>
            <p role="alert">{error.message}</p>
            {error.status === 401 ? (
              <Link
                className="merch-cart-secondary"
                href={merchandiseLoginPath("/souvenirs/checkout", true)}
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
          <p role="status">กำลังตรวจสอบตะกร้า</p>
        )}
      </main>
    );
  return <CheckoutWorkspace onConfirm={onConfirm} />;
}
function CheckoutWorkspace({
  onConfirm,
}: {
  onConfirm?: (quote: QuoteDto) => void;
}) {
  const { user } = useAuth();
  const { api, eventCode, token, ownerId, cart, store } = useMerchandise();
  const [recipient, setRecipient] = useState(() =>
    defaultRecipient(user ?? {}),
  );
  const [errors, setErrors] = useState<RecipientErrors>({}),
    [quote, setQuote] = useState<QuoteDto | null>(null);
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState<string | null>(null),
    [unauthorized, setUnauthorized] = useState(false),
    [focusName, setFocusName] = useState(false);
  const active = useRef(false),
    pending = useRef(false),
    abort = useRef<AbortController | null>(null),
    bar = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      abort.current?.abort();
    };
  }, [token, ownerId, eventCode]);
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
  useLayoutEffect(() => {
    if (quote) {
      heading.current?.focus();
      window.scrollTo(0, 0);
    }
  }, [quote]);
  const submit = async () => {
    if (pending.current || !token || !canCheckout(cart.data!, store.data!)) return;
    const validated = validateRecipientDraft(recipient);
    setErrors(validated.errors);
    if (!validated.recipient) return;
    pending.current = true;
    setBusy(true);
    setUnauthorized(false);
    const controller = new AbortController();
    abort.current = controller;
    const current = () => active.current && !controller.signal.aborted;
    let currentCart = cart.data!,
      currentStore = store.data!,
      refreshed = false;
    try {
      let value: QuoteDto;
      try {
        value = await api.quote(
          eventCode,
          token,
          {
            expectedCartRevision: currentCart.revision,
            recipient: validated.recipient,
          },
          controller.signal,
        );
      } catch (error) {
        if (
          !(error instanceof MerchandiseApiError) ||
          error.status !== 409 ||
          !current()
        )
          throw error;
        [currentCart, currentStore] = await Promise.all([
          api.cart(eventCode, token, controller.signal),
          api.store(eventCode, controller.signal),
        ]);
        if (!current()) return;
        if (
          currentCart.eventId !== store.data!.eventId ||
          currentStore.eventId !== store.data!.eventId
        )
          throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
        cart.accept(currentCart);
        store.accept(currentStore);
        refreshed = true;
        if (!canCheckout(currentCart, currentStore)) {
          setNotice(
            currentStore.state === "closed"
              ? "ปิดรับพรีออเดอร์แล้ว ไม่สามารถสร้างคำสั่งซื้อใหม่ได้"
              : "มีรายการที่ไม่พร้อมขาย กรุณากลับไปตรวจสอบตะกร้า",
          );
          return;
        }
        value = await api.quote(
          eventCode,
          token,
          {
            expectedCartRevision: currentCart.revision,
            recipient: validated.recipient,
          },
          controller.signal,
        );
      }
      if (!current()) return;
      if (value.cartRevision !== currentCart.revision)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      const changed =
        refreshed ||
        value.amounts.totalMinor !== currentCart.amounts?.totalMinor ||
        value.items.some((item) => {
          const line = currentCart.items.find((c) => c.id === item.id);
          return (
            !line ||
            line.quantity !== item.quantity ||
            line.unitPriceMinor !== item.unitPriceMinor
          );
        });
      setRecipient(value.recipient);
      setQuote(value);
      setNotice(
        changed
          ? "รายการหรือราคามีการเปลี่ยนแปลง กรุณาตรวจสอบยอดและรายละเอียดล่าสุดอีกครั้งก่อนยืนยัน"
          : null,
      );
    } catch (error) {
      if (!current()) return;
      setUnauthorized(
        error instanceof MerchandiseApiError && error.status === 401,
      );
      setNotice(
        "ตรวจสอบคำสั่งซื้อไม่สำเร็จ ยังไม่ได้สร้างคำสั่งซื้อ กรุณาลองอีกครั้ง",
      );
    } finally {
      if (current()) {
        pending.current = false;
        setBusy(false);
      }
    }
  };
  const eligible = canCheckout(cart.data!, store.data!);
  const amounts = quote?.amounts ?? cart.data!.amounts;
  return (
    <main className="merch-cart merch-checkout">
      {quote ? (
        <button
          className="merch-cart-back"
          type="button"
          onClick={() => {
            setQuote(null);
            setFocusName(true);
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          กลับไปแก้ข้อมูลผู้รับ
        </button>
      ) : (
        <Link className="merch-cart-back" href="/souvenirs/cart">
          <ArrowLeft size={18} aria-hidden="true" />
          กลับตะกร้า
        </Link>
      )}
      <h1 ref={heading} tabIndex={-1}>
        {quote ? "ตรวจสอบคำสั่งซื้อ" : "ข้อมูลผู้รับ"}
      </h1>
      <ol className="merch-checkout-steps" aria-label="ขั้นตอนสั่งซื้อ">
        {["ตะกร้า", "ที่อยู่", "ตรวจสอบ", "ชำระเงิน"].map((label, index) => {
          const step = quote ? 2 : 1;
          return (
            <li
              key={label}
              aria-current={index === step ? "step" : undefined}
              data-completed={index < step}
            >
              <span>
                {index < step ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ol>
      {notice && (
        <div className="merch-cart-notice" role="status">
          {notice}
          {unauthorized && (
            <Link
              className="merch-cart-secondary"
              href={merchandiseLoginPath("/souvenirs/checkout", true)}
            >
              เข้าสู่ระบบอีกครั้ง
            </Link>
          )}
        </div>
      )}
      {!eligible && (
        <p className="merch-cart-notice">
          {store.data!.state === "closed"
            ? "ปิดรับพรีออเดอร์แล้ว"
            : "ตะกร้ายังไม่พร้อมสำหรับสั่งซื้อ"}{" "}
          <Link href="/souvenirs/cart">กลับไปตรวจสอบตะกร้า</Link>
        </p>
      )}
      <div className="merch-cart-grid">
        <section>
          {!quote ? (
            <RecipientForm
              value={recipient}
              onChange={(value) => {
                setRecipient(value);
                setErrors({});
              }}
              onSubmit={() => void submit()}
              errors={errors}
              busy={busy}
              buyerEmail={user?.email ?? ""}
              focusName={focusName}
            />
          ) : (
            <>
              <section aria-label="รายการที่ตรวจสอบ">
                {quote.items.map((item) => {
                  const image = cart.data!.items.find(
                    (line) => line.id === item.id,
                  )?.product?.images[0];
                  return (
                    <article className="merch-review-item" key={item.id}>
                      {image && (
                        <Image
                          unoptimized
                          src={image.url}
                          alt={image.altTh}
                          width={80}
                          height={92}
                        />
                      )}
                      <div>
                        <h2>{item.nameTh}</h2>
                        <p className="merch-cart-muted">
                          {[item.colorTh, item.sizeTh]
                            .filter(Boolean)
                            .join(" · ") ||
                            (item.kind === "bundle"
                              ? "ชุดสินค้า"
                              : "ไม่มีตัวเลือก")}
                        </p>
                        <p className="merch-cart-unit-price">
                          {formatMinorBaht(item.unitPriceMinor)}
                        </p>
                        <p>
                          {item.quantity}{" "}
                          {item.kind === "bundle" ? "ชุด" : "ชิ้น"} · รวม{" "}
                          {formatMinorBaht(item.lineTotalMinor)}
                        </p>
                        {item.components.length > 0 && (
                          <ul className="merch-cart-components">
                            {item.components.map((c, index) => (
                              <li key={index}>
                                {c.nameTh} × {c.quantityPerBundle} ·{" "}
                                {[c.colorTh, c.sizeTh]
                                  .filter(Boolean)
                                  .join(" · ") || "ไม่มีตัวเลือก"}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
              <section className="merch-review-section">
                <div className="merch-review-title">
                  <h2>ที่อยู่จัดส่ง</h2>
                  <button
                    className="merch-cart-secondary"
                    type="button"
                    onClick={() => {
                      setQuote(null);
                      setFocusName(true);
                    }}
                  >
                    แก้ไขข้อมูลผู้รับ
                  </button>
                </div>
                <address>
                  <strong>{quote.recipient.fullName}</strong>
                  <br />
                  {quote.recipient.phone}
                  <br />
                  {quote.recipient.company && (
                    <>
                      {quote.recipient.company}
                      <br />
                    </>
                  )}
                  {quote.recipient.addressLine}
                  <br />
                  {quote.recipient.subdistrict} {quote.recipient.district}
                  <br />
                  {quote.recipient.province} {quote.recipient.postalCode}
                  <br />
                  ประเทศไทย
                  {quote.recipient.deliveryNote && (
                    <p>หมายเหตุจัดส่ง: {quote.recipient.deliveryNote}</p>
                  )}
                </address>
              </section>
              <section className="merch-review-section">
                <h2>ชำระเงินด้วย</h2>
                <p className="merch-payment-method">Thai QR PromptPay</p>
                <p>
                  ค่าสินค้าและค่าจัดส่งเท่านั้น ไม่มีค่าธรรมเนียมชำระเงินเพิ่ม
                </p>
              </section>
              <p className="merch-review-lock">
                เมื่อยืนยันคำสั่งซื้อแล้ว จะไม่สามารถแก้ไขรายการสินค้า จำนวน
                ตัวเลือก หรือข้อมูลผู้รับได้ด้วยตนเอง
              </p>
              {quote.productionInfoTh && (
                <section className="merch-review-section">
                  <h2>การผลิต</h2>
                  <p>{quote.productionInfoTh}</p>
                </section>
              )}
              {quote.shippingInfoTh && (
                <section className="merch-review-section">
                  <h2>การจัดส่ง</h2>
                  <p>{quote.shippingInfoTh}</p>
                </section>
              )}
            </>
          )}
        </section>
        <CheckoutSummary amounts={amounts} />
      </div>
      <div className="merch-cart-bar" ref={bar}>
        {quote ? (
          <button
            type="button"
            disabled={busy || !eligible || !onConfirm}
            onClick={() => onConfirm?.(quote)}
          >
            ยืนยันคำสั่งซื้อ · {formatMinorBaht(quote.amounts.totalMinor)}
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            form="merch-recipient-form"
            disabled={busy || !eligible || unauthorized}
          >
            {busy ? "กำลังตรวจสอบคำสั่งซื้อ" : "ตรวจสอบคำสั่งซื้อ"}
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        )}
      </div>
    </main>
  );
}
function CheckoutSummary({ amounts }: { amounts: Amounts | null }) {
  return (
    <aside className="merch-cart-summary" aria-label="สรุปคำสั่งซื้อ">
      <h2>สรุปคำสั่งซื้อ</h2>
      {amounts ? (
        <dl>
          <div>
            <dt>ค่าสินค้า</dt>
            <dd>{formatMinorBaht(amounts.subtotalMinor)}</dd>
          </div>
          <div>
            <dt>ค่าจัดส่ง</dt>
            <dd>{formatMinorBaht(amounts.shippingMinor)}</dd>
          </div>
          <div className="merch-cart-total">
            <dt>ยอดชำระรวม</dt>
            <dd>{formatMinorBaht(amounts.totalMinor)}</dd>
          </div>
        </dl>
      ) : (
        <p>ยังสรุปยอดไม่ได้ กรุณาตรวจสอบตะกร้า</p>
      )}
      <p className="merch-cart-muted">
        สินค้าพรีออเดอร์ · จัดส่งภายในประเทศไทย
        <br />
        จัดส่งพร้อมกันเมื่อสินค้าพร้อมครบ ใช้ที่อยู่เดียวต่อออเดอร์
        <br />
        ค่าจัดส่ง 50 บาทต่อออเดอร์
      </p>
    </aside>
  );
}
