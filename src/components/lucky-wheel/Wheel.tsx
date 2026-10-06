"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Gift } from "lucide-react";
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
  const locale = useLocale();
  const t = useTranslations("luckyWheel");
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
      <svg className={styles.pointer} viewBox="0 0 32 42" aria-hidden="true">
        <path d="M 2 2 H 30 L 16 40 Z" fill="#f45100" stroke="#09090b" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
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
        {sectors.map((sector, index) => {
          const segment = segments[index];
          const soldOut =
            segment.kind === "prize" &&
            segment.remaining !== null &&
            segment.remaining <= 0;
          const imagePoint = polar(segments.length <= 2 ? 44 : 62, sector.centerAngle + 90);
          const imageSize = segments.length > 10 ? 16 : segments.length > 6 ? 25 : 36;
          const labelWidth = segments.length > 10 ? 30 : segments.length > 6 ? 38 : 52;
          const imageUrl =
            segment.kind === "prize" && !failedImages.has(segment.id)
              ? resolveWheelImageUrl(segment.imageKey, imageBase)
              : null;

          return (
            <g key={segment.id}>
              <title>{`${segment.name.th} / ${segment.name.en}`}</title>
              <path
                d={wedge(sector.startAngle + 90, sector.endAngle + 90)}
                fill="#fff"
                stroke="#18181b"
                strokeWidth="0.9"
              />
              {imageUrl ? (
                <image
                  href={imageUrl}
                  x={imagePoint.x - imageSize / 2}
                  y={imagePoint.y - imageSize / 2 - 6}
                  width={imageSize}
                  height={imageSize}
                  preserveAspectRatio="xMidYMid meet"
                  onError={() =>
                    setFailedImages((current) => {
                      const next = new Set(current);
                      next.add(segment.id);
                      return next;
                    })
                  }
                />
              ) : (
                <Gift x={imagePoint.x - imageSize * 0.3} y={imagePoint.y - imageSize * 0.3 - 6} width={imageSize * 0.6} height={imageSize * 0.6} color="#18181b" strokeWidth={1.6} aria-hidden="true" />
              )}
              <foreignObject
                x={imagePoint.x - labelWidth / 2}
                y={imagePoint.y + imageSize / 2 - 5}
                width={labelWidth}
                height={32}
              >
                <div className={styles.wheelLabel} style={{ fontSize: segments.length > 10 ? 5 : segments.length > 6 ? 6 : 7.5 }}>
                  <span>{segment.name[locale === "th" ? "th" : "en"]}</span>
                  {(soldOut || !segment.enabled) && <span className={styles.wheelBadge}>{t(!segment.enabled ? "unavailableSegment" : "soldOutPrize")}</span>}
                </div>
              </foreignObject>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="94" fill="none" stroke="#09090b" strokeWidth="1.3" />
      </svg>
      <div className={styles.hub} aria-hidden="true" />
    </div>
  );
}
