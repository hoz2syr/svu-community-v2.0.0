/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Email Verification Page
 * ════════════════════════════════════════════════════════════════
 */

let db = null;

document.addEventListener('DOMContentLoaded', function() {
  window.initializeTheme?.();
  window.i18n?.initLang?.();
  db = window.initSupabase?.();

  const loadingDiv = document.getElementById('verifyLoading');
  const successDiv = document.getElementById('verifySuccess');
  const errorDiv = document.getElementById('verifyError');
  const errorMsg = document.getElementById('verifyErrorMsg');

  // Parse hash fragment — Supabase redirects with #access_token=...&refresh_token=...&type=signup
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const type = hashParams.get('type');
  const errorParam = hashParams.get('error');
  const errorDescription = hashParams.get('error_description');

  // Check for error in URL
  if (errorParam) {
    showError(errorDescription || errorParam);
    return;
  }

  // Check if this is a signup confirmation
  if (type === 'signup' && accessToken && db) {
    // Set session to confirm the email
    db.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(function(result) {
      if (result.error) {
        showError(result.error.message);
        return;
      }

      // Email confirmed successfully
      showSuccess();

      // Sign out so user logs in fresh
      setTimeout(function() {
        db.auth.signOut().then(function() {
          window.location.href = 'login.html';
        });
      }, 3000);
    }).catch(function(err) {
      showError(err.message);
    });
  } else if (type === 'recovery' && accessToken) {
    // This is a password recovery link — redirect to reset-password page
    window.location.href = 'reset-password.html' + window.location.hash;
  } else if (!accessToken) {
    // No token — show instructions to check email
    loadingDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    document.querySelector('#verifyError h3').textContent =
      window.i18n?.t('verifyEmailNoToken') || 'لم يتم العثور على رابط التفعيل';
    errorMsg.textContent =
      window.i18n?.t('verifyEmailCheckInbox') || 'تحقق من بريدك الإلكتروني واضغط على رابط التفعيل.';
    document.getElementById('resendBtn').classList.remove('hidden');
  } else {
    showError(window.i18n?.t('verifyEmailUnknown') || 'نوع الرابط غير معروف');
  }

  function showSuccess() {
    loadingDiv.classList.add('hidden');
    successDiv.classList.remove('hidden');
  }

  function showError(message) {
    loadingDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    errorMsg.textContent = message || window.i18n?.t('verifyEmailError') || 'حدث خطأ أثناء التفعيل';
  }
});

// Resend verification email
async function resendVerification() {
  const btn = document.getElementById('resendBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ' + (window.i18n?.t('loading') || 'Loading...') + '</span>';

  try {
    // Get email from URL params or ask user
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
      showToast(window.i18n?.t('verifyEmailEnterEmail') || 'يرجى إدخال البريد الإلكتروني', 'error');
      return;
    }

    if (db) {
      const { error } = await db.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
    }

    showToast(window.i18n?.t('verifyEmailResent') || 'تم إرسال رابط التفعيل مرة أخرى!', 'success');
  } catch (error) {
    showToast(error.message || window.i18n?.t('verifyEmailResendError') || 'فشل إرسال رابط التفعيل', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span data-i18n="verifyEmailResend">' + (window.i18n?.t('verifyEmailResend') || 'إعادة إرسال رابط التفعيل') + '</span>';
  }
}
