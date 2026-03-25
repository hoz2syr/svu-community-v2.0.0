#!/usr/bin/env sh
# Deploy apps/web to Cloudflare Pages
# Requires: CF_ACCOUNT_ID, CF_API_TOKEN (or CLOUDFLARE_API_TOKEN)
set -e

APP_DIR="apps/web"
PROJECT_NAME="svu-community"

if [ -z "$CF_ACCOUNT_ID" ]; then
  echo "❌ CF_ACCOUNT_ID is not set"
  exit 1
fi

if [ -z "$CF_API_TOKEN" ] && [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CF_API_TOKEN or CLOUDFLARE_API_TOKEN is not set"
  exit 1
fi

# Build first
echo "🔨 Building web app..."
npm run build:web

# Deploy
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy "$APP_DIR/dist" \
  --project-name="$PROJECT_NAME" \
  --commit-dirty=true

echo "✅ Deployment complete"
