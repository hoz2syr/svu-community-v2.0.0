/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Register Page
 * ════════════════════════════════════════════════════════════════
 */

let db = null;

// Eye SVGs
const EYE_VISIBLE = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
const EYE_HIDDEN = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';

const STR_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
const STR_LABEL_KEY = ['', 'passwordVeryWeak', 'passwordWeak', 'passwordMedium', 'passwordStrong'];

// State
let selected = window.COUNTRIES[0];
let dropOpen = false;
let selectedMajor = null;
let majorMenuOpen = false;

// ════════════════════════════════════════════════════════════════
// Country Dropdown
// ════════════════════════════════════════════════════════════════
function renderList(q) {
  q = (q || '').trim().toLowerCase();
  const list = document.getElementById('countryList');
  const none = document.getElementById('noResult');
  if (!list) return;

  const lang = window.i18n?.getLang?.() || 'ar';
  const filtered = window.COUNTRIES.filter(c => {
    const name = typeof c.name === 'object' ? c.name[lang] || c.name.ar : c.name;
    return name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q);
  });

  list.innerHTML = '';
  filtered.forEach(c => {
    const name = typeof c.name === 'object' ? c.name[lang] || c.name.ar : c.name;
    const li = document.createElement('li');
    li.className = 'c-row' + (c.code === selected.code ? ' active' : '');
    li.setAttribute('role', 'option');
    li.dataset.code = c.code;
    li.innerHTML = `<span class="cf">${c.flag}</span><span class="cn">${name}</span><span class="cd">${c.dial}</span><span class="ck">✓</span>`;
    li.addEventListener('click', () => chooseCountry(c.code, true));
    list.appendChild(li);
  });

  if (none) none.classList.toggle('hidden', filtered.length > 0);
}

function chooseCountry(code, andClose) {
  const c = window.COUNTRIES.find(x => x.code === code);
  if (!c) return;
  selected = c;
  document.getElementById('selFlag').textContent = c.flag;
  document.getElementById('selDial').textContent = c.dial;
  updateHint();
  if (andClose) closeMenu();
  else renderList(document.getElementById('countrySearch').value);
  checkPhone(document.getElementById('phone').value);
}

function openMenu() {
  dropOpen = true;
  document.getElementById('countryMenu').classList.add('open');
  document.getElementById('dropArrow').style.transform = 'rotate(180deg)';
  document.getElementById('countryBtn').setAttribute('aria-expanded', 'true');
  setTimeout(() => document.getElementById('countrySearch').focus(), 60);
}

function closeMenu() {
  dropOpen = false;
  document.getElementById('countryMenu').classList.remove('open');
  document.getElementById('dropArrow').style.transform = '';
  document.getElementById('countryBtn').setAttribute('aria-expanded', 'false');
  document.getElementById('countrySearch').value = '';
  renderList('');
}

function toggleMenu() { dropOpen ? closeMenu() : openMenu(); }

function updateHint() {
  const c = selected;
  const px = c.localPfx.length ? c.localPfx[0] : '';
  const ex = px ? `0${px}xx xxx xxx` : `${c.dial} xxx xxx xxx`;
  document.getElementById('phoneHint').textContent = `${c.flag} ${window.i18n?.t('registerPhone') || 'Phone'}: ${ex}`;
  document.getElementById('phone').placeholder = px ? `0${px}xx xxx xxx` : `${c.dial} xxx`;
}

function fmtPhone(raw) {
  const hasPlus = raw.charAt(0) === '+';
  const has00 = !hasPlus && raw.slice(0, 2) === '00';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return hasPlus ? '+' : '';
  const n = digits.length;
  let g;
  if (n <= 3) g = digits;
  else if (n <= 6) g = digits.slice(0, 3) + ' ' + digits.slice(3);
  else if (n <= 9) g = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
  else g = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 9) + ' ' + digits.slice(9, 15);
  return hasPlus ? '+' + g : has00 ? '00' + g : g;
}

