import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { NavigationTracker } from "@/components/NavigationTracker";

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
          <Navigation />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
