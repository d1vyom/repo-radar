import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RepoRadar | Premium GitHub Discovery',
  description: 'Discover, filter, and track trending open-source repositories.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] btn-primary">Skip to content</a>
        <Navbar />
        <main id="main-content" className="flex-1 min-w-0 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
