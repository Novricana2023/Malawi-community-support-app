"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { SolvedReport } from "@/lib/types";
import { formatCategory, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2, ArrowLeft, MapPin, Building2 } from "lucide-react";

export default function PublicSolvedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<SolvedReport | null>(null);

  useEffect(() => {
    if (params.id) {
      api.reports.getSolved(Number(params.id)).then(setReport).catch(() => router.push("/solved"));
    }
  }, [params.id, router]);

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/solved" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to solved issues
        </Link>

        <div className="bg-green-600 text-white rounded-2xl p-5 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 shrink-0" />
          <div>
            <p className="font-semibold">Issue Resolved</p>
            <p className="text-green-100 text-sm">
              This community issue was resolved by the District Commissioner&apos;s Office
              {report.resolved_at && ` on ${formatDate(report.resolved_at)}`}.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="py-6 space-y-4">
            <div>
              <p className="text-sm font-mono text-emerald-700">{report.report_number}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{report.title}</h1>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category</span>
                <p className="font-medium">{formatCategory(report.category)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p className="font-medium capitalize">{report.status.replace(/_/g, " ")}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Location</span>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {report.location}
                </p>
              </div>
              {report.department_name && (
                <div className="col-span-2">
                  <span className="text-gray-500">Department</span>
                  <p className="font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {report.department_name}
                  </p>
                </div>
              )}
            </div>
            {report.resolution_notes && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm font-medium text-green-800">Resolution Summary</p>
                <p className="text-sm text-green-700 mt-1">{report.resolution_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
