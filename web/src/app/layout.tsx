import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { NavigationTracker } from "@/components/NavigationTracker";
import ClientProviders from "./client-providers";
import { Toaster } from "sonner";
import { PWAInstaller } from "@/components/PWAInstaller";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Web Search RAG Platform",
  description:
    "A comprehensive RAG system with web crawling, PDF processing, and AI chat capabilities",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RAG Platform",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="RAG Platform" />
      </head>
      <body className="antialiased bg-gray-50 hmr-stable">
        <ClientProviders>
          <PWAInstaller />
          <NavigationTracker />
          <div className="flex h-screen flex-col lg:flex-row">
            {/* Navigation - Desktop only - simplified responsive classes */}
            <div className="hidden lg:block flex-shrink-0 h-full">
              <Navigation />
            </div>
            {/* Main content - takes remaining space, adjusts for mobile */}
            <main className="flex-1 overflow-auto min-w-0">{children}</main>
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
