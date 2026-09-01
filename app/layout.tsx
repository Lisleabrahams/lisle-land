import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import MediaProtection from "@/components/MediaProtection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lisle.land"),
  title: "Lisle Abrahams",
  description: "World-class creative director with 15+ years of agency craft, now operating as an AI-augmented studio of one.",
  keywords: ["portfolio", "creative", "creative director", "art direction", "AI"],
  authors: [{ name: "Lisle Abrahams" }],
  openGraph: {
    title: "Lisle Abrahams",
    description: "World-class creative director with 15+ years of agency craft, now operating as an AI-augmented studio of one.",
    type: "website",
    url: "https://lisle.land",
    siteName: "lisle.land",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lisle Abrahams",
    description: "World-class creative director with 15+ years of agency craft, now operating as an AI-augmented studio of one.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SiteChrome />
        <MediaProtection />
      </body>
    </html>
  );
}
