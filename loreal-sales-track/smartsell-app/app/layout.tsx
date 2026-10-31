import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { TopBar } from '@/components/TopBar';
import { Toast } from '@/components/Toast';
import { JudgeGuide } from '@/components/JudgeGuide';

export const metadata: Metadata = {
  title: 'SMARTSELL Field Sales',
  description: 'Field sales intelligence and inventory intervention prototype for the L\'Oréal Sustainability Challenge 2026 (Sales Track). Synthetic data.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Providers>
          <TopBar />
          <main className="mx-auto max-w-7xl px-4 pb-28 pt-5">{children}</main>
          <Toast />
          <JudgeGuide />
        </Providers>
      </body>
    </html>
  );
}
