'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/* ── Animated brand panel for auth screens ───────────────────────────────────
   Desktop only. Floating shield, orbiting nodes, gradient mesh. Purely
   decorative — it sits behind `aria-hidden` and never intercepts pointer
   events, so the form stays the only interactive region. */

const NODES = [
  { x: '12%', y: '22%', delay: 0, size: 10, color: '#7c3aed' },
  { x: '82%', y: '16%', delay: 0.6, size: 7, color: '#2563eb' },
  { x: '70%', y: '68%', delay: 1.1, size: 12, color: '#06b6d4' },
  { x: '22%', y: '74%', delay: 0.3, size: 8, color: '#a3e635' },
  { x: '48%', y: '38%', delay: 0.9, size: 6, color: '#7c3aed' },
  { x: '88%', y: '44%', delay: 1.4, size: 9, color: '#22d3ee' },
  { x: '8%', y: '52%', delay: 0.5, size: 6, color: '#3b82f6' },
];

const LINKS: [number, number][] = [
  [0, 4], [1, 5], [2, 5], [3, 6], [0, 6], [4, 2], [4, 3], [1, 4],
];

function nodePos(i: number) {
  const n = NODES[i];
  return { left: n.x, top: n.y };
}

export function AuthBrandPanel({
  headline,
  body,
  children,
}: {
  headline: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl border border-border bg-gradient-hero lg:flex lg:flex-col lg:justify-between">
      {/* gradient mesh */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-mesh animate-gradient" />

      {/* circuit grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      {/* animated network */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
        {LINKS.map(([a, b], i) => {
          const na = NODES[a];
          const nb = NODES[b];
          return (
            <motion.line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="url(#nodeGradient)"
              strokeWidth={1}
              strokeOpacity={0.35}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, strokeOpacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          );
        })}
        <defs>
          <linearGradient id="nodeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {NODES.map((n, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            ...nodePos(i),
            width: n.size,
            height: n.size,
            background: n.color,
            boxShadow: `0 0 16px ${n.color}`,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: n.delay }}
        />
      ))}

      {/* content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2.5"
        >
          <ShieldMark />
          <span className="text-lg font-extrabold tracking-tight text-white">CyberQalqon</span>
        </motion.div>

        <div className="relative">
          {/* floating shield */}
          <motion.div
            aria-hidden="true"
            className="absolute -top-40 right-4 grid h-56 w-56 place-items-center"
            animate={{ y: [0, -16, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BigShield />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white text-balance"
          >
            {headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4 max-w-sm text-base leading-relaxed text-slate-300"
          >
            {body}
          </motion.p>

          {children}
        </div>
      </div>
    </div>
  );
}

function ShieldMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-[0_6px_20px_-6px_rgb(124_58_237_/_0.8)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6L12 2.5Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path d="M8.6 12.2 11 14.6l4.6-4.8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function BigShield() {
  return (
    <svg width="220" height="240" viewBox="0 0 220 240" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="shieldFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#2563eb" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M110 14 34 44v62c0 52 32 94 76 112 44-18 76-60 76-112V44l-76-30Z"
        fill="url(#shieldFill)"
        stroke="url(#shieldStroke)"
        strokeWidth="2"
      />
      <path
        d="M110 34 52 56v52c0 42 25 76 58 92 33-16 58-50 58-92V56l-58-22Z"
        fill="none"
        stroke="url(#shieldStroke)"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="4 6"
      />
      <path
        d="M84 112 104 132 142 92"
        stroke="url(#shieldStroke)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
