import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dars',
  description: 'Interaktiv dars: savollarga javob bering va XP toʻplang.',
};

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
