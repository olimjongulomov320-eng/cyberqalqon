import type { Metadata } from 'next';
import AgeGate from '@/components/AgeGate';

export const metadata: Metadata = {
  title: 'Kod masalalari',
  description: 'Python masalalarini brauzerning oʻzida yeching: namunaviy va yashirin testlar bilan.',
};

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  return <AgeGate rule="no-code">{children}</AgeGate>;
}
