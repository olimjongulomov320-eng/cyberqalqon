'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';

/**
 * Compatibility entry point. The mistake-review session that used to live at
 * /practice is now /review (and "Practice" in the navigation means the
 * challenge catalogue). Old bookmarks and links keep working through here.
 */
export default function PracticeRedirect() {
  const router = useRouter();
  const { lang } = useApp();
  const tr = makeT(lang);
  useEffect(() => {
    router.replace('/review');
  }, [router]);
  return (
    <p className="py-10 text-center text-sm text-text-secondary">
      <Link href="/review" className="font-semibold text-cyan-300 hover:underline">
        {tr('reviewSession')}
      </Link>
    </p>
  );
}
