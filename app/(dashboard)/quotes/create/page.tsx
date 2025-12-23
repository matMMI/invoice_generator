import { QuoteForm } from "@/components/quotes/quote-form";

export default function CreateQuotePage() {
  return (
    <div className="page-container">
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
