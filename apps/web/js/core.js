/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Unified Core
 * التخزين، الجلسة، التحقق، والأمان
 * ════════════════════════════════════════════════════════════════
 */

// Namespace foundation — migrate gradually from window.* to window.SVU.*
window.SVU = window.SVU || {};

// ════════════════════════════════════════════════════════════════
// 1. Safe Storage
// ════════════════════════════════════════════════════════════════
window.safeStorageGet = function(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
};

window.safeStorageSet = function(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
};

window.safeStorageRemove = function(key) {
  try { localStorage.removeItem(key); return true; }
  catch { return false; }
};

// ════════════════════════════════════════════════════════════════
// 2. Auth Config
// ════════════════════════════════════════════════════════════════
window.AUTH_CONFIG = {
  SESSION_KEY: 'svu_session_token',
  STORAGE_KEY: 'svu_user_session',
  USER_KEY: 'svu_user_data',
};

window.THEME_CONFIG = {
  STORAGE_KEY: 'svu_theme',
  DARK_CLASS: 'dark',
  LIGHT_ATTR: 'data-theme',
};

// ════════════════════════════════════════════════════════════════
// 3. User Functions
// ════════════════════════════════════════════════════════════════
window.getCurrentUser = function() {
  try {
    const str = window.safeStorageGet(window.AUTH_CONFIG.USER_KEY);
    return str ? JSON.parse(str) : null;
  } catch { return null; }
};

window.saveUserSession = function(userData, rememberMe = false) {
  const sessionData = { user: userData, timestamp: Date.now(), rememberMe };
  window.safeStorageSet('svu_user_session', JSON.stringify(sessionData));
  window.safeStorageSet(window.AUTH_CONFIG.SESSION_KEY, userData.id);
  window.safeStorageSet(window.AUTH_CONFIG.USER_KEY, JSON.stringify(userData));

  if (rememberMe) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    window.safeStorageSet('session_expires', expires.getTime().toString());
  } else {
    window.safeStorageRemove('session_expires');
  }
};

window.isLoggedIn = function() {
  const token = window.safeStorageGet(window.AUTH_CONFIG.SESSION_KEY);
  const data = window.safeStorageGet(window.AUTH_CONFIG.STORAGE_KEY);
  if (!token || !data) return false;

  try {
    const parsed = JSON.parse(data);
    if (!parsed.user) return false;

    const timeout =
      window.SVU_CONFIG?.SECURITY_CONFIG?.sessionTimeout ?? 30 * 60 * 1000;
    const rememberMe = !!parsed.rememberMe;

    if (rememberMe) {
      const expiresStr = window.safeStorageGet('session_expires');
      if (expiresStr && Date.now() > parseInt(expiresStr, 10)) {
        window.clearUserSession();
        return false;
      }
    } else {
      const ts = typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
      if (!ts || Date.now() - ts > timeout) {
        window.clearUserSession();
        return false;
      }
    }
    return true;
  } catch { return false; }
};

window.clearUserSession = function() {
  window.safeStorageRemove(window.AUTH_CONFIG.STORAGE_KEY);
  window.safeStorageRemove(window.AUTH_CONFIG.SESSION_KEY);
  window.safeStorageRemove(window.AUTH_CONFIG.USER_KEY);
  window.safeStorageRemove('session_expires');
};

