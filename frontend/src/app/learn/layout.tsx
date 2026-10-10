import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oʻrganish',
  description: 'Qisqa interaktiv darslar orqali kiber xavfsizlikni oʻrganing.',
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
