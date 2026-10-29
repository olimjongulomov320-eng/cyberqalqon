'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import NavBar from '@/components/NavBar';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';

/**
 * Route-aware shell. The authentication screens run their own full-bleed
 * split layout, so the global nav/footer and the centred content column are
 * suppressed there. The lesson runner is a focused assessment surface: it keeps
 * the nav but drops the footer and the generous page padding so the question,
 * options, progress and actions can share a single viewport. Every other route
 * keeps the standard chrome.
 *
 * Pages no longer animate in: the route transition that used to fade + rise
 * every page on navigation is gone, so content is visible immediately and
 * nothing shifts after paint. `MotionConfig reducedMotion="user"` still gates
 * the remaining interaction animations in the tree.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <Shell>{children}</Shell>
    </MotionConfig>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/auth');

  // Route widths, owned by the shell so pages never re-declare a container:
  // lessons and legal prose stay at a reading-measure column; landing,
  // dashboard, learn map, practice, leaderboard and profile get the wide
  // composition that suits richer layouts.
  // Wide laptop screens get a wide column; only long-form prose (legal text)
  // keeps a reading measure. Pages that are lists by nature (leaderboard,
  // review) centre themselves at a narrower width in their own layout.
  const prose = Boolean(pathname?.startsWith('/privacy') || pathname?.startsWith('/terms'));
  const width = prose ? 'max-w-3xl' : 'max-w-7xl';

  // The lesson runner is treated as a test surface: no marketing footer, a
  // flex column so the active question can fill exactly the space between the
  // nav and the bottom of the viewport, and smaller gutters than a content page.
  const test = Boolean(pathname?.startsWith('/modules'));

  if (bare) {
    return (
      <div className="flex min-h-dvh flex-col">
        <main id="main" tabIndex={-1} className="flex flex-1 items-center px-4 py-8 focus:outline-none sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar />
      <main
        id="main"
        tabIndex={-1}
        className={
          test
            ? `mx-auto flex w-full flex-1 flex-col px-4 pb-24 pt-5 focus:outline-none sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-8 lg:pt-8 ${width}`
            : `mx-auto w-full flex-1 px-4 pb-28 pt-6 focus:outline-none sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pt-10 ${width}`
        }
      >
        {children}
      </main>
      {!test && <Footer />}
      <BottomNav />
    </div>
  );
}

function Footer() {
  const { lang } = useApp();
  const tr = makeT(lang);
  return (
    <footer className="mx-auto hidden w-full max-w-7xl px-4 pb-8 sm:block sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-5 text-xs text-text-muted">
        <p>CyberQalqon | {tr('tagline')}</p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="transition-colors hover:text-text-secondary">{tr('privacy')}</Link>
          <Link href="/terms" className="transition-colors hover:text-text-secondary">{tr('terms')}</Link>
        </nav>
      </div>
    </footer>
  );
}
