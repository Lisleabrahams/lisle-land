import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lisle Abrahams",
  description: "World-class creative director with 15+ years of agency craft, now operating as an AI-augmented studio of one.",
  keywords: ["portfolio", "creative", "content lead", "art direction", "design"],
  authors: [{ name: "Lisle Abrahams" }],
  openGraph: {
    title: "Lisle Abrahams",
    description: "World-class creative director with 15+ years of agency craft, now operating as an AI-augmented studio of one.",
    type: "website",
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
      </body>
    </html>
  );
}
