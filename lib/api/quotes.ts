import { authClient } from "@/lib/auth-client";

export enum Currency {
  EUR = "EUR",
  USD = "USD",
  GBP = "GBP",
  CHF = "CHF",
  CAD = "CAD",
}

export enum QuoteStatus {
  DRAFT = "Draft",
  SENT = "Sent",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
}

export interface QuoteItem {
  id?: string; // Optional for new items before save
  description: string;
  quantity: number; // Using number for frontend, backend handles Decimal
  unit_price: number;
  total?: number;
  order?: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  user_id: string;
  client_id: string;
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
  status?: QuoteStatus;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  items?: QuoteItem[];
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

export async function getQuotes(
  page: number = 1,
  limit: number = 10
): Promise<{ quotes: Quote[]; total: number }> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/quotes`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch quotes");
  return res.json();
}

export async function getQuote(id: string): Promise<Quote> {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
