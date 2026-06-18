import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Dela Langa — Community Development Management System",
  description: "Smart citizen engagement and community development management platform for Malawi. Every citizen has a voice.",
  keywords: ["Malawi", "citizen engagement", "district management", "community development"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