function checkPhone(val) {
  const inp = document.getElementById('phone');
  const ico = document.getElementById('phoneStatus');
  const err = document.getElementById('phoneError');
  const info = document.getElementById('phoneInfo');
  const digits = val.replace(/\D/g, '');

  if (!digits) {
    inp.classList.remove('valid', 'invalid');
    if (ico) ico.textContent = '';
    err?.classList.add('hidden');
    if (info) info.textContent = '';
    return false;
  }

  const ok = digits.length >= selected.minLen && digits.length <= selected.maxLen;
  inp.classList.toggle('valid', ok);
  inp.classList.toggle('invalid', !ok);
  if (ico) ico.textContent = ok ? '✅' : '❌';
  err?.classList.toggle('hidden', ok);
  if (info) info.textContent = ok
    ? `${selected.flag} ${window.getCountryName(selected)} · ${digits.length}`
    : `${window.getCountryName(selected)}: ${selected.minLen}–${selected.maxLen} (${digits.length})`;
  return ok;
}

function buildFull(val) {
  const raw = val.trim();
  const digits = raw.replace(/\D/g, '');
  const dial = selected.dial;
  if (raw.charAt(0) === '+' || raw.slice(0, 2) === '00') return dial + digits.slice(dial.slice(1).length);
  if (raw.charAt(0) === '0') return dial + digits.slice(1);
  return dial + digits;
}

// ════════════════════════════════════════════════════════════════
// Major Dropdown
// ════════════════════════════════════════════════════════════════
function renderMajors(q) {
  q = (q || '').trim().toLowerCase();
  const list = document.getElementById('majorList');
  const menu = document.getElementById('majorMenu');
  if (!list) return;

  const filtered = q
    ? window.MAJORS.filter(m => m.toLowerCase().includes(q)).slice(0, 15)
    : window.MAJORS.slice(0, 15);

  list.innerHTML = '';
  filtered.forEach(code => {
    const li = document.createElement('li');
    li.className = 'm-row' + (selectedMajor === code ? ' active' : '');
    li.setAttribute('role', 'option');
    li.dataset.code = code;
    li.innerHTML = `<span class="mi">${code}</span><span class="check">✓</span>`;
    li.addEventListener('click', () => selectMajor(code));
    list.appendChild(li);
  });

  if (majorMenuOpen) menu?.classList.add('open');
  else menu?.classList.remove('open');
}

function selectMajor(code) {
  if (!window.MAJORS.includes(code)) return;
  selectedMajor = code;
  const input = document.getElementById('majorInput');
  input.value = code;
  input.classList.add('valid');
  input.classList.remove('invalid');
  majorMenuOpen = false;
  document.getElementById('majorMenu')?.classList.remove('open');
  document.getElementById('majorArrow').style.transform = '';
  document.getElementById('majorError')?.classList.add('hidden');
  renderMajors('');
}

function openMajorMenu() {
  majorMenuOpen = true;
  document.getElementById('majorMenu')?.classList.add('open');
  document.getElementById('majorArrow').style.transform = 'rotate(180deg)';
  renderMajors(document.getElementById('majorInput').value);
  setTimeout(() => document.getElementById('majorInput').focus(), 60);
}

function closeMajorMenu() {
  majorMenuOpen = false;
  document.getElementById('majorMenu')?.classList.remove('open');
  document.getElementById('majorArrow').style.transform = '';
}

function toggleMajorMenu() { majorMenuOpen ? closeMajorMenu() : openMajorMenu(); }

// ════════════════════════════════════════════════════════════════
// Password
// ════════════════════════════════════════════════════════════════
function calcStrength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function showStrength(p) {
  const sc = p ? calcStrength(p) : 0;
  for (let i = 1; i <= 4; i++) {
    const f = document.getElementById('s' + i);
    if (f) {
      f.style.width = i <= sc ? '100%' : '0%';
      f.style.background = i <= sc ? STR_COLOR[sc] : '';
    }
  }
  const lbl = document.getElementById('strengthLabel');
  if (lbl) {
    const labelKey = STR_LABEL_KEY[sc];
    lbl.textContent = sc > 0
      ? (window.i18n?.t('passwordStrength') || 'Strength') + ': ' + (window.i18n?.t(labelKey) || labelKey)
      : window.i18n?.t('passwordMinChars') || '8 characters minimum';
    lbl.style.color = sc > 0 ? STR_COLOR[sc] : '';
  }
}

