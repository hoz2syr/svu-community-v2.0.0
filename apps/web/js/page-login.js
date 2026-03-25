/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Login Page
 * ════════════════════════════════════════════════════════════════
 */

// Eye icon SVGs
const EYE_VISIBLE = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
const EYE_HIDDEN = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';

let passwordVisible = false;
let db = null;

// Toggle password visibility
window.togglePassword = function(type) {
  const input = document.getElementById('loginPassword');
  const icon = document.getElementById('toggleLoginPassword');
  if (input && icon) {
    passwordVisible = !passwordVisible;
    input.type = passwordVisible ? 'text' : 'password';
    icon.innerHTML = passwordVisible ? EYE_HIDDEN : EYE_VISIBLE;
  }
};

// Forgot password modal
function showForgotPassword() {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function hideForgotPassword() {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

window.showForgotPassword = showForgotPassword;
window.hideForgotPassword = hideForgotPassword;

// Check existing session (shape matches saveUserSession in core.js: { user, timestamp, rememberMe })
function checkExistingSession() {
  try {
    const session = window.safeStorageGet('svu_user_session');
    if (!session) return;
    const sessionData = JSON.parse(session);
    const user = sessionData?.user;
    if (user?.id) {
      showToast(window.i18n?.t('loginSuccess') || 'Already logged in', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
    }
  } catch {
    window.safeStorageRemove('svu_user_session');
  }
}

// ════════════════════════════════════════════════════════════════
// DOM Ready
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme and language
  window.initializeTheme?.();
  window.i18n?.initLang?.();

  // Initialize Supabase (use centralized function)
  db = window.initSupabase?.();

  checkExistingSession();

  // ════════════════════════════════════════════════════════════
  // Login Form
  // ════════════════════════════════════════════════════════════
  document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (isLockedOut()) return;

    const btn = document.getElementById('loginBtn');
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    const validationErrors = validateLoginInput(identifier, password);
    if (validationErrors.length > 0) {
      showToast(validationErrors[0], 'error');
      return;
    }

    const attempts = incrementLoginAttempts();
    const maxAttempts = window.SVU_CONFIG?.SECURITY_CONFIG?.maxLoginAttempts ?? 5;
    if (attempts >= maxAttempts) { lockoutUser(); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ' + (window.i18n?.t('loading') || 'Loading...') + '</span>';

    try {
      if (!db) {
        throw new Error('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.');
      }

      const isEmail = identifier.includes('@');
      let userEmail = identifier;

      if (!isEmail) {
        const userResult = await db
          .from('users')
          .select('email, id, username, first_name, middle_name, last_name, major')
          .eq('username', identifier)
          .maybeSingle();

        if (!userResult || userResult.error || !userResult.data?.email) {
          throw new Error(window.i18n?.t('loginUserNotFound') || 'User not found');
        }
        userEmail = userResult.data.email;
      }

      const authResult = await db.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (authResult.error) throw authResult.error;

      // Fetch user profile
      const profileResult = await db
        .from('users')
        .select('*')
        .eq('id', authResult.data.user.id)
        .maybeSingle();

      const profile = profileResult?.data || {};
      const authMeta = authResult.data.user?.user_metadata || {};

      const fullUserData = {
        id: authResult.data.user.id,
        username: profile.username || authMeta.username || authResult.data.user.email?.split('@')[0],
        email: profile.email || authResult.data.user.email,
        first_name: profile.first_name || authMeta.first_name || '',
        middle_name: profile.middle_name || authMeta.middle_name || '',
        last_name: profile.last_name || authMeta.last_name || '',
        major: profile.major || authMeta.major || '',
        avatar_url: profile.avatar_url || '',
      };

      saveUserSession(fullUserData, rememberMe);
      resetLoginAttempts();

      const welcomeName = escapeHtml(fullUserData.first_name || fullUserData.username);
      showToast('مرحباً بك ' + welcomeName + '!', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
    } catch (error) {
      const errorMessage = handleLoginError(error);
      showToast(errorMessage, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = window.i18n?.t('loginBtn') || 'تسجيل الدخول';
    }
  });

  // ════════════════════════════════════════════════════════════
  // Forgot Password Form
  // ════════════════════════════════════════════════════════════
  document.getElementById('forgotPasswordForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('resetBtn');
    const email = document.getElementById('resetEmail').value;

    btn.disabled = true;
    btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ' + (window.i18n?.t('loading') || 'Loading...') + '</span>';

    try {
      if (db) {
        const result = await db.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password.html',
        });
        if (result.error) throw result.error;
      }
      showToast(window.i18n?.t('forgotPasswordSuccess') || 'Reset link sent!', 'success');
      setTimeout(() => hideForgotPassword(), 2000);
    } catch (error) {
      showToast(error.message || window.i18n?.t('forgotPasswordError'), 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = window.i18n?.t('forgotPasswordBtn') || 'إرسال رابط الاستعادة';
    }
  });

  // Close modal on outside click
  document.getElementById('forgotPasswordModal')?.addEventListener('click', function(e) {
    if (e.target === e.currentTarget) hideForgotPassword();
  });

  // Close modal on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideForgotPassword();
  });
});
