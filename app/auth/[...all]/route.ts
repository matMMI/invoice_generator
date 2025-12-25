import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

function getAllowedOrigin(request: Request): string {
  const origin = request.headers.get("origin") || "";
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}

function addCorsHeaders(response: Response, origin: string): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", origin);
  newHeaders.set("Access-Control-Allow-Credentials", "true");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export async function GET(request: Request) {
  const response = await handler.GET(request);
  return addCorsHeaders(response, getAllowedOrigin(request));
}

export async function POST(request: Request) {
  const response = await handler.POST(request);
  return addCorsHeaders(response, getAllowedOrigin(request));
}

// Handle CORS preflight for local development
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": getAllowedOrigin(request),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
