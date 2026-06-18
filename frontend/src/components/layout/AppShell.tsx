"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Map, BarChart3, LogOut, Menu, X, Shield, CheckCircle2,
} from "lucide-react";
import { useState } from "react";

const citizenLinks = [
  { href: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/citizen/report", label: "Report Issue", icon: FileText },
  { href: "/citizen/reports", label: "My Reports", icon: FileText },
  { href: "/citizen/solved", label: "Solved Issues", icon: CheckCircle2 },
  { href: "/solved", label: "Community Solved", icon: CheckCircle2 },
  { href: "/transparency", label: "Transparency", icon: BarChart3 },
];

const officialLinks = [
  { href: "/official/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/official/reports", label: "Reports", icon: FileText },
  { href: "/official/map", label: "Map View", icon: Map },
  { href: "/official/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/transparency", label: "Transparency", icon: Shield },
];

export function AppShell({ children, role }: { children: React.ReactNode; role: "citizen" | "official" }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = role === "citizen" ? citizenLinks : officialLinks;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href={role === "citizen" ? "/citizen/dashboard" : "/official/dashboard"} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">DL</span>
            </div>
            <div>
              <p className="font-bold text-emerald-900 text-sm leading-tight">Dela Langa</p>
              <p className="text-[10px] text-gray-500 leading-tight">
                {role === "citizen" ? "Citizen Portal" : "DC Office Portal"}
              </p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside className={cn(
          "fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 pt-16 md:pt-0 transform transition-transform md:transform-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    active ? "bg-emerald-800 text-white shadow-lg shadow-emerald-900/20" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
