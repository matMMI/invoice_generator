import { authClient } from "@/lib/auth-client";

export enum Currency {
  EUR = "EUR",
}

export enum QuoteStatus {
  DRAFT = "Draft",
  SENT = "Sent",
  SIGNED = "Signed",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
}

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  order?: number;
}

export interface Quote {
  id: string;
  user_id: string;
  client_id?: string;
  client_name?: string;
  quote_number: string;
  status: QuoteStatus;
  currency: Currency;

  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;

  notes?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  items: QuoteItem[];
  share_token?: string;
  signed_at?: string;
  signer_name?: string;
  signer_ip?: string;
}

export interface CreateQuoteData {
  client_id: string;
  currency: Currency;
  tax_rate: number;
  notes?: string;
  payment_terms?: string;
  items: QuoteItem[];
}

export interface UpdateQuoteData {
  client_id?: string;
  currency?: Currency;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  items?: QuoteItem[];
  status?: QuoteStatus;
}

export async function getQuotes(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ quotes: Quote[]; total: number }> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const url = new URL("/api/quotes", process.env.NEXT_PUBLIC_API_URL || "");
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quotes");
  }

  const data = await response.json();
  return data;
}

export async function createQuote(data: CreateQuoteData): Promise<Quote> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to create quote");
  }
  return res.json();
}

export async function getQuote(id: string): Promise<Quote> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes/${id}?t=${Date.now()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

export async function updateQuote(
  id: string,
  data: UpdateQuoteData
): Promise<Quote> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) throw new Error("Failed to update quote");
  return res.json();
}

export async function deleteQuote(id: string): Promise<void> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to delete quote");
}
