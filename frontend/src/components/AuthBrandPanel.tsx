'use client';
import Image from 'next/image';
import { ReactNode } from 'react';
import Wordmark from '@/components/Wordmark';

/* ── Brand panel for auth screens ─────────────────────────────────────────────
   Desktop only. A static, editorial counterweight to the form: the real product
   mark, a headline, and whatever proof points the caller passes in. It is
   `aria-hidden` behind the form's own labelling and never intercepts pointer
   events, so the form stays the only interactive region.

   The previous version floated seven coloured nodes on infinite loops over a
   violet→cobalt mesh, and then animated its own copy in (opacity + y, staggered
   0-0.16s). Both are gone: infinite motion is banned, and entrance animation on
   ordinary copy is exactly the "fade-up everywhere" tell under review. */

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
    <div className="relative hidden overflow-hidden rounded-lg border border-border bg-surface-900 shadow-card edge-light lg:flex lg:flex-col">
      {/* Static circuit grid - depth without motion. */}
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

      <div className="relative z-10 flex h-full flex-col justify-between gap-16 p-10">
        <div className="flex items-center gap-3">
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.svg`} alt="" width={34} height={34} className="shrink-0" priority />
          <Wordmark className="text-lg" />
        </div>

        <div>
          <p className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white text-balance">
            {headline}
          </p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-text-secondary">
            {body}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
