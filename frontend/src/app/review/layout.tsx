import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Takrorlash',
  description: 'Xato qilgan mavzularingizni takrorlab, bilimingizni mustahkamlang.',
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl">{children}</div>;
}
