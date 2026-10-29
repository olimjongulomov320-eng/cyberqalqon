'use client';
import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/**
 * A single underline that slides between tabs/links instead of each item
 * switching its own style. It communicates "you moved here". Position and size
 * are applied with transform only (the width is a scale of a 100px base), and
 * the first measurement is placed without a transition so it never slides in
 * from the left on load.
 *
 * The container must be `position: relative`; the active child is found by
 * `aria-current` or `aria-selected`. Pass `activeKey` so it re-measures when the
 * active item changes.
 */
export default function SlidingIndicator({
  containerRef,
  activeKey,
  className = 'bg-cyan-400',
  offsetClass = 'bottom-0',
}: {
  containerRef: RefObject<HTMLElement | null>;
  activeKey: string;
  className?: string;
  offsetClass?: string;
}) {
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  const [armed, setArmed] = useState(false);

  const measure = () => {
    const c = containerRef.current;
    const el = c?.querySelector<HTMLElement>('[aria-current="page"], [aria-selected="true"]');
    if (!c || !el) return setBox(null);
    const cr = c.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setBox({ x: er.left - cr.left + c.scrollLeft, w: er.width });
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 60);
    const c = containerRef.current;
    if (!c || typeof ResizeObserver === 'undefined') return () => window.clearTimeout(t);
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!box) return null;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 h-0.5 w-[100px] origin-left ${offsetClass} ${className} ${
        armed ? 'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
      }`}
      style={{ transform: `translateX(${box.x}px) scaleX(${box.w / 100})` }}
    />
  );
}
