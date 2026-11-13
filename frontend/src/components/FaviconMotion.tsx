'use client';

import { useEffect } from 'react';

/**
 * Plays the brand mark's draw-in (the same one LogoMark runs in the header) in
 * the browser tab once per page load, then hands the tab back to the static
 * icon.svg. Browsers do not animate SVG favicons themselves, so frames are
 * painted on a canvas and swapped into the icon <link>s. Skipped entirely for
 * reduced motion; waits until the tab is first visible so a page opened in a
 * background tab still gets to show it.
 */

// Same geometry as public/logo.svg, in its 24-unit grid.
const RING: [number, number][] = [
  [15.29, 19.95], [8.71, 19.95], [4.05, 15.29], [4.05, 8.71],
  [8.71, 4.05], [15.29, 4.05], [19.95, 8.71], [19.95, 15.29],
];
const SIZE = 64;
const ORIGIN = 3; // icon.svg viewBox starts at 3,3 and spans 18.6 units
const SCALE = SIZE / 18.6;
const DRAW_MS = 1100;
const FADE_START = 800;
const FADE_MS = 500;

// Approximates the header's cubic-bezier(0.4, 0, 0.2, 1).
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function drawRing(ctx: CanvasRenderingContext2D, progress: number) {
  const segs = RING.slice(1).map((p, i) => Math.hypot(p[0] - RING[i][0], p[1] - RING[i][1]));
  let left = segs.reduce((a, b) => a + b, 0) * progress;
  ctx.beginPath();
  ctx.moveTo(...RING[0]);
  for (let i = 1; i < RING.length && left > 0; i++) {
    const [x0, y0] = RING[i - 1];
    const [x1, y1] = RING[i];
    const f = Math.min(1, left / segs[i - 1]);
    ctx.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
    left -= segs[i - 1];
  }
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawInner(ctx: CanvasRenderingContext2D, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(9, 9.2); ctx.lineTo(12.2, 12); ctx.lineTo(9, 14.8);
  ctx.moveTo(12.9, 14.8); ctx.lineTo(15.1, 14.8);
  ctx.stroke();
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(17.1, 17.1); ctx.lineTo(20.6, 20.6);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export default function FaviconMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-cq-icon]'));
    if (!links.length) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const originals = links.map(l => ({ l, href: l.href, type: l.type, sizes: l.getAttribute('sizes') }));
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let raf = 0;
    let done = false;

    const restore = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      for (const o of originals) {
        o.l.href = o.href;
        o.l.type = o.type;
        if (o.sizes) o.l.setAttribute('sizes', o.sizes);
      }
    };

    const play = () => {
      const start = performance.now();
      let last = 0;
      const frame = (now: number) => {
        const t = now - start;
        if (t >= FADE_START + FADE_MS) return restore();
        // ~30fps is plenty for a 16px icon and keeps the work tiny.
        if (now - last >= 33) {
          last = now;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, SIZE, SIZE);
          ctx.setTransform(SCALE, 0, 0, SCALE, -ORIGIN * SCALE, -ORIGIN * SCALE);
          ctx.strokeStyle = dark ? '#39d98a' : '#16a063';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          drawRing(ctx, ease(Math.min(1, t / DRAW_MS)));
          if (t > FADE_START) drawInner(ctx, Math.min(1, (t - FADE_START) / FADE_MS));
          const url = canvas.toDataURL('image/png');
          for (const o of originals) {
            o.l.type = 'image/png';
            o.l.removeAttribute('sizes');
            o.l.href = url;
          }
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onVisible);
      play();
    };
    if (document.hidden) document.addEventListener('visibilitychange', onVisible);
    else play();

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      restore();
    };
  }, []);

  return null;
}
