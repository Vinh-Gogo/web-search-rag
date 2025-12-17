"use client";

import dynamic from "next/dynamic";
import { Database } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";

const RAGQueryClient = dynamic(() => import("@/components/RAGQueryClient"), {
  ssr: true,
  loading: () => (
    <div className="p-8 h-full overflow-auto bg-muted/20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          RAG Query System
        </h1>
        <p className="text-muted-foreground text-lg">
          Loading RAG Query System...
        </p>
      </div>
    </div>
  ),
});

export default function RAGPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 overflow-x-hidden">
      {/* Brand Header - Fixed at top */}
      <BrandHeader
        icon={Database}
        title="RAG Query"
        subtitle="Vector Search Interface"
        statusText="RAG System Ready"
      />
      {/* Content Area - Let root layout handle scrolling */}
      <RAGQueryClient />
    </div>
  );
}
