"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { SearchHeader } from "@/components/dashboard/search-header";
import { StatusBadge } from "@/components/status-badge";
import { getQuotes } from "@/lib/api/quotes";
import { onSyncMessage } from "@/lib/sync";
import useSWR from "swr";

export function RecentQuotes() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const LIMIT = 5;

  const {
    data,
    isLoading: loading,
    mutate,
  } = useSWR(
    ["recent-quotes", page, search],
    () => getQuotes(page, LIMIT, search),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        setTotalPages(Math.ceil((data?.total || 0) / LIMIT));
      },
    }
  );

  useEffect(() => {
    const unsubscribe = onSyncMessage((msg) => {
      if (msg.type.startsWith("quote_")) {
        mutate();
      }
    });
    return unsubscribe;
  }, [mutate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    mutate();
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
    mutate();
  };

  const quotes = data?.quotes || [];

  const formatCurrency = (amount: number, currency: string) => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: currency,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Devis Récents</h2>
        <Link href="/quotes">
          <Button variant="ghost" size="sm">
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <SearchHeader
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
        onClear={clearSearch}
        placeholder="Rechercher un devis..."
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
      />

      <div className="space-y-0">
        {/* Table Header - Always visible */}
        <div className="grid grid-cols-5 gap-4 px-3 py-3 text-sm font-medium text-muted-foreground border-b border-border">
          <div className="col-span-1">N° Devis</div>
          <div className="col-span-1">Client</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1 text-right">Montant</div>
          <div className="col-span-1 text-right">Statut</div>
        </div>

        {/* Content Area - Switches between Skeletons and Data */}
        {loading ? (
          // Skeleton Rows (Loading State)
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 px-3 py-3 items-center border-b border-border last:border-b-0"
            >
              <Skeleton className="h-5 w-24 col-span-1" />
              <Skeleton className="h-4 w-32 col-span-1" />
              <Skeleton className="h-4 w-24 col-span-1" />
              <Skeleton className="h-5 w-20 col-span-1 justify-self-end" />
              <Skeleton className="h-6 w-20 col-span-1 justify-self-end rounded-full" />
            </div>
          ))
        ) : quotes.length === 0 ? (
          // Empty State
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm mb-4">
              {search
                ? "Aucun résultat pour votre recherche"
                : "Aucun devis pour le moment"}
            </p>
            {!search && (
              <Link href="/quotes/create">
                <Button variant="outline" size="sm">
                  Créer votre premier devis
                </Button>
              </Link>
            )}
            {search && (
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : (
          // Data Rows
          quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/quotes/${quote.id}`}
              className="grid grid-cols-5 gap-4 items-center px-3 py-3 hover:bg-muted/50 transition-colors text-sm border-b border-border last:border-b-0"
            >
              <div className="font-medium truncate col-span-1">
                {quote.quote_number}
              </div>
              <div className="font-medium text-foreground/80 truncate col-span-1">
                {quote.client_name || "Client Inconnu"}
              </div>
              <div className="text-muted-foreground truncate col-span-1">
                {new Date(quote.created_at).toLocaleDateString("fr-FR")}
              </div>
              <div className="font-bold text-right truncate col-span-1">
                {formatCurrency(quote.total, quote.currency)}
              </div>
              <div className="flex justify-end col-span-1">
                <StatusBadge status={quote.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
