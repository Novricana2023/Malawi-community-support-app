"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Shield, CheckCircle2, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TransparencyPage() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    api.dashboard.transparency().then(setStats).catch(() => {});
  }, []);

  const items = [
    { label: "Issues Reported", value: stats.total_reported || 0, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: "Issues Resolved", value: stats.total_resolved || 0, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "In Progress", value: stats.in_progress || 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Pending Review", value: stats.pending || 0, icon: Clock, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="gradient-hero text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-emerald-200" />
            <h1 className="text-3xl font-bold">Public Transparency Portal</h1>
          </div>
          <p className="text-emerald-100">
            Open accountability — see how your community&apos;s development challenges are being addressed.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-5xl font-bold text-emerald-800">{stats.resolution_rate || 0}%</p>
          <p className="text-gray-500 mt-2">Community Issue Resolution Rate</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {items.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="py-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-500">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-10">
          <Link href="/solved">
            <Button size="lg" className="gap-2">
              <CheckCircle2 className="w-5 h-5" />
              View Solved Issues by Date
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            Browse every community issue the District Office has resolved, sorted by date.
          </p>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Building Trust Through Transparency</h3>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Dela Langa ensures every community issue is tracked, every action is recorded, and every citizen can see progress being made in their district.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
