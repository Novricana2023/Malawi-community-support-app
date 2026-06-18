"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TrackingTimeline } from "@/components/citizen/TrackingTimeline";
import { api, downloadPdf } from "@/lib/api";
import { Report } from "@/lib/types";
import { formatDate, getUrgencyColor, formatCategory } from "@/lib/utils";
import { Download, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ReportDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/citizen/login");
    if (user && params.id) {
      api.reports.get(Number(params.id)).then(setReport).catch(() => router.push("/citizen/reports"));
    }
  }, [user, loading, params.id, router]);

  if (loading || !user || !report) return null;

  const isSolved = report.status === "resolved" || report.status === "closed";

  return (
    <AppShell role="citizen">
      {isSolved && (
        <div className="bg-green-600 text-white rounded-2xl p-5 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 shrink-0" />
          <div>
            <p className="font-semibold text-lg">Your issue has been resolved!</p>
            <p className="text-green-100 text-sm">
              The District Commissioner&apos;s Office has completed work on your report
              {report.resolved_at && ` on ${formatDate(report.resolved_at)}`}.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-mono text-emerald-700">{report.report_number}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{report.title}</h1>
        </div>
        <Button onClick={() => downloadPdf(api.reports.pdfUrl(report.id), `${report.report_number}.pdf`)} size="sm">
          <Download className="w-4 h-4" /> PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Issue Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Category</span><p className="font-medium">{formatCategory(report.category)}</p></div>
                <div><span className="text-gray-500">Urgency</span><p><span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(report.urgency)}`}>{report.urgency.toUpperCase()}</span></p></div>
                <div><span className="text-gray-500">Location</span><p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}</p></div>
                <div><span className="text-gray-500">Submitted</span><p className="font-medium">{formatDate(report.created_at)}</p></div>
              </div>
              <div><span className="text-gray-500 text-sm">Description</span><p className="mt-1">{report.description}</p></div>
              {report.resolution_notes && (
                <div className="bg-green-50 rounded-xl p-4 mt-4">
                  <p className="text-sm font-medium text-green-800">Resolution Notes</p>
                  <p className="text-sm text-green-700 mt-1">{report.resolution_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {report.feedback && report.feedback.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {report.feedback.map((f) => (
                  <div key={f.id} className={`rounded-xl p-4 ${f.is_official ? "bg-amber-50 border border-amber-100" : "bg-gray-50"}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{f.user_name}{f.is_official && " (Official)"}</span>
                      <span className="text-xs text-gray-400">{formatDate(f.created_at)}</span>
                    </div>
                    <p className="text-sm">{f.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Track Progress</CardTitle></CardHeader>
            <CardContent>
              <TrackingTimeline currentStatus={report.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
