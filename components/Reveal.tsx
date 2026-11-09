"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
  /** Direction the element travels from. */
  from?: "up" | "left" | "right" | "none";
  className?: string;
};

/**
 * Reveal — fades + slides children into view when scrolled into the viewport.
 * Uses IntersectionObserver (no external dependency) and honours
 * prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  from = "up",
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = {
    up: "translate-y-8",
    left: "-translate-x-8",
    right: "translate-x-8",
    none: "",
  }[from];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${hidden}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
