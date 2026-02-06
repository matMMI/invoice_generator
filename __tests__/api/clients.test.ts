/**
 * @jest-environment jsdom
 */
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/api/clients";
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

    it("should throw on server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(
        createClient({ name: "X", email: "x@x.com" })
      ).rejects.toThrow("Failed to create client");
    });
  });

  describe("getClient", () => {
    it("should return a single client", async () => {
      const mockClient = {
        id: "c-1",
        name: "Test",
        email: "test@test.com",
        user_id: "u-1",
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockClient,
      });

      const result = await getClient("c-1");

      expect(result.id).toBe("c-1");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients/c-1"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should throw on 404", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(getClient("invalid")).rejects.toThrow(
        "Failed to fetch client"
      );
    });
  });

  describe("updateClient", () => {
    it("should send PUT request with data", async () => {
      const updateData = { name: "Updated Name" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: "c-1", ...updateData }),
      });

      const result = await updateClient("c-1", updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients/c-1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
      expect(result.name).toBe("Updated Name");
    });

    it("should throw on server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Server Error",
      });

      await expect(updateClient("c-1", { name: "X" })).rejects.toThrow(
        "Failed to update client"
      );
    });
  });

  describe("deleteClient", () => {
    it("should send DELETE request", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await deleteClient("c-1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients/c-1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw on server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Forbidden",
      });

      await expect(deleteClient("c-1")).rejects.toThrow(
        "Failed to delete client"
      );
    });

    it("should throw when not authenticated", async () => {
      (authClient.authClient.getSession as jest.Mock).mockResolvedValue({
        data: null,
      });

      await expect(deleteClient("c-1")).rejects.toThrow("Not authenticated");
    });
  });
});
