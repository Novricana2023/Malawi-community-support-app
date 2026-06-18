"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Report } from "@/lib/types";
import { formatDate, getStatusColor, getUrgencyColor, formatCategory } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "solved";

const SOLVED_STATUSES = ["resolved", "closed"];

export default function MyReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!loading && !user) router.push("/citizen/login");
    if (user) api.reports.my().then((r) => setReports(r.reports)).catch(() => {});
  }, [user, loading, router]);

  if (loading || !user) return null;

  const filtered = reports.filter((r) => {
    if (filter === "solved") return SOLVED_STATUSES.includes(r.status);
    if (filter === "active") return !SOLVED_STATUSES.includes(r.status);
    return true;
  });

  const solvedCount = reports.filter((r) => SOLVED_STATUSES.includes(r.status)).length;

  return (
    <AppShell role="citizen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
        <Link href="/citizen/solved">
          <Button variant="outline" size="sm">
            <CheckCircle2 className="w-4 h-4" /> View Solved Issues ({solvedCount})
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          ["all", "All Reports"],
          ["active", "In Progress"],
          ["solved", "Solved"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filter === key
                ? "bg-emerald-800 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              {filter === "solved"
                ? "None of your reports have been solved yet."
                : filter === "active"
                ? "You have no active reports in progress."
                : "You haven't submitted any reports yet."}
            </p>
            {filter === "solved" ? (
              <Link href="/solved" className="text-emerald-700 font-medium hover:underline">
                Browse community solved issues →
              </Link>
            ) : (
              <Link href="/citizen/report" className="text-emerald-700 font-medium hover:underline">
                Report your first issue →
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const isSolved = SOLVED_STATUSES.includes(report.status);
            return (
              <Link key={report.id} href={`/citizen/reports/${report.id}`}>
                <Card className={cn(
                  "hover:shadow-md transition-all cursor-pointer",
                  isSolved && "border-l-4 border-l-green-500"
                )}>
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isSolved && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          <span className="text-xs font-mono text-emerald-700">{report.report_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.replace(/_/g, " ")}
                          </span>
                          {!isSolved && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(report.urgency)}`}>
                              {report.urgency}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{formatCategory(report.category)} · {report.location}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {isSolved && report.resolved_at
                            ? `Resolved ${formatDate(report.resolved_at)}`
                            : `Submitted ${formatDate(report.created_at)}`}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
