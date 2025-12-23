"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Quote, getQuote } from "@/lib/api/quotes";
import { QuoteForm } from "@/components/quotes/quote-form";
import { toast } from "sonner";

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuote(quoteId);
        setQuote(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load quote");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quoteId]);

  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground">Quote not found</p>
        <Button variant="link" onClick={() => router.push("/quotes")}>
          Back to quotes
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit {quote.quote_number}
          </h1>
          <p className="text-muted-foreground">
            Modify the quote details below.
          </p>
        </div>
      </div>

      <QuoteForm mode="edit" initialData={quote} />
    </div>
  );
}
