import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Ashimarket — Find Amazing Deals, Sell With Ease',
    template: '%s | Ashimarket',
  },
  description:
    'Ashimarket is a modern multi-vendor marketplace where you can buy and sell everything from electronics to real estate. Make offers, bid at auction, and find unbeatable deals.',
  keywords: [
    'marketplace', 'buy', 'sell', 'deals', 'electronics', 'cars', 'real estate',
    'auction', 'make offer', 'online shopping', 'ashimarket',
  ],
  authors: [{ name: 'Ashimarket' }],
  creator: 'Ashimarket',
  publisher: 'Ashimarket',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Ashimarket',
    title: 'Ashimarket — Find Amazing Deals, Sell With Ease',
    description:
      'A modern marketplace for buying and selling everything. Auctions, offers, and incredible deals.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Ashimarket Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ashimarket',
    description: 'Find Amazing Deals. Sell With Ease.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D7377' },
    { media: '(prefers-color-scheme: dark)', color: '#095456' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
