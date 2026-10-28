import { fetchModules } from '@/lib/api';
import LessonView from './lesson-client';
import knownSlugs from '@/lib/module-slugs.json';

// Static export (GitHub Pages) requires every dynamic route to be enumerated at
// build time — there is no server to render `/modules/[slug]` on demand. We pull
// the public module catalog (GET /v1/modules is `optionalAuth`, so no token is
// needed) and pre-render one page per slug. A module added later needs a rebuild
// to get a page; that is inherent to static hosting.
//
// Slugs are language-neutral, but we union both locales defensively in case a
// module is published in only one language.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = new Set<string>();
  for (const lang of ['uz', 'ru']) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { modules } = await fetchModules(lang);
        for (const m of modules) slugs.add(m.slug);
        break;
      } catch (err) {
        // The API is a free tier that sleeps; a cold start can exceed a single
        // attempt. Retry with backoff; if the API stays unreachable, fall back
        // to the committed slug list (kept in sync by a backend test) so a
        // sleeping free-tier host can no longer block a deploy.
        if (attempt === 3) break;
        await new Promise((r) => setTimeout(r, 5000 * attempt));
      }
    }
  }
  for (const slug of knownSlugs) slugs.add(slug);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LessonView slug={slug} />;
}
