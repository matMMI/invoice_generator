"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientSelector } from "@/components/clients/client-selector";
import { LineItemsEditor } from "./line-items-editor";
import { QuoteTotals } from "./quote-totals";
import { Currency, createQuote } from "@/lib/api/quotes";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/schemas/quote";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function QuoteForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      client_id: "",
      currency: Currency.EUR,
      tax_rate: 20,
      notes: "",
      items: [{ description: "", quantity: 1, unit_price: 0, order: 0 }],
    },
  });

  const items = watch("items");
  const taxRate = watch("tax_rate");
  const currency = watch("currency");

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      await createQuote(data);
      toast.success("Quote created successfully");
      router.push("/quotes");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create quote");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-5xl mx-auto py-6"
    >
      <div className="grid gap-6 p-6 border rounded-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Client *</Label>
            <ClientSelector
              value={watch("client_id")}
              onChange={(value) => setValue("client_id", value)}
            />
            {errors.client_id && (
              <p className="text-sm text-red-500">{errors.client_id.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Line Items *</Label>
          <LineItemsEditor
            items={items}
            onChange={(newItems) => setValue("items", newItems)}
            currency={currency}
          />
          {errors.items && (
            <p className="text-sm text-red-500">{errors.items.message}</p>
          )}
        </div>

        <QuoteTotals
          items={items}
          currency={currency}
          taxRate={taxRate}
          onTaxRateChange={(rate) => setValue("tax_rate", rate)}
        />

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            {...register("notes")}
            placeholder="Additional notes for the client..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Quote
        </Button>
      </div>
    </form>
  );
}
