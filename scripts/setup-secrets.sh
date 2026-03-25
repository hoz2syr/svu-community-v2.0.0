#!/usr/bin/env sh
# ════════════════════════════════════════════════════════════════
# Setup Supabase Edge Function Secrets
# يُعيّن كل الأسرار المطلوبة ل瞭解並ظائف Edge Functions
#
# الاستخدام (Terminal — ليس SQL Editor):
#   bash scripts/setup-secrets.sh
#   OCR_KEY=xxx GEMINI_KEY=xxx bash scripts/setup-secrets.sh
#
# PowerShell:
#   $env:OCR_KEY="xxx"; bash scripts/setup-secrets.sh
# ════════════════════════════════════════════════════════════════
set -e

# ─── التحقق من Supabase CLI ─────────────────────────────────
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI غير مثبت."
  echo "   التثبيت: npm install -g supabase"
  echo "   أو: brew install supabase/tap/supabase"
  exit 1
fi

# ─── المتغيرات ───────────────────────────────────────────────
# مفتاح OCR.space API — لاستخراج النصوص من صور الجداول
OCR_KEY="${OCR_KEY:-}"

# مفتاح Google Gemini — لتحليل صور الجداول
GEMINI_KEY="${GEMINI_KEY:-}"

# أصول CORS المسموحة (쉼ولة للفصل)
ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-}"

# ─── التحقق من المفاتيح ─────────────────────────────────────
if [ -z "$OCR_KEY" ]; then
  echo "⚠️  OCR_KEY غير معيّن."
  echo "   الاستخدام: OCR_KEY=your-key bash scripts/setup-secrets.sh"
  echo "   أو: export OCR_KEY=your-key ثم شغّل السكريبت"
  echo ""
  read -p "أدخل مفتاح OCR.space API (أو Enter للتخطي): " OCR_KEY
fi

if [ -z "$GEMINI_KEY" ]; then
  echo "⚠️  GEMINI_KEY غير معيّن."
  read -p "أدخل مفتاح Google Gemini (أو Enter للتخطي): " GEMINI_KEY
fi

# ─── تعيين الأسرار ───────────────────────────────────────────
echo ""
echo "🔧 جاري تعيين أسرار Supabase..."
echo ""

SET_COUNT=0

if [ -n "$OCR_KEY" ]; then
  echo "  📝 تعيين OCR_API_KEY..."
  supabase secrets set OCR_API_KEY="$OCR_KEY"
  echo "  ✅ OCR_API_KEY تم تعيينه"
  SET_COUNT=$((SET_COUNT + 1))
fi

if [ -n "$GEMINI_KEY" ]; then
  echo "  📝 تعيين GEMINI_API_KEY..."
  supabase secrets set GEMINI_API_KEY="$GEMINI_KEY"
  echo "  ✅ GEMINI_API_KEY تم تعيينه"
  SET_COUNT=$((SET_COUNT + 1))
fi

if [ -n "$ALLOWED_ORIGINS" ]; then
  echo "  📝 تعيين ALLOWED_ORIGINS..."
  supabase secrets set ALLOWED_ORIGINS="$ALLOWED_ORIGINS"
  echo "  ✅ ALLOWED_ORIGINS تم تعيينه"
  SET_COUNT=$((SET_COUNT + 1))
fi

# ─── النتيجة ─────────────────────────────────────────────────
echo ""
if [ "$SET_COUNT" -eq 0 ]; then
  echo "⚠️  لم يتم تعيين أي سر. تحقق من المتغيرات المدخلة."
  exit 1
else
  echo "✅ تم تعيين $SET_COUNT سر(أسرار) بنجاح."
  echo ""
  echo "📋 الأسرار الحالية:"
  supabase secrets list
fi
