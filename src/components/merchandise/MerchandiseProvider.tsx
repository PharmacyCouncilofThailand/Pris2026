"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  merchandiseApi,
  merchandiseFailure,
  type MerchandiseApi,
} from "@/lib/merchandiseApi";
import type { StoreDto, CartDto } from "@/types/merchandise";
import { usePathname } from "@/i18n/routing";
import { isMerchandisePath } from "@/lib/merchandiseRoutes";
import {
  useMerchandiseResource,
  type MerchandiseResource,
} from "./useMerchandiseResource";
export interface MerchandiseSession {
  isAuthenticated: boolean;
  token: string | null;
  user: { id?: number; email: string } | null;
}
interface MerchandiseContextValue {
  eventCode: string;
  token: string | null;
  ownerId: number | null;
  ownerIdentity: string | null;
  api: MerchandiseApi;
  store: MerchandiseResource<StoreDto>;
  cart: MerchandiseResource<CartDto>;
}
const MerchandiseContext = createContext<MerchandiseContextValue | null>(null);
// Explicit session/API injection keeps the same production state boundary testable.
export function MerchandiseSessionProvider({
  children,
  session,
  eventCode = process.env.NEXT_PUBLIC_EVENT_CODE ?? "PRIS-2026",
  api = merchandiseApi,
}: {
  children?: ReactNode;
  session: MerchandiseSession;
  eventCode?: string;
  api?: MerchandiseApi;
}) {
  const load = useCallback(
    (signal: AbortSignal) => api.store(eventCode, signal),
    [api, eventCode],
  );
  const store = useMerchandiseResource(eventCode, load);
  const token = session.isAuthenticated && session.user ? session.token : null;
  const ownerIdentity = token
    ? String(session.user?.id ?? session.user?.email)
    : null;
  const eventId = store.data?.eventId;
  const cartScope = useMemo(
    () =>
      token && eventId ? { eventCode, eventId, ownerIdentity, token } : null,
    [eventCode, eventId, ownerIdentity, token],
  );
  const loadCart = useCallback(
    async (signal: AbortSignal) => {
      if (!token || !eventId)
        throw merchandiseFailure(401, "MERCH_AUTH_REQUIRED");
      const result = await api.cart(eventCode, token, signal);
      if (result.eventId !== eventId)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      return result;
    },
    [api, eventCode, token, eventId],
  );
  const cart = useMerchandiseResource(cartScope, loadCart);
  return (
    <MerchandiseContext.Provider
      value={{
        eventCode,
        api,
        store,
        cart,
        token,
        ownerId: token ? (session.user?.id ?? null) : null,
        ownerIdentity,
      }}
    >
      {children}
    </MerchandiseContext.Provider>
  );
}
// Header and page share one feature provider; other routes create no shop reads.
export function MerchandiseRouteScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isMerchandisePath(pathname) ? (
    <MerchandiseProvider>
      <div className="merchandise-route-scope">{children}</div>
    </MerchandiseProvider>
  ) : (
    children
  );
}
export function MerchandiseProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const identity = auth.isAuthenticated
    ? String(auth.user?.id ?? auth.user?.email)
    : "anonymous";
  return (
    <MerchandiseSessionProvider key={identity} session={auth}>
      {children}
    </MerchandiseSessionProvider>
  );
}
export function useMerchandise() {
  const context = useContext(MerchandiseContext);
  if (!context) throw new Error("MerchandiseProvider is required");
  return context;
}
