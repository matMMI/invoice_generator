"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { getQuotes, Quote } from "@/lib/api/quotes";
import { QuoteCard } from "@/components/quotes/quote-card";
import { SearchHeader } from "@/components/dashboard/search-header";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const LIMIT = 9;

  async function fetchQuotes(page: number, searchQuery: string) {
    try {
      setLoading(true);
      const data = await getQuotes(page, LIMIT, searchQuery);
      setQuotes(data.quotes);
      setTotalPages(Math.ceil(data.total / LIMIT));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes(currentPage, search);
  }, [currentPage]); // Search is handled by explicit submit or clear, page changes trigger fetch

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuotes(1, search);
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchQuotes(1, "");
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">
            Gérez vos devis et estimations.
          </p>
        </div>
        <Link href="/quotes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Devis
          </Button>
        </Link>
      </div>

      <SearchHeader
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
        onClear={clearSearch}
        placeholder="Rechercher par n° devis ou client..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <QuoteCard key={i} isLoading={true} />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun devis trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {search
              ? "Aucun résultat pour votre recherche."
              : "Créez votre premier devis pour commencer."}
          </p>
          {search ? (
            <Button variant="outline" onClick={clearSearch}>
              Effacer la recherche
            </Button>
          ) : (
            <Link href="/quotes/create">
              <Button variant="outline">Créer un Devis</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
