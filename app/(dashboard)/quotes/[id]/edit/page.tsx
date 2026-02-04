"use client";

import { QuoteForm } from "@/components/quotes/quote-form";
import { Button } from "@/components/ui/button";
import { Quote, getQuote } from "@/lib/api/quotes";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      <div className="page-container max-w-4xl mx-auto flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="page-container max-w-4xl mx-auto text-center flex flex-col justify-center items-center min-h-[50vh]">
        <p className="text-muted-foreground">Devis introuvable</p>
        <Button variant="link" onClick={() => router.push("/quotes")}>
          Retour aux devis
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container ">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier le devis {quote.quote_number}
          </h1>
          <p className="text-muted-foreground">
            Modifiez les détails du devis ci-dessous.
          </p>
        </div>
      </div>

      <QuoteForm mode="edit" initialData={quote} />
    </div>
  );
}
