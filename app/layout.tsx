import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "themacdonald / notebook",
  description:
    "Engineering notebook documenting AI systems, data analytics, research, and open source work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}