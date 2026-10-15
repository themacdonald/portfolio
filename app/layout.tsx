import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ProfileJsonLd, metadata as siteMetadata } from "@/lib/seo";

export const metadata: Metadata = siteMetadata;

/** Display: a serif with optical sizing and a wonk axis, for the headline. */
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

/** Body: quiet, legible, gets out of the way. */
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

/** Data: every label, figure, and code line. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Paint the stored archetype and motion preference before hydration so the
 * workspace never flashes the wrong theme.
 */
const BOOTSTRAP = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("portfolio.theme");if(t==="light"||t==="dark"){d.dataset.theme=t;d.style.colorScheme=t;}var m=localStorage.getItem("portfolio.reduceMotion");d.dataset.reduceMotion=m==="true"?"true":"false";}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" data-reduce-motion="false" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
        <ProfileJsonLd />
      </head>
      <body className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
