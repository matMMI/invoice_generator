#!/bin/bash

set -e
echo "🧪 Running frontend unit tests..."
pnpm run test
pnpm run build
echo ""
echo "✅ All tests passed!"
