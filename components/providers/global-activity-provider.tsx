"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { getQuotes, Quote, QuoteStatus } from "@/lib/api/quotes";
import { useRouter } from "next/navigation";
interface GlobalActivityContextType {
  lastUpdate: Date | null;
  refreshData: () => Promise<void>;
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
interface GlobalActivityProviderProps {
  children: ReactNode;
}
export function GlobalActivityProvider({
  children,
}: GlobalActivityProviderProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const router = useRouter();
  const fetchActivity = useCallback(
    async (silent = true) => {
      try {
        // Fetch recent quotes to monitor status changes
        const data = await getQuotes(1, 50);
        const newQuotes = data.quotes;
        if (!silent) {
          setQuotes(newQuotes);
          setLastUpdate(new Date());
          return;
        }
        setQuotes((prevQuotes) => {
          newQuotes.forEach((newQ) => {
            const oldQ = prevQuotes.find((q) => q.id === newQ.id);
            if (oldQ) {
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
                  description: "Consultez le devis pour plus de détails.",
                });
              }
            }
          });
          return newQuotes;
        });

        setLastUpdate(new Date());
      } catch (error) {
        console.error("Global activity polling failed", error);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchActivity(false);
  }, [fetchActivity]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchActivity(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchActivity]);

  return (
    <GlobalActivityContext.Provider
      value={{ lastUpdate, refreshData: () => fetchActivity(false) }}
    >
      {children}
    </GlobalActivityContext.Provider>
  );
}
