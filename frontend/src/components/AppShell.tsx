'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import NavBar from '@/components/NavBar';
import BottomNav from '@/components/BottomNav';
import { DUR, EASE } from '@/lib/motion';

/**
 * Route-aware shell. The authentication screens run their own full-bleed
 * split layout, so the global nav/footer and the centred content column are
 * suppressed there. Every other route keeps the standard chrome.
 *
 * `MotionConfig reducedMotion="user"` makes every Framer Motion animation in the
 * tree honour the OS "reduce motion" preference — transforms and layout
 * animations are skipped, opacity fades still play.
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
  const narrow = Boolean(
    pathname?.startsWith('/modules') || pathname?.startsWith('/privacy') || pathname?.startsWith('/terms')
  );
  const width = narrow ? 'max-w-3xl' : 'max-w-5xl';

  if (bare) {
    return (
      <div className="flex min-h-dvh flex-col">
        <main id="main" tabIndex={-1} className="flex flex-1 items-center px-4 py-8 focus:outline-none sm:px-6 lg:py-12">
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
        className={`mx-auto w-full flex-1 px-4 pb-24 pt-6 focus:outline-none sm:pb-12 ${width}`}
      >
        <PageMotion pathname={pathname ?? '/'}>{children}</PageMotion>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

/**
 * Route transition: a short fade + rise keyed by pathname, so navigating
 * between pages breathes instead of snapping. `MotionConfig reducedMotion`
 * above downgrades this to a plain fade for users who prefer reduced motion.
 */
function PageMotion({ pathname, children }: { pathname: string; children: ReactNode }) {
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="mx-auto hidden w-full max-w-5xl items-center justify-between gap-4 px-4 pb-8 pt-2 text-xs text-text-muted sm:flex">
      <p>CyberQalqon</p>
      <nav className="flex gap-4">
        <a href="/privacy" className="transition-colors hover:text-text-secondary">Privacy</a>
        <a href="/terms" className="transition-colors hover:text-text-secondary">Terms</a>
      </nav>
    </footer>
  );
}
