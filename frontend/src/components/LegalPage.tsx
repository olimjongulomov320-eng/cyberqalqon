'use client';
import { Fragment } from 'react';
import { useApp } from '@/context/AppContext';
import { LEGAL, type LegalKind } from '@/lib/legal';
import { BackLink, Card } from './ui';

/**
 * Shared shell for the legal documents. It picks the active locale from the app
 * context and renders the matching long-form copy from `lib/legal`.
 */
export default function LegalPage({ kind }: { kind: LegalKind }) {
  const { lang } = useApp();
  const doc = LEGAL[kind][lang];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <BackLink href="/">CyberQalqon</BackLink>

      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white text-balance">{doc.title}</h1>
        <p className="num mt-1 text-[0.75rem] text-text-muted">{doc.updated}</p>
      </header>

      <Card className="p-5">
        {/* .lesson caps the measure at 65ch, which is what legal prose needs. */}
        <div className="lesson">
          {doc.intro.map((paragraph, i) => (
            <p key={`intro-${i}`}>{paragraph}</p>
          ))}

          {doc.sections.map((section, i) => (
            <Fragment key={`section-${i}`}>
              <h2 className="text-base font-bold text-white">{section.heading}</h2>
              {section.paragraphs.map((paragraph, j) => (
                <p key={`p-${j}`}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet, j) => (
                    <li key={`li-${j}`}>{bullet}</li>
                  ))}
                </ul>
              )}
            </Fragment>
          ))}

          <blockquote>{doc.note}</blockquote>
        </div>
      </Card>
    </div>
  );
}
