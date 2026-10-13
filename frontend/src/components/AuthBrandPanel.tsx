'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/* ── Brand panel for auth screens ─────────────────────────────────────────────
   Desktop only. A static, editorial counterweight to the form: the real product
   mark, a headline, and whatever proof points the caller passes in. It is
   `aria-hidden` behind the form's own labelling and never intercepts pointer
   events, so the form stays the only interactive region.

   The previous version floated seven coloured nodes on infinite loops over a
   violet→cobalt mesh. Both were removed: infinite motion is banned outright and
   the multi-hue mesh fought the single-accent rule. */

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
    <div className="relative hidden overflow-hidden rounded-2xl border border-border bg-surface-900 shadow-card edge-light lg:flex lg:flex-col">
      {/* Static circuit grid — depth without motion. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
        }}
      />

      {/* A single cyan bloom anchored top-centre — the only glow in the panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/[0.12] blur-3xl"
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-16 p-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.svg`} alt="" width={34} height={34} className="shrink-0" priority />
          <span className="text-lg font-extrabold tracking-tight text-white">CyberQalqon</span>
        </motion.div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white text-balance"
          >
            {headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-sm text-base leading-relaxed text-text-secondary"
          >
            {body}
          </motion.p>

          {children}
        </div>
      </div>
    </div>
  );
}
