import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Landing Page Roast — Instant Conversion Feedback',
  description: 'Get brutally honest, AI-powered feedback on your landing page in seconds. Free conversion analysis.',
  keywords: 'landing page, conversion rate, CRO, website feedback, AI analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
