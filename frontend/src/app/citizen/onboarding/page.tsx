"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { MALAWI_DISTRICTS } from "@/lib/types";

export default function CitizenOnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: "", district: "Lilongwe", area_village: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.updateProfile(form);
      await refreshUser();
      router.push("/citizen/dashboard");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-500 mb-6 text-sm">Help us serve your community better</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Phone Number</Label>
            <Input
              placeholder="+265 99X XXX XXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>District</Label>
            <Select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
              {MALAWI_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Area / Village</Label>
            <Input
              placeholder="e.g. Area 25, Kawale"
              value={form.area_village}
              onChange={(e) => setForm({ ...form, area_village: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Saving..." : "Continue to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
