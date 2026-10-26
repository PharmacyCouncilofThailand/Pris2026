"use client";
import { useCallback, useMemo, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Package } from "lucide-react";
import { Link } from "@/i18n/routing";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
import {
  merchandiseReturnPath,
  merchandiseLoginPath,
} from "@/lib/merchandiseRoutes";
import { formatMerchandiseTime, formatBaht } from "@/lib/merchandiseFormat";
import OrderStatus from "./OrderStatus";
export default function OrderHistory() {
  const search = useSearchParams().toString();
  const path = merchandiseReturnPath(
    "/souvenirs/orders" + (search ? `?${search}` : ""),
  );
  const page = path
    ? Number(new URLSearchParams(path.split("?")[1]).get("page") ?? "1")
    : null;
  return (
    <MerchandiseAuthBoundary returnPath={path ?? "/souvenirs/orders"}>
      {page ? (
        <HistoryLoader page={page} />
      ) : (
        <main className="merch-cart merch-history">
          <h1>คำสั่งซื้อของฉัน</h1>
          <p role="alert">พารามิเตอร์หน้าประวัติไม่ถูกต้อง</p>
          <Link className="merch-cart-secondary" href="/souvenirs/orders">
            กลับหน้าประวัติ
          </Link>
        </main>
      )}
    </MerchandiseAuthBoundary>
  );
}
function HistoryLoader({ page }: { page: number }) {
  const { api, eventCode, token, ownerIdentity } = useMerchandise();
  const scope = useMemo(
    () => (token ? { token, eventCode, ownerIdentity, page } : null),
    [token, eventCode, ownerIdentity, page],
  );
  const load = useCallback(
    async (signal: AbortSignal) => {
      return api.orders(eventCode, token!, { page, limit: 10 }, signal);
    },
    [api, eventCode, token, page],
  );
  const resource = useMerchandiseResource(scope, load),
    error = resource.error;
  const bar = useRef<HTMLDivElement>(null),
    empty = !error && resource.data?.items.length === 0 && page === 1;
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
  }, [empty]);
  return (
    <main className="merch-cart merch-history">
      <Link className="merch-cart-back" href="/souvenirs">
        <ArrowLeft size={18} aria-hidden="true" />
        กลับหน้าร้าน
      </Link>
      <h1>คำสั่งซื้อของฉัน</h1>
      <p className="merch-history-intro">
        ดูสถานะชำระเงินและการจัดส่งของแต่ละออเดอร์
      </p>
      {error ? (
        <section className="merch-order-message">
          <p role="alert">{error.message}</p>
          {error.status === 401 ? (
            <Link
              className="merch-cart-secondary"
              href={merchandiseLoginPath(
                `/souvenirs/orders?page=${page}`,
                true,
              )}
            >
              เข้าสู่ระบบอีกครั้ง
            </Link>
          ) : (
            <button
              type="button"
              className="merch-cart-secondary"
              onClick={() => {
                resource.reload();
              }}
            >
              ลองโหลดอีกครั้ง
            </button>
          )}
        </section>
      ) : !resource.data ? (
        <p role="status">กำลังโหลดคำสั่งซื้อ</p>
      ) : resource.data.items.length === 0 ? (
        <section className="merch-order-message merch-history-empty">
          <Package size={36} aria-hidden="true" />
          <h2>
            {page === 1 ? "ยังไม่มีคำสั่งซื้อ" : "ไม่พบคำสั่งซื้อในหน้านี้"}
          </h2>
          <p>
            {page === 1
              ? "เมื่อสั่งซื้อแล้ว คุณสามารถดูสถานะการชำระเงินและจัดส่งได้ที่นี่"
              : "กลับหน้าประวัติเพื่อดูคำสั่งซื้อของคุณ"}
          </p>
          {page !== 1 && (
            <Link className="merch-cart-secondary" href="/souvenirs/orders">
              กลับหน้าประวัติ
            </Link>
          )}
        </section>
      ) : (
        <div className="merch-history-content">
          <section className="merch-history-list" aria-label="รายการคำสั่งซื้อ">
            {resource.data.items.map((order) => (
              <article key={order.id} className="merch-history-row">
                <div className="merch-history-row-top">
                  <h2>{order.orderNumber}</h2>
                  <time dateTime={order.createdAt}>
                    {formatMerchandiseTime(order.createdAt)}
                  </time>
                </div>
                <OrderStatus order={order} />
                <div className="merch-history-row-bottom">
                  <strong>{formatBaht(order.amounts.totalBaht)}</strong>
                  {order.paymentStatus !== "pending" && (
                    <Link
                      href={`/souvenirs/orders/${order.id}`}
                      aria-label={`ดูรายละเอียด ${order.orderNumber}`}
                    >
                      ดูรายละเอียด
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </section>
          {resource.data.pagination.totalPages > 1 && (
            <nav
              className="merch-history-pagination"
              aria-label="หน้าประวัติคำสั่งซื้อ"
            >
              {page > 1 && (
                <Link
                  className="merch-cart-secondary"
                  href={`/souvenirs/orders?page=${page - 1}`}
                >
                  หน้าก่อนหน้า
                </Link>
              )}
              <p>
                หน้า {page} จาก {resource.data.pagination.totalPages}
              </p>
              {page < resource.data.pagination.totalPages && (
                <Link
                  className="merch-cart-secondary"
                  href={`/souvenirs/orders?page=${page + 1}`}
                >
                  หน้าถัดไป
                </Link>
              )}
            </nav>
          )}
        </div>
      )}
      {empty && (
        <div className="merch-cart-bar merch-order-bar" ref={bar}>
          <Link href="/souvenirs">
            เลือกสินค้า
            <ChevronRight size={22} aria-hidden="true" />
          </Link>
        </div>
      )}
    </main>
  );
}
