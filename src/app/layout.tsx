import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.siteName}｜「今すぐ何をすればいい？」がすぐわかる`,
    template: `%s｜${siteConfig.siteName}`,
  },
  description: siteConfig.siteDescription,
  keywords: [
    '親の介護施設選び',
    '老人ホーム 選び方',
    '特別養護老人ホーム 特養',
    '有料老人ホーム 費用',
    '認知症 グループホーム',
    '老人ホーム 費用 年金内',
    '退院迫る 施設探し',
    '介護 兄弟 対立',
  ],
  metadataBase: new URL(siteConfig.siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    url: siteConfig.siteUrl,
    siteName: siteConfig.siteName,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
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
      <body className="min-h-screen flex flex-col justify-between antialiased selection:bg-orange-100 selection:text-orange-950">
        <Header />
        <main className="grow max-w-5xl w-full mx-auto px-4 py-6 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
