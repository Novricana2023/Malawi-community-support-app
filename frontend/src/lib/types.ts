function resolveApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  if (raw.endsWith("/api")) return raw;
  return `${raw.replace(/\/$/, "")}/api`;
}

export const API_URL = resolveApiUrl();

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  district?: string;
  area_village?: string;
  citizen_id?: string;
  role: "citizen" | "official" | "admin";
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: number;
  report_number: string;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  urgency: "emergency" | "high" | "normal";
  status: string;
  department_id?: number;
  department_name?: string;
  assigned_officer_id?: number;
  assigned_officer_name?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  citizen?: User;
  attachments?: { id: number; file_name: string; file_path: string; file_type: string }[];
  activities?: { id: number; action: string; description: string; created_at: string; user_name?: string }[];
  feedback?: { id: number; message: string; is_official: boolean; created_at: string; user_name?: string }[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  report_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface SolvedReport {
  id: number;
  report_number: string;
  category: string;
  title: string;
  location: string;
  area_village?: string;
  district?: string;
  status: string;
  department_name?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  is_mine?: boolean;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export const ISSUE_CATEGORIES = [
  { value: "road_damage", label: "Road Damage" },
  { value: "potholes", label: "Potholes" },
  { value: "broken_bridges", label: "Broken Bridges" },
  { value: "street_lights", label: "Street Lights Not Working" },
  { value: "waste_management", label: "Waste Management Problems" },
  { value: "illegal_dumping", label: "Illegal Dumping" },
  { value: "flooding", label: "Flooding" },
  { value: "fire_incidents", label: "Fire Incidents" },
  { value: "water_problems", label: "Water Problems" },
  { value: "infrastructure_damage", label: "Public Infrastructure Damage" },
  { value: "environmental", label: "Environmental Concerns" },
  { value: "other", label: "Other Development Issues" },
];

export const REPORT_STATUSES = [
  { value: "submitted", label: "Report Submitted", step: 1 },
  { value: "under_review", label: "Under Review", step: 2 },
  { value: "assigned", label: "Assigned to Department", step: 3 },
  { value: "in_progress", label: "Action in Progress", step: 4 },
  { value: "resolved", label: "Resolved", step: 5 },
  { value: "closed", label: "Closed", step: 6 },
];

export const MALAWI_DISTRICTS = [
  "Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza",
  "Dowa", "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga",
  "Mangochi", "Mchinji", "Mulanje", "Mwanza", "Mzimba", "Neno",
  "Ntcheu", "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo",
  "Zomba", "Nkhata Bay", "Nsanje",
];
