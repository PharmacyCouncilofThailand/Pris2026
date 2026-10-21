"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MerchandiseApiError, merchandiseFailure } from "@/lib/merchandiseApi";
export interface MerchandiseResource<T> {
  status: "idle" | "loading" | "ready" | "error";
  data: T | null;
  error: MerchandiseApiError | null;
  reload(): void;
  accept(data: T): void;
}
export function useMerchandiseResource<T>(
  scope: object | string | null,
  loader: (signal: AbortSignal) => Promise<T>,
): MerchandiseResource<T> {
  const [version, setVersion] = useState(0);
  const key = useMemo(
    () => (scope === null ? null : { scope, version, loader }),
    [scope, version, loader],
  );
  const [result, setResult] = useState<{
    key: typeof key;
    data: T | null;
    error: MerchandiseApiError | null;
  } | null>(null);
  const active = useRef(key);
  useLayoutEffect(() => {
    active.current = key;
    return () => {
      active.current = null;
    };
  }, [key]);
  const accept = useCallback(
    (data: T) => {
      if (key && active.current === key)
        setResult((previous) =>
          active.current === key ? { key, data, error: null } : previous,
        );
    },
    [key],
  );
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted)
          throw new DOMException("Aborted", "AbortError");
        return loader(controller.signal);
      })
      .then(
        (data) => {
          if (!controller.signal.aborted) setResult({ key, data, error: null });
        },
        (error) => {
          if (!controller.signal.aborted)
            setResult({
              key,
              data: null,
              error:
                error instanceof MerchandiseApiError
                  ? error
                  : merchandiseFailure(),
            });
        },
      );
    return () => controller.abort();
  }, [key, loader]);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  if (!key) return { status: "idle", data: null, error: null, reload, accept };
  if (result?.key !== key)
    return { status: "loading", data: null, error: null, reload, accept };
  return {
    status: result.error ? "error" : "ready",
    data: result.data,
    error: result.error,
    reload,
    accept,
  };
}
