import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import QueryClientProvider from "@/providers/QueryClientProvider";
import { AppLayout } from "./_layout/AppLayout";
import { siteConfig } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Arc Raiders Companion App`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords.join(", "),
  authors: [{ name: "ArcDéx Team" }],
  creator: "ArcDéx",
  publisher: "ArcDéx",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Arc Raiders Companion App`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Arc Raiders Companion App`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Arc Raiders Companion App`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@arcdex",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "de": "/",
    },
  },
  verification: {
    // Add your verification tokens when available
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <link rel="alternate" hrefLang="en" href={siteConfig.url} />
        <link rel="alternate" hrefLang="de" href={siteConfig.url} />
        <link rel="alternate" hrefLang="x-default" href={siteConfig.url} />
      </head>
      <body>
        <QueryClientProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </QueryClientProvider>
        </body>
    </html>
  );
}
