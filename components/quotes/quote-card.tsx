import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { Quote } from "@/lib/api/quotes";
import { Skeleton } from "@/components/ui/skeleton";

interface QuoteCardProps {
  quote?: Quote;
  isLoading?: boolean;
}

export function QuoteCard({ quote, isLoading }: QuoteCardProps) {
  if (isLoading) {
    return (
      <Card>
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
    );
  }

  if (!quote) return null;

  return (
    <Card className="hover:bg-muted/50 transition-colors h-full">
      <Link href={`/quotes/${quote.id}`} className="block h-full">
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
  );
}
