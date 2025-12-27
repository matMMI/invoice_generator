/**
 * @jest-environment jsdom
 */
import { getQuote, getQuotes, QuoteStatus, Currency } from "@/lib/api/quotes";
import * as authClient from "@/lib/auth-client";

// Mock auth client
jest.mock("@/lib/auth-client", () => ({
  authClient: {
    getSession: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("Quotes API", () => {
  const mockSession = {
    data: {
      session: {
        token: "test-token",
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
    (authClient.authClient.getSession as jest.Mock).mockResolvedValue(
      mockSession
    );
  });

  describe("getQuote", () => {
    const mockQuote = {
      id: "quote-123",
      user_id: "user-1",
      client_id: "client-1",
      client_name: "Test Client",
      quote_number: "Q-001",
      status: QuoteStatus.DRAFT,
      currency: Currency.EUR,
      subtotal: 100,
      tax_rate: 20,
      tax_amount: 20,
      total: 120,
      notes: "Test notes",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      items: [
        {
          id: "item-1",
          description: "Service A",
          quantity: 2,
          unit_price: 50,
          total: 100,
          order: 1,
        },
      ],
    };

    it("should return quote with all expected fields", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuote,
      });

      const result = await getQuote("quote-123");

      expect(result.id).toBe("quote-123");
      expect(result.quote_number).toBe("Q-001");
      expect(result.client_id).toBe("client-1");
      expect(result.status).toBe(QuoteStatus.DRAFT);
      expect(result.subtotal).toBe(100);
      expect(result.tax_rate).toBe(20);
      expect(result.tax_amount).toBe(20);
      expect(result.total).toBe(120);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description).toBe("Service A");
    });

    it("should throw error when quote not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getQuote("invalid-id")).rejects.toThrow(
        "Failed to fetch quote"
      );
    });

    it("should include authorization header", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuote,
      });

      await getQuote("quote-123");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/quotes/quote-123"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });

  describe("getQuotes", () => {
    it("should return quotes list with pagination", async () => {
      const mockResponse = {
        quotes: [
          {
            id: "q1",
            quote_number: "Q-001",
            status: QuoteStatus.DRAFT,
            total: 100,
            items: [],
          },
        ],
        total: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getQuotes(1, 10);

      expect(result.quotes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should include search parameter when provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ quotes: [], total: 0 }),
      });

      await getQuotes(1, 10, "test-search");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("search=test-search"),
        expect.any(Object)
      );
    });

    it("should throw error when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Server Error",
      });

      await expect(getQuotes()).rejects.toThrow("Failed to fetch quotes");
    });
  });
});
