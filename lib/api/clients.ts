/**
 * API client utilities for Client management.
 * All requests are authenticated using Better Auth session tokens.
 */

import { authClient } from "@/lib/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  address: string | null;
  phone: string | null;
  vat_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
  vat_number?: string;
}

export interface ClientUpdate extends Partial<ClientCreate> {}

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

/**
 * Create a new client
 */
export async function createClient(data: ClientCreate): Promise<Client> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/clients`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create client: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all clients with optional search
 */
export async function getClients(
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ clients: Client[]; total: number }> {
  const headers = await getAuthHeaders();
  const url = new URL(`${API_BASE}/api/clients`);

  if (search) {
    url.searchParams.set("search", search);
  }
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single client by ID
 */
export async function getClient(id: string): Promise<Client> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch client: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update a client
 */
export async function updateClient(
  id: string,
  data: ClientUpdate
): Promise<Client> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update client: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete client: ${response.statusText}`);
  }
}
