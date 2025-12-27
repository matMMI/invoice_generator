#!/bin/bash
# Run unit tests for the Frontend (Next.js/Jest)

set -e

echo "🧪 Running frontend unit tests..."
pnpm run test
pnpm run build

echo ""
echo "✅ All tests passed!"
