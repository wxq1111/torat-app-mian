import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI塔罗牌',
    template: 'AI塔罗牌',
  },
  description:
    '为您带来沉浸式的抽牌体验，玄妙准确的预测结论',
  keywords: [
    'AI塔罗牌',
    '塔罗牌占卜',
    '在线塔罗',
    '塔罗解读',
    '沉浸式抽牌体验',
  ],
  authors: [{ name: 'AI塔罗牌' }],
  // icons: {
  //   icon: '',
  // },
  openGraph: {
    title: 'AI塔罗牌',
    description:
      '为您带来沉浸式的抽牌体验，玄妙准确的预测结论',
    siteName: 'AI塔罗牌',
    locale: 'zh_CN',
    type: 'website',
    // images: [
    //   {
    //     url: '',
    //     width: 1200,
    //     height: 630,
    //     alt: 'AI塔罗牌',
    //   },
    // ],
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
    <html lang="zh-CN">
      <head></head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
