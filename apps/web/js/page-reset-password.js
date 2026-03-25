/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Reset Password Page
 * ════════════════════════════════════════════════════════════════
 */

let db = null;

// Eye SVGs
const EYE_VISIBLE = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
const EYE_HIDDEN = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize
  window.initializeTheme?.();
  window.i18n?.initLang?.();
  db = window.initSupabase?.();

  const form = document.getElementById('resetPasswordForm');
  const errorDiv = document.getElementById('resetError');
  const successDiv = document.getElementById('resetSuccess');
  const submitBtn = document.getElementById('resetBtn');

  // Check for hash fragment (Supabase redirects with #access_token=...)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const type = hashParams.get('type');

  if (type === 'recovery' && accessToken && db) {
    // Set the session with the tokens from the URL
    db.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).catch(() => {
      showError(window.i18n?.t('resetPasswordInvalidLink') || 'Invalid or expired link');
    });
  } else if (!accessToken && db) {
    // No token — check if we have an active session
    db.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        showError(window.i18n?.t('resetPasswordInvalidLink') || 'Invalid or expired link');
        if (form) form.style.display = 'none';
      }
    });
  }

  // Password toggle
  document.getElementById('toggleNewPwd')?.addEventListener('click', function() {
    const inp = document.getElementById('newPassword');
    const svg = this.querySelector('svg');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    svg.innerHTML = inp.type === 'text' ? EYE_VISIBLE : EYE_HIDDEN;
  });

  document.getElementById('toggleConfirmPwd')?.addEventListener('click', function() {
    const inp = document.getElementById('confirmPassword');
    const svg = this.querySelector('svg');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    svg.innerHTML = inp.type === 'text' ? EYE_VISIBLE : EYE_HIDDEN;
  });

  // Form submit
  form?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (newPassword.length < 8) {
      showError(window.i18n?.t('registerPasswordWeak') || 'Password too weak');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(window.i18n?.t('registerPasswordMismatch') || 'Passwords do not match');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ' + (window.i18n?.t('loading') || 'Loading...') + '</span>';

    try {
      if (db) {
        const { error } = await db.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }

      showSuccess(window.i18n?.t('resetPasswordSuccess') || 'Password changed!');
      form.style.display = 'none';

      setTimeout(() => { window.location.href = 'login.html'; }, 3000);
    } catch (error) {
      showError(error.message || window.i18n?.t('resetPasswordError'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = window.i18n?.t('resetPasswordBtn') || 'Change Password';
    }
  });

  function showError(msg) {
    if (errorDiv) { errorDiv.textContent = msg; errorDiv.classList.remove('hidden'); }
    if (successDiv) successDiv.classList.add('hidden');
  }

  function showSuccess(msg) {
    if (successDiv) { successDiv.textContent = msg; successDiv.classList.remove('hidden'); }
    if (errorDiv) errorDiv.classList.add('hidden');
  }
});
