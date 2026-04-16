"use client";

import React, { useState, useEffect, useRef } from "react";

interface InViewWrapperProps {
  children: React.ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

export default function InViewWrapper({ 
  children, 
  rootMargin = "400px", 
  minHeight = "600px" 
}: InViewWrapperProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Use IntersectionObserver to detect when the section is near the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el); // Only need to load it once
        }
      },
      { root: null, rootMargin }
    );
    
    observer.observe(el);

    return () => observer.disconnect();
  }, [rootMargin]);

  // Before it is in view, render a placeholder div with a minimum height 
  // to preserve layout space and prevent weird scroll jumps.
  // Once in view, we render the actual heavy component.
  return (
    <div ref={ref} style={{ minHeight: inView ? "auto" : minHeight, width: "100%" }}>
      {inView ? children : null}
    </div>
  );
}
