"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';

interface CountUpProps {
  text: string;
  duration?: number;
}

/**
 * Lightweight count-up animation.
 * Uses a single IntersectionObserver + requestAnimationFrame loop.
 * Writes directly to the DOM via ref to avoid React re-renders during animation.
 */
export default function CountUp({ text, duration = 2000 }: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  // Parse text once — stable across renders
  const { prefix, suffix, endValue } = useMemo(() => {
    const match = text.match(/\d+(?:,\d+)*(?:\.\d+)?/);
    if (!match) return { prefix: '', suffix: '', endValue: 0 };
    return {
      prefix: text.substring(0, match.index),
      suffix: text.substring(match.index! + match[0].length),
      endValue: parseInt(match[0].replace(/,/g, ''), 10),
    };
  }, [text]);

  const runAnimation = useCallback(() => {
    if (hasAnimated.current || endValue === 0 || !spanRef.current) return;
    hasAnimated.current = true;

    let start: number | undefined;
    const el = spanRef.current;

    const step = (ts: number) => {
      if (start === undefined) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = pct === 1 ? 1 : 1 - Math.pow(2, -10 * pct);
      const val = Math.floor(ease * endValue);

      el.textContent = `${prefix}${val.toLocaleString()}${suffix}`;

      if (pct < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${endValue.toLocaleString()}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  }, [prefix, suffix, endValue, duration]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    // Show initial text (0 if animatable, raw text otherwise)
    if (endValue > 0) {
      el.textContent = `${prefix}0${suffix}`;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runAnimation();
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefix, suffix, endValue, runAnimation]);

  // Render once — all subsequent updates go through ref.textContent
  return <span ref={spanRef}>{text}</span>;
}
