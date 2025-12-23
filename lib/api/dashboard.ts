import { authClient } from "@/lib/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface StatusCount {
  status: string;
  count: number;
}

export interface CurrencyTotal {
  currency: string;
  total: number;
}

export interface RecentQuote {
  id: string;
  quote_number: string;
  status: string;
  currency: string;
  total: number;
  created_at: string;
}

export interface DashboardMetrics {
  total_quotes: number;
  total_clients: number;
  quotes_by_status: StatusCount[];
  totals_by_currency: CurrencyTotal[];
  recent_quotes: RecentQuote[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const session = await authClient.getSession();
  const token = session.data?.session?.token;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE}/api/dashboard/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard metrics");
  }

  return response.json();
}
