import type { Metadata } from 'next';
import AgeGate from '@/components/AgeGate';

export const metadata: Metadata = {
  title: 'Sinov intervyulari',
  description:
    'Kiber xavfsizlik rollari boʻyicha texnik suhbat mashqi: nazariya, real holat tahlili va Python topshiriq, oxirida batafsil baholash varaqasi.',
};

export default function InterviewsLayout({ children }: { children: React.ReactNode }) {
  return <AgeGate rule="no-code">{children}</AgeGate>;
}
