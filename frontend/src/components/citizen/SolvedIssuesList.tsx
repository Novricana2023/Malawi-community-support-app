"use client";

import Link from "next/link";
import { SolvedReport } from "@/lib/types";
import { formatCategory, formatDate, groupSolvedByDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2, MapPin, Building2, ArrowRight } from "lucide-react";

interface SolvedIssuesListProps {
  reports: SolvedReport[];
  showMineBadge?: boolean;
  linkPrefix?: string;
}

export function SolvedIssuesList({
  reports,
  showMineBadge = false,
  linkPrefix = "/citizen/reports",
}: SolvedIssuesListProps) {
  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No solved issues yet. Check back as the District Office resolves community reports.</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupSolvedByDate(reports);

  return (
    <div className="space-y-8">
      {grouped.map(([dateLabel, dayReports]) => (
        <div key={dateLabel}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-emerald-200" />
            <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-full">
              {dateLabel}
            </span>
            <div className="h-px flex-1 bg-emerald-200" />
          </div>
          <div className="space-y-3">
            {dayReports.map((r) => (
                <Link key={r.id} href={`${linkPrefix}/${r.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="text-xs font-mono text-emerald-700">{r.report_number}</span>
                            {showMineBadge && r.is_mine && (
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                                Your report
                              </span>
                            )}
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full capitalize">
                              {r.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{r.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatCategory(r.category)}
                            {r.area_village && ` · ${r.area_village}`}
                            {r.district && `, ${r.district}`}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {r.location}
                            </span>
                            {r.department_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {r.department_name}
                              </span>
                            )}
                          </div>
                          {r.resolution_notes && (
                            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-3">
                              {r.resolution_notes}
                            </p>
                          )}
                          {r.resolved_at && (
                            <p className="text-xs text-gray-400 mt-2">
                              Resolved {formatDate(r.resolved_at)}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
