"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Notification } from "@/lib/types";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.notifications.list().then(setNotifications).catch(() => {});
    }
  }, [user]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: number) => {
    await api.notifications.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h4 className="font-semibold text-gray-900">Notifications</h4>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer",
                    !n.is_read && "bg-emerald-50/50"
                  )}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  {n.report_id && (
                    <Link href={`/citizen/reports/${n.report_id}`} className="text-xs text-emerald-700 mt-1 inline-block">
                      View report →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
