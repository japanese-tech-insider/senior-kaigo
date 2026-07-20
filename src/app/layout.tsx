import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: '親が亡くなった後の実家整理の安心手引き｜手順・費用・空き家売却ガイド',
    template: '%s｜実家整理の安心手引き',
  },
  description:
    '「親が亡くなった後の実家、何から始める？」に結論ファーストで答える専門メディア。実家じまい、空き家売却、解体費用相場、遺品整理、相続手続きの選び方と無料相談窓口を提示します。',
  metadataBase: new URL('https://senior-jikka.web.app'),
  openGraph: {
    title: '親が亡くなった後の実家整理の安心手引き',
    description: '「親が亡くなった後の実家、何から始める？」に結論ファーストで答える専門メディア。',
    url: 'https://senior-jikka.web.app',
    siteName: '実家整理の安心手引き',
    locale: 'ja_JP',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col justify-between antialiased selection:bg-emerald-100 selection:text-emerald-950">
        <Header />
        <main className="grow max-w-5xl w-full mx-auto px-4 py-6 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
