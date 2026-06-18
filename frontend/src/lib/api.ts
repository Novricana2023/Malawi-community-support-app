import { API_URL, User, Report, Notification, Department, SolvedReport } from "./types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dela_langa_token");
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  if (res.status === 204) return {} as T;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json();
  return res as unknown as T;
}

export const api = {
  auth: {
    demoLogin: (email: string, full_name: string, role: string) =>
      apiFetch<{ access_token: string; user: User }>("/auth/demo-login", {
        method: "POST",
        body: JSON.stringify({ email, full_name, role }),
      }),
    googleAuth: (data: { email: string; full_name: string; google_id: string; role: string; avatar_url?: string }) =>
      apiFetch<{ access_token: string; user: User }>("/auth/google", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => apiFetch<User>("/auth/me"),
    updateProfile: (data: Partial<User>) =>
      apiFetch<User>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  },
  reports: {
    create: (formData: FormData) =>
      apiFetch<Report>("/reports", { method: "POST", body: formData }),
    my: (page = 1) => apiFetch<{ reports: Report[]; total: number }>(`/reports/my?page=${page}`),
    mySolved: (sort: "asc" | "desc" = "desc", page = 1) =>
      apiFetch<{ reports: SolvedReport[]; total: number }>(`/reports/my/solved?page=${page}&sort_order=${sort}`),
    solved: (sort: "asc" | "desc" = "desc", page = 1) =>
      apiFetch<{ reports: SolvedReport[]; total: number }>(`/reports/solved?page=${page}&sort_order=${sort}`),
    getSolved: (id: number) => apiFetch<SolvedReport>(`/reports/solved/${id}`),
    all: (params: Record<string, string> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch<{ reports: Report[]; total: number }>(`/reports/all?${qs}`);
    },
    get: (id: number) => apiFetch<Report>(`/reports/${id}`),
    update: (id: number, data: Record<string, unknown>) =>
      apiFetch<Report>(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    feedback: (id: number, message: string) =>
      apiFetch(`/reports/${id}/feedback`, { method: "POST", body: JSON.stringify({ message }) }),
    pdfUrl: (id: number) => `${API_URL}/reports/${id}/pdf`,
  },
  dashboard: {
    stats: () => apiFetch<Record<string, number>>("/dashboard/stats"),
    byCategory: () => apiFetch<{ category: string; count: number }[]>("/dashboard/by-category"),
    byArea: () => apiFetch<{ area: string; count: number }[]>("/dashboard/by-area"),
    monthlyTrends: () => apiFetch<{ month: string; count: number }[]>("/dashboard/monthly-trends"),
    resolutionPerformance: () => apiFetch<{ status: string; count: number }[]>("/dashboard/resolution-performance"),
    transparency: () => apiFetch<Record<string, number>>("/transparency"),
    map: () => apiFetch<Record<string, unknown>[]>("/map"),
    exportPdf: () => `${API_URL}/reports/export/district-summary`,
  },
  departments: () => apiFetch<Department[]>("/departments"),
  notifications: {
    list: () => apiFetch<Notification[]>("/notifications"),
    markRead: (id: number) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
  },
};

export async function downloadPdf(url: string, filename: string) {
  const token = getToken();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
