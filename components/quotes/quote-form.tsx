"use client";

import { ClientSelector } from "@/components/clients/client-selector";
import { useGlobalActivity } from "@/components/providers/global-activity-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createQuote, Currency, Quote, updateQuote } from "@/lib/api/quotes";
import { getSettings, TaxStatus } from "@/lib/api/settings";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/schemas/quote";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LineItemsEditor } from "./line-items-editor";
import { QuoteTotals } from "./quote-totals";

interface QuoteFormProps {
  mode?: "create" | "edit";
  initialData?: Quote;
}

export function QuoteForm({ mode = "create", initialData }: QuoteFormProps) {
  const router = useRouter();
  const { notifyChange } = useGlobalActivity();
  const isEdit = mode === "edit";
  const [isFranchise, setIsFranchise] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: initialData
      ? {
          client_id: initialData.client_id,
          currency: initialData.currency,
          tax_rate: Number(initialData.tax_rate),
          notes: initialData.notes || "",
          items: initialData.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            order: Number(item.order) || 0,
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

  useEffect(() => {
    getSettings()
      .then((s) => {
        if (s.tax_status === TaxStatus.FRANCHISE) {
          setIsFranchise(true);
          setValue("tax_rate", 0);
        } else {
          // ASSUJETTI: use default tax rate from settings
          setValue("tax_rate", s.default_tax_rate);
        }
      })
      .catch(() => {});
  }, [setValue]);

  const items = watch("items");
  const taxRate = watch("tax_rate");
  const currency = watch("currency");

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      if (isEdit && initialData) {
        await updateQuote(initialData.id, data);
        notifyChange("quote_updated");
        toast.success("Devis mis à jour avec succès");
        router.push(`/quotes/${initialData.id}`);
      } else {
        await createQuote(data);
        notifyChange("quote_created");
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
    <form
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
        const messages: string[] = [];
        if (fieldErrors.client_id) messages.push("Client manquant");
        if (fieldErrors.items?.message)
          messages.push(fieldErrors.items.message);
        if (Array.isArray(fieldErrors.items)) {
          const badLines = fieldErrors.items
            .map((item, i) => (item ? i + 1 : null))
            .filter(Boolean);
          if (badLines.length > 0)
            messages.push(`Ligne(s) ${badLines.join(", ")} invalide(s)`);
        }
        if (fieldErrors.tax_rate) messages.push("Taux de TVA invalide");
        toast.error(
          messages.length > 0
            ? messages.join(" — ")
            : "Veuillez corriger les erreurs du formulaire"
        );
      })}
    >
      <div className="grid gap-6 p-6 border rounded-lg bg-card min-w-0">
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

        <div className="space-y-4 min-w-0">
          <Label>Facturation *</Label>
          <LineItemsEditor
            items={items}
            onChange={(newItems) => setValue("items", newItems)}
            currency={currency}
            itemErrors={
              isSubmitted && Array.isArray(errors.items)
                ? errors.items
                : undefined
            }
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
          hideTaxRate={isFranchise}
        />

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            {...register("notes")}
            placeholder="Notes supplémentaires pour le client..."
            className="min-h-20 resize-none overflow-hidden"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
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
