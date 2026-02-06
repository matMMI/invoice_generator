/**
 * @jest-environment jsdom
 */
jest.mock("@/lib/auth-client", () => ({
  authClient: { getSession: jest.fn() },
}));

import { quoteItemSchema, quoteFormSchema } from "@/lib/schemas/quote";
import { Currency } from "@/lib/api/quotes";

describe("quoteItemSchema", () => {
  const validItem = {
    description: "Web development",
    quantity: 5,
    unit_price: 100,
  };

  it("should accept a valid item", () => {
    const result = quoteItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("should accept item with optional fields", () => {
    const result = quoteItemSchema.safeParse({
      ...validItem,
      id: "item-1",
      order: 2,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty description", () => {
    const result = quoteItemSchema.safeParse({ ...validItem, description: "" });
    expect(result.success).toBe(false);
  });

  it("should reject quantity of 0", () => {
    const result = quoteItemSchema.safeParse({ ...validItem, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject negative quantity", () => {
    const result = quoteItemSchema.safeParse({ ...validItem, quantity: -1 });
    expect(result.success).toBe(false);
  });

  it("should accept minimal quantity (0.01)", () => {
    const result = quoteItemSchema.safeParse({ ...validItem, quantity: 0.01 });
    expect(result.success).toBe(true);
  });

  it("should reject negative unit_price", () => {
    const result = quoteItemSchema.safeParse({
      ...validItem,
      unit_price: -10,
    });
    expect(result.success).toBe(false);
  });

  it("should accept zero unit_price", () => {
    const result = quoteItemSchema.safeParse({ ...validItem, unit_price: 0 });
    expect(result.success).toBe(true);
  });

  it("should coerce string numbers", () => {
    const result = quoteItemSchema.safeParse({
      description: "Test",
      quantity: "3",
      unit_price: "50.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(3);
      expect(result.data.unit_price).toBe(50.5);
    }
  });
});

describe("quoteFormSchema", () => {
  const validForm = {
    client_id: "client-123",
    currency: Currency.EUR,
    tax_rate: 20,
    items: [{ description: "Service", quantity: 1, unit_price: 100 }],
  };

  it("should accept a valid form", () => {
    const result = quoteFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it("should accept form with optional fields", () => {
    const result = quoteFormSchema.safeParse({
      ...validForm,
      notes: "Some notes",
      payment_terms: "Net 30",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty client_id", () => {
    const result = quoteFormSchema.safeParse({ ...validForm, client_id: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty items array", () => {
    const result = quoteFormSchema.safeParse({ ...validForm, items: [] });
    expect(result.success).toBe(false);
  });

  it("should reject tax_rate above 100", () => {
    const result = quoteFormSchema.safeParse({ ...validForm, tax_rate: 101 });
    expect(result.success).toBe(false);
  });

  it("should reject negative tax_rate", () => {
    const result = quoteFormSchema.safeParse({ ...validForm, tax_rate: -1 });
    expect(result.success).toBe(false);
  });

  it("should accept 0% tax_rate (franchise)", () => {
    const result = quoteFormSchema.safeParse({ ...validForm, tax_rate: 0 });
    expect(result.success).toBe(true);
  });

  it("should reject invalid currency", () => {
    const result = quoteFormSchema.safeParse({
      ...validForm,
      currency: "GBP",
    });
    expect(result.success).toBe(false);
  });

  it("should reject if an item inside is invalid", () => {
    const result = quoteFormSchema.safeParse({
      ...validForm,
      items: [{ description: "", quantity: 0, unit_price: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("should accept multiple items", () => {
    const result = quoteFormSchema.safeParse({
      ...validForm,
      items: [
        { description: "Service A", quantity: 1, unit_price: 100 },
        { description: "Service B", quantity: 2, unit_price: 50 },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(2);
    }
  });
});
