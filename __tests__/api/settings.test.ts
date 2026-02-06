/**
 * @jest-environment jsdom
 */
import {
  getSettings,
  updateSettings,
  resetAccount,
  TaxStatus,
} from "@/lib/api/settings";
import type { Settings, SettingsUpdate } from "@/lib/api/settings";
import * as authClient from "@/lib/auth-client";

jest.mock("@/lib/auth-client", () => ({
  authClient: {
    getSession: jest.fn(),
  },
}));

global.fetch = jest.fn();

describe("Settings API", () => {
  const mockSession = {
    data: { session: { token: "test-token" } },
  };

  const mockSettings: Settings = {
    name: "John Doe",
    business_name: "ACME Corp",
    email: "john@example.com",
    siret: "12345678901234",
    address: "1 rue de Paris",
    tax_status: TaxStatus.ASSUJETTI,
    logo_url: null,
    company_email: "contact@acme.fr",
    company_phone: null,
    company_website: null,
    default_currency: "EUR",
    default_tax_rate: 20,
    pdf_footer_text: null,
    vat_exemption_text: null,
    late_payment_penalties: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
    (authClient.authClient.getSession as jest.Mock).mockResolvedValue(
      mockSession
    );
  });

  describe("getSettings", () => {
    it("should return settings", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSettings,
      });

      const result = await getSettings();

      expect(result.name).toBe("John Doe");
      expect(result.tax_status).toBe(TaxStatus.ASSUJETTI);
      expect(result.default_tax_rate).toBe(20);
    });

    it("should include auth header", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSettings,
      });

      await getSettings();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/settings"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("should throw when not authenticated", async () => {
      (authClient.authClient.getSession as jest.Mock).mockResolvedValue({
        data: null,
      });

      await expect(getSettings()).rejects.toThrow("Not authenticated");
    });

    it("should throw on server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(getSettings()).rejects.toThrow("Failed to fetch settings");
    });
  });

  describe("updateSettings", () => {
    const updateData: SettingsUpdate = {
      name: "Jane Doe",
      email: "jane@example.com",
      tax_status: TaxStatus.FRANCHISE,
      default_currency: "EUR",
      default_tax_rate: 0,
    };

    it("should send PUT request with body", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockSettings, ...updateData }),
      });

      const result = await updateSettings(updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/settings"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
      expect(result.name).toBe("Jane Doe");
    });

    it("should throw on server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(updateSettings(updateData)).rejects.toThrow(
        "Failed to update settings"
      );
    });
  });

  describe("resetAccount", () => {
    it("should send DELETE request", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await resetAccount();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/settings/reset"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should throw on server error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Server Error",
      });

      await expect(resetAccount()).rejects.toThrow("Failed to reset account");
    });
  });
});
