'use client';
import { useEffect, useRef, useState } from 'react';
import { valueAt } from '@/lib/countUp';

/**
 * Animates a whole number toward `target`. With `fromZero` it also counts up on
 * first appearance (used for stat tiles, where the count IS the reveal); without
 * it, it only animates changes, so a header counter does not replay on every
 * navigation. Reduced motion jumps straight to the value.
 */
export function useCountUp(target: number, fromZero = false) {
  const [shown, setShown] = useState(fromZero ? 0 : target);
  const from = useRef(fromZero ? 0 : target);
  useEffect(() => {
    if (from.current === target) {
      setShown(target);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('low-bandwidth')) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const v = valueAt(origin, target, now - start, 700);
      setShown(v);
      if (v !== target) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

export default function CountUp({ value, suffix = '', fromZero = true }: { value: number; suffix?: string; fromZero?: boolean }) {
  const shown = useCountUp(value, fromZero);
  return (
    <span className="num">
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
      {suffix}
    </span>
  );
}
