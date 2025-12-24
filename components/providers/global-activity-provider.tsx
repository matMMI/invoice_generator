"use client";
import { createContext, useContext, ReactNode, useRef, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { getQuotes, Quote, QuoteStatus } from "@/lib/api/quotes";
import { useRouter } from "next/navigation";
import { onSyncMessage, broadcastSync } from "@/lib/sync";

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
  const previousQuotesRef = useRef<Quote[]>([]);

  // SWR handles caching, revalidation, and deduplication automatically
  const {
    data: quotes = [],
    isLoading,
    mutate,
  } = useSWR("global-quotes", fetchQuotes, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
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

  // Check for status changes and show notifications
  useEffect(() => {
    if (quotes.length === 0 || previousQuotesRef.current.length === 0) {
      previousQuotesRef.current = quotes;
      return;
    }

    quotes.forEach((newQ) => {
      const oldQ = previousQuotesRef.current.find((q) => q.id === newQ.id);
      if (oldQ && oldQ.status !== newQ.status) {
        if (
          oldQ.status === QuoteStatus.SENT &&
          newQ.status === QuoteStatus.SIGNED
        ) {
          toast.success(`Le devis ${newQ.quote_number} a été signé !`, {
            description: `Par ${newQ.signer_name || "le client"}`,
            duration: 8000,
            icon: <Check className="h-5 w-5 text-green-500" />,
            action: {
              label: "Voir",
              onClick: () => router.push(`/quotes/${newQ.id}`),
            },
          });
        } else if (
          oldQ.status === QuoteStatus.SENT &&
          newQ.status === QuoteStatus.ACCEPTED
        ) {
          toast.success(`Le devis ${newQ.quote_number} a été accepté !`, {
            icon: <Check className="h-5 w-5 text-green-500" />,
          });
        } else if (
          oldQ.status === QuoteStatus.SENT &&
          newQ.status === QuoteStatus.REJECTED
        ) {
          toast.error(`Le devis ${newQ.quote_number} a été refusé.`, {
            icon: <X className="h-5 w-5 text-red-500" />,
          });
        }
      }
    });

    previousQuotesRef.current = quotes;
  }, [quotes, router]);

  // Notify other tabs + refresh this tab
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
