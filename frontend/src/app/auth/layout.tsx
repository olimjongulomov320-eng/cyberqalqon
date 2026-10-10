import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kirish',
  description: 'CyberQalqon hisobingizga kiring yoki bir daqiqada roʻyxatdan oʻting.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
