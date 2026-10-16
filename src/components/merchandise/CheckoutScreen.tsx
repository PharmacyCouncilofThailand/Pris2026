"use client";
import { useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import { canCheckout, describeLine } from "@/lib/merchandiseSelection";
import { formatBaht } from "@/lib/merchandiseFormat";
import {
  formatRecipientLine,
  validateRecipient,
} from "@/lib/merchandiseRecipient";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import type { CartDto, Recipient } from "@/types/merchandise";
import { CheckoutBar } from "./CheckoutBar";
import RecipientForm from "./RecipientForm";
import { useMerchandiseCheckout } from "./useMerchandiseCheckout";

export default function CheckoutScreen() {
  return (
    <MerchandiseAuthBoundary>
      <CheckoutLoader />
    </MerchandiseAuthBoundary>
  );
}
function CheckoutLoader() {
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
  return <CheckoutWorkspace />;
}
function CheckoutWorkspace() {
  const { user } = useAuth();
  const { store, cart: contextCart } = useMerchandise();
  const checkout = useMerchandiseCheckout();
  const { step, status, message, cart, loading } = checkout;
  const [returned, setReturned] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const review = step === "review";
  const storeData = store.data!;
  const eligible = cart ? canCheckout(cart, storeData) : false;
  const uncertain = status === "uncertain";
  const submitting = status === "submitting";
  const validated = validateRecipient(checkout.draft);
  useLayoutEffect(() => {
    if (review) {
      heading.current?.focus();
      window.scrollTo(0, 0);
    }
  }, [review]);
  const blockedReason =
    checkout.closed || storeData.state === "closed"
      ? "ปิดรับพรีออเดอร์แล้ว"
      : cart && !eligible
        ? "ตะกร้ายังไม่พร้อมสำหรับสั่งซื้อ"
        : null;
  return (
    <main className="merch-cart merch-checkout">
      {review ? (
        !uncertain && (
          <button
            className="merch-cart-back"
            type="button"
            disabled={submitting}
            onClick={() => {
              setReturned(true);
              checkout.back();
            }}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            กลับไปแก้ข้อมูลผู้รับ
          </button>
        )
      ) : (
        <Link className="merch-cart-back" href="/souvenirs/cart">
          <ArrowLeft size={18} aria-hidden="true" />
          กลับตะกร้า
        </Link>
      )}
      <h1 ref={heading} tabIndex={-1}>
        {review ? "ตรวจสอบคำสั่งซื้อ" : "ข้อมูลผู้รับ"}
      </h1>
      <ol className="merch-checkout-steps" aria-label="ขั้นตอนสั่งซื้อ">
        {["ตะกร้า", "ที่อยู่", "ตรวจสอบ", "ชำระเงิน"].map((label, index) => {
          const current = review ? 2 : 1;
          return (
            <li
              key={label}
              aria-current={index === current ? "step" : undefined}
              data-completed={index < current}
            >
              <span>
                {index < current ? (
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
      {message && (
        <div
          className="merch-cart-notice"
          role={status === "error" ? "alert" : "status"}
        >
          {message}
          {uncertain && (
            <>
              {" "}
              <Link href="/souvenirs/orders">คำสั่งซื้อของฉัน</Link>
            </>
          )}
        </div>
      )}
      {blockedReason && (
        <p className="merch-cart-notice">
          {blockedReason}{" "}
          <Link href="/souvenirs/cart">กลับไปตรวจสอบตะกร้า</Link>
        </p>
      )}
      <div className="merch-cart-grid merch-cart-grid-single">
        <section>
          {!review ? (
            <RecipientForm
              value={checkout.draft}
              onChange={checkout.setDraft}
              onSubmit={checkout.toReview}
              errors={checkout.errors}
              busy={false}
              buyerEmail={
                user?.email ?? contextCart.data?.buyerDefaults.email ?? ""
              }
              focusName={returned}
            />
          ) : !cart ? (
            loading ? (
              <p role="status">กำลังตรวจสอบตะกร้า</p>
            ) : (
              <button
                className="merch-cart-secondary"
                type="button"
                onClick={() => void checkout.reloadReview()}
              >
                ลองโหลดตะกร้าอีกครั้ง
              </button>
            )
          ) : (
            <ReviewBody
              cart={cart}
              recipient={validated.ok ? validated.value : null}
            />
          )}
        </section>
      </div>
      {!review ? (
        <CheckoutBar totalBaht={contextCart.data?.amounts?.totalBaht ?? null}>
          <button
            type="submit"
            form="merch-recipient-form"
            disabled={!canCheckout(contextCart.data!, storeData)}
          >
            ตรวจสอบคำสั่งซื้อ
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        </CheckoutBar>
      ) : (
        <CheckoutBar totalBaht={cart?.amounts?.totalBaht ?? null}>
          {uncertain ? (
            <button
              type="button"
              disabled={checkout.blocked}
              onClick={() => void checkout.retry()}
            >
              ลองอีกครั้ง
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled={
                submitting ||
                loading ||
                !eligible ||
                checkout.closed ||
                checkout.blocked
              }
              onClick={() => void checkout.confirm()}
            >
              {submitting
                ? "กำลังยืนยันคำสั่งซื้อ"
                : `ยืนยันคำสั่งซื้อ${cart?.amounts ? " · " + formatBaht(cart.amounts.totalBaht) : ""}`}
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          )}
        </CheckoutBar>
      )}
    </main>
  );
}
function ReviewBody({
  cart,
  recipient,
}: {
  cart: CartDto;
  recipient: Recipient | null;
}) {
  const info = useId();
  return (
    <>
      <section
        className="merch-review-section"
        aria-labelledby={`${info}-address`}
      >
        <h2 id={`${info}-address`}>ที่อยู่จัดส่ง</h2>
        {recipient && (
          <>
            <p className="merch-review-address">
              {formatRecipientLine(recipient)}
            </p>
            {recipient.deliveryNote && (
              <p className="merch-review-note">
                หมายเหตุจัดส่ง: {recipient.deliveryNote}
              </p>
            )}
          </>
        )}
      </section>
      <section
        className="merch-review-section"
        aria-labelledby={`${info}-items`}
      >
        <h2 id={`${info}-items`}>รายการสินค้า</h2>
        {cart.items.map((line) => {
          const image = line.product?.images[0];
          const detail = describeLine(line);
          return (
            <article className="merch-review-item" key={line.id}>
              {image && (
                <Image
                  unoptimized
                  src={image.url}
                  alt=""
                  width={64}
                  height={72}
                />
              )}
              <div>
                <h3>{line.product?.nameTh ?? "สินค้านี้ไม่มีแล้ว"}</h3>
                {detail && <p className="merch-cart-muted">{detail}</p>}
                <p className="merch-review-price">
                  <span>
                    {line.unitPriceBaht !== null
                      ? formatBaht(line.unitPriceBaht)
                      : ""}
                  </span>
                  <span className="merch-review-qty">x{line.quantity}</span>
                </p>
              </div>
            </article>
          );
        })}
      </section>
      <section
        className="merch-review-section"
        aria-labelledby={`${info}-method`}
      >
        <h2 id={`${info}-method`}>ช่องทางการชำระเงิน</h2>
        <label className="merch-payment-option">
          <Image
            unoptimized
            src="/assets/Img/payment/thai-qr.webp"
            alt=""
            width={32}
            height={32}
          />
          QR พร้อมเพย์
          <input type="radio" name="payment-method" checked readOnly />
        </label>
      </section>
      <section
        className="merch-review-section"
        aria-labelledby={`${info}-payment`}
      >
        <h2 id={`${info}-payment`}>ข้อมูลการชำระเงิน</h2>
        {cart.amounts && (
          <dl className="merch-review-amounts">
            <div>
              <dt>รวมคำสั่งซื้อ</dt>
              <dd>{formatBaht(cart.amounts.subtotalBaht)}</dd>
            </div>
            <div>
              <dt>ค่าจัดส่ง</dt>
              <dd>{formatBaht(cart.amounts.shippingBaht)}</dd>
            </div>
            <div className="merch-review-amounts-total">
              <dt>ยอดชำระเงินทั้งหมด</dt>
              <dd>{formatBaht(cart.amounts.totalBaht)}</dd>
            </div>
          </dl>
        )}
      </section>
      <p className="merch-review-lock">
        เมื่อยืนยันคำสั่งซื้อแล้ว จะไม่สามารถแก้ไขรายการสินค้า จำนวน ตัวเลือก
        หรือข้อมูลผู้รับได้ด้วยตนเอง
      </p>
    </>
  );
}
