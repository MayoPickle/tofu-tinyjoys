import './globals.css';
import { Nunito, Baloo_2 } from 'next/font/google';
import { Providers } from './providers';

// 配置字体
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  display: 'swap',
});

export const metadata = {
  title: '豆腐小乐事 | 可爱的待办事项应用',
  description: '一个精美可爱的待办事项应用，帮助你管理日常任务，支持多设备同步和多种视图模式。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${nunito.variable} ${baloo.variable}`}>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 