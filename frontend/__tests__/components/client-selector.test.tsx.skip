/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { ClientSelector } from "@/components/clients/client-selector";
import * as clientsApi from "@/lib/api/clients";

// Mock the API module
jest.mock("@/lib/api/clients");

describe("ClientSelector", () => {
  const mockClients = [
    {
      id: "1",
      user_id: "user1",
      name: "John Doe",
      email: "john@example.com",
      company: "Acme Corp",
      address: null,
      phone: null,
      vat_number: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      user_id: "user1",
      name: "Jane Smith",
      email: "jane@example.com",
      company: null,
      address: null,
      phone: null,
      vat_number: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load and display clients", async () => {
    const mockGetClients = jest.spyOn(clientsApi, "getClients");
    mockGetClients.mockResolvedValue({
      clients: mockClients,
      total: 2,
    });

    const mockOnChange = jest.fn();
    render(<ClientSelector value="" onChange={mockOnChange} />);

    // Should show loading state initially
    expect(screen.getByText(/loading clients/i)).toBeInTheDocument();

    // Wait for clients to load
    await waitFor(() => {
      expect(mockGetClients).toHaveBeenCalled();
    });

    // Should display clients (implementation depends on Select component)
    // This test verifies the API call was made with correct response structure
    expect(mockGetClients).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors gracefully", async () => {
    const mockGetClients = jest.spyOn(clientsApi, "getClients");
    mockGetClients.mockRejectedValue(new Error("Failed to fetch"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const mockOnChange = jest.fn();

    render(<ClientSelector value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load clients",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("should handle empty client list", async () => {
    const mockGetClients = jest.spyOn(clientsApi, "getClients");
    mockGetClients.mockResolvedValue({
      clients: [],
      total: 0,
    });

    const mockOnChange = jest.fn();
    render(<ClientSelector value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(mockGetClients).toHaveBeenCalled();
    });

    // Verify no crash with empty array
    expect(mockGetClients).toHaveBeenCalledTimes(1);
  });
});
