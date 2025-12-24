"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Loader2 } from "lucide-react";
import { getQuotes, Quote } from "@/lib/api/quotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 9;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getQuotes(currentPage, LIMIT);
        setQuotes(data.quotes);
        setTotalPages(Math.ceil(data.total / LIMIT));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentPage]);

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

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <Skeleton className="h-8 w-28 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun devis</h3>
          <p className="text-muted-foreground mb-6">
            Créez votre premier devis pour commencer.
          </p>
          <Link href="/quotes/create">
            <Button variant="outline">Créer un Devis</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <Card
              key={quote.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <Link href={`/quotes/${quote.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                      {quote.quote_number}
                    </CardTitle>
                    <StatusBadge status={quote.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {quote.total.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: quote.currency,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quote.items.length} articles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {!loading && quotes.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
