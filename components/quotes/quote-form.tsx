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
import { Currency, Quote, createQuote, updateQuote } from "@/lib/api/quotes";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/schemas/quote";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QuoteFormProps {
  mode?: "create" | "edit";
  initialData?: Quote;
}

export function QuoteForm({ mode = "create", initialData }: QuoteFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: initialData
      ? {
          client_id: initialData.client_id,
          currency: initialData.currency,
          tax_rate: initialData.tax_rate,
          notes: initialData.notes || "",
          items: initialData.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            order: item.order || 0,
          })),
        }
      : {
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
      if (isEdit && initialData) {
        await updateQuote(initialData.id, data);
        toast.success("Devis mis à jour avec succès");
        router.push(`/quotes/${initialData.id}`);
      } else {
        await createQuote(data);
        toast.success("Devis créé avec succès");
        router.push("/quotes");
      }
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Échec de la ${isEdit ? "mise à jour" : "création"} du devis`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          <Label>Facturation *</Label>
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
            placeholder="Notes supplémentaires pour le client..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Mettre à jour" : "Créer le Devis"}
        </Button>
      </div>
    </form>
  );
}
