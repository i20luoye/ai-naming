import type { Metadata } from 'next';
import { Noto_Serif_SC, Noto_Sans_SC, JetBrains_Mono } from 'next/font/google';

import './globals.css';

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '天衍 · AI八字智能起名',
    template: '%s · 天衍',
  },
  description:
    '基于八字喜用神分析，AI智能生成+诗词出处，为宝宝起一个好名。传统文化数字化工具。',
  keywords: [
    '起名',
    '八字起名',
    'AI起名',
    '宝宝起名',
    '喜用神',
    '五行',
    '诗词起名',
    '天衍',
  ],
  authors: [{ name: '天衍' }],
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
    <html lang="zh-CN" className={`${notoSerifSC.variable} ${notoSansSC.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-ink-900 text-ink-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