function makeToggle(inputId, btnId) {
  document.getElementById(btnId)?.addEventListener('click', function() {
    const inp = document.getElementById(inputId);
    const svg = this.querySelector('svg');
    if (inp.type === 'password') {
      inp.type = 'text';
      svg.innerHTML = EYE_VISIBLE;
    } else {
      inp.type = 'password';
      svg.innerHTML = EYE_HIDDEN;
    }
  });
}

// ════════════════════════════════════════════════════════════════
// DOM Ready
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Initialize
  window.initializeTheme?.();
  window.i18n?.initLang?.();
  db = window.initSupabase?.();

  renderList('');
  updateHint();

  // Country dropdown events
  document.getElementById('countryBtn')?.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', function(e) {
    if (dropOpen && !document.getElementById('countryWrapper')?.contains(e.target)) closeMenu();
  });

  const srch = document.getElementById('countrySearch');
  srch?.addEventListener('input', function(e) { e.stopPropagation(); renderList(e.target.value); });
  srch?.addEventListener('click', function(e) { e.stopPropagation(); });
  srch?.addEventListener('keydown', function(e) {
    e.stopPropagation();
    if (e.key === 'Escape') closeMenu();
  });

  // Major dropdown events
  const majorInput = document.getElementById('majorInput');
  majorInput?.addEventListener('click', function(e) { e.stopPropagation(); toggleMajorMenu(); });
  majorInput?.addEventListener('input', function(e) {
    e.stopPropagation();
    selectedMajor = null;
    this.classList.remove('valid');
    renderMajors(this.value);
    majorMenuOpen = true;
  });
  majorInput?.addEventListener('keydown', function(e) {
    e.stopPropagation();
    if (e.key === 'Escape') closeMajorMenu();
    else if (e.key === 'Enter') {
      e.preventDefault();
      document.querySelector('#majorList .m-row')?.click();
    }
  });
  document.addEventListener('click', function(e) {
    if (majorMenuOpen && !document.getElementById('majorWrapper')?.contains(e.target)) closeMajorMenu();
  });

  // Phone input events
  const phoneEl = document.getElementById('phone');
  phoneEl?.addEventListener('input', function() {
    const pos = this.selectionStart;
    const prev = this.value.length;
    const fmted = fmtPhone(this.value);
    this.value = fmted;
    try { this.setSelectionRange(pos + (fmted.length - prev), pos + (fmted.length - prev)); } catch {}
    checkPhone(this.value);
  });
  phoneEl?.addEventListener('paste', function() {
    setTimeout(() => {
      this.value = fmtPhone(this.value);
      checkPhone(this.value);
    }, 0);
  });
  phoneEl?.addEventListener('blur', function() { checkPhone(this.value); });

  // Password toggles
  makeToggle('password', 'togglePwd');
  makeToggle('confirmPassword', 'toggleConfirm');

  document.getElementById('password')?.addEventListener('input', function() {
    showStrength(this.value);
    const c = document.getElementById('confirmPassword');
    if (c?.value) document.getElementById('matchMsg')?.classList.toggle('hidden', c.value === this.value);
  });
  document.getElementById('confirmPassword')?.addEventListener('input', function() {
    const p = document.getElementById('password').value;
    document.getElementById('matchMsg')?.classList.toggle('hidden', !this.value || this.value === p);
  });

  // ════════════════════════════════════════════════════════════
  // Register Form
  // ════════════════════════════════════════════════════════════
  document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('registerBtn');
    const user = document.getElementById('username').value.trim();
    const pwd = document.getElementById('password').value;
    const conf = document.getElementById('confirmPassword').value;
    const rawP = document.getElementById('phone').value;

    if (!/^[a-zA-Z]+_\d{6}$/.test(user)) {
      showToast(window.i18n?.t('registerUsernameFormat') || 'Invalid username format', 'error');
      return;
    }
    if (!selectedMajor || !window.MAJORS.includes(selectedMajor)) {
      showToast(window.i18n?.t('registerMajorRequired') || 'Please select a major', 'error');
      document.getElementById('majorInput')?.classList.add('invalid');
      document.getElementById('majorError')?.classList.remove('hidden');
      return;
    }
    if (!checkPhone(rawP)) {
      showToast(window.i18n?.t('registerPhoneRequired') || 'Invalid phone', 'error');
      document.getElementById('phoneError')?.classList.remove('hidden');
      return;
    }
    if (pwd !== conf) { showToast(window.i18n?.t('registerPasswordMismatch'), 'error'); return; }
    if (calcStrength(pwd) < 2) { showToast(window.i18n?.t('registerPasswordWeak'), 'error'); return; }

    const payload = {
      username: user,
      first_name: document.getElementById('firstName').value.trim(),
      middle_name: document.getElementById('middleName').value.trim(),
      last_name: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      major: selectedMajor,
      phone: buildFull(rawP),
      country_code: selected.code,
      country_name: window.getCountryName(selected),
      country_dial: selected.dial,
      country_flag: selected.flag,
      created_at: new Date().toISOString(),
    };

    btn.disabled = true;
    btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>' + (window.i18n?.t('loading') || 'Loading...') + '</span>';

    try {
      if (!db) {
        throw new Error('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.');
      }

      // Check duplicates
      const chk = await db.from('users').select('username,email')
        .or(`username.eq.${payload.username},email.eq.${payload.email}`)
        .maybeSingle();
      if (chk.error && chk.error.code !== 'PGRST116') throw chk.error;
      if (chk.data) {
        const field = chk.data.username === payload.username
          ? (window.i18n?.getLang?.() === 'en' ? 'Username' : 'اسم المستخدم')
          : (window.i18n?.getLang?.() === 'en' ? 'Email' : 'البريد الإلكتروني');
        throw new Error(field + (window.i18n?.getLang?.() === 'en' ? ' already registered' : ' مسجّل مسبقاً'));
      }

      // Sign up
      const auth = await db.auth.signUp({
        email: payload.email,
        password: pwd,
        options: {
          data: {
            username: payload.username,
            first_name: payload.first_name,
            middle_name: payload.middle_name,
            last_name: payload.last_name,
            major: payload.major,
            country_code: payload.country_code,
            country_name: payload.country_name,
          },
        },
      });
      if (auth.error) throw auth.error;

      // Insert into public.users (trigger may also do this — use upsert to avoid conflict)
      if (auth.data.user) {
        const ins = await db.from('users').upsert(
          { id: auth.data.user.id, ...payload },
          { onConflict: 'id' }
        );
        if (ins.error) throw new Error('Profile creation failed: ' + ins.error.message);
      }

      if (auth.data.session) {
        showToast(window.i18n?.t('registerSuccess') || 'Account created!', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 2500);
      } else {
        // Email confirmation required — redirect to verify-email page with instructions
        showToast(window.i18n?.t('registerSuccess') || 'Account created!', 'success');
        const email = encodeURIComponent(payload.email);
        setTimeout(() => { window.location.href = 'verify-email.html?email=' + email; }, 3000);
      }
    } catch (err) {
      let errorMsg = err.message || window.i18n?.t('error');
      if (errorMsg.includes('already registered') || errorMsg.includes('User already registered'))
        errorMsg = window.i18n?.t('registerEmailExists');
      else if (errorMsg.includes('Password should be at least'))
        errorMsg = window.i18n?.t('registerPasswordWeak');
      else if (errorMsg.includes('duplicate key'))
        errorMsg = window.i18n?.t('registerUsernameExists');
      showToast(errorMsg, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = window.i18n?.t('registerBtn') || 'إنشاء حساب';
    }
  });
});

// Expose for HTML
window.chooseCountry = chooseCountry;
