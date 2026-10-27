import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexton | Enterprise Role-Based Portal",
  description: "Nexton Enterprise Task Lifecycle, Team Hierarchy & Query Resolution Platform",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexton",
  },
};

import FcmInitializer from "@/components/common/FcmInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <FcmInitializer />
        {children}
      </body>
    </html>
  );
}
