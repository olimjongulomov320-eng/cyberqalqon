import type { Metadata, Viewport } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

// Manrope instead of Inter: geometric, semi-condensed, unmistakably not the
// default UI font — and it ships a cyrillic subset, so the ru locale never
// falls back mid-sentence.
const sans = Manrope({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-mono',
});

const TITLE = 'CyberQalqon — kiber xavfsizlikni oʻrganish';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cyberqalqon.uz'),
  title: { default: TITLE, template: '%s · CyberQalqon' },
  description:
    'Qisqa darslar va savollar orqali kiber xavfsizlikni oʻzbek va rus tilida oʻrganing. XP toʻplang, reytingda koʻrinishing.',
  applicationName: 'CyberQalqon',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'CyberQalqon' },
  // `appleWebApp.capable` emits the deprecated apple-* tag; Chrome asks for the
  // standard mobile-web-app-capable alongside it. Declaring both silences the
  // console warning without dropping the iOS behaviour.
  other: { 'mobile-web-app-capable': 'yes' },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'CyberQalqon',
    title: TITLE,
    description: 'Kiber xavfsizlikni qisqa darslar bilan oʻrganing.',
    locale: 'uz_UZ',
    alternateLocale: 'ru_RU',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'CyberQalqon' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: 'Kiber xavfsizlikni oʻrganish.',
    images: ['/icons/icon-512.png'],
  },
  // Both cards declared a large image card but shipped no image, so shares
  // rendered with no preview at all.
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#080c14',
  width: 'device-width',
  initialScale: 1,
  // maximumScale is deliberately not set. Clamping it blocks pinch-zoom, which
  // is a WCAG 1.4.4 failure and the single most common accessibility complaint
  // on mobile.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${sans.variable} ${mono.variable}`}>
      <body className="grain">
        <a
          href="#main"
          className="sr-only rounded-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-skip focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-text-inverse"
        >
          Skip to content / Oʻtish
        </a>

        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
