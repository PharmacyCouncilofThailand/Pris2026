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
import type { ProductDto, StoreDto } from "@/types/merchandise";
import {
  defaultSelection,
  parseQuantity,
  selectionComplete,
  selectionPriceMinor,
  unavailableMessage,
  type Selection,
} from "@/lib/merchandiseSelection";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import { isMerchandiseId, merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import {
  readPurchaseIntent,
  savePurchaseIntent,
} from "@/lib/merchandiseIntent";
import { useMerchandise } from "./MerchandiseProvider";
import { MerchandiseIntentResume } from "./MerchandiseAuthBoundary";
import VariantSelector from "./VariantSelector";
import BundleSelector from "./BundleSelector";

const MAX_QUANTITY = 9999;

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
    price = selectionPriceMinor(product, selection);
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
                alt={product.nameTh}
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
            {price !== null ? (
              <>
                {formatMinorBaht(price)}
                <small> / {unit}</small>
              </>
            ) : product.price?.kind === "from" ? (
              `เริ่มต้น ${formatMinorBaht(product.price.amountMinor)}`
            ) : product.price ? (
              <>
                {formatMinorBaht(product.price.amountMinor)}
                <small> / {unit}</small>
              </>
            ) : (
              "ยังไม่กำหนดราคา"
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
          {unavailable.map((message) => (
            <p role="status" key={message}>
              {message}
            </p>
          ))}
          <MerchandiseIntentResume intentId={intentId} onFailed={refresh} />
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
