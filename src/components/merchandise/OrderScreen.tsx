"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "@/i18n/routing";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseOrder } from "./useMerchandiseOrder";
import {
  acknowledgeAttemptRequest,
  acknowledgeOrderRequest,
  beginAttemptRequest,
  readOrderRequest,
  readAttemptRequest,
  type AttemptRequestRecord,
  attemptResultKnown,
} from "@/lib/merchandiseOrderRequest";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { MerchandiseApiError, merchandiseFailure } from "@/lib/merchandiseApi";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import {
  mayRequestQr,
  MERCHANDISE_ORDER_REFRESH_MS,
} from "@/lib/merchandisePayment";
import { usePaymentDeadline } from "./usePaymentDeadline";
import type { OrderDetail } from "@/types/merchandise";
import PaidOrder from "./PaidOrder";
import PaymentPanel from "./PaymentPanel";
import { OrderDelivery, OrderOriginal, OrderTimes } from "./OrderRecord";
export default function OrderScreen({ orderId }: { orderId: string }) {
  return (
    <MerchandiseAuthBoundary>
      <OrderLoader orderId={orderId} />
    </MerchandiseAuthBoundary>
  );
}
function OrderLoader({ orderId }: { orderId: string }) {
  const resource = useMerchandiseOrder(orderId),
    { store } = useMerchandise();
  const error = resource.error ?? store.error;
  if (!resource.data || error)
    return (
      <main className="merchandise-host-message">
        <Link href="/souvenirs/orders">คำสั่งซื้อของฉัน</Link>
        {error ? (
          <>
            <p role="alert">
              {error.status === 404 || error.status === 403
                ? "ไม่พบคำสั่งซื้อที่คุณเข้าถึงได้"
                : error.message}
            </p>
            {error.status === 401 ? (
              <Link
                className="merch-cart-secondary"
                href={merchandiseLoginPath(
                  `/souvenirs/orders/${orderId}`,
                  true,
                )}
              >
                เข้าสู่ระบบอีกครั้ง
              </Link>
            ) : (
              <button
                className="merch-cart-secondary"
                onClick={() => {
                  resource.reload();
                  if (store.error) store.reload();
                }}
              >
                ลองโหลดอีกครั้ง
              </button>
            )}
          </>
        ) : (
          <p role="status">กำลังโหลดคำสั่งซื้อ</p>
        )}
      </main>
    );
  return <OrderWorkspace resource={resource} />;
}
function OrderWorkspace({
  resource,
}: {
  resource: ReturnType<typeof useMerchandiseOrder>;
}) {
  const { api, eventCode, token, ownerId, cart } = useMerchandise(),
    order = resource.data!;
  const [operation, setOperation] = useState<"creating" | "checking" | null>(
      null,
    ),
    [notice, setNotice] = useState<string | null>(null),
    [verificationFailed, setVerificationFailed] = useState(false);
  const remaining = usePaymentDeadline(order.payment);
  const busy = operation !== null;
  const pending = useRef(false),
    active = useRef(false),
    automaticallyStarted = useRef(false),
    expiredChecked = useRef<string | null>(null),
    reading = useRef<Promise<OrderDetail | null> | null>(null),
    readAbort = useRef<AbortController | null>(null),
    bar = useRef<HTMLDivElement>(null);
  const owner = useRef({ token, ownerId, eventCode, orderId: order.id });
  useLayoutEffect(() => {
    active.current = true;
    owner.current = { token, ownerId, eventCode, orderId: order.id };
    return () => {
      active.current = false;
      readAbort.current?.abort();
    };
  }, [token, ownerId, eventCode, order.id]);
  const current = useCallback(
    () =>
      active.current &&
      owner.current.token === token &&
      owner.current.ownerId === ownerId &&
      owner.current.eventCode === eventCode &&
      owner.current.orderId === order.id,
    [token, ownerId, eventCode, order.id],
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
  }, [order.paymentStatus, order.fulfillment.status]);
  const accept = resource.accept,
    reloadCart = cart.reload;
  useEffect(() => {
    if (
      !token ||
      !ownerId ||
      !order.payment.attempt ||
      (![
        "qr_active",
        "paid",
        "qr_expired_open",
        "qr_expired_closed",
        "qr_expired_unavailable",
      ].includes(order.payment.state) &&
        order.payment.attempt.creationStatus !== "failed")
    )
      return;
    try {
      const record = readAttemptRequest(
        window.sessionStorage,
        eventCode,
        ownerId,
        order.id,
      );
      if (record && attemptResultKnown(record, order.payment))
        acknowledgeAttemptRequest(
          window.sessionStorage,
          eventCode,
          ownerId,
          order.id,
          record.key,
        );
    } catch {
      /* Preserve unresolved metadata rather than permitting a new request. */
    }
  }, [token, ownerId, eventCode, order.id, order.payment]);
  useEffect(() => {
    let live = true;
    void Promise.resolve().then(async () => {
      if (!live || !current() || !token || !ownerId) return;
      reloadCart();
      try {
        const record = readOrderRequest(
          window.sessionStorage,
          eventCode,
          ownerId,
        );
        if (!record) return;
        const status = await api.orderRequest(eventCode, token, record.key);
        if (
          live &&
          current() &&
          status.state === "completed" &&
          status.orderId === order.id
        )
          acknowledgeOrderRequest(
            window.sessionStorage,
            eventCode,
            ownerId,
            record.key,
          );
      } catch {
        /* Known order remains viewable; never create another from an unreadable key. */
      }
    });
    return () => {
      live = false;
    };
  }, [api, token, ownerId, eventCode, order.id, current, reloadCart]);
  const refresh = useCallback(
    (afterWrite = false) => {
      if (afterWrite && reading.current) {
        readAbort.current?.abort();
        reading.current = null;
      }
      if (reading.current) return reading.current;
      const controller = new AbortController();
      readAbort.current = controller;
      const request = api
        .order(order.id, token!, controller.signal)
        .then((value) => {
          if (!current() || controller.signal.aborted) return null;
          if (value.eventId !== order.eventId || value.buyer.id !== ownerId)
            throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
          accept(value);
          return value;
        })
        .catch((error) => {
          if (controller.signal.aborted) return null;
          throw error;
        })
        .finally(() => {
          if (reading.current === request) reading.current = null;
        });
      reading.current = request;
      return request;
    },
    [api, token, order.id, order.eventId, ownerId, current, accept],
  );
  const create = useCallback(async () => {
    if (
      pending.current ||
      !token ||
      !ownerId ||
      !mayRequestQr(order.payment) ||
      verificationFailed ||
      !current()
    )
      return;
    pending.current = true;
    setOperation("creating");
    setNotice(null);
    let record: AttemptRequestRecord | null = null;
    try {
      record = beginAttemptRequest(
        window.sessionStorage,
        eventCode,
        ownerId,
        order.id,
        order.effectiveRevision,
        crypto.randomUUID(),
        order.payment.attempt?.id ?? null,
      );
      const value = await api.createAttempt(
        order.id,
        token,
        { expectedOrderRevision: record.expectedOrderRevision },
        record.key,
      );
      if (!current()) return;
      if (value.payment.state === "qr_active" || value.payment.state === "paid")
        acknowledgeAttemptRequest(
          window.sessionStorage,
          eventCode,
          ownerId,
          order.id,
          record.key,
        );
      await refresh(true);
    } catch (error) {
      if (current()) {
        if (
          record &&
          error instanceof MerchandiseApiError &&
          error.status === 409 &&
          error.body.code === "MERCH_VERSION_CONFLICT"
        ) {
          try {
            acknowledgeAttemptRequest(
              window.sessionStorage,
              eventCode,
              ownerId,
              order.id,
              record.key,
            );
          } catch {
            /* Keep the old key if acknowledgement is denied. */
          }
        }
        setNotice(
          "ยังยืนยันผลสร้าง QR ไม่ได้ ระบบจะตรวจสอบออเดอร์เดิม กรุณาตรวจสอบอีกครั้ง",
        );
        try {
          await refresh(true);
        } catch {
          if (current())
            setNotice(
              "ยังตรวจสอบสถานะไม่ได้ กรุณาลองตรวจสอบอีกครั้ง โดยไม่สร้างคำสั่งซื้อใหม่",
            );
        }
      }
    } finally {
      if (current()) {
        pending.current = false;
        setOperation(null);
      }
    }
  }, [
    token,
    ownerId,
    order.id,
    order.payment,
    verificationFailed,
    order.effectiveRevision,
    current,
    eventCode,
    api,
    refresh,
  ]);
  useEffect(() => {
    let live = true;
    void Promise.resolve().then(() => {
      if (
        live &&
        current() &&
        !automaticallyStarted.current &&
        !order.payment.attempt &&
        order.payment.state === "not_created" &&
        order.payment.canRequestNewQr
      ) {
        automaticallyStarted.current = true;
        void create();
      }
    });
    return () => {
      live = false;
    };
  }, [
    order.payment.state,
    order.payment.attempt,
    order.payment.canRequestNewQr,
    create,
    current,
  ]);
  const check = useCallback(async () => {
    if (pending.current || !token || !current()) return;
    pending.current = true;
    setOperation("checking");
    try {
      const result = await api.checkPayment(order.id, token);
      if (current()) {
        if (
          result.payment.attempt?.expiresAt &&
          Date.parse(result.payment.attempt.expiresAt) <=
            Date.parse(result.payment.serverNow)
        )
          expiredChecked.current = `${result.payment.attempt.id}:${result.payment.attempt.expiresAt}`;
        await refresh(true);
        setVerificationFailed(false);
        setNotice(null);
      }
    } catch {
      if (current()) {
        setVerificationFailed(true);
        setNotice("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง");
      }
    } finally {
      if (current()) {
        pending.current = false;
        setOperation(null);
      }
    }
  }, [token, current, api, order.id, refresh]);
  const attemptId = order.payment.attempt?.id;
  useEffect(() => {
    const stamp = `${attemptId}:${order.payment.attempt?.expiresAt}`;
    if (
      remaining !== 0 ||
      !attemptId ||
      !order.payment.canCheck ||
      busy ||
      verificationFailed ||
      !["qr_active", "checking"].includes(order.payment.state) ||
      expiredChecked.current === stamp
    )
      return;
    let live = true;
    void Promise.resolve().then(() => {
      if (live && current()) {
        expiredChecked.current = stamp;
        void check();
      }
    });
    return () => {
      live = false;
    };
  }, [
    remaining,
    attemptId,
    order.payment.attempt?.expiresAt,
    order.payment.canCheck,
    order.payment.state,
    busy,
    verificationFailed,
    current,
    check,
  ]);
  useEffect(() => {
    const read = async (returning: boolean) => {
      if (
        document.visibilityState === "hidden" ||
        pending.current ||
        !current()
      )
        return;
      try {
        const latest = await refresh();
        if (
          returning &&
          latest?.payment.canCheck &&
          latest.payment.state === "checking"
        )
          void check();
      } catch {
        if (current())
          setNotice("โหลดสถานะคำสั่งซื้อไม่สำเร็จ กรุณาตรวจสอบอีกครั้ง");
      }
    };
    const wake = () => {
      void read(true);
    };
    const timer =
      order.paymentStatus === "paid"
        ? null
        : setInterval(() => {
            void read(false);
          }, MERCHANDISE_ORDER_REFRESH_MS);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("pageshow", wake);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pageshow", wake);
    };
  }, [current, refresh, check, order.paymentStatus]);
  if (order.paymentStatus === "paid")
    return <PaidOrder order={order} barRef={bar} />;
  const payment = verificationFailed
    ? {
        ...order.payment,
        state: "verification_unknown" as const,
        canRequestNewQr: false,
      }
    : operation === "checking" ||
        (remaining === 0 && order.payment.state === "qr_active")
      ? { ...order.payment, state: "checking" as const, canRequestNewQr: false }
      : order.payment;
  const reissue = mayRequestQr(payment) && payment.state === "qr_expired_open";
  const unknown = payment.state === "verification_unknown";
  const recipient = order.effective.recipient;
  return (
    <main className="merch-cart merch-order" aria-busy={busy}>
      <Link className="merch-cart-back" href="/souvenirs/orders">
        <ArrowLeft size={18} aria-hidden="true" />
        คำสั่งซื้อของฉัน
      </Link>
      <h1>ชำระเงิน</h1>
      <p className="merch-cart-muted">คำสั่งซื้อ {order.orderNumber}</p>
      <OrderDelivery order={order} />
      <OrderOriginal order={order} />
      {notice && !unknown && (
        <p className="merch-cart-notice" role="status">
          {notice}
        </p>
      )}
      <div className="merch-cart-grid">
        <PaymentPanel
          order={order}
          payment={payment}
          remaining={remaining}
          busy={busy}
          onCreate={() => void create()}
          creating={operation === "creating"}
        />
        <div>
          <section className="merch-review-section">
            <h2>ที่อยู่จัดส่ง</h2>
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
          </section>
          <section className="merch-review-section">
            <h2>
              <LockKeyhole size={18} aria-hidden="true" />
              ข้อมูลคำสั่งซื้อ
            </h2>
            {order.effective.items.map((item) => (
              <article className="merch-order-item" key={item.id}>
                <h3>
                  {item.nameTh} × {item.quantity}
                </h3>
                <p>
                  {[item.colorTh, item.sizeTh].filter(Boolean).join(" · ") ||
                    (item.kind === "bundle" ? "ชุดสินค้า" : "ไม่มีตัวเลือก")}
                </p>
                <p>{formatMinorBaht(item.lineTotalMinor)}</p>
                {item.components.length > 0 && (
                  <ul className="merch-cart-components">
                    {item.components.map((component, index) => (
                      <li key={index}>
                        {component.nameTh} × {component.quantityPerBundle} ·{" "}
                        {[component.colorTh, component.sizeTh]
                          .filter(Boolean)
                          .join(" · ") || "ไม่มีตัวเลือก"}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
            <p className="merch-cart-muted">
              ข้อมูลถูกล็อกหลังยืนยันคำสั่งซื้อ
            </p>
          </section>
          <OrderTimes order={order} />
          <p className="merch-order-support">
            หากต้องการแก้ไขคำสั่งซื้อ กรุณาติดต่อ{" "}
            <a
              href={`mailto:pr@pharmacycouncil.org?subject=${encodeURIComponent(`คำสั่งซื้อ ${order.orderNumber}`)}`}
            >
              pr@pharmacycouncil.org
            </a>{" "}
            พร้อมเลขคำสั่งซื้อ
          </p>
        </div>
      </div>
      <div
        className={`merch-cart-bar merch-order-bar${reissue ? " merch-order-reissue" : ""}`}
        ref={bar}
      >
        <button
          type="button"
          disabled={
            busy ||
            ["creating", "checking"].includes(payment.state) ||
            (!reissue && !order.payment.canCheck)
          }
          onClick={() => void (reissue ? create() : check())}
        >
          {operation === "creating"
            ? "กำลังสร้าง QR"
            : busy || payment.state === "checking"
              ? "กำลังตรวจสอบ"
              : reissue
                ? "ขอ QR ใหม่"
                : unknown
                  ? "ตรวจสอบอีกครั้ง"
                  : "ตรวจสอบการชำระเงิน"}
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
