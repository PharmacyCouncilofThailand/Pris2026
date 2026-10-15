"use client";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { merchandiseApi, type MerchandiseApi } from "@/lib/merchandiseApi";
import type { StoreDto } from "@/types/merchandise";
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
  return (
    <MerchandiseContext.Provider
      value={{
        eventCode,
        api,
        store,
        token,
        ownerId: token ? (session.user?.id ?? null) : null,
        ownerIdentity: token
          ? String(session.user?.id ?? session.user?.email)
          : null,
      }}
    >
      {children}
    </MerchandiseContext.Provider>
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
