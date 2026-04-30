import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LASU TECH X 5.0 - Beyond Code',
    template: '%s | LASU TECH X 5.0',
  },
  description:
    'LASU TECH X 5.0 is the flagship student technology conference at Lagos State University. Explore keynotes, workshops, and industry connections in one bold, high-impact event.',
  keywords: [
    'LASU TECH X',
    'LASU TECH X 5.0',
    'technology conference nigeria',
    'lagos tech event',
    'Lagos State University',
    'student technology conference',
    'GDG LASU',
    'tech careers nigeria',
    'software engineering event',
    'ai and cloud workshops',
  ],
  authors: [{ name: 'GDG LASU Community' }],
  creator: 'GDG LASU Community',
  publisher: 'LASU TECH X',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lasutechx.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LASU TECH X 5.0 - Beyond Code',
    description:
      'LASU TECH X 5.0 brings students, professionals, and builders together for a full day of learning, networking, and opportunity.',
    url: 'https://lasutechx.com',
    siteName: 'LASU TECH X 5.0',
    images: [
      {
        url: '/images/Hero_Bg.jpg',
        width: 1200,
        height: 630,
        alt: 'LASU TECH X 5.0 - Beyond Code',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LASU TECH X 5.0 - Beyond Code',
    description:
      'A bold student-led tech conference at LASU. Keynotes, workshops, networking, and practical career insights.',
    images: ['/images/Hero_Bg.jpg'],
    creator: '@lasutechx',
    site: '@lasutechx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'pending-google-site-verification-token',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/icons/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#00E676" />
        <meta name="msapplication-TileColor" content="#00E676" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>
        <header className="border-border bg-background/95 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
          <div className="site-container flex items-center justify-between py-4">
            <Link
              href="/"
              className="text-display text-foreground flex items-center gap-3 text-[16px] font-extrabold tracking-tight sm:text-2xl"
            >
              <img src="/icons/favicon-32x32.png" alt="LASU TECH X" className="h-8 w-8 sm:h-9 sm:w-9" />
              <span>
                LASU TECH<span className="text-primary">X</span> 5.0
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              <a
                href="https://lasu-techx-5-mu.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-border hover:border-foreground text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:scale-105"
                title="Main Website"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </nav>
          </div>
        </header>

        <main className="pt-16s sm:pt-20">
          {children}
        </main>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
