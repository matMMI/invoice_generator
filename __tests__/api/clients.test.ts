/**
 * @jest-environment jsdom
 */
import { getClients, createClient } from "@/lib/api/clients";
import * as authClient from "@/lib/auth-client";

// Mock auth client
jest.mock("@/lib/auth-client", () => ({
  authClient: {
    getSession: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("Clients API", () => {
  const mockSession = {
    data: {
      session: {
        token: "test-token",
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authClient.authClient.getSession as jest.Mock).mockResolvedValue(
      mockSession
    );
  });

  describe("getClients", () => {
    it("should return clients with correct structure", async () => {
      const mockResponse = {
        clients: [
          {
            id: "1",
            name: "Test Client",
            email: "test@example.com",
          },
        ],
        total: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getClients();

      expect(result).toEqual(mockResponse);
      expect(result.clients).toBeInstanceOf(Array);
      expect(result.total).toBe(1);
    });

    it("should throw error when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(getClients()).rejects.toThrow("Failed to fetch clients");
    });

    it("should include search parameter when provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ clients: [], total: 0 }),
      });

      await getClients("test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("search=test"),
        expect.any(Object)
      );
    });
  });

  describe("createClient", () => {
    it("should create client with correct data", async () => {
      const newClient = {
        name: "New Client",
        email: "new@example.com",
      };

      const mockResponse = {
        id: "1",
        ...newClient,
        user_id: "user1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createClient(newClient);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newClient),
        })
      );
    });
  });
});
