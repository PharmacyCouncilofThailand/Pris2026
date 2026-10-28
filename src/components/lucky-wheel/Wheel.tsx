"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Gift } from "lucide-react";
import {
  LUCKY_WHEEL_IMAGE_BASE_URL,
  resolveWheelImageUrl,
  type LuckyWheelSegment,
} from "@/lib/luckyWheel";
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

// Largest image that stays inside a wedge: the image's bounding circle must
// clear both wedge edges (r * sin(half-angle) >= c) and the rim (r + c <= 94).
function imageFit(sweep: number) {
  const sinHalf = Math.sin((Math.min(sweep, 180) * Math.PI) / 360);
  const radius = Math.min((94 * sinHalf) / (1 + sinHalf), 30) - 2;
  const distance = (radius / sinHalf + (94 - radius)) / 2;
  return { distance, size: radius * 1.7 };
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
  const t = useTranslations("luckyWheel");
  const clipPrefix = useId().replace(/:/g, "");
  const sectors = useMemo(() => buildWheelSectors(segments), [segments]);
  const [rotation, setRotation] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set(),
  );

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
  }, [
    winningSegmentId,
    snapshotVersion,
    segments,
    reducedMotion,
    onAnimationComplete,
  ]);

  return (
    <div className={styles.wheelFrame}>
      <svg className={styles.pointer} viewBox="0 0 32 42" aria-hidden="true">
        <path
          d="M 2 2 H 30 L 16 40 Z"
          fill="#f45100"
          stroke="#09090b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
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
          const fit = imageFit(sector.endAngle - sector.startAngle);
          const imagePoint =
            segments.length === 1
              ? { x: 100, y: 100 }
              : polar(fit.distance, sector.centerAngle + 90);
          const imageSize = fit.size;
          const clipId = `${clipPrefix}-wedge-${index}`;
          const wedgePath = wedge(sector.startAngle + 90, sector.endAngle + 90);
          const labelWidth =
            segments.length > 10 ? 30 : segments.length > 6 ? 38 : 52;
          const imageUrl =
            segment.kind === "prize" && !failedImages.has(segment.id)
              ? resolveWheelImageUrl(
                  segment.imageKey,
                  LUCKY_WHEEL_IMAGE_BASE_URL,
                )
              : null;

          return (
            <g key={segment.id}>
              <clipPath id={clipId}>
                <path d={wedgePath} />
              </clipPath>
              <path d={wedgePath} fill="#fff" />
              <g clipPath={`url(#${clipId})`}>
                {imageUrl ? (
                  <image
                    href={imageUrl}
                    x={imagePoint.x - imageSize / 2}
                    y={imagePoint.y - imageSize / 2}
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
                  <Gift
                    x={imagePoint.x - imageSize * 0.3}
                    y={imagePoint.y - imageSize * 0.3}
                    width={imageSize * 0.6}
                    height={imageSize * 0.6}
                    color="#18181b"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                )}
                {(soldOut || !segment.enabled) && (
                  <foreignObject
                    x={imagePoint.x - labelWidth / 2}
                    y={imagePoint.y - 8}
                    width={labelWidth}
                    height={16}
                  >
                    <div
                      className={styles.wheelLabel}
                      style={{
                        fontSize:
                          segments.length > 10
                            ? 5
                            : segments.length > 6
                              ? 6
                              : 7.5,
                      }}
                    >
                      <span className={styles.wheelBadge}>
                        {t(
                          !segment.enabled
                            ? "unavailableSegment"
                            : "soldOutPrize",
                        )}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
              <path
                d={wedgePath}
                fill="none"
                stroke="#18181b"
                strokeWidth="0.9"
              />
            </g>
          );
        })}
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke="#09090b"
          strokeWidth="1.3"
        />
      </svg>
      <div className={styles.hub} aria-hidden="true" />
    </div>
  );
}
