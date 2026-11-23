import type {Metadata, Viewport} from 'next';
import {
  Caveat,
  Instrument_Serif,
  JetBrains_Mono,
  Newsreader,
} from 'next/font/google';
import type {ReactNode} from 'react';
import {ThemeProvider} from '@/components/theme';
import {profile} from '@/lib/content';
import './globals.css';

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
});

const description =
  'Manas Shende is an AI/ML engineer building retrieval systems that cite ' +
  'their sources, medical-imaging models that explain themselves, and data ' +
  'pipelines that validate their own output.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? profile.site),
  title: 'Manas Shende: On Building Machines That Show Their Work',
  description,
  authors: [{name: profile.name, url: profile.github}],
  keywords: ['Manas Shende', 'AI engineer', 'machine learning', 'RAG',
    'LangChain', 'PyTorch', 'medical imaging', 'portfolio'],
  openGraph: {
    title: 'Manas Shende: AI / ML Engineer',
    description,
    type: 'website',
  },
  twitter: {card: 'summary_large_image'},
};

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f2ede3'},
    {media: '(prefers-color-scheme: dark)', color: '#0e0f0d'},
  ],
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrument.variable} ${newsreader.variable}
        ${jetbrains.variable} ${caveat.variable}`}
    >
      <body className="min-h-dvh text-[17px] leading-[1.7] sm:text-[18px]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
