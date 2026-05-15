import type { Metadata } from 'next';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Queuely — Distributed Job Queue Management',
    template: '%s | Queuely',
  },
  description:
    'Enterprise-grade distributed job queue with priority scheduling, automatic retries, circuit breakers, and real-time observability.',
  keywords: [
    'job queue',
    'distributed systems',
    'task scheduling',
    'message queue',
    'background jobs',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Queuely',
    title: 'Queuely — Distributed Job Queue Management',
    description:
      'Enterprise-grade distributed job queue with real-time observability.',
  },
};

/**
 * โครงสร้างหลักของแอปพลิเคชัน (Root Layout) — เป็น Server Component
 * Providers ทั้งหมดที่ต้องรันฝั่ง Client จะถูกแยกไปอยู่ใน AppProviders
 * เพื่อให้ Root Layout นี้ทำงานได้เบาและรองรับ SSR อย่างเต็มรูปแบบ
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-neutral-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
