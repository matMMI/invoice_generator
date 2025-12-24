import { authClient } from "@/lib/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Settings {
  id: string;
  user_id: string;
  company_name: string;
  company_address: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_website: string | null;
  company_logo_url: string | null;
  pdf_footer_text: string | null;
  company_siret: string | null;
  is_vat_applicable: boolean;
  vat_exemption_text: string;
  late_payment_penalties: string;
  default_currency: string;
  default_tax_rate: number;
}

export interface SettingsUpdate {
  company_name: string;
  company_address?: string;
  company_email?: string;
  company_phone?: string;
  company_website?: string;
  company_logo_url?: string;
  pdf_footer_text?: string;
  company_siret?: string;
  is_vat_applicable?: boolean;
  vat_exemption_text?: string;
  late_payment_penalties?: string;
  default_currency: string;
  default_tax_rate: number;
}

/**
 * Get authentication headers with session token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await authClient.getSession();

  if (!session?.data?.session?.token) {
    throw new Error("Not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.data.session.token}`,
  };
}

export async function getSettings(): Promise<Settings> {
  const headers = await getAuthHeaders();

  // Create a new AbortController to manage timeouts if needed
  const response = await fetch(`${API_BASE}/api/settings`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.statusText}`);
  }
  return response.json();
}

export async function updateSettings(data: SettingsUpdate): Promise<Settings> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/settings`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update settings: ${response.statusText}`);
  }
  return response.json();
}

export async function resetAccount(): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/settings/reset`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to reset account: ${response.statusText}`);
  }
}
