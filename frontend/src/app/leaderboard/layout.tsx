import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reyting',
  description: 'Eng koʻp XP toʻplagan oʻquvchilar reytingi.',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
