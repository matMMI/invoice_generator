import { z } from "zod";
import { Currency } from "@/lib/api/quotes";

export const quoteItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Le libellé est requis"),
  detailed_description: z.string().optional(),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantité invalide" })
    .min(0.01, "La quantité doit être supérieure à 0"),
  unit_price: z.coerce
    .number({ invalid_type_error: "Prix invalide" })
    .min(0, "Le prix doit être positif"),
  order: z.coerce.number().optional(),
});

export const quoteFormSchema = z.object({
  client_id: z.string().min(1, "Veuillez sélectionner un client"),
  currency: z.nativeEnum(Currency, {
    errorMap: () => ({ message: "Devise invalide" }),
  }),
  tax_rate: z.coerce
    .number()
    .min(0, "Le taux de TVA ne peut pas être négatif")
    .max(100, "Le taux de TVA ne peut pas dépasser 100%"),
  deposit_percentage: z.coerce
    .number()
    .min(0, "Le pourcentage d'acompte ne peut pas être négatif")
    .max(100, "Le pourcentage d'acompte ne peut pas dépasser 100%")
    .optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  items: z
    .array(quoteItemSchema)
    .min(1, "Ajoutez au moins une ligne de facturation"),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
