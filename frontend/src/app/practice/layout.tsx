import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Takrorlash',
  description: 'Bu sahifa koʻchirildi: takrorlash seansi endi /review manzilida.',
};

export default function PracticeLegacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
