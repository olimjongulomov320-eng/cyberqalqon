import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mashq',
  description: 'Xato qilgan mavzularingizni takrorlab, bilimingizni mustahkamlang.',
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
