import type { ReactNode } from 'react';
import { BackLink, Card } from './ui';

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <BackLink href="/">← CyberQalqon</BackLink>

      <header>
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-1 text-[0.75rem] text-slate-600">{updated}</p>
      </header>

      <Card className="p-5">
        {/* .lesson caps the measure at 65ch, which is what legal prose needs. */}
        <div className="lesson">{children}</div>
      </Card>
    </div>
  );
}
