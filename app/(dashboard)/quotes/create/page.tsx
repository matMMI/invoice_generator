import { QuoteForm } from "@/components/quotes/quote-form";

export default function CreateQuotePage() {
  return (
    <div className="container py-10 mx-auto max-w-4xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Nouveau Devis</h1>
        <p className="text-muted-foreground">
          Créez un nouveau devis pour votre client.
        </p>
      </div>
      <QuoteForm />
    </div>
  );
}
