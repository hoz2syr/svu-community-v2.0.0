#!/usr/bin/env sh
# Reset local Supabase database (drop + migrate + seed)
# Usage: ./scripts/db-reset.sh
set -e

echo "⚠️  This will reset your LOCAL Supabase database!"
echo "   All data will be lost."
echo ""
printf "Continue? [y/N] "
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Cancelled."
  exit 0
fi

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install: npm install -g supabase"
  exit 1
fi

echo "🔄 Resetting local database..."
supabase db reset

echo "✅ Database reset complete (migrations + seed applied)"
