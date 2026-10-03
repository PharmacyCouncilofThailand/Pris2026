"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveWheelImageUrl, type LuckyWheelSegment } from "@/lib/luckyWheel";
import {
  buildWheelSectors,
  rotationForWinningSegment,
} from "@/lib/wheelGeometry";
import styles from "./wheel.module.css";

type Props = {
  segments: LuckyWheelSegment[];
  winningSegmentId?: string | null;
  snapshotVersion?: number | null;
  reducedMotion: boolean;
  onAnimationComplete?: () => void;
  ariaLabel: string;
};

function polar(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 100 + radius * Math.cos(radians),
    y: 100 + radius * Math.sin(radians),
  };
}

function wedge(startAngle: number, endAngle: number) {
  if (Math.abs(endAngle - startAngle) >= 359.999) {
    return "M 100 100 m -94 0 a 94 94 0 1 0 188 0 a 94 94 0 1 0 -188 0";
  }
  const start = polar(94, startAngle);
  const end = polar(94, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    "M 100 100",
    `L ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A 94 94 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

export function Wheel({
  segments,
  winningSegmentId = null,
  snapshotVersion = null,
  reducedMotion,
  onAnimationComplete,
  ariaLabel,
}: Props) {
  const sectors = useMemo(() => buildWheelSectors(segments), [segments]);
  const [rotation, setRotation] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!winningSegmentId || segments.length === 0) return;
    const target = rotationForWinningSegment(
      segments,
      winningSegmentId,
      reducedMotion ? 0 : 6,
    );
    let targetFrame = 0;
    const resetFrame = requestAnimationFrame(() => {
      setAnimate(false);
      setRotation(reducedMotion ? target : 0);
      if (reducedMotion) {
        queueMicrotask(() => onAnimationComplete?.());
        return;
      }
      targetFrame = requestAnimationFrame(() => {
        setAnimate(true);
        setRotation(target);
      });
    });
    return () => {
      cancelAnimationFrame(resetFrame);
      if (targetFrame) cancelAnimationFrame(targetFrame);
    };
  }, [winningSegmentId, snapshotVersion, segments, reducedMotion, onAnimationComplete]);

  const imageBase = process.env.NEXT_PUBLIC_LUCKY_WHEEL_IMAGE_BASE_URL;

  return (
    <div className={styles.wheelFrame}>
      <div className={styles.pointer} aria-hidden="true" />
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={ariaLabel}
        className={`${styles.wheelSvg} ${animate ? styles.wheelAnimated : ""}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        onTransitionEnd={(event) => {
          if (event.propertyName === "transform") onAnimationComplete?.();
        }}
      >
        <circle cx="100" cy="100" r="97" fill="#fff" stroke="#18181b" strokeWidth="4" />
        {sectors.map((sector, index) => {
          const segment = segments[index];
          const soldOut =
            segment.kind === "prize" &&
            segment.remaining !== null &&
            segment.remaining <= 0;
          const selected = segment.id === winningSegmentId;
          const fill = soldOut
            ? "#e4e4e7"
            : segment.kind === "no_prize"
              ? "#f4f4f5"
              : index % 2 === 0
                ? "#ffedd5"
                : "#fff";
          const labelPoint = polar(61, sector.centerAngle + 90);
          const imagePoint = polar(39, sector.centerAngle + 90);
          const imageUrl =
            segment.kind === "prize" && !failedImages.has(segment.id)
              ? resolveWheelImageUrl(segment.imageKey, imageBase)
              : null;

          return (
            <g key={segment.id}>
              <title>{`${segment.name.th} / ${segment.name.en}`}</title>
              <path
                d={wedge(sector.startAngle + 90, sector.endAngle + 90)}
                fill={selected ? "#fed7aa" : fill}
                stroke="#18181b"
                strokeWidth="1.5"
              />
              {imageUrl ? (
                <image
                  href={imageUrl}
                  x={imagePoint.x - 12}
                  y={imagePoint.y - 12}
                  width="24"
                  height="24"
                  preserveAspectRatio="xMidYMid slice"
                  onError={() =>
                    setFailedImages((current) => {
                      const next = new Set(current);
                      next.add(segment.id);
                      return next;
                    })
                  }
                />
              ) : segment.kind === "no_prize" ? (
                <text
                  x={imagePoint.x}
                  y={imagePoint.y + 5}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="800"
                  fill="#52525b"
                >
                  —
                </text>
              ) : (
                <>
                  <circle
                    cx={imagePoint.x}
                    cy={imagePoint.y}
                    r="9"
                    fill="#fafafa"
                    stroke="#71717a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={imagePoint.x}
                    y={imagePoint.y + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill="#71717a"
                    aria-hidden="true"
                  >
                    ·
                  </text>
                </>
              )}
              <text
                x={labelPoint.x}
                y={labelPoint.y + 4}
                textAnchor="middle"
                fontSize={segments.length > 10 ? "8" : "10"}
                fontWeight="800"
                fill={soldOut ? "#71717a" : "#18181b"}
              >
                {index + 1}
              </text>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="18" fill="#fff" stroke="#18181b" strokeWidth="3" />
        <circle cx="100" cy="100" r="5" fill="#ea580c" />
      </svg>
      <div className={styles.hub} aria-hidden="true" />
    </div>
  );
}