window.updateUserData = function(updates) {
  const user = window.getCurrentUser();
  if (!user) return null;
  const updatedUser = { ...user, ...updates };
  window.safeStorageSet(window.AUTH_CONFIG.USER_KEY, JSON.stringify(updatedUser));
  const sessionData = JSON.parse(window.safeStorageGet(window.AUTH_CONFIG.STORAGE_KEY) || '{}');
  sessionData.user = updatedUser;
  window.safeStorageSet(window.AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
  return updatedUser;
};

// ════════════════════════════════════════════════════════════════
// 4. Session Verification
// ════════════════════════════════════════════════════════════════
window.verifySessionWithServer = async function(db) {
  if (!db) return window.isLoggedIn();

  try {
    const { data: { session }, error } = await db.auth.getSession();
    if (error || !session) {
      window.clearUserSession();
      return false;
    }

    const { data: userData } = await db
      .from('users')
      .select('*, is_admin')
      .eq('id', session.user.id)
      .single();

    if (userData) {
      const rememberMe = JSON.parse(
        window.safeStorageGet(window.AUTH_CONFIG.STORAGE_KEY) || '{}'
      ).rememberMe || false;
      window.saveUserSession(userData, rememberMe);
    }
    return true;
  } catch {
    return window.isLoggedIn();
  }
};

// ════════════════════════════════════════════════════════════════
// 5. Validation
// ════════════════════════════════════════════════════════════════
window.validateLoginInput = function(identifier, password) {
  const errors = [];
  if (!identifier?.trim()) errors.push(window.i18n?.t('loginEmail') || 'Please enter email or username');
  if (!password?.trim()) errors.push(window.i18n?.t('loginPassword') || 'Please enter password');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');
  return errors;
};

// ════════════════════════════════════════════════════════════════
// 6. Error Handling
// ════════════════════════════════════════════════════════════════
window.handleLoginError = function(error) {
  const msg = error?.message || '';
  const t = window.i18n?.t || (k => k);
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant'))
    return t('loginInvalidCredentials');
  if (msg.includes('User not found')) return t('loginUserNotFound');
  if (msg.includes('Email not confirmed')) return t('loginEmailNotConfirmed');
  if (msg.includes('Too many requests')) return t('loginTooManyAttempts');
  if (msg.includes('Network')) return t('loginNetworkError');
  return msg || t('error');
};

// ════════════════════════════════════════════════════════════════
// 7. Security
// DUPLICATE: packages/utils/src/index.ts has identical escapeHtml (TS version).
// TODO: Consolidate when web app migrates to ES modules.
// ════════════════════════════════════════════════════════════════
window.escapeHtml = function(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

window.validateUrl = function(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    let parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {}
  return null;
};



// ════════════════════════════════════════════════════════════════
// 9. Theme Toggle — 3-state: light → dark → system
// ════════════════════════════════════════════════════════════════
window.getSystemTheme = function() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

window.getStoredTheme = function() {
  return window.safeStorageGet(window.THEME_CONFIG.STORAGE_KEY);
};

window.getCurrentEffectiveTheme = function() {
  const stored = window.getStoredTheme();
  if (!stored || stored === 'system') return window.getSystemTheme();
  return stored;
};

window.applyTheme = function(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute(window.THEME_CONFIG.LIGHT_ATTR);
    const sysTheme = window.getSystemTheme();
    root.classList.toggle(window.THEME_CONFIG.DARK_CLASS, sysTheme === 'dark');
  } else {
    root.setAttribute(window.THEME_CONFIG.LIGHT_ATTR, theme);
    root.classList.toggle(window.THEME_CONFIG.DARK_CLASS, theme === 'dark');
  }
  window.safeStorageSet(window.THEME_CONFIG.STORAGE_KEY, theme);

  // Update toggle buttons
  document.querySelectorAll('[data-theme-option]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeOption === theme);
  });

  // Update theme toggle icon
  window.updateThemeToggleIcon(theme);
};

window.updateThemeToggleIcon = function(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;

  const sunIcon = btn.querySelector('.icon-sun');
  const moonIcon = btn.querySelector('.icon-moon');
  const systemIcon = btn.querySelector('.icon-system');

  if (sunIcon) sunIcon.classList.toggle('hidden', theme !== 'light');
  if (moonIcon) moonIcon.classList.toggle('hidden', theme !== 'dark');
  if (systemIcon) systemIcon.classList.toggle('hidden', theme !== 'system');

  btn.setAttribute('aria-label',
    theme === 'light' ? 'Light mode — click for dark' :
    theme === 'dark' ? 'Dark mode — click for system' :
    'System mode — click for light'
  );

  // Update tooltip
  const isAr = (window.i18n?.getLang?.() || 'ar') === 'ar';
  const tipAttr = btn.getAttribute('data-tooltip');
  if (tipAttr) {
    btn.setAttribute('data-tooltip',
      theme === 'light' ? (isAr ? 'الوضع الفاتح' : 'Light mode') :
      theme === 'dark' ? (isAr ? 'الوضع الداكن' : 'Dark mode') :
      (isAr ? 'وضع النظام' : 'System mode')
    );
  }
};

window.initializeTheme = function() {
  const stored = window.getStoredTheme();
  const theme = stored || 'system';
  window.applyTheme(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = window.getStoredTheme();
    if (!current || current === 'system') {
      window.applyTheme('system');
    }
  });
};

window.toggleTheme = function() {
  const current = window.getStoredTheme() || 'system';
  const cycle = { light: 'dark', dark: 'system', system: 'light' };
  const next = cycle[current] || 'light';
  window.applyTheme(next);
  return next;
};
