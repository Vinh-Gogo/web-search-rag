import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { NavigationTracker } from "@/components/NavigationTracker";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Web Search RAG Platform",
  description: "A comprehensive RAG system with web crawling, PDF processing, and AI chat capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50">
        <NavigationTracker />
        <div className="flex h-screen">
          {/* Navigation - flex-shrink-0 prevents shrinking, full height */}
          <div className="flex-shrink-0 h-full">
            <Navigation />
          </div>
          {/* Main content - takes remaining space */}
          <main className="flex-1 overflow-auto min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
