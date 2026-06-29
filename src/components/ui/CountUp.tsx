"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';

interface CountUpProps {
  text: string;
  duration?: number;
  suffixClassName?: string;
}

/**
 * Lightweight count-up animation.
 * Uses a single IntersectionObserver + requestAnimationFrame loop.
 * Writes directly to the DOM via ref to avoid React re-renders during animation.
 */
export default function CountUp({ text, duration = 2000, suffixClassName }: CountUpProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
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
    if (hasAnimated.current || endValue === 0 || !numRef.current) return;
    hasAnimated.current = true;

    let start: number | undefined;
    const el = numRef.current;

    const step = (ts: number) => {
      if (start === undefined) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = pct === 1 ? 1 : 1 - Math.pow(2, -10 * pct);
      const val = Math.floor(ease * endValue);

      el.textContent = val.toLocaleString();

      if (pct < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = endValue.toLocaleString();
      }
    };

    requestAnimationFrame(step);
  }, [prefix, suffix, endValue, duration]);

  useEffect(() => {
    const container = containerRef.current;
    const numEl = numRef.current;
    if (!container || !numEl) return;

    // Show initial text (0 if animatable)
    if (endValue > 0) {
      numEl.textContent = '0';
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
    io.observe(container);
    return () => io.disconnect();
  }, [endValue, runAnimation]);

  if (endValue === 0) {
    return <span>{text}</span>;
  }

  // Render separated parts
  return (
    <span ref={containerRef} className="inline-flex items-baseline">
      {prefix && <span>{prefix}</span>}
      <span ref={numRef}>0</span>
      {suffix && <span className={suffixClassName}>{suffix}</span>}
    </span>
  );
}
