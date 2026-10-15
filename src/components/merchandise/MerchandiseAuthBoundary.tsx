"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import {
  clearForeignPurchaseIntent,
  clearPurchaseIntent,
  readPurchaseIntent,
  resumePurchaseIntent,
  type IntentResult,
} from "@/lib/merchandiseIntent";
import {
  merchandiseLoginPath,
  merchandiseReturnPath,
} from "@/lib/merchandiseRoutes";
import type { CartDto } from "@/types/merchandise";
import toast from "react-hot-toast";

// Header is already mounted for every auth journey, including its null view on
// login. Observe ownership here without modifying the incumbent AuthContext.
export function useMerchandiseSessionCleanup(buyerId: number | null) {
  const previous = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    try {
      if (
        previous.current !== undefined &&
        previous.current !== null &&
        previous.current !== buyerId
      )
        clearPurchaseIntent(window.sessionStorage);
      else clearForeignPurchaseIntent(window.sessionStorage, buyerId);
    } catch {
      /* Storage denial cannot authorize any cart write. */
    }
    previous.current = buyerId;
  }, [buyerId]);
}
export function MerchandiseAuthBoundary({ children }: { children: ReactNode }) {
  const { token } = useMerchandise(),
    pathname = usePathname(),
    router = useRouter();
  useEffect(() => {
    if (!token) router.replace(merchandiseLoginPath(pathname));
  }, [token, pathname, router]);
  return token ? (
    children
  ) : (
    <main className="min-h-[60vh] bg-white px-5 pb-12 pt-28 text-[#0b1535]">
      <p>กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ</p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0055ff] px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
        href={merchandiseLoginPath(pathname)}
      >
        เข้าสู่ระบบ
      </Link>
    </main>
  );
}

export function MerchandiseIntentResume({
  intentId,
  onAdded,
}: {
  intentId: string | null;
  onAdded: (cart: CartDto) => void;
}) {
  const { api, eventCode, token, ownerId } = useMerchandise(),
    pathname = usePathname(),
    router = useRouter();
  const [result, setResult] = useState<{
    scope: string;
    value: IntentResult;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const session = useRef<{
    token: string | null;
    ownerId: number | null;
    eventCode: string;
  } | null>(null);
  const scope = `${eventCode}:${ownerId}:${intentId}`;
  useLayoutEffect(() => {
    session.current = { token, ownerId, eventCode };
    return () => {
      session.current = null;
    };
  }, [token, ownerId, eventCode]);
  useEffect(() => {
    if (!token || !ownerId || !intentId) return;
    let active = true;
    const isCurrent = () =>
      session.current?.token === token &&
      session.current.ownerId === ownerId &&
      session.current.eventCode === eventCode;
    const run = async () => {
      let value: IntentResult;
      try {
        const intent = readPurchaseIntent(window.sessionStorage, eventCode);
        if (!intent || intent.id !== intentId) return;
        value = await resumePurchaseIntent({
          storage: window.sessionStorage,
          api,
          eventCode,
          token,
          buyerId: ownerId,
          isCurrent,
        });
      } catch {
        value = {
          kind: "error",
          error: new Error(
            "ไม่สามารถเก็บรายการที่เลือกได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์",
          ),
          uncertain: false,
        };
      }
      if (!active || !isCurrent()) return;
      setResult({ scope, value });
      if (value.kind === "added") {
        onAdded(value.cart);
        toast.success("เพิ่มลงตะกร้าแล้ว", {
          id: `merchandise-intent:${value.intentId}`,
        });
        const url = new URL(window.location.href);
        url.searchParams.delete("intentId");
        router.replace(
          merchandiseReturnPath(pathname + url.search) ?? pathname,
        );
      } else if (value.kind === "needs_selection") {
        if (
          merchandiseReturnPath(pathname + window.location.search) !==
          value.path
        )
          router.replace(value.path);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [
    api,
    eventCode,
    token,
    ownerId,
    intentId,
    onAdded,
    pathname,
    router,
    retry,
    scope,
  ]);
  const current = result?.scope === scope ? result.value : null;
  if (
    !current ||
    current.kind === "none" ||
    current.kind === "cancelled" ||
    current.kind === "added"
  )
    return null;
  return (
    <div
      className="my-5 rounded-xl bg-blue-50 p-4 text-sm leading-7 text-[#0b1535]"
      role="status"
    >
      {current.kind === "needs_selection" ? (
        <p>กรุณาเลือกตัวเลือกสินค้าก่อนเพิ่มลงตะกร้า</p>
      ) : (
        <>
          <p>
            {current.uncertain
              ? "ยังยืนยันผลเพิ่มสินค้าลงตะกร้าไม่ได้ กรุณาตรวจสอบอีกครั้ง"
              : current.error.message}
          </p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-xl border border-[#0055ff] bg-white px-4 font-semibold text-[#0055ff] focus-visible:outline-2 focus-visible:outline-offset-4"
            onClick={() => setRetry((v) => v + 1)}
          >
            ตรวจสอบอีกครั้ง
          </button>
        </>
      )}
    </div>
  );
}
