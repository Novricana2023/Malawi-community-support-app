"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { api, downloadPdf } from "@/lib/api";
import { ISSUE_CATEGORIES, Report } from "@/lib/types";
import { getUrgencyColor, formatCategory } from "@/lib/utils";
import { Upload, MapPin, CheckCircle2, Download, AlertTriangle } from "lucide-react";

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmergency = searchParams.get("emergency") === "true";
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<Report | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [form, setForm] = useState({
    category: isEmergency ? "fire_incidents" : "potholes",
    title: "",
    description: "",
    location: user?.area_village ? `${user.area_village}, ${user.district}` : "",
  });
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("category", form.category);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("location", form.location);
      if (gps) {
        fd.append("latitude", String(gps.lat));
        fd.append("longitude", String(gps.lng));
      }
      if (files) {
        Array.from(files).forEach((f) => fd.append("files", f));
      }
      const report = await api.reports.create(fd);
      setSubmitted(report);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 mb-6">Your report has been received by the District Commissioner&apos;s Office.</p>
        <Card className="mb-6 text-left">
          <CardContent className="py-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Report Number</span>
              <span className="font-bold text-emerald-800">{submitted.report_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span>{formatCategory(submitted.category)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Priority</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(submitted.urgency)}`}>
                {submitted.urgency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="capitalize">{submitted.status.replace(/_/g, " ")}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => downloadPdf(api.reports.pdfUrl(submitted.id), `${submitted.report_number}.pdf`)}>
            <Download className="w-4 h-4" /> Download PDF Receipt
          </Button>
          <Button variant="outline" onClick={() => router.push(`/citizen/reports/${submitted.id}`)}>
            Track Progress
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {isEmergency && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800 font-medium">Emergency Reporting — Your report will be prioritized immediately.</p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Report a Community Issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Issue Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {ISSUE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input placeholder="Brief summary of the issue" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <Label>Location</Label>
            <Input placeholder="Area, village, landmark" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          {gps && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2">
              <MapPin className="w-4 h-4" />
              GPS captured: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
            </div>
          )}
          <div>
            <Label>Photos / Videos</Label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-emerald-400 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload evidence</span>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => setFiles(e.target.files)} />
            </label>
            {files && <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

export default function ReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/citizen/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <AppShell role="citizen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ReportForm />
      </Suspense>
    </AppShell>
  );
}
