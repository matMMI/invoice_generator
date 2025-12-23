import { QuoteForm } from "@/components/quotes/quote-form";

export default function CreateQuotePage() {
  return (
    <div className="container py-10 flex justify-center">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Quote</h1>
        <p className="text-muted-foreground">
          Create a new quote for your client.
        </p>
      </div>
      <QuoteForm />
    </div>
  );
}
