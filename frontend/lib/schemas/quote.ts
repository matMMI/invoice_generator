import { z } from "zod";
import { Currency } from "@/lib/api/quotes";

export const quoteItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_price: z.number().min(0, "Price must be positive"),
  order: z.number().optional(),
});

export const quoteFormSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  currency: z.nativeEnum(Currency),
  tax_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "At least one item is required"),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
