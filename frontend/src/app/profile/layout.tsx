import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profilim',
  description: 'Statistika, yutuqlar va kunlik seriyangiz.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
