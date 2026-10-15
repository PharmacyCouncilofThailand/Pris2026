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
} from "@/lib/merchandiseOrderRequest";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { MerchandiseApiError, merchandiseFailure } from "@/lib/merchandiseApi";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import PaymentPanel from "./PaymentPanel";
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
    [notice, setNotice] = useState<string | null>(null);
  const busy = operation !== null;
  const pending = useRef(false),
    active = useRef(false),
    automaticallyStarted = useRef(false),
    bar = useRef<HTMLDivElement>(null);
  const owner = useRef({ token, ownerId, eventCode, orderId: order.id });
  useLayoutEffect(() => {
    active.current = true;
    owner.current = { token, ownerId, eventCode, orderId: order.id };
    return () => {
      active.current = false;
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
  }, []);
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
      if (record)
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
  }, [
    token,
    ownerId,
    eventCode,
    order.id,
    order.payment.state,
    order.payment.attempt,
  ]);
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
  const refresh = useCallback(async () => {
    const value = await api.order(order.id, token!);
    if (!current()) return null;
    if (value.eventId !== order.eventId || value.buyer.id !== ownerId)
      throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
    accept(value);
    return value;
  }, [api, token, order.id, order.eventId, ownerId, current, accept]);
  const create = useCallback(async () => {
    if (
      pending.current ||
      !token ||
      !ownerId ||
      !order.payment.canRequestNewQr ||
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
      await refresh();
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
          await refresh();
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
    order.payment.canRequestNewQr,
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
      await api.checkPayment(order.id, token);
      if (current()) {
        await refresh();
        setNotice(null);
      }
    } catch {
      if (current()) setNotice("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง");
    } finally {
      if (current()) {
        pending.current = false;
        setOperation(null);
      }
    }
  }, [token, current, api, order.id, refresh]);
  const expired = useCallback(() => {
    void check();
  }, [check]);
  const recipient = order.effective.recipient;
  return (
    <main className="merch-cart merch-order">
      <Link className="merch-cart-back" href="/souvenirs/orders">
        <ArrowLeft size={18} aria-hidden="true" />
        คำสั่งซื้อของฉัน
      </Link>
      <h1>{order.paymentStatus === "paid" ? "ชำระเงินสำเร็จ" : "ชำระเงิน"}</h1>
      <p className="merch-cart-muted">คำสั่งซื้อ {order.orderNumber}</p>
      {notice && (
        <p className="merch-cart-notice" role="status">
          {notice}
        </p>
      )}
      <div className="merch-cart-grid">
        <PaymentPanel
          order={order}
          busy={busy}
          onExpired={expired}
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
      <div className="merch-cart-bar merch-order-bar" ref={bar}>
        <button
          type="button"
          disabled={busy || !order.payment.canCheck}
          onClick={() => void check()}
        >
          {busy ? "กำลังตรวจสอบ" : "ตรวจสอบการชำระเงิน"}
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
