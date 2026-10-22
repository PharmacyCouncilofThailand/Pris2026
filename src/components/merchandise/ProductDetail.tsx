"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import type { ProductDto, StoreDto } from "@/types/merchandise";
import {
  defaultSelection,
  leadImageFirst,
  parseQuantity,
  selectionComplete,
  selectionPriceBaht,
  unavailableMessage,
  type Selection,
} from "@/lib/merchandiseSelection";
import { formatBaht, shippingFeeLabel } from "@/lib/merchandiseFormat";
import {
  isMerchandiseId,
  merchandiseLoginPath,
  merchandiseReturnPath,
} from "@/lib/merchandiseRoutes";
import {
  readPurchaseIntent,
  savePurchaseIntent,
} from "@/lib/merchandiseIntent";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseIntentResume } from "./MerchandiseAuthBoundary";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import BundleSelector from "./BundleSelector";

const MAX_QUANTITY = 9999;
const STOREFRONT_URL_KEY = "pris_merch_storefront_url";

function savedStorefrontPath(): string {
  try {
    const raw = window.sessionStorage.getItem(STOREFRONT_URL_KEY);
    const path = raw ? merchandiseReturnPath(raw) : null;
    if (
      path &&
      /^\/souvenirs(?:[?#]|$)/.test(path) &&
      !path.includes("/products/")
    )
      return path;
  } catch {
    /* storage unavailable */
  }
  return "/souvenirs";
}

export default function ProductDetail({
  product: original,
  store: originalStore,
}: {
  product: ProductDto;
  store: StoreDto;
}) {
  const { api, eventCode, token } = useMerchandise();
  const search = useSearchParams(),
    router = useRouter();
  const rawIntent = search.get("intentId"),
    intentId = isMerchandiseId(rawIntent) ? rawIntent : null;
  const [product, setProduct] = useState(original),
    [store, setStore] = useState(originalStore);
  const [selection, setSelection] = useState<Selection>(() =>
    defaultSelection(original),
  );
  const [quantity, setQuantity] = useState("1"),
    [restored, setRestored] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // undefined until the buyer picks an option; then the preview image id.
  const [preview, setPreview] = useState<string | null | undefined>(undefined);
  const [failedImages, setFailedImages] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [backHref, setBackHref] = useState("/souvenirs"),
    [justAdded, setJustAdded] = useState(false),
    [hasAdded, setHasAdded] = useState(false);
  const started = useRef(false),
    active = useRef(true),
    barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  // Coming back from login: show the choice the buyer made before leaving.
  useEffect(() => {
    let current = true;
    void Promise.resolve().then(() => {
      if (!current) return;
      if (intentId) {
        const intent = readPurchaseIntent(window.sessionStorage, intentId);
        if (intent?.productId === original.id) {
          setSelection(intent.selection);
          setQuantity(String(intent.quantity));
        }
      }
      setRestored(true);
    });
    return () => {
      current = false;
    };
  }, [intentId, original.id]);
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    // Only the fixed phone bar needs bottom clearance; it is hidden from 768px.
    const measure = () => {
      if (getComputedStyle(bar).display !== "none")
        root.style.setProperty(
          "--merch-host-bar-height",
          `${bar.getBoundingClientRect().height}px`,
        );
      else root.style.removeProperty("--merch-host-bar-height");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      document.documentElement.style.removeProperty("--merch-host-bar-height");
    };
  }, []);
  useEffect(() => {
    let current = true;
    void Promise.resolve().then(() => {
      if (current) setBackHref(savedStorefrontPath());
    });
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [justAdded]);
  const handleAdded = useCallback(() => {
    setHasAdded(true);
    setJustAdded(true);
  }, []);
  const refresh = useCallback(() => {
    setNotice(
      "ข้อมูลสินค้ามีการเปลี่ยนแปลง กรุณาตรวจสอบตัวเลือกและราคาอีกครั้ง",
    );
    void Promise.all([
      api.product(eventCode, original.id),
      api.store(eventCode),
    ])
      .then(([fresh, freshStore]) => {
        if (!active.current) return;
        setProduct(fresh);
        setPreview(undefined);
        setStore(freshStore);
        // Keep the buyer's choice only where it is still on offer.
        setSelection((current) =>
          selectionComplete(fresh, current) ? current : defaultSelection(fresh),
        );
      })
      .catch(() => {
        if (active.current)
          setNotice(
            "โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณาลองโหลดหน้าอีกครั้งก่อนเพิ่มสินค้า",
          );
      });
  }, [api, eventCode, original.id]);
  const busy = Boolean(token && intentId);
  const count = parseQuantity(quantity),
    countOk = count !== null && count <= MAX_QUANTITY,
    complete = selectionComplete(product, selection),
    price = selectionPriceBaht(product, selection);
  const allowed =
    store.state === "open" &&
    product.purchasable &&
    complete &&
    price !== null &&
    countOk &&
    !busy &&
    restored;
  const add = () => {
    if (!allowed || started.current || !countOk) return;
    started.current = true;
    try {
      const id = crypto.randomUUID();
      const returnPath = `/souvenirs/products/${product.id}?intentId=${id}`;
      savePurchaseIntent(window.sessionStorage, {
        id,
        eventCode,
        returnPath,
        productId: product.id,
        selection,
        quantity: count,
      });
      router.push(token ? returnPath : merchandiseLoginPath(returnPath), {
        scroll: false,
      });
    } catch {
      started.current = false;
      setNotice(
        "ไม่สามารถเก็บรายการที่เลือกได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์",
      );
    }
  };
  // The page stays mounted when logged in; re-arm once the intent is spent.
  useEffect(() => {
    if (!intentId) started.current = false;
  }, [intentId]);
  const unit = product.kind === "bundle" ? "ชุด" : "ชิ้น";
  const selectedVariant = product.variants.find(
    (v) => v.id === selection.variantId,
  );
  const leadId =
    preview !== undefined ? preview : (selectedVariant?.imageId ?? null);
  const shownImages = leadImageFirst(
    product.images.filter((image) => !failedImages.has(image.id)),
    leadId,
  );
  const unavailable = [
    ...new Set(
      product.unavailableCodes.map((code) =>
        unavailableMessage(code, store.state),
      ),
    ),
  ];
  if (
    store.state !== "open" &&
    !product.unavailableCodes.includes("STORE_NOT_OPEN")
  )
    unavailable.unshift(unavailableMessage("STORE_NOT_OPEN", store.state));
  if (!product.purchasable && unavailable.length === 0)
    unavailable.push("สินค้านี้ไม่พร้อมขาย");
  return (
    <main className="merch-detail">
      <Link className="merch-detail-back" href={backHref}>
        <ArrowLeft size={18} aria-hidden="true" /> กลับ
      </Link>
      <div className="merch-detail-grid">
        <ProductGallery
          key={JSON.stringify([leadId, shownImages.map((image) => image.id)])}
          images={shownImages}
          name={product.nameTh}
          failed={product.images.length > 0}
          onImageError={(id) =>
            setFailedImages((failed) => new Set(failed).add(id))
          }
        />
        <div className="merch-detail-info">
          <h1>{product.nameTh}</h1>
          {product.kind === "bundle" && (
            <span className="merch-detail-tag">ชุดสินค้า</span>
          )}
          <p className="merch-detail-price" aria-live="polite">
            {price !== null ? (
              <>
                {formatBaht(price)}
                <small> / {unit}</small>
              </>
            ) : product.price?.kind === "from" ? (
              `เริ่มต้น ${formatBaht(product.price.amountBaht)}`
            ) : product.price ? (
              <>
                {formatBaht(product.price.amountBaht)}
                <small> / {unit}</small>
              </>
            ) : (
              "ยังไม่กำหนดราคา"
            )}
          </p>
          {product.descriptionTh && (
            <section className="merch-detail-description">
              <h2>รายละเอียดสินค้า</h2>
              <p>{product.descriptionTh}</p>
            </section>
          )}
          {notice && (
            <p role="alert" className="merch-detail-notice">
              {notice}
            </p>
          )}
          {product.kind === "bundle" ? (
            <BundleSelector
              key={`${product.id}:${restored}`}
              product={product}
              selection={selection}
              disabled={busy}
              onChange={setSelection}
            />
          ) : (
            product.hasOptions && (
              <VariantSelector
                key={`${product.id}:${restored}`}
                variants={product.variants}
                images={product.images}
                onPreviewChange={setPreview}
                selectedId={selection.variantId}
                disabled={busy}
                onChange={(variantId) =>
                  setSelection((s) => ({ ...s, variantId }))
                }
              />
            )
          )}
          {product.sizeChartTh && (
            <section className="merch-detail-description">
              <h2>ข้อมูลขนาด</h2>
              <p>{product.sizeChartTh}</p>
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
                disabled={busy || !countOk || count <= 1}
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
                aria-invalid={!countOk}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button
                type="button"
                aria-label="เพิ่มจำนวน"
                disabled={busy || !countOk || count >= MAX_QUANTITY}
                onClick={() => setQuantity(String(count! + 1))}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          {!countOk && (
            <p role="alert">กรุณาระบุจำนวนเต็มระหว่าง 1 ถึง {MAX_QUANTITY}</p>
          )}
          <div className="merch-detail-add">
            <button
              type="button"
              className="merch-detail-add-button"
              disabled={!allowed && !justAdded}
              onClick={justAdded ? undefined : add}
            >
              {justAdded ? (
                "เพิ่มแล้ว ✓"
              ) : (
                <>
                  {busy ? "กำลังตรวจสอบรายการ" : "เพิ่มลงตะกร้า"}
                  {price !== null && <> · {formatBaht(price)}</>}
                </>
              )}
            </button>
            {hasAdded && (
              <Link className="merch-detail-cart-link" href="/souvenirs/cart">
                ดูตะกร้า
              </Link>
            )}
          </div>
          <p className="merch-detail-hint">
            สินค้าพรีออเดอร์ · {shippingFeeLabel(store.shippingBaht)}
          </p>
          {unavailable.map((message) => (
            <p role="status" key={message}>
              {message}
            </p>
          ))}
          <MerchandiseIntentResume
            intentId={intentId}
            onFailed={refresh}
            onAdded={handleAdded}
          />
        </div>
      </div>
      <div className="merch-detail-bar" ref={barRef}>
        <button type="button" disabled={!allowed} onClick={add}>
          {busy ? "กำลังตรวจสอบรายการ" : "เพิ่มลงตะกร้า"}
          {price !== null && <> · {formatBaht(price)}</>}
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
