"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FileText, List, MapPin, Bell, AlertTriangle, ArrowRight, IdCard, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const quickActions = [
  { href: "/citizen/report", icon: FileText, label: "Report an Issue", color: "bg-emerald-600", desc: "Submit a new community report" },
  { href: "/citizen/reports", icon: List, label: "My Reports", color: "bg-blue-600", desc: "View all your submitted reports" },
  { href: "/citizen/solved", icon: CheckCircle2, label: "Solved Issues", color: "bg-green-600", desc: "See your resolved cases by date" },
  { href: "/citizen/reports", icon: MapPin, label: "Track Progress", color: "bg-purple-600", desc: "Follow resolution status" },
  { href: "/solved", icon: CheckCircle2, label: "Community Solved", color: "bg-teal-600", desc: "All issues resolved by the office" },
  { href: "/transparency", icon: Bell, label: "Community Updates", color: "bg-amber-600", desc: "Public development progress" },
  { href: "/citizen/report?emergency=true", icon: AlertTriangle, label: "Emergency Reporting", color: "bg-red-600", desc: "Urgent safety issues" },
];

export default function CitizenDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/citizen/login");
    if (!loading && user && !user.district) router.push("/citizen/onboarding");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <AppShell role="citizen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {user.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Your voice matters. Report issues and track progress here.</p>
        </div>

        {user.citizen_id && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white border-0">
            <CardContent className="py-5 flex items-center gap-4">
              <IdCard className="w-10 h-10 text-emerald-200" />
              <div>
                <p className="text-emerald-200 text-sm">Your Citizen ID</p>
                <p className="text-2xl font-bold tracking-wider">{user.citizen_id}</p>
              </div>
              <div className="ml-auto text-right text-sm text-emerald-200">
                <p>{user.district} District</p>
                <p>{user.area_village}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={action.href}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <CardContent className="py-5">
                    <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">{action.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-3" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
