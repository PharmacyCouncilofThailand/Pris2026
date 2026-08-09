"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAbstractWordCount,
  type AbstractWordCountRequest,
  type AbstractWordCountResponse,
} from "@/lib/abstractWordCount";

export const ABSTRACT_WORD_COUNT_DEBOUNCE_MS = 500;

export type AuthoritativeWordCountStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

type HookState = {
  status: AuthoritativeWordCountStatus;
  result: AbstractWordCountResponse | null;
  resultSignature: string | null;
  error: string | null;
};

type HookInput = {
  apiUrl: string;
  token: string | null;
  input: AbstractWordCountRequest;
  enabled: boolean;
  debounceMs?: number;
  request?: typeof fetchAbstractWordCount;
};

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useAuthoritativeWordCount({
  apiUrl,
  token,
  input,
  enabled,
  debounceMs = ABSTRACT_WORD_COUNT_DEBOUNCE_MS,
  request = fetchAbstractWordCount,
}: HookInput) {
  const [state, setState] = useState<HookState>({
    status: "idle",
    result: null,
    resultSignature: null,
    error: null,
  });
  const signature = useMemo(() => JSON.stringify(input), [input]);
  const latestInputRef = useRef(input);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSequenceRef = useRef(0);
  latestInputRef.current = input;

  const execute = useCallback(
    async (nextInput: AbstractWordCountRequest) => {
      if (!token) {
        throw new Error("Authentication is required for word counting");
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const sequence = ++requestSequenceRef.current;
      const nextSignature = JSON.stringify(nextInput);

      setState((previous) => ({
        ...previous,
        status: "loading",
        error: null,
      }));

      try {
        const result = await request(
          apiUrl,
          token,
          nextInput,
          controller.signal,
        );
        if (sequence === requestSequenceRef.current) {
          setState({
            status: "ready",
            result,
            resultSignature: nextSignature,
            error: null,
          });
        }
        return result;
      } catch (error) {
        if (!isAbortError(error) && sequence === requestSequenceRef.current) {
          setState((previous) => ({
            ...previous,
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unable to calculate abstract word count",
          }));
        }
        throw error;
      }
    },
    [apiUrl, request, token],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    requestSequenceRef.current += 1;

    if (!enabled || !token) return;

    timerRef.current = setTimeout(() => {
      void execute(latestInputRef.current).catch(() => undefined);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [debounceMs, enabled, execute, signature, token]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
      requestSequenceRef.current += 1;
    },
    [],
  );

  const refresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return execute(latestInputRef.current);
  }, [execute]);

  return {
    status: state.status,
    result: state.result,
    error: state.error,
    isStale: state.resultSignature !== signature,
    refresh,
  };
}
