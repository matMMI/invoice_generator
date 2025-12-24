import { formatCurrency, formatDate } from "@/lib/formatters";

describe("Formatters", () => {
  describe("formatCurrency", () => {
    it("should format EUR currency correctly with French locale", () => {
      // Note: non-breaking space (NBSP) is often \u00a0 or \u202f depending on browser/node env
      // normalize() helps to compare strings safely.
      const result = formatCurrency(1000, "EUR");
      expect(result.replace(/\s/g, " ")).toBe("1 000,00 €");
    });

    it("should format other currencies", () => {
      // USD often puts symbol before or after depending on locale fr-FR -> 1 000,00 $US usually or $
      const result = formatCurrency(50.5, "USD");
      expect(result).toContain("50,50");
      expect(result).toMatch(/US\$|\$/);
    });

    it("should handle zero", () => {
      const result = formatCurrency(0, "EUR");
      expect(result.replace(/\s/g, " ")).toBe("0,00 €");
    });
  });

  describe("formatDate", () => {
    it("should format date string correctly", () => {
      const result = formatDate("2025-01-31");
      expect(result).toBe("31/01/2025");
    });

    it("should format Date object correctly", () => {
      const date = new Date("2025-12-25T10:00:00Z");
      const result = formatDate(date);
      expect(result).toBe("25/12/2025");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatDate("")).toBe("");
      // @ts-ignore
      expect(formatDate(null)).toBe("");
    });
  });
});
