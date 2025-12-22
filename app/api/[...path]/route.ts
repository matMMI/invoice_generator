/**
 * Proxy all /api/* requests to the Python FastAPI serverless function
 * This allows us to have both Next.js (for frontend + auth at /auth)
 * and FastAPI (for business API at /api) in the same deployment
 */

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyToPython(request, params.path);
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyToPython(request, params.path);
}

export async function PUT(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyToPython(request, params.path);
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyToPython(request, params.path);
}

export async function PATCH(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyToPython(request, params.path);
}

async function proxyToPython(request: Request, pathSegments: string[]) {
  // Reconstruct the full path
  const path = pathSegments.join("/");

  // Get the URL from the Python function
  // In production, this will be the same domain
  // The Python function is accessible at /api/index.py
  const url = new URL(request.url);
  const targetUrl = `${url.protocol}//${url.host}/api/index.py/${path}${url.search}`;

  // Forward all headers except host
  const headers = new Headers(request.headers);
  headers.delete("host");

  // Make the request to Python
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    // @ts-ignore - duplex is needed for streaming
    duplex: "half",
  });

  // Return the response from Python
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
