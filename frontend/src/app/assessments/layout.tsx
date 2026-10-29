import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nazoratlar',
  description: 'Har bir boʻlim oxiridagi nazorat nuqtalari: bilimingizni tekshiring.',
};

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
