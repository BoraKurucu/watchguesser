import Script from "next/script";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import CookieConsent from "@/components/CookieConsent";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://watchguesser.watch"),
  title: "WatchGuesser – Test Your Horology Knowledge",
  description: "A GeoGuessr-inspired game where you guess luxury watches from high-resolution images. Test your knowledge of Rolex, Patek Philippe, Audemars Piguet, and more.",
  keywords: ["watch game", "horology", "watch guessing", "luxury watches", "rolex", "patek philippe", "audemars piguet", "watch enthusiast", "timepiece game", "swiss watches", "watch quiz", "luxury watch game", "watch identification", "horology quiz"],
  authors: [{ name: "WatchGuesser Team" }],
  creator: "WatchGuesser",
  publisher: "WatchGuesser",
  category: "Games",
  classification: "Entertainment",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WatchGuesser – Test Your Horology Knowledge",
    description: "The ultimate challenge for watch enthusiasts. Guess the reference from the details.",
    url: "https://watchguesser.watch",
    siteName: "WatchGuesser",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WatchGuesser - The Ultimate Horology Challenge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WatchGuesser – Test Your Horology Knowledge",
    description: "The ultimate challenge for watch enthusiasts. Guess the reference from the details.",
    images: ["/og-image.png"],
    creator: "@watchguesser",
    site: "@watchguesser",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "WatchGuesser",
  "operatingSystem": "Web",
  "applicationCategory": "GameApplication",
  "genre": "Horology Quiz",
  "description": "A GeoGuessr-inspired game where you guess luxury watches from high-resolution images.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "WatchGuesser"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="google-consent-mode" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            const storedConsent = typeof localStorage !== 'undefined' ? localStorage.getItem('google-consent-mode') : null;
            
            gtag('consent', 'default', {
              ad_storage: storedConsent === 'granted' ? 'granted' : 'denied',
              ad_user_data: storedConsent === 'granted' ? 'granted' : 'denied',
              ad_personalization: storedConsent === 'granted' ? 'granted' : 'denied',
              analytics_storage: storedConsent === 'granted' ? 'granted' : 'denied'
            });
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-804GFFBZR7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            gtag('js', new Date());
            gtag('config', 'G-804GFFBZR7');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
