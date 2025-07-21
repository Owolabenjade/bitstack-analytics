import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ToastProvider } from '@/components/notifications/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BitStack Analytics',
  description:
    'Cross-Chain Bitcoin Portfolio Analytics Dashboard built on Stacks',
  keywords: ['Bitcoin', 'Stacks', 'Portfolio', 'Analytics', 'DeFi'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#f97316',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://api.coincap.io" />
        <link rel="preconnect" href="https://api.testnet.hiro.so" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider maxToasts={5}>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="relative">{children}</main>
            </div>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
