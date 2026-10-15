"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import type { LineSelection, ProductDto, StoreDto } from "@/types/merchandise";
import {
  initialSelection,
  parseQuantity,
  selectedPriceMinor,
  selectionReady,
} from "@/lib/merchandiseSelection";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import { isMerchandiseId, merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import {
  purchaseIntentReturnPath,
  readPurchaseIntent,
  writePurchaseIntent,
  type IntentResult,
} from "@/lib/merchandiseIntent";
import { MerchandiseApiError } from "@/lib/merchandiseApi";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseIntentResume } from "./MerchandiseAuthBoundary";
import VariantSelector from "./VariantSelector";
import BundleSelector from "./BundleSelector";

export default function ProductDetail({
  product: original,
  store: originalStore,
}: {
  product: ProductDto;
  store: StoreDto;
}) {
  const { api, eventCode, token, ownerId, cart } = useMerchandise();
  const search = useSearchParams(),
    router = useRouter();
  const rawIntent = search.get("intentId"),
    intentId = isMerchandiseId(rawIntent) ? rawIntent : null;
  const [product, setProduct] = useState(original),
    [store, setStore] = useState(originalStore);
  const [selection, setSelection] = useState<LineSelection>(() =>
    initialSelection(original),
  );
  const [quantity, setQuantity] = useState("1"),
    [restored, setRestored] = useState(false);
  const [resolution, setResolution] = useState<{
    id: string;
    busy: boolean;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const started = useRef(false),
    active = useRef(true),
    barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    let current = true;
    Promise.resolve().then(() => {
      if (!current) return;
      if (intentId) {
        const intent = readPurchaseIntent(window.sessionStorage, eventCode);
        if (
          intent?.id === intentId &&
          intent.selection.productId === original.id &&
          (intent.buyerId === undefined || intent.buyerId === ownerId)
        ) {
          const fixed = initialSelection(original).bundleSelections;
          setSelection({
            ...intent.selection,
            bundleSelections: [
              ...fixed.filter(
                (c) =>
                  !intent.selection.bundleSelections.some(
                    (s) => s.componentId === c.componentId,
                  ),
              ),
              ...intent.selection.bundleSelections,
            ],
          });
          setQuantity(String(intent.quantity));
        }
      }
      setRestored(true);
    });
    return () => {
      current = false;
    };
  }, [intentId, eventCode, original, ownerId]);
  useLayoutEffect(() => {
    const bar = barRef.current;
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
  }, []);
  const pending = useCallback(
    (id: string) => setResolution({ id, busy: true }),
    [],
  );
  const { reload } = cart;
  const added = useCallback(() => reload(), [reload]);
  const result = useCallback(
    (id: string, value: IntentResult) => {
      const busy = value.kind === "error" && value.uncertain;
      setResolution({ id, busy });
      if (!busy) started.current = false;
      if (
        value.kind === "needs_selection" ||
        (value.kind === "error" &&
          value.error instanceof MerchandiseApiError &&
          value.error.status === 409)
      ) {
        setNotice(
          "ข้อมูลสินค้ามีการเปลี่ยนแปลง กรุณาตรวจสอบตัวเลือกและราคาอีกครั้ง",
        );
        setRefreshing(true);
        void Promise.all([
          api.product(eventCode, original.id),
          api.store(eventCode),
        ])
          .then(([fresh, freshStore]) => {
            if (
              !active.current ||
              fresh.eventId !== original.eventId ||
              freshStore.eventId !== original.eventId
            )
              return;
            setProduct(fresh);
            setStore(freshStore);
            setRefreshing(false);
          })
          .catch(() => {
            if (active.current)
              setNotice(
                "โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณาลองโหลดหน้าอีกครั้งก่อนเพิ่มสินค้า",
              );
          });
      }
    },
    [api, eventCode, original.id, original.eventId],
  );
  const busy = Boolean(
    token && intentId && (resolution?.id !== intentId || resolution.busy),
  );
  const count = parseQuantity(quantity),
    price = selectedPriceMinor(product, selection);
  const allowed =
    store.state === "open" &&
    selectionReady(product, selection) &&
    price !== null &&
    count !== null &&
    !busy &&
    !refreshing &&
    restored;
  const add = () => {
    if (!allowed || started.current || count === null) return;
    started.current = true;
    try {
      const intent = {
        id: crypto.randomUUID(),
        eventCode,
        returnPath: `/souvenirs/products/${product.id}`,
        selection,
        quantity: count,
      };
      writePurchaseIntent(window.sessionStorage, intent);
      const path = purchaseIntentReturnPath(intent);
      router.push(token ? path : merchandiseLoginPath(path), { scroll: false });
    } catch {
      started.current = false;
      setNotice(
        "ไม่สามารถเก็บรายการที่เลือกได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์",
      );
    }
  };
  return (
    <main className="merch-detail">
      <Link className="merch-detail-back" href="/souvenirs">
        <ArrowLeft size={18} aria-hidden="true" /> กลับ
      </Link>
      <h1>{product.nameTh}</h1>
      <div className="merch-detail-grid">
        <div className="merch-detail-gallery">
          {product.images.map((image, index) => (
            <figure key={image.id}>
              <Image
                unoptimized
                src={image.url}
                alt={image.altTh}
                width={image.width}
                height={image.height}
                loading={index ? "lazy" : "eager"}
              />
              {index === 0 && <figcaption>พรีออเดอร์</figcaption>}
            </figure>
          ))}
        </div>
        <div className="merch-detail-info">
          {product.kind === "bundle" && (
            <span className="merch-detail-tag">ชุดสินค้า</span>
          )}
          <p className="merch-detail-price" aria-live="polite">
            {price !== null
              ? formatMinorBaht(price)
              : product.optionMode !== "none" || product.kind === "bundle"
                ? "กรุณาเลือกตัวเลือกสินค้า"
                : "ยังไม่เปิดขาย"}
            {price !== null && (
              <small> / {product.kind === "bundle" ? "ชุด" : "ชิ้น"}</small>
            )}
          </p>
          {product.descriptionTh && (
            <p className="merch-detail-description">{product.descriptionTh}</p>
          )}
          {notice && (
            <p role="alert" className="merch-detail-notice">
              {notice}
            </p>
          )}
          {product.kind === "bundle" ? (
            <BundleSelector
              key={`${product.id}:${product.version}:${restored}`}
              product={product}
              selection={selection}
              disabled={busy}
              onChange={setSelection}
            />
          ) : (
            product.optionMode !== "none" && (
              <VariantSelector
                key={`${product.id}:${product.version}:${restored}`}
                variants={product.variants}
                selectedId={selection.variantId}
                disabled={busy}
                onChange={(variantId) =>
                  setSelection((s) => ({ ...s, variantId }))
                }
              />
            )
          )}
          {product.sizeInfoTh && (
            <section className="merch-detail-description">
              <h2>ข้อมูลขนาด</h2>
              <p>{product.sizeInfoTh}</p>
            </section>
          )}
          <div className="merch-detail-quantity">
            <label htmlFor="merch-product-quantity">
              {product.kind === "bundle" ? "จำนวนชุด" : "จำนวน"}
            </label>
            <div>
              <button
                type="button"
                aria-label="ลดจำนวน"
                disabled={busy || count === null || count <= 1}
                onClick={() => setQuantity(String(count! - 1))}
              >
                <Minus size={18} aria-hidden="true" />
              </button>
              <input
                id="merch-product-quantity"
                inputMode="numeric"
                type="text"
                value={quantity}
                disabled={busy}
                aria-invalid={count === null}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button
                type="button"
                aria-label="เพิ่มจำนวน"
                disabled={
                  busy || count === null || count === Number.MAX_SAFE_INTEGER
                }
                onClick={() => setQuantity(String(count! + 1))}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          {count === null && (
            <p role="alert">กรุณาระบุจำนวนเต็มตั้งแต่ 1 ขึ้นไป</p>
          )}
          <p className="merch-detail-hint">
            สินค้าพรีออเดอร์ · จัดส่งภายในประเทศไทย
          </p>
          {store.productionInfoTh && (
            <section>
              <h2>การผลิต</h2>
              <p className="merch-detail-description">
                {store.productionInfoTh}
              </p>
            </section>
          )}
          {store.shippingInfoTh && (
            <section>
              <h2>การจัดส่ง</h2>
              <p className="merch-detail-description">{store.shippingInfoTh}</p>
            </section>
          )}
          {(store.state !== "open" || !product.purchasable) && (
            <p role="status">
              {store.state === "closed"
                ? "ปิดรับพรีออเดอร์แล้ว"
                : store.state === "not_open"
                  ? "ยังไม่ถึงเวลาเปิดรับพรีออเดอร์"
                  : "สินค้านี้ยังไม่เปิดขาย"}
            </p>
          )}
          <MerchandiseIntentResume
            intentId={intentId}
            onAdded={added}
            onPending={pending}
            onResult={result}
          />
        </div>
      </div>
      <div className="merch-detail-bar" ref={barRef}>
        <button type="button" disabled={!allowed} onClick={add}>
          {busy ? "กำลังตรวจสอบรายการ" : "เพิ่มลงตะกร้า"}
          {price !== null && <> · {formatMinorBaht(price)}</>}
          <ArrowRight
            size={22}
            aria-hidden="true"
            className="ml-auto shrink-0"
          />
        </button>
      </div>
    </main>
  );
}
