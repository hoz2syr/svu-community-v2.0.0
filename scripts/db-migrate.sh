#!/usr/bin/env sh
# Apply Supabase migrations
# Usage: ./scripts/db-migrate.sh [--local]
set -e

LOCAL_FLAG=""
if [ "$1" = "--local" ]; then
  LOCAL_FLAG="--local"
  echo "📦 Applying migrations to LOCAL Supabase..."
else
  echo "📦 Applying migrations to REMOTE Supabase..."
fi

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install: npm install -g supabase"
  exit 1
fi

supabase db push $LOCAL_FLAG

echo "✅ Migrations applied"
