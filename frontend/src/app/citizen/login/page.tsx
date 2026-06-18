"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function CitizenLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const name = form.full_name || "Citizen User";
      const email = form.email || `citizen${Date.now()}@example.mw`;
      const result = await api.auth.demoLogin(email, name, "citizen");
      login(result.access_token, result.user);
      if (!result.user.district) {
        router.push("/citizen/onboarding");
      } else {
        router.push("/citizen/dashboard");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Citizen Login</h1>
            <p className="text-sm text-gray-500">Access your citizen portal</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label>Full Name</Label>
            <Input
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <Button onClick={handleGoogleLogin} disabled={loading} className="w-full mb-3" size="lg">
          <Mail className="w-5 h-5" />
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
        <p className="text-xs text-gray-400 text-center">
          Demo mode: Enter your details and click to sign in. Google OAuth ready for production.
        </p>
      </motion.div>
    </div>
  );
}
