"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { SolvedIssuesList } from "@/components/citizen/SolvedIssuesList";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { SolvedReport } from "@/lib/types";
import { CheckCircle2, ArrowUpDown } from "lucide-react";

export default function CitizenSolvedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<SolvedReport[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/citizen/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.reports.mySolved(sortOrder).then((r) => {
        setReports(r.reports);
        setTotal(r.total);
      }).catch(() => {});
    }
  }, [user, sortOrder]);

  if (loading || !user) return null;

  return (
    <AppShell role="citizen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Solved Issues</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Issues you reported that the District Office has resolved — sorted by date.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortOrder === "desc" ? "primary" : "outline"}
            size="sm"
            onClick={() => setSortOrder("desc")}
          >
            <ArrowUpDown className="w-4 h-4" /> Newest first
          </Button>
          <Button
            variant={sortOrder === "asc" ? "primary" : "outline"}
            size="sm"
            onClick={() => setSortOrder("asc")}
          >
            Oldest first
          </Button>
        </div>
      </div>

      {total > 0 && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 mb-6">
          You have <strong>{total}</strong> resolved {total === 1 ? "issue" : "issues"}. Tap any case to see full details and government feedback.
        </p>
      )}

      <SolvedIssuesList reports={reports} showMineBadge linkPrefix="/citizen/reports" />

      <div className="mt-8 text-center">
        <Link href="/solved">
          <Button variant="outline">View all community solved issues →</Button>
        </Link>
      </div>
    </AppShell>
  );
}
