/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Configuration (Production)
 * ════════════════════════════════════════════════════════════════
 */

// Supabase — إعدادات الإنتاج
// المفاتيح تُحقن عبر Vite define من متغيرات البيئة (.env)
const env = window.SVU_ENV || {};
const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

// Supabase config
const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

// App settings
const APP_CONFIG = {
  name: 'SVU Community',
  version: '2.0.0',
  defaultLang: 'ar',
  supportedLangs: ['ar', 'en'],
};

// Security settings — sessionTimeout/isLoggedIn + lockout في core.js؛ maxLoginAttempts في page-login.js؛ requireEmailConfirmation إشعار تشغيلي
const SECURITY_CONFIG = {
  requireEmailConfirmation: false,
  sessionTimeout: 30 * 60 * 1000,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
};

// Supabase client singleton
let supabaseClient = null;

/**
 * تهيئة Supabase — مُحسّنة مع singleton
 */
function initSupabase() {
  if (supabaseClient) return supabaseClient;

  try {
    if (typeof window.supabase === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { 'Accept': 'application/json' },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    return supabaseClient;
  } catch (e) {
    if (SUPABASE_ANON_KEY) window.log.warn('[Config] Supabase init error:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

/**
 * الحصول على Supabase client
 */
function getDb() {
  return supabaseClient || initSupabase();
}

/**
 * التحقق من إعداد Supabase
 */
function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://'));
}

// Export for window globals
window.SVU_CONFIG = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_CONFIG,
  SECURITY_CONFIG,
};
window.initSupabase = initSupabase;
window.getDb = getDb;
window.isSupabaseConfigured = isSupabaseConfigured;
