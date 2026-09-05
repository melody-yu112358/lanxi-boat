import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '蓝溪镇 · 借火岩 | 湖上漫游',
  description: '与阿根、小白和小黑一起乘舟进入蓝溪镇。一段可以暂停、环顾的轻量三维湖上旅程。',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
