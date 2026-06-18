import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    assigned: "bg-purple-100 text-purple-800",
    in_progress: "bg-orange-100 text-orange-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getUrgencyColor(urgency: string) {
  const colors: Record<string, string> = {
    emergency: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    normal: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[urgency] || "bg-gray-100 text-gray-800";
}

export function formatCategory(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatDateOnly(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function groupSolvedByDate(reports: { resolved_at?: string; [key: string]: unknown }[]) {
  const groups = new Map<string, typeof reports>();
  for (const report of reports) {
    const key = report.resolved_at ? formatDateOnly(report.resolved_at) : "Date unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(report);
  }
  return Array.from(groups.entries());
}
