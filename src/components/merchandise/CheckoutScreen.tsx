"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import { canCheckout, describeLine } from "@/lib/merchandiseSelection";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import { validateRecipient } from "@/lib/merchandiseRecipient";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import type { Amounts, CartDto, Recipient } from "@/types/merchandise";
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
  const bar = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const review = step === "review";
  const storeData = store.data!;
  const eligible = cart ? canCheckout(cart, storeData) : false;
  const uncertain = status === "uncertain";
  const submitting = status === "submitting";
  const validated = validateRecipient(checkout.draft);
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
      <div className="merch-cart-grid">
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
              productionInfoTh={storeData.productionInfoTh}
              shippingInfoTh={storeData.shippingInfoTh}
            />
          )}
        </section>
        <CheckoutSummary
          amounts={(review ? cart : contextCart.data)?.amounts ?? null}
        />
      </div>
      <div className="merch-cart-bar" ref={bar}>
        {!review ? (
          <button
            type="submit"
            form="merch-recipient-form"
            disabled={!canCheckout(contextCart.data!, storeData)}
          >
            ตรวจสอบคำสั่งซื้อ
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        ) : uncertain ? (
          <button
            type="button"
            disabled={loading || !eligible || checkout.blocked}
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
              : `ยืนยันคำสั่งซื้อ${cart?.amounts ? " · " + formatMinorBaht(cart.amounts.totalMinor) : ""}`}
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        )}
      </div>
    </main>
  );
}
function ReviewBody({
  cart,
  recipient,
  productionInfoTh,
  shippingInfoTh,
}: {
  cart: CartDto;
  recipient: Recipient | null;
  productionInfoTh: string | null;
  shippingInfoTh: string | null;
}) {
  return (
    <>
      <section aria-label="รายการที่ตรวจสอบ">
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
                  width={80}
                  height={92}
                />
              )}
              <div>
                <h2>{line.product?.nameTh ?? "สินค้านี้ไม่มีแล้ว"}</h2>
                {detail && <p className="merch-cart-muted">{detail}</p>}
                {line.unitPriceMinor !== null && (
                  <p className="merch-cart-unit-price">
                    {formatMinorBaht(line.unitPriceMinor)}
                  </p>
                )}
                <p>
                  {line.quantity}{" "}
                  {line.product?.kind === "bundle" ? "ชุด" : "ชิ้น"}
                  {line.lineTotalMinor !== null &&
                    ` · รวม ${formatMinorBaht(line.lineTotalMinor)}`}
                </p>
              </div>
            </article>
          );
        })}
      </section>
      <section className="merch-review-section">
        <h2>ที่อยู่จัดส่ง</h2>
        {recipient && (
          <address>
            <strong>{recipient.fullName}</strong>
            <br />
            {recipient.phone}
            <br />
            {recipient.company && (
              <>
                {recipient.company}
                <br />
              </>
            )}
            {recipient.addressLine}
            <br />
            {recipient.subdistrict} {recipient.district}
            <br />
            {recipient.province} {recipient.postalCode}
            <br />
            ประเทศไทย
            {recipient.deliveryNote && (
              <p>หมายเหตุจัดส่ง: {recipient.deliveryNote}</p>
            )}
          </address>
        )}
      </section>
      <section className="merch-review-section">
        <h2>ชำระเงินด้วย</h2>
        <p className="merch-payment-method">Thai QR PromptPay</p>
        <p>ค่าสินค้าและค่าจัดส่งเท่านั้น ไม่มีค่าธรรมเนียมชำระเงินเพิ่ม</p>
      </section>
      <p className="merch-review-lock">
        เมื่อยืนยันคำสั่งซื้อแล้ว จะไม่สามารถแก้ไขรายการสินค้า จำนวน ตัวเลือก
        หรือข้อมูลผู้รับได้ด้วยตนเอง
      </p>
      {productionInfoTh && (
        <section className="merch-review-section">
          <h2>การผลิต</h2>
          <p>{productionInfoTh}</p>
        </section>
      )}
      {shippingInfoTh && (
        <section className="merch-review-section">
          <h2>การจัดส่ง</h2>
          <p>{shippingInfoTh}</p>
        </section>
      )}
    </>
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
