import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useGlobalActivity,
  GlobalActivityProvider,
} from "@/components/providers/global-activity-provider";
import { getQuotes } from "@/lib/api/quotes";

// Mock the API client
jest.mock("@/lib/api/quotes", () => ({
  getQuotes: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("useGlobalActivity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GlobalActivityProvider>{children}</GlobalActivityProvider>
  );

  it("should fetch quotes on mount", async () => {
    (getQuotes as jest.Mock).mockResolvedValue({ quotes: [] });

    renderHook(() => useGlobalActivity(), { wrapper });

    await waitFor(() => {
      expect(getQuotes).toHaveBeenCalledTimes(1);
    });
  });

  // More complex tests for polling could be added,
  // but just verifying it mounts and calls API is a good start.
});
