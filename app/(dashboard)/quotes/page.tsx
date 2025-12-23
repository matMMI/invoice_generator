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

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuotes();
        setQuotes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Manage your quotes and estimates.
          </p>
        </div>
        <Link href="/quotes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
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
          <h3 className="text-lg font-medium">No quotes yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first quote to get started.
          </p>
          <Link href="/quotes/create">
            <Button variant="outline">Create Quote</Button>
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
                        {quote.items.length} items
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
