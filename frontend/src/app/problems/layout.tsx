import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masalalar',
  description:
    'Mavzu, qiyinlik va tur boʻyicha filtrlangan masalalar — real oʻquv dasturidan mashq qiling.',
};

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
