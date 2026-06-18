"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [performance, setPerformance] = useState<{ status: string; count: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ category: string; count: number }[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) router.push("/official/login");
    if (user) {
      Promise.all([
        api.dashboard.resolutionPerformance(),
        api.dashboard.byCategory(),
        api.dashboard.stats(),
      ]).then(([perf, cat, s]) => {
        setPerformance(perf);
        setByCategory(cat);
        setStats(s);
      }).catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <AppShell role="official">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Performance</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="py-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resolution Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2D6A4F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#40916C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-4">Key Metrics Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Resolution Rate", value: stats.total_reports ? `${Math.round((stats.resolved_issues / stats.total_reports) * 100)}%` : "0%" },
              { label: "Avg Resolution", value: `${stats.avg_resolution_days || 0} days` },
              { label: "Active Emergencies", value: stats.emergency_cases || 0 },
              { label: "Pending Backlog", value: stats.pending_issues || 0 },
            ].map((m) => (
              <div key={m.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-800">{m.value}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
