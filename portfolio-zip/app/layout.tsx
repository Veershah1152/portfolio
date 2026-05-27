import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Toaster } from "@/components/ui/Toaster";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  title: {
    default: "Portfolio — Developer & Engineer",
    template: "%s | Portfolio",
  },
  description:
    "Full-stack developer portfolio featuring projects, skills, and experience.",
  keywords: ["developer", "portfolio", "full-stack", "typescript", "react", "next.js"],
  authors: [{ name: "Portfolio Owner" }],
  creator: "Portfolio Owner",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000",
    siteName: "Portfolio",
    title: "Portfolio — Developer & Engineer",
    description: "Full-stack developer portfolio featuring projects, skills, and experience.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — Developer & Engineer",
    description: "Full-stack developer portfolio featuring projects, skills, and experience.",
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
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-display antialiased bg-void text-foreground overflow-x-hidden">
        <LoadingScreen />
        <ScrollProgress />
        <CustomCursor />
        <CommandPalette />
        {children}
        <Toaster />
        {/* Scanlines overlay */}
        <div className="fixed inset-0 scanlines opacity-[0.04] pointer-events-none z-[60]" />
      </body>
    </html>
  );
}
