"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { DOUBLE_TAP_ZOOM, MIN_ZOOM, panBy, zoomAt, type ZoomState } from "@/lib/posterZoom";

const DOUBLE_TAP_MS = 300;
const TAP_MOVE_PX = 12;

const identity: ZoomState = { scale: MIN_ZOOM, x: 0, y: 0 };

type Pt = { x: number; y: number };

const distance = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Pinch, double-tap and drag-to-pan for the element that receives the returned handlers. */
export function usePosterZoom() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomState>(identity);
  const pointers = useRef(new Map<number, Pt>());
  const tap = useRef<{ id: number; start: Pt; moved: boolean } | null>(null);
  const lastTapAt = useRef(0);

  const bounds = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 1, height: rect?.height ?? 1 };
  };
  const local = (e: { clientX: number; clientY: number }): Pt => {
    const rect = stageRef.current?.getBoundingClientRect();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  };

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, local(e));
    tap.current =
      pointers.current.size === 1 ? { id: e.pointerId, start: local(e), moved: false } : null;
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = local(e);
    const other = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)?.[1];
    pointers.current.set(e.pointerId, next);
    if (tap.current && distance(tap.current.start, next) > TAP_MOVE_PX) tap.current.moved = true;

    if (other) {
      const before = distance(prev, other);
      const after = distance(next, other);
      if (before < 1) return;
      const mid = { x: (next.x + other.x) / 2, y: (next.y + other.y) / 2 };
      const prevMid = { x: (prev.x + other.x) / 2, y: (prev.y + other.y) / 2 };
      setZoom((z) => {
        const scaled = zoomAt(z, mid, z.scale * (after / before), bounds());
        return panBy(scaled, mid.x - prevMid.x, mid.y - prevMid.y, bounds());
      });
    } else {
      setZoom((z) =>
        z.scale > MIN_ZOOM ? panBy(z, next.x - prev.x, next.y - prev.y, bounds()) : z,
      );
    }
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const t = tap.current;
    pointers.current.delete(e.pointerId);
    tap.current = null;
    if (!t || t.id !== e.pointerId || t.moved) return;
    const now = Date.now();
    if (now - lastTapAt.current <= DOUBLE_TAP_MS) {
      lastTapAt.current = 0;
      const point = local(e);
      setZoom((z) => zoomAt(z, point, z.scale > MIN_ZOOM ? MIN_ZOOM : DOUBLE_TAP_ZOOM, bounds()));
    } else {
      lastTapAt.current = now;
    }
  }, []);

  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    tap.current = null;
  }, []);

  return {
    stageRef,
    zoom,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
