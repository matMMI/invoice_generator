"use client";
import { createContext, useContext, ReactNode, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { getQuotes, Quote, QuoteStatus } from "@/lib/api/quotes";
import { useRouter } from "next/navigation";
import { onSyncMessage, broadcastSync } from "@/lib/sync";
const NOTIFIED_KEY = "devis_notified_changes";
const FINAL_STATUSES = [
  QuoteStatus.SIGNED,
  QuoteStatus.ACCEPTED,
  QuoteStatus.REJECTED,
] as const;

function getNotifiedSet(): Set<string> {
  try {
    const stored = localStorage.getItem(NOTIFIED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function persistNotifiedSet(set: Set<string>) {
  try {
    const arr = Array.from(set);
    const trimmed = arr.length > 500 ? arr.slice(-500) : arr;
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(trimmed));
  } catch {}
}

function markNotified(quoteId: string | number, status: string) {
  const set = getNotifiedSet();
  set.add(`${quoteId}_${status}`);
  persistNotifiedSet(set);
}

function isAlreadyNotified(quoteId: string | number, status: string): boolean {
  return getNotifiedSet().has(`${quoteId}_${status}`);
}

function seedCurrentStatuses(quotes: Quote[]) {
  const set = getNotifiedSet();
  for (const q of quotes) {
    if ((FINAL_STATUSES as readonly string[]).includes(q.status)) {
      set.add(`${q.id}_${q.status}`);
    }
  }
  persistNotifiedSet(set);
}

interface GlobalActivityContextType {
  quotes: Quote[];
  isLoading: boolean;
  refreshData: () => void;
  notifyChange: (
    type:
      | "quote_created"
      | "quote_updated"
      | "quote_deleted"
      | "client_created"
      | "client_updated"
      | "client_deleted"
  ) => void;
}

const GlobalActivityContext = createContext<GlobalActivityContextType | null>(
  null
);

export function useGlobalActivity() {
  const context = useContext(GlobalActivityContext);
  if (!context) {
    throw new Error(
      "useGlobalActivity must be used within a GlobalActivityProvider"
    );
  }
  return context;
}

// Fetcher function for SWR
const fetchQuotes = async () => {
  const data = await getQuotes(1, 50);
  return data.quotes;
};

interface GlobalActivityProviderProps {
  children: ReactNode;
}

export function GlobalActivityProvider({
  children,
}: GlobalActivityProviderProps) {
  const router = useRouter();

  // SWR handles caching, revalidation, and deduplication automatically
  const {
    data: quotes = [],
    isLoading,
    mutate,
  } = useSWR("global-quotes", fetchQuotes, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
    compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  });

  // Listen for cross-tab sync messages (BroadcastChannel, not WebSocket!)
  useEffect(() => {
    const unsubscribe = onSyncMessage((message) => {
      if (
        message.type.startsWith("quote_") ||
        message.type.startsWith("client_") ||
        message.type === "refresh_all"
      ) {
        mutate();
      }
    });
    return unsubscribe;
  }, [mutate]);

  // Detect status changes and show notifications (persisted via localStorage)
  useEffect(() => {
    if (quotes.length === 0) return;

    // First ever load (or after localStorage clear): seed without notifying
    if (localStorage.getItem(NOTIFIED_KEY) === null) {
      seedCurrentStatuses(quotes);
      return;
    }

    for (const q of quotes) {
      if (
        q.status === QuoteStatus.SIGNED &&
        !isAlreadyNotified(q.id, QuoteStatus.SIGNED)
      ) {
        markNotified(q.id, QuoteStatus.SIGNED);
        toast.success(`Le devis ${q.quote_number} a été signé !`, {
          description: `Par ${q.signer_name || "le client"}`,
          duration: 8000,
          icon: <Check className="h-5 w-5 text-green-500" />,
          action: {
            label: "Voir",
            onClick: () => router.push(`/quotes/${q.id}`),
          },
        });
      } else if (
        q.status === QuoteStatus.ACCEPTED &&
        !isAlreadyNotified(q.id, QuoteStatus.ACCEPTED)
      ) {
        markNotified(q.id, QuoteStatus.ACCEPTED);
        toast.success(`Le devis ${q.quote_number} a été accepté !`, {
          icon: <Check className="h-5 w-5 text-green-500" />,
        });
      } else if (
        q.status === QuoteStatus.REJECTED &&
        !isAlreadyNotified(q.id, QuoteStatus.REJECTED)
      ) {
        markNotified(q.id, QuoteStatus.REJECTED);
        toast.error(`Le devis ${q.quote_number} a été refusé.`, {
          icon: <X className="h-5 w-5 text-red-500" />,
        });
      }
    }
  }, [quotes, router]);

  const notifyChange = (
    type:
      | "quote_created"
      | "quote_updated"
      | "quote_deleted"
      | "client_created"
      | "client_updated"
      | "client_deleted"
  ) => {
    broadcastSync(type);
    mutate();
  };

  return (
    <GlobalActivityContext.Provider
      value={{ quotes, isLoading, refreshData: () => mutate(), notifyChange }}
    >
      {children}
    </GlobalActivityContext.Provider>
  );
}
