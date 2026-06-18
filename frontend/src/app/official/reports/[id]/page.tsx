"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Input";
import { TrackingTimeline } from "@/components/citizen/TrackingTimeline";
import { api } from "@/lib/api";
import { Report, Department } from "@/lib/types";
import { formatDate, getUrgencyColor, formatCategory } from "@/lib/utils";
import { User, MapPin, MessageSquare } from "lucide-react";

export default function OfficialReportDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [status, setStatus] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReport = () => {
    if (params.id) api.reports.get(Number(params.id)).then((r) => {
      setReport(r);
      setStatus(r.status);
      setDepartmentId(String(r.department_id || ""));
      setResolutionNotes(r.resolution_notes || "");
    }).catch(() => router.push("/official/reports"));
  };

  useEffect(() => {
    if (!loading && !user) router.push("/official/login");
    if (user) {
      loadReport();
      api.departments().then(setDepartments).catch(() => {});
    }
  }, [user, loading, params.id, router]);

  const handleUpdate = async () => {
    if (!report) return;
    setSaving(true);
    try {
      await api.reports.update(report.id, {
        status,
        department_id: departmentId ? Number(departmentId) : null,
        resolution_notes: resolutionNotes,
      });
      loadReport();
    } finally {
      setSaving(false);
    }
  };

  const handleFeedback = async () => {
    if (!report || !feedbackMsg) return;
    await api.reports.feedback(report.id, feedbackMsg);
    setFeedbackMsg("");
    loadReport();
  };

  if (loading || !user || !report) return null;

  return (
    <AppShell role="official">
      <div className="mb-6">
        <p className="text-sm font-mono text-emerald-700">{report.report_number}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{report.title}</h1>
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
              <p>{report.description}</p>
            </CardContent>
          </Card>

          {report.citizen && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Citizen Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Name</span><p className="font-medium">{report.citizen.full_name}</p></div>
                <div><span className="text-gray-500">Citizen ID</span><p className="font-medium">{report.citizen.citizen_id}</p></div>
                <div><span className="text-gray-500">Email</span><p className="font-medium">{report.citizen.email}</p></div>
                <div><span className="text-gray-500">Phone</span><p className="font-medium">{report.citizen.phone || "N/A"}</p></div>
                <div><span className="text-gray-500">District</span><p className="font-medium">{report.citizen.district}</p></div>
                <div><span className="text-gray-500">Area</span><p className="font-medium">{report.citizen.area_village}</p></div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Add Official Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={3} placeholder="Provide feedback to the citizen..." value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)} />
              <Button onClick={handleFeedback} size="sm">Send Feedback</Button>
              {report.feedback?.map((f) => (
                <div key={f.id} className={`rounded-xl p-3 text-sm ${f.is_official ? "bg-amber-50" : "bg-gray-50"}`}>
                  <span className="font-medium">{f.user_name}</span> · <span className="text-gray-400 text-xs">{formatDate(f.created_at)}</span>
                  <p className="mt-1">{f.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Manage Report</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
              <div>
                <Label>Assign Department</Label>
                <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Resolution Notes</Label>
                <Textarea rows={3} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} />
              </div>
              <Button onClick={handleUpdate} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Update Report"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <TrackingTimeline currentStatus={report.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
