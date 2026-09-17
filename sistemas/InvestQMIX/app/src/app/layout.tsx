import type { Metadata } from 'next';
import { Open_Sans, Montserrat, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-open-sans',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-montserrat',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'QMIX Invest — Smart Money Tracking B3',
  description: 'Sistema de inteligência financeira pessoal — smart money tracking na B3 / CVM / SEC',
  icons: {
    icon: '/icon-qmix.webp',
    apple: '/icon-qmix.webp',
  },
  appleWebApp: {
    capable: true,
    title: 'QMIX Invest',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050a0f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${openSans.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <main
          style={{
            flex: 1,
            maxWidth: '1880px',
            width: '100%',
            margin: '0 auto',
            padding: '24px 28px',
          }}
        >
          {children}
        </main>
        <footer
          style={{
            background: 'var(--bg-alt)',
            borderTop: '1px solid var(--border-hex)',
            padding: '24px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <strong style={{ color: 'var(--foreground-hex)', fontFamily: 'Montserrat, sans-serif' }}>
              QMIX Invest
            </strong>{' '}
            v0.6.0 — Smart Money tracking B3 / CVM / SEC
            <br />
            <span style={{ opacity: 0.7 }}>
              Uso pessoal · Dados de fontes públicas · Sem recomendação de investimento
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
