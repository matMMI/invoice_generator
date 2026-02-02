import { z } from "zod";
import { Currency } from "@/lib/api/quotes";

export const quoteItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Price must be positive"),
  order: z.coerce.number().optional(),
});

export const quoteFormSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  currency: z.nativeEnum(Currency),
  tax_rate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "At least one item is required"),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
