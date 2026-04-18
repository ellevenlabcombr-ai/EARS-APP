import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ScrollToTop } from '@/components/ScrollToTop';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const viewport: Viewport = {
  themeColor: '#050B14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ELLEVEN Wellness | EARS',
  description: 'Sistema de monitoramento de wellness para atletas da EARS (7 a 19 anos).',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EARS',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__ENV = {
                NEXT_PUBLIC_SUPABASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')},
                NEXT_PUBLIC_SUPABASE_ANON_KEY: ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')}
              };
              window.addEventListener('error', (e) => {
                if (e.message && e.message.includes('ChunkLoadError')) {
                  console.warn('ChunkLoadError detected, reloading page...');
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#050B14] text-slate-50" suppressHydrationWarning>
        <ErrorBoundary>
          <LanguageProvider>
            {children}
            <ScrollToTop />
            <InstallPrompt />
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
