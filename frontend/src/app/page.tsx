"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Building2, MapPin, Shield, BarChart3, Bell, FileText, ArrowRight, CheckCircle2,
} from "lucide-react";

const features = [
  { icon: FileText, title: "Report Issues", desc: "Report community development challenges in seconds" },
  { icon: BarChart3, title: "Track Progress", desc: "Follow your report like a delivery tracking system" },
  { icon: Bell, title: "Real-time Updates", desc: "Receive notifications at every stage of resolution" },
  { icon: Shield, title: "Transparency", desc: "Public accountability builds trust in government" },
];

const stats = [
  { value: "100%", label: "Accountability" },
  { value: "24/7", label: "Citizen Access" },
  { value: "Real-time", label: "Issue Tracking" },
  { value: "Digital", label: "Transformation" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                <span className="text-white font-bold text-lg">DL</span>
              </div>
              <div>
                <p className="font-bold text-lg">Dela Langa</p>
                <p className="text-emerald-200 text-xs">Republic of Malawi</p>
              </div>
            </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors">
            Public Transparency →
          </Link>
          <Link href="/solved" className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors ml-4">
            Solved Issues →
          </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                National Digital Governance Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Community Development<br />
                <span className="text-emerald-200">Management System</span>
              </h1>
              <p className="text-lg text-emerald-100 mb-4 leading-relaxed">
                Smart citizen engagement platform connecting citizens directly with the District Commissioner&apos;s Office.
              </p>
              <p className="text-emerald-200 italic mb-10 text-sm">
                &ldquo;Every citizen has a voice. Every community issue has a path to resolution.&rdquo;
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-emerald-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Role Selection Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Dela Langa</h2>
              <p className="text-gray-500 mb-8">How would you like to continue?</p>

              <div className="space-y-4">
                <Link href="/citizen/login" className="block group">
                  <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <Users className="w-7 h-7 text-emerald-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">Citizen</p>
                      <p className="text-sm text-gray-500">Report issues & track progress</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Link>

                <Link href="/official/login" className="block group">
                  <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                      <Building2 className="w-7 h-7 text-amber-700 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">District Commissioner&apos;s Office</p>
                      <p className="text-sm text-gray-500">Manage reports & analytics</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Malawi&apos;s Future</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A complete digital governance platform designed to improve citizen participation, accountability, and community development.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Report Any Community Issue</h2>
          <p className="text-gray-500 text-center mb-12">From road damage to environmental concerns — we&apos;ve got you covered</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "Road Damage", "Potholes", "Broken Bridges", "Street Lights",
              "Waste Management", "Illegal Dumping", "Flooding", "Fire Incidents",
              "Water Problems", "Infrastructure", "Environmental", "Other Issues",
            ].map((cat) => (
              <div key={cat} className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-gray-700">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-hero text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-lg">Dela Langa</span>
          </div>
          <p className="text-emerald-200 text-sm mb-2">Community Development Management System for Developing Nations</p>
          <p className="text-emerald-300 text-xs">Republic of Malawi — Digital Transformation Initiative</p>
        </div>
      </footer>
    </div>
  );
}
