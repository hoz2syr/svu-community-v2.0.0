#!/usr/bin/env sh
# Build all apps via Turborepo
set -e

echo "🔨 Building all apps..."

# Build shared packages first (Turbo handles dependency order)
npm run build

# Verify all dist directories exist
FAILED=0
for APP in web courses schedule; do
  if [ -d "apps/$APP/dist" ]; then
    echo "  ✅ apps/$APP/dist"
  else
    echo "  ❌ apps/$APP/dist — missing!"
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo "❌ Build verification failed"
  exit 1
fi

echo "✅ All apps built successfully"
