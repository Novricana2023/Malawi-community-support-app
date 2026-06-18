"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  FileText, AlertTriangle, Clock, CheckCircle2, TrendingUp, Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadPdf } from "@/lib/api";

const COLORS = ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC"];

export default function OfficialDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [byCategory, setByCategory] = useState<{ category: string; count: number }[]>([]);
  const [byArea, setByArea] = useState<{ area: string; count: number }[]>([]);
  const [trends, setTrends] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/official/login");
    if (user && user.role !== "citizen") {
      Promise.all([
        api.dashboard.stats(),
        api.dashboard.byCategory(),
        api.dashboard.byArea(),
        api.dashboard.monthlyTrends(),
      ]).then(([s, cat, area, trend]) => {
        setStats(s);
        setByCategory(cat);
        setByArea(area);
        setTrends(trend);
      }).catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const statCards = [
    { label: "Total Community Reports", value: stats.total_reports || 0, icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "New Reports Today", value: stats.new_today || 0, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Issues", value: stats.pending_issues || 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Emergency Cases", value: stats.emergency_cases || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: "Resolved Issues", value: stats.resolved_issues || 0, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "Avg Resolution (days)", value: stats.avg_resolution_days || 0, icon: Clock, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <AppShell role="official">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Government Dashboard</h1>
          <p className="text-gray-500 mt-1">District Commissioner&apos;s Office — Real-time community insights</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => downloadPdf(api.dashboard.exportPdf(), "district-report.pdf")}>
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="py-6">
            <h3 className="font-semibold text-gray-900 mb-4">Issues by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(props) => `${props.name}: ${props.value}`}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <h3 className="font-semibold text-gray-900 mb-4">Issues by Area</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byArea}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Reporting Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1B4332" strokeWidth={2} dot={{ fill: "#2D6A4F" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </AppShell>
  );
}
