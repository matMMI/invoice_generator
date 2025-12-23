import { authClient } from "@/lib/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generate PDF for a quote and trigger download
 */
export async function generateQuotePdf(quoteId: string): Promise<void> {
  const session = await authClient.getSession();
  const token = session.data?.session?.token;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_BASE}/api/quotes/${quoteId}/generate-pdf`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to generate PDF" }));
    throw new Error(error.detail || "Failed to generate PDF");
  }

  // Get the PDF blob
  const blob = await response.blob();

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "quote.pdf";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename=(.+)/);
    if (match) {
      filename = match[1].replace(/['"]/g, "");
    }
  }

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get PDF preview URL for a quote
 */
export function getQuotePdfPreviewUrl(quoteId: string): string {
  return `${API_BASE}/api/quotes/${quoteId}/pdf`;
}
