"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { Report } from "@/lib/types";
import { formatDate, getStatusColor, getUrgencyColor, formatCategory } from "@/lib/utils";
import { Search, ArrowRight } from "lucide-react";

export default function OfficialReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");

  const loadReports = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (urgencyFilter) params.urgency = urgencyFilter;
    api.reports.all(params).then((r) => setReports(r.reports)).catch(() => {});
  };

  useEffect(() => {
    if (!loading && !user) router.push("/official/login");
    if (user) loadReports();
  }, [user, loading, router]);

  useEffect(() => {
    const timer = setTimeout(loadReports, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, urgencyFilter]);

  if (loading || !user) return null;

  return (
    <AppShell role="official">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Report Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
        <Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="sm:w-44">
          <option value="">All Urgency</option>
          <option value="emergency">Emergency</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
        </Select>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Link key={report.id} href={`/official/reports/${report.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-emerald-700">{report.report_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace(/_/g, " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(report.urgency)}`}>
                        {report.urgency}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
                    <p className="text-sm text-gray-500">{formatCategory(report.category)} · {report.location} · {report.citizen?.full_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(report.created_at)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
