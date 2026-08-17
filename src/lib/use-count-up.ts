import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * Smoothly animates a number towards `target`.
 * Purely presentational — never changes the underlying value.
 */
export function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !Number.isFinite(target)) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setDisplay(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      fromRef.current = display;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

/**
 * Animates the leading number inside a display string ("12h" -> counts to 12).
 * Non-numeric strings are returned untouched.
 */
export function useAnimatedValue(value: string) {
  const match = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : NaN;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const animated = useCountUp(Number.isFinite(target) ? target : 0);

  if (!match) return value;
  return `${animated.toFixed(decimals)}${suffix}`;
}
