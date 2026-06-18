"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";

const CommunityMap = dynamic(() => import("@/components/map/CommunityMap"), { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 rounded-2xl animate-pulse" /> });

export default function MapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mapData, setMapData] = useState<Record<string, unknown>[]>([]);
  const [areaStats, setAreaStats] = useState<{ area: string; count: number }[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/official/login");
    if (user) {
      api.dashboard.map().then(setMapData).catch(() => {});
      api.dashboard.byArea().then(setAreaStats).catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <AppShell role="official">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Map View</h1>
      <p className="text-gray-500 mb-6">Report locations, problem hotspots, and development needs by area</p>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="h-[500px]">
                <CommunityMap data={mapData} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="py-5">
              <h3 className="font-semibold text-gray-900 mb-4">Hotspots by Area</h3>
              <div className="space-y-3">
                {areaStats.map((area) => (
                  <div key={area.area} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{area.area}</span>
                    <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {area.count} reports
                    </span>
                  </div>
                ))}
                {areaStats.length === 0 && <p className="text-sm text-gray-400">No area data yet</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
