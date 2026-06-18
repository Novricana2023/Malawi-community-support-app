"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { SolvedReport } from "@/lib/types";
import { SolvedIssuesList } from "@/components/citizen/SolvedIssuesList";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowLeft, ArrowUpDown } from "lucide-react";

export default function PublicSolvedPage() {
  const [reports, setReports] = useState<SolvedReport[]>([]);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    api.reports.solved(sortOrder).then((r) => {
      setReports(r.reports);
      setTotal(r.total);
    }).catch(() => {});
  }, [sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="gradient-hero text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            <h1 className="text-3xl font-bold">Solved Community Issues</h1>
          </div>
          <p className="text-emerald-100">
            See issues the District Commissioner&apos;s Office has resolved — organised by date for full transparency.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <p className="text-gray-600">
            <strong className="text-emerald-800">{total}</strong> community {total === 1 ? "issue" : "issues"} resolved
          </p>
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
        </motion.div>

        <SolvedIssuesList reports={reports} linkPrefix="/solved" />

        <div className="mt-10 text-center">
          <Link href="/transparency">
            <Button variant="outline">View transparency statistics</Button>
          </Link>
          <span className="mx-2 text-gray-300">|</span>
          <Link href="/citizen/login">
            <Button variant="ghost" size="sm">Citizen login to see your solved reports</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
