/**
 * API Client for communicating with the FastAPI backend
 *
 * This client handles all HTTP requests to the backend API,
 * automatically including credentials (cookies) for auth.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface FetchAPIOptions extends RequestInit {
  /**
   * If true, include auth credentials (cookies) with the request
   * @default true
   */
  withCredentials?: boolean;
}

/**
 * Fetch data from the FastAPI backend
 *
 * @param endpoint - API endpoint (e.g., '/api/clients')
 * @param options - Fetch options
 * @returns Promise with parsed JSON response
 */
export async function fetchAPI<T = any>(
  endpoint: string,
  options?: FetchAPIOptions
): Promise<T> {
  const { withCredentials = true, ...fetchOptions } = options || {};

  const url = `${API_URL}${endpoint}`;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: withCredentials ? "include" : "same-origin",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error (${response.status}): ${response.statusText}. ${errorText}`
    );
  }

  return response.json();
}

/**
 * GET request to the API
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: "GET" });
}

/**
 * POST request to the API
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request to the API
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request to the API
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: "DELETE" });
}
