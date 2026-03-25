#!/usr/bin/env sh
# Seed the courses table from svu_courses.json
# Usage: ./scripts/db-seed.sh [--local]
set -e

SEED_FILE="supabase/seed/courses.sql"

if [ ! -f "$SEED_FILE" ]; then
  echo "❌ Seed file not found: $SEED_FILE"
  exit 1
fi

LOCAL_FLAG=""
if [ "$1" = "--local" ]; then
  LOCAL_FLAG="--local"
  echo "🌱 Seeding courses to LOCAL Supabase..."
else
  echo "🌱 Seeding courses to REMOTE Supabase..."
fi

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install: npm install -g supabase"
  exit 1
fi

supabase db reset $LOCAL_FLAG --seed-only 2>/dev/null || \
  psql "$SUPABASE_DB_URL" -f "$SEED_FILE" 2>/dev/null || \
  supabase db execute --file "$SEED_FILE" $LOCAL_FLAG

echo "✅ Courses seeded"
