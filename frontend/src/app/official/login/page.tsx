"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function OfficialLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("official@soso.malawi.gov.mw");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.auth.demoLogin(email, "District Commissioner", "official");
      login(result.access_token, result.user);
      router.push("/official/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Government Portal</h1>
            <p className="text-sm text-gray-500">District Commissioner&apos;s Office</p>
          </div>
        </div>

        <div className="mb-6">
          <Label>Official Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="official@soso.malawi.gov.mw"
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <Button onClick={handleLogin} disabled={loading} variant="secondary" className="w-full mb-3" size="lg">
          <Shield className="w-5 h-5" />
          {loading ? "Authenticating..." : "Secure Government Login"}
        </Button>
        <p className="text-xs text-gray-400 text-center">
          Authorized personnel only. All actions are logged for accountability.
        </p>
      </motion.div>
    </div>
  );
}
