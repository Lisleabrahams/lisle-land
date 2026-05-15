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
  title: "Lisle & Pool",
  description: "Portfolio of Lisle Abrahams — Content Lead, Art Director, and Creative exploring the frontier of human-AI collaboration.",
  keywords: ["portfolio", "creative", "content lead", "art direction", "design"],
  authors: [{ name: "Lisle Abrahams" }],
  openGraph: {
    title: "Lisle & Pool",
    description: "Portfolio of Lisle Abrahams — Content Lead, Art Director, and Creative exploring the frontier of human-AI collaboration.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lisle & Pool",
    description: "Portfolio of Lisle Abrahams — Content Lead, Art Director, and Creative exploring the frontier of human-AI collaboration.",
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
