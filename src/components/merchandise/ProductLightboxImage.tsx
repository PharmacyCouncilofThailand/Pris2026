"use client";

import { useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/types/merchandise";

type Point = { x: number; y: number };
type Transform = Point & { scale: number };
type Gesture =
  | { kind: "pinch"; distance: number; scale: number; anchor: Point }
  | { kind: "swipe"; start: Point };
const ORIGINAL: Transform = { scale: 1, x: 0, y: 0 };
const point = (touch: { clientX: number; clientY: number }): Point => ({
  x: touch.clientX,
  y: touch.clientY,
});

export default function ProductLightboxImage({
  image,
  name,
  onImageError,
  onSwipe,
  onDismiss,
  suppressClickRef,
}: {
  image: ImageAsset;
  name: string;
  onImageError: (id: string) => void;
  onSwipe: (direction: number) => void;
  onDismiss: () => void;
  suppressClickRef: { current: boolean };
}) {
  const stage = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const [transform, setTransform] = useState(ORIGINAL);
  const current = useRef(ORIGINAL);
  const gesture = useRef<Gesture | null>(null);
  const zoomGesture = useRef(false);

  const apply = (next: Transform) => {
    const maxX = Math.max(
      0,
      ((photo.current?.offsetWidth ?? 0) * next.scale -
        (stage.current?.clientWidth ?? 0)) /
        2,
    );
    const maxY = Math.max(
      0,
      ((photo.current?.offsetHeight ?? 0) * next.scale -
        (stage.current?.clientHeight ?? 0)) /
        2,
    );
    const bounded = {
      scale: next.scale,
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
    current.current = bounded;
    setTransform(bounded);
  };
  const begin = (touches: TouchEvent<HTMLDivElement>["touches"]) => {
    if (touches.length >= 2) {
      const a = point(touches[0]),
        b = point(touches[1]);
      const rect = stage.current!.getBoundingClientRect();
      const center = {
        x: (a.x + b.x) / 2 - rect.left - rect.width / 2,
        y: (a.y + b.y) / 2 - rect.top - rect.height / 2,
      };
      gesture.current = {
        kind: "pinch",
        distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        scale: current.current.scale,
        anchor: {
          x: (center.x - current.current.x) / current.current.scale,
          y: (center.y - current.current.y) / current.current.scale,
        },
      };
      zoomGesture.current = true;
      suppressClickRef.current = true;
    } else if (touches.length === 1) {
      gesture.current = {
        kind: "swipe",
        start: point(touches[0]),
      };
    }
  };

  return (
    <div
      ref={stage}
      className="merch-lightbox-stage"
      onTouchStart={(event) => {
        event.stopPropagation();
        if (!gesture.current) {
          suppressClickRef.current = false;
          zoomGesture.current = false;
        }
        begin(event.touches);
      }}
      onTouchMove={(event) => {
        event.stopPropagation();
        const active = gesture.current;
        if (!active) return;
        if (active.kind === "pinch" && event.touches.length >= 2) {
          const a = point(event.touches[0]),
            b = point(event.touches[1]);
          const scale = Math.max(
            1,
            Math.min(
              4,
              (active.scale * Math.hypot(b.x - a.x, b.y - a.y)) /
                active.distance,
            ),
          );
          const rect = stage.current!.getBoundingClientRect();
          apply({
            scale,
            x:
              (a.x + b.x) / 2 -
              rect.left -
              rect.width / 2 -
              active.anchor.x * scale,
            y:
              (a.y + b.y) / 2 -
              rect.top -
              rect.height / 2 -
              active.anchor.y * scale,
          });
        } else if (active.kind === "swipe" && event.touches.length === 1) {
          const end = point(event.touches[0]);
          const dx = end.x - active.start.x,
            dy = end.y - active.start.y;
          if (Math.abs(dx) > 10 || Math.abs(dy) > 10)
            suppressClickRef.current = true;
        }
      }}
      onTouchEnd={(event) => {
        event.stopPropagation();
        const active = gesture.current;
        if (event.touches.length >= 2) {
          begin(event.touches);
          return;
        }
        gesture.current = null;
        if (zoomGesture.current) {
          apply(ORIGINAL);
          suppressClickRef.current = true;
          return;
        }
        if (
          active?.kind === "swipe" &&
          !zoomGesture.current &&
          event.changedTouches[0]
        ) {
          const end = point(event.changedTouches[0]);
          const dx = end.x - active.start.x,
            dy = end.y - active.start.y;
          suppressClickRef.current = Math.abs(dx) > 10 || Math.abs(dy) > 10;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
            onSwipe(dx < 0 ? 1 : -1);
        }
      }}
      onTouchCancel={(event) => {
        event.stopPropagation();
        gesture.current = null;
        suppressClickRef.current = true;
        apply(ORIGINAL);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !suppressClickRef.current)
          onDismiss();
        suppressClickRef.current = false;
      }}
    >
      <Image
        ref={photo}
        unoptimized
        src={image.url}
        alt={name}
        width={image.width}
        height={image.height}
        loading="eager"
        draggable={false}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
        onError={() => onImageError(image.id)}
      />
    </div>
  );
}
