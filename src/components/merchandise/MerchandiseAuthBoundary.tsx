"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import toast from "react-hot-toast";
import { useMerchandise } from "./MerchandiseProvider";
import {
  readPurchaseIntent,
  resumePurchaseIntent,
} from "@/lib/merchandiseIntent";
import {
  merchandiseLoginPath,
  merchandiseReturnPath,
} from "@/lib/merchandiseRoutes";
import { MerchandiseApiError } from "@/lib/merchandiseApi";
import { applyOwnerChange } from "@/lib/merchandiseSession";

// Header is already mounted for every auth journey, including its null view on
// login. Observe ownership here without modifying the incumbent AuthContext.
export function useMerchandiseSessionCleanup(buyerId: number | null) {
  const previous = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    try {
      const loggedOut =
        buyerId === null &&
        !(
          window.localStorage.getItem("pris_token") ||
          window.sessionStorage.getItem("pris_token")
        );
      applyOwnerChange(
        window.sessionStorage,
        previous.current,
        buyerId,
        loggedOut,
      );
    } catch {
      /* Storage denial cannot authorize any cart write. */
    }
    previous.current = buyerId;
  }, [buyerId]);
}
export function MerchandiseAuthBoundary({
  children,
  returnPath,
}: {
  children: ReactNode;
  returnPath?: string;
}) {
  const { token } = useMerchandise(),
    pathname = usePathname(),
    router = useRouter();
  const destination = merchandiseReturnPath(returnPath ?? pathname) ?? pathname;
  useEffect(() => {
    if (!token) router.replace(merchandiseLoginPath(destination));
  }, [token, destination, router]);
  return token ? (
    children
  ) : (
    <main className="min-h-[60vh] bg-white px-5 pb-12 pt-28 text-[#0b1535]">
      <p>กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ</p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0055ff] px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
        href={merchandiseLoginPath(destination)}
      >
        เข้าสู่ระบบ
      </Link>
    </main>
  );
}

// One automatic add per intent id, even if React re-runs the effect.
const started = new Set<string>();

type Failure = { message: string; reauthenticate: boolean };

/** After login the buyer lands here with ?intentId=...; it adds that intent once. */
export function MerchandiseIntentResume({
  intentId,
  onFailed,
}: {
  intentId: string | null;
  /** The API refused the add (not a session or network problem): refresh the page data. */
  onFailed?: () => void;
}) {
  const { api, token, setCart, cart } = useMerchandise(),
    pathname = usePathname(),
    router = useRouter();
  const [failure, setFailure] = useState<Failure | null>(null);
  const where = useRef({ pathname, router });
  const reload = useRef(cart.reload);
  const accept = useRef(setCart);
  const failed = useRef(onFailed);
  useEffect(() => {
    failed.current = onFailed;
    where.current = { pathname, router };
    reload.current = cart.reload;
    accept.current = setCart;
  });
  const strip = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("intentId");
    const { pathname: path, router: r } = where.current;
    r.replace(merchandiseReturnPath(path + url.search) ?? path, {
      scroll: false,
    });
  }, []);
  useEffect(() => {
    if (!intentId) return;
    if (!token) {
      where.current.router.replace(
        merchandiseLoginPath(where.current.pathname + window.location.search),
      );
      return;
    }
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled || started.has(intentId)) return;
      const intent = readPurchaseIntent(window.sessionStorage, intentId);
      if (!intent) {
        strip();
        return;
      }
      started.add(intentId);
      setFailure(null);
      try {
        const next = await resumePurchaseIntent(
          api,
          token,
          intent,
          window.sessionStorage,
        );
        accept.current(next);
        toast.success("เพิ่มลงตะกร้าแล้ว", {
          id: `merchandise-intent:${intentId}`,
        });
      } catch (error) {
        const e = error instanceof MerchandiseApiError ? error : null;
        if (e?.uncertain) reload.current();
        else if (e?.status !== 401) failed.current?.();
        if (!cancelled)
          setFailure({
            message: e?.uncertain
              ? "ยังยืนยันผลการเพิ่มสินค้าไม่ได้ กรุณาตรวจสอบตะกร้าของคุณ"
              : (e?.message ?? "เพิ่มสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง"),
            reauthenticate: e?.status === 401,
          });
      } finally {
        started.delete(intentId);
      }
      if (!cancelled) strip();
    })();
    return () => {
      cancelled = true;
    };
  }, [api, token, intentId, strip]);
  if (!failure) return null;
  return (
    <div
      className="my-5 rounded-xl bg-blue-50 p-4 text-sm leading-7 text-[#0b1535]"
      role="alert"
    >
      <p>{failure.message}</p>
      {failure.reauthenticate && (
        <Link
          className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-[#0055ff] bg-white px-4 font-semibold text-[#0055ff] focus-visible:outline-2 focus-visible:outline-offset-4"
          href={merchandiseLoginPath(pathname, true)}
        >
          เข้าสู่ระบบอีกครั้ง
        </Link>
      )}
    </div>
  );
}
