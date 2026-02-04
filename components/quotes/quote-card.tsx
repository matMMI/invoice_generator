import { StatusBadge } from "@/components/status-badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote } from "@/lib/api/quotes";
import Link from "next/link";

interface QuoteCardProps {
  quote?: Quote;
  isLoading?: boolean;
}

export function QuoteCard({ quote, isLoading }: QuoteCardProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="border-t pt-3 flex justify-between items-end">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Card className="hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full p-1!">
      <Link href={`/quotes/${quote.id}`} className="flex flex-col h-full p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <CardTitle className="text-base font-semibold truncate">
            {quote.quote_number}
          </CardTitle>
          <StatusBadge status={quote.status} />
        </div>
        {quote.client_name && (
          <p className="text-sm text-muted-foreground truncate mb-2">
            {quote.client_name}
          </p>
        )}
        <div className="border-t mt-auto pt-3 flex justify-between items-end">
          <p className="text-xl font-bold">
            {quote.total.toLocaleString("fr-FR", {
              style: "currency",
              currency: quote.currency,
            })}{" "}
            €
          </p>
          <div className="text-xs text-muted-foreground text-right">
            <p>
              {quote.items.length} article{quote.items.length > 1 ? "s" : ""}
            </p>
            <p>{new Date(quote.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
