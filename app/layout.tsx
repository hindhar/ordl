import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ordl",
  description: "A daily puzzle game where you order 6 historical events chronologically. New puzzle every day!",
  keywords: ["ordl", "history", "puzzle", "daily game", "wordle", "trivia", "timeline"],
  authors: [{ name: "Ordl" }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: "Ordl",
    description: "Can you order 6 historical events? New puzzle daily!",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ordl",
    description: "Can you order 6 historical events? New puzzle daily!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF9F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-bg-primary text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}
