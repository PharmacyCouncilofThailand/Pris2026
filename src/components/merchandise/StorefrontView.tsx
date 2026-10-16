"use client";
/* eslint-disable @next/next/no-img-element -- Portable React renderer has no Next.js dependency; media dimensions come from the API. */
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ProductDto, StoreDto } from "@/types/merchandise";
import { formatBaht } from "@/lib/merchandiseFormat";
import { Icon } from "./storefront-icons";
export interface StorefrontViewProps {
  store: StoreDto;
  products: ProductDto[];
  headerSlot: ReactNode | null;
  query: string;
  activeCategory: string;
  activeKind: "all" | "bundle";
  busy: boolean;
  errorMessage: string | null;
  noMatches: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  primaryLabel: string;
  primaryDisabled: boolean;
  onQuery(value: string): void;
  onCategory(value: string): void;
  onKind(value: "all" | "bundle"): void;
  onPage(value: number): void;
  onProduct(productId: string): void;
  onAdd(productId: string): void;
  onPrimary(): void;
  onRetry(): void;
}
function BannerCarousel({ store }: { store: StoreDto }) {
  const banners = store.banners,
    [index, setIndex] = useState(0);
  if (!banners.length) return null;
  const current = index % banners.length,
    banner = banners[current],
    move = (offset: number) =>
      setIndex((current + offset + banners.length) % banners.length);
  const art = (
    <img
      src={banner.image.url}
      alt={`แบนเนอร์ประชาสัมพันธ์ ${current + 1}`}
      width={banner.image.width}
      height={banner.image.height}
      fetchPriority="high"
    />
  );
  return (
    <section
      className="merch-banner"
      aria-label="แบนเนอร์ประชาสัมพันธ์"
      aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (banners.length < 2) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      }}
    >
      <div className="merch-banner-art">
        {banner.linkUrl ? (
          <a href={banner.linkUrl} rel="noopener noreferrer">
            {art}
          </a>
        ) : (
          art
        )}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              className="merch-banner-arrow merch-banner-prev"
              aria-label="แบนเนอร์ก่อนหน้า"
              onClick={() => move(-1)}
            >
              <Icon name="left" />
            </button>
            <button
              type="button"
              className="merch-banner-arrow merch-banner-next"
              aria-label="แบนเนอร์ถัดไป"
              onClick={() => move(1)}
            >
              <Icon name="right" />
            </button>
          </>
        )}
      </div>
      <span className="merch-sr-only" aria-live="polite">
        แบนเนอร์ {current + 1} จาก {banners.length}
      </span>
      {banners.length > 1 && (
        <div className="merch-banner-dots">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`ดูแบนเนอร์ ${i + 1}`}
              aria-current={current === i ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
function ProductCard({
  product,
  storeOpen,
  busy,
  onProduct,
  onAdd,
}: {
  product: ProductDto;
  storeOpen: boolean;
  busy: boolean;
  onProduct(id: string): void;
  onAdd(id: string): void;
}) {
  const image = product.images[0],
    [failed, setFailed] = useState(false);
  const titleId = useId();
  return (
    <article className="merch-product" data-product-id={product.id}>
      <button
        type="button"
        className="merch-product-media"
        aria-label={`ดูรายละเอียด ${product.nameTh}`}
        onClick={() => onProduct(product.id)}
      >
        {image && !failed ? (
          <img
            key={image.id}
            src={image.url}
            alt={product.nameTh}
            width={image.width}
            height={image.height}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="merch-image-empty">
            {image ? "โหลดรูปภาพไม่สำเร็จ" : "ยังไม่มีรูปสินค้า"}
          </span>
        )}
        <span className="merch-preorder">พรีออเดอร์</span>
      </button>
      <div className="merch-product-body">
        <h3 id={titleId}>{product.nameTh}</h3>
        <p className="merch-price">
          {product.price
            ? `${product.price.kind === "from" ? "เริ่มต้น " : ""}${formatBaht(product.price.amountBaht)}`
            : "ยังไม่กำหนดราคา"}
        </p>
        {storeOpen && (
          <button
            type="button"
            className="merch-add"
            aria-describedby={titleId}
            disabled={busy || !product.purchasable}
            onClick={() => onAdd(product.id)}
          >
            <Icon name="cart" />
            <span>เพิ่มลงตะกร้า</span>
          </button>
        )}
      </div>
    </article>
  );
}
export function StorefrontView(props: StorefrontViewProps) {
  const root = useRef<HTMLDivElement>(null),
    bar = useRef<HTMLDivElement>(null),
    searchId = useId();
  useEffect(() => {
    const target = bar.current,
      wrapper = root.current;
    if (!target || !wrapper) return;
    const measure = () =>
      wrapper.style.setProperty(
        "--merch-bar-height",
        `${target.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target, { box: "border-box" });
    return () => observer.disconnect();
  }, []);
  const products = props.products,
    storeOpen = props.store.state === "open";
  return (
    <div className="merch-store" ref={root}>
      {props.headerSlot}
      <h1 className="merch-sr-only">ร้านของที่ระลึก</h1>
      <main className="merch-store-content">
        <BannerCarousel store={props.store} />
        <div className="merch-search">
          <Icon name="search" />
          <label className="merch-sr-only" htmlFor={searchId}>
            ค้นหาสินค้า
          </label>
          <input
            id={searchId}
            type="search"
            value={props.query}
            placeholder="ค้นหาสินค้า"
            onChange={(e) => props.onQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <nav className="merch-categories" aria-label="หมวดสินค้า">
          <button
            type="button"
            className="merch-pill"
            aria-pressed={
              props.activeCategory === "all" && props.activeKind === "all"
            }
            onClick={() => props.onCategory("all")}
          >
            <Icon name="grid" />
            ทั้งหมด
          </button>
          {[...props.store.categories]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => (
              <button
                type="button"
                key={c.id}
                className="merch-pill"
                aria-pressed={props.activeCategory === c.id}
                onClick={() => props.onCategory(c.id)}
              >
                <Icon name="tag" />
                {c.nameTh}
              </button>
            ))}
          <button
            type="button"
            className="merch-pill"
            aria-pressed={props.activeKind === "bundle"}
            onClick={() =>
              props.onKind(props.activeKind === "bundle" ? "all" : "bundle")
            }
          >
            <Icon name="gift" />
            ชุดสินค้า
          </button>
        </nav>
        <div className="merch-catalog-heading">
          <h2>
            {props.activeKind === "bundle" ? "ชุดสินค้า" : "สินค้าทั้งหมด"}
          </h2>
          <p>
            <Icon name="truck" />
            <span>จัดส่งทั่วไทย 50 บาทต่อออเดอร์</span>
          </p>
        </div>
        {props.errorMessage && (
          <div className="merch-message merch-error" role="alert">
            <p>{props.errorMessage}</p>
            <button
              type="button"
              className="merch-secondary"
              disabled={props.busy}
              onClick={props.onRetry}
            >
              ลองโหลดอีกครั้ง
            </button>
          </div>
        )}
        <div aria-busy={props.busy}>
          {props.busy && !products.length ? (
            <p className="merch-message" role="status">
              กำลังโหลดสินค้า
            </p>
          ) : !products.length ? (
            <div className="merch-message" role="status">
              <p>
                {props.noMatches
                  ? "ไม่พบสินค้าตามคำค้นหาหรือหมวดที่เลือก"
                  : "ยังไม่มีสินค้าที่เปิดแสดง"}
              </p>
              {props.noMatches && (
                <button
                  type="button"
                  className="merch-secondary"
                  onClick={() => {
                    props.onQuery("");
                    props.onCategory("all");
                    props.onKind("all");
                  }}
                >
                  ดูสินค้าทั้งหมด
                </button>
              )}
            </div>
          ) : (
            <div className="merch-products">
              {products.map((product) => (
                <ProductCard
                  key={`${product.id}:${product.images[0]?.id ?? "no-image"}`}
                  product={product}
                  storeOpen={storeOpen}
                  busy={props.busy}
                  onProduct={props.onProduct}
                  onAdd={props.onAdd}
                />
              ))}
            </div>
          )}
        </div>
        {props.pagination && props.pagination.totalPages > 1 && (
          <nav className="merch-pagination" aria-label="หน้ารายการสินค้า">
            <button
              type="button"
              className="merch-secondary"
              disabled={props.busy || props.pagination.page <= 1}
              onClick={() => props.onPage(props.pagination!.page - 1)}
            >
              ก่อนหน้า
            </button>
            <p>
              หน้า {props.pagination.page} / {props.pagination.totalPages}
            </p>
            <button
              type="button"
              className="merch-secondary"
              disabled={
                props.busy ||
                props.pagination.page >= props.pagination.totalPages
              }
              onClick={() => props.onPage(props.pagination!.page + 1)}
            >
              ถัดไป
            </button>
          </nav>
        )}
      </main>
      <div className="merch-bottom-bar" ref={bar}>
        <button
          type="button"
          className="merch-primary"
          disabled={props.busy || props.primaryDisabled}
          onClick={props.onPrimary}
        >
          <Icon name="lock" />
          <span>{props.primaryLabel}</span>
          <span className="merch-primary-arrow">
            <Icon name="right" />
          </span>
        </button>
      </div>
    </div>
  );
}
