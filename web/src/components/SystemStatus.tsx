"use client";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceStatus } from "@/types/rag";

interface SystemStatusProps {
  services?: ServiceStatus[];
}

const defaultServices: ServiceStatus[] = [
  { name: "Vector Database", status: "online", color: "success" },
  { name: "Embedding Service", status: "online", color: "success" },
  { name: "Search Engine", status: "online", color: "success" },
  { name: "LLM Service", status: "degraded", color: "warning" },
];

export default function SystemStatus({ services = defaultServices }: SystemStatusProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Globe className="w-4 h-4 text-blue-500" />
        System Status
      </h3>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
          >
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              service.color === "success" ? "bg-green-500" : "bg-yellow-500"
            )} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {service.name}
            </span>
            <span className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
              service.color === "success"
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50"
            )}>
              {service.status === "online" ? "Online" : "Degraded"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
