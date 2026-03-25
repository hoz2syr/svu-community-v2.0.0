/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Feedback & Rating System v1
 * تقييم إلزامي بعد الجولة — لغة فصحى ودية
 * ════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  let KEY = 'svu_feedback_done';
  let STYLE_ID = 'svu-feedback-css';
  let MODAL_ID = 'svu-feedback-modal';

  let rating = 0;
  let submitted = false;

  function t(k) {
    return (window.i18n && window.i18n.t(k)) || k;
  }

  function isDone() {
    return localStorage.getItem(KEY) === 'true';
  }

  // ──────────────────────────────
  // CSS
  // ──────────────────────────────
  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    let s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      /* ── Overlay ── */
      '.fb-overlay{' +
        'position:fixed;inset:0;z-index:99999;' +
        'background:rgba(0,0,0,0);backdrop-filter:blur(0px);' +
        'display:flex;align-items:center;justify-content:center;' +
        'padding:16px;transition:all .4s ease;' +
      '}' +
      '.fb-overlay.fb-show{' +
        'background:rgba(0,0,0,.65);backdrop-filter:blur(8px);' +
      '}' +

      /* ── Modal ── */
      '.fb-modal{' +
        'width:100%;max-width:420px;' +
        'background:linear-gradient(160deg,rgba(15,23,42,.98),rgba(30,41,59,.96));' +
        'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);' +
        'border:1px solid rgba(255,255,255,.1);border-radius:24px;' +
        'padding:32px 28px;position:relative;overflow:hidden;' +
        'box-shadow:0 30px 80px rgba(0,0,0,.6);' +
        'transform:scale(.92) translateY(20px);opacity:0;' +
        'transition:all .4s cubic-bezier(0.34,1.56,0.64,1);' +
      '}' +
      '.fb-overlay.fb-show .fb-modal{' +
        'transform:scale(1) translateY(0);opacity:1;' +
      '}' +

      /* ── Glow effect ── */
      '.fb-modal::before{' +
        'content:"";position:absolute;top:-60%;left:-60%;' +
        'width:220%;height:220%;' +
        'background:radial-gradient(circle at 30% 30%,rgba(56,189,248,.08),transparent 60%),'+
        'radial-gradient(circle at 70% 70%,rgba(129,140,248,.06),transparent 60%);' +
        'pointer-events:none;' +
      '}' +

      /* ── Emoji icon ── */
      '.fb-emoji{' +
        'font-size:48px;text-align:center;margin-bottom:12px;' +
        'animation:fb-bounce 2s ease infinite;' +
      '}' +
      '@keyframes fb-bounce{' +
        '0%,100%{transform:translateY(0)}' +
        '50%{transform:translateY(-6px)}' +
      '}' +

      /* ── Title ── */
      '.fb-title{' +
        'text-align:center;font-size:20px;font-weight:700;' +
        'color:#fff;margin-bottom:6px;line-height:1.4;' +
      '}' +

      /* ── Subtitle ── */
      '.fb-sub{' +
        'text-align:center;font-size:13px;' +
        'color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.6;' +
      '}' +

      /* ── Stars ── */
      '.fb-stars{' +
        'display:flex;justify-content:center;gap:8px;margin-bottom:8px;' +
        'direction:ltr;' +
      '}' +
      '.fb-star{' +
        'font-size:36px;cursor:pointer;transition:all .2s ease;' +
        'filter:grayscale(1) brightness(.5);' +
        'user-select:none;-webkit-user-select:none;' +
      '}' +
      '.fb-star:hover,.fb-star.fb-active{' +
        'filter:none;transform:scale(1.15);' +
      '}' +
      '.fb-star:active{transform:scale(.95)}' +

      /* ── Rating label ── */
      '.fb-rating-label{' +
        'text-align:center;font-size:13px;font-weight:600;' +
        'color:rgba(255,255,255,.4);margin-bottom:20px;min-height:20px;' +
        'transition:color .2s;' +
      '}' +

      /* ── Textarea ── */
      '.fb-textarea{' +
        'width:100%;min-height:90px;resize:vertical;' +
        'background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.15);' +
        'border-radius:14px;padding:14px 16px;' +
        'color:#fff;font-size:14px;font-family:inherit;line-height:1.6;' +
        'transition:all .2s;box-sizing:border-box;' +
      '}' +
      '.fb-textarea:focus{' +
        'outline:none;border-color:rgba(56,189,248,.5);' +
        'box-shadow:0 0 0 3px rgba(56,189,248,.1);' +
      '}' +
      '.fb-textarea::placeholder{color:rgba(255,255,255,.25)}' +

      /* ── Label ── */
      '.fb-label{' +
        'display:block;font-size:13px;font-weight:600;' +
        'color:rgba(255,255,255,.6);margin-bottom:8px;' +
      '}' +

      /* ── Submit button ── */
      '.fb-submit{' +
        'width:100%;padding:14px;margin-top:16px;' +
        'background:linear-gradient(135deg,#38bdf8,#0ea5e9);' +
        'color:#fff;font-size:15px;font-weight:600;' +
        'border:none;border-radius:14px;cursor:pointer;' +
        'transition:all .2s;font-family:inherit;' +
        'box-shadow:0 4px 20px rgba(56,189,248,.3);' +
      '}' +
      '.fb-submit:hover{' +
        'transform:translateY(-2px);' +
        'box-shadow:0 8px 30px rgba(56,189,248,.4);' +
      '}' +
      '.fb-submit:active{transform:translateY(0)}' +
      '.fb-submit:disabled{' +
        'opacity:.4;cursor:not-allowed;transform:none;' +
        'box-shadow:none;' +
      '}' +

      /* ── Skip link ── */
      '.fb-skip{' +
        'display:block;text-align:center;margin-top:12px;' +
        'background:none;border:none;color:rgba(255,255,255,.2);' +
        'font-size:12px;cursor:pointer;font-family:inherit;' +
        'padding:4px 8px;transition:color .2s;' +
      '}' +
      '.fb-skip:hover{color:rgba(255,255,255,.45)}' +

      /* ── Success state ── */
      '.fb-success{' +
        'text-align:center;padding:20px 0;' +
      '}' +
      '.fb-success-emoji{font-size:56px;margin-bottom:12px;' +
        'animation:fb-success-pop .5s cubic-bezier(0.34,1.56,0.64,1);}' +
      '@keyframes fb-success-pop{' +
        'from{transform:scale(0);opacity:0}' +
        'to{transform:scale(1);opacity:1}' +
      '}' +
      '.fb-success-title{' +
        'font-size:20px;font-weight:700;color:#fff;margin-bottom:8px;' +
      '}' +
      '.fb-success-text{' +
        'font-size:14px;color:rgba(255,255,255,.5);line-height:1.7;' +
      '}' +

      /* ── Responsive ── */
      '@media(max-width:639px){' +
        '.fb-modal{padding:24px 20px;border-radius:20px}' +
        '.fb-star{font-size:30px}' +
        '.fb-title{font-size:18px}' +
        '.fb-emoji{font-size:40px}' +
      '}';
    document.head.appendChild(s);
  }

  // ──────────────────────────────
  // Rating labels
  // ──────────────────────────────
  let RATING_LABELS = [
    '',
    t('fbRate1'),
    t('fbRate2'),
    t('fbRate3'),
    t('fbRate4'),
    t('fbRate5'),
  ];

  // ──────────────────────────────
  // Build Modal
  // ──────────────────────────────
  function buildModal() {
    let overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'fb-overlay';

    overlay.innerHTML =
      '<div class="fb-modal">' +
        // Form view
        '<div id="fbForm">' +
          '<div class="fb-emoji">💬</div>' +
          '<h2 class="fb-title">' + t('fbTitle') + '</h2>' +
          '<p class="fb-sub">' + t('fbSubtitle') + '</p>' +

          // Stars
          '<div class="fb-stars" id="fbStars">' +
            '<span class="fb-star" data-v="1">⭐</span>' +
            '<span class="fb-star" data-v="2">⭐</span>' +
            '<span class="fb-star" data-v="3">⭐</span>' +
            '<span class="fb-star" data-v="4">⭐</span>' +
            '<span class="fb-star" data-v="5">⭐</span>' +
          '</div>' +
          '<div class="fb-rating-label" id="fbRatingLabel">' + t('fbPickRating') + '</div>' +

          // Feedback textarea
          '<label class="fb-label">' + t('fbFeedbackLabel') + '</label>' +
          '<textarea class="fb-textarea" id="fbText" placeholder="' + t('fbPlaceholder') + '"></textarea>' +

          // Submit
          '<button class="fb-submit" id="fbSubmit" disabled>' + t('fbSubmit') + '</button>' +
          '<button class="fb-skip" id="fbSkip">' + t('fbSkip') + '</button>' +
        '</div>' +

        // Success view (hidden)
        '<div id="fbSuccess" class="fb-success" style="display:none">' +
          '<div class="fb-success-emoji">🎉</div>' +
          '<h2 class="fb-success-title">' + t('fbSuccessTitle') + '</h2>' +
          '<p class="fb-success-text">' + t('fbSuccessText') + '</p>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    bindEvents(overlay);
    return overlay;
  }

  // ──────────────────────────────
  // Events
  // ──────────────────────────────
  function bindEvents(overlay) {
    let stars = overlay.querySelectorAll('.fb-star');
    let submitBtn = overlay.querySelector('#fbSubmit');
    let skipBtn = overlay.querySelector('#fbSkip');
    let textarea = overlay.querySelector('#fbText');
    let ratingLabel = overlay.querySelector('#fbRatingLabel');

    // Star hover
    stars.forEach(function (star) {
      star.addEventListener('mouseenter', function () {
        let val = parseInt(star.getAttribute('data-v'), 10);
        highlightStars(stars, val);
        ratingLabel.textContent = RATING_LABELS[val] || '';
        ratingLabel.style.color = '#38bdf8';
      });

      star.addEventListener('mouseleave', function () {
        highlightStars(stars, rating);
        ratingLabel.textContent = rating > 0 ? RATING_LABELS[rating] : t('fbPickRating');
        ratingLabel.style.color = rating > 0 ? '#38bdf8' : 'rgba(255,255,255,.4)';
      });

      star.addEventListener('click', function () {
        rating = parseInt(star.getAttribute('data-v'), 10);
        highlightStars(stars, rating);
        ratingLabel.textContent = RATING_LABELS[rating];
        ratingLabel.style.color = '#38bdf8';
        submitBtn.disabled = false;

        // Haptic-like visual feedback
        star.style.transform = 'scale(1.4)';
        setTimeout(function () { star.style.transform = ''; }, 200);
      });
    });

    // Submit
    submitBtn.addEventListener('click', function () {
      if (rating === 0) return;
      submitFeedback(overlay);
    });

    // Skip
    skipBtn.addEventListener('click', function () {
      localStorage.setItem(KEY, 'true');
      hideModal(overlay);
    });

    // Prevent closing by clicking overlay (mandatory feel)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        // Gentle shake to indicate it's important
        let modal = overlay.querySelector('.fb-modal');
        modal.style.animation = 'fb-shake .4s ease';
        setTimeout(function () { modal.style.animation = ''; }, 400);
      }
    });

    // Add shake keyframe
    if (!document.getElementById('fb-shake-css')) {
      let s = document.createElement('style');
      s.id = 'fb-shake-css';
      s.textContent = '@keyframes fb-shake{' +
        '0%,100%{transform:translateX(0)}' +
        '20%{transform:translateX(-8px)}' +
        '40%{transform:translateX(8px)}' +
        '60%{transform:translateX(-4px)}' +
        '80%{transform:translateX(4px)}' +
      '}';
      document.head.appendChild(s);
    }
  }

  function highlightStars(stars, val) {
    stars.forEach(function (s) {
      let v = parseInt(s.getAttribute('data-v'), 10);
      s.classList.toggle('fb-active', v <= val);
    });
  }

  // ──────────────────────────────
  // Submit
  // ──────────────────────────────
  function submitFeedback(overlay) {
    if (submitted) return;
    submitted = true;

    let feedbackText = overlay.querySelector('#fbText').value.trim();

    // Save to localStorage
    let feedbackData = {
      rating: rating,
      feedback: feedbackText,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    };
    localStorage.setItem('svu_feedback_data', JSON.stringify(feedbackData));
    localStorage.setItem(KEY, 'true');

    // Try to save to Supabase if available
    saveToSupabase(feedbackData);

    // Show success
    showSuccess(overlay);
  }

  function saveToSupabase(data) {
    try {
      if (window.supabaseClient) {
        window.supabaseClient
          .from('feedback')
          .insert([{
            rating: data.rating,
            feedback: data.feedback,
            user_id: window.currentUserId || null,
            created_at: data.timestamp,
          }])
          .then(function (result) {
            if (result.error) {
              window.log.warn('Feedback: Could not save to Supabase', result.error);
            }
          });
      }
    } catch (e) {
      // Supabase not available, data is in localStorage
      window.log.debug('Feedback saved to localStorage');
    }
  }

  function showSuccess(overlay) {
    let form = overlay.querySelector('#fbForm');
    let success = overlay.querySelector('#fbSuccess');

    form.style.opacity = '0';
    form.style.transform = 'translateY(-10px)';
    setTimeout(function () {
      form.style.display = 'none';
      success.style.display = 'block';
    }, 200);

    // Auto-close after 3 seconds
    setTimeout(function () {
      hideModal(overlay);
    }, 3500);
  }

  // ──────────────────────────────
  // Show / Hide
  // ──────────────────────────────
  function showModal() {
    if (isDone()) return;

    injectCSS();
    let overlay = document.getElementById(MODAL_ID) || buildModal();

    // Reset state
    rating = 0;
    submitted = false;
    let form = overlay.querySelector('#fbForm');
    let success = overlay.querySelector('#fbSuccess');
    form.style.display = '';
    form.style.opacity = '1';
    form.style.transform = '';
    success.style.display = 'none';
    overlay.querySelector('#fbText').value = '';
    overlay.querySelector('#fbSubmit').disabled = true;
    let stars = overlay.querySelectorAll('.fb-star');
    highlightStars(stars, 0);
    overlay.querySelector('#fbRatingLabel').textContent = t('fbPickRating');

    // Show
    overlay.style.display = 'flex';
    requestAnimationFrame(function () {
      overlay.classList.add('fb-show');
    });
  }

  function hideModal(overlay) {
    if (!overlay) overlay = document.getElementById(MODAL_ID);
    if (!overlay) return;
    overlay.classList.remove('fb-show');
    setTimeout(function () {
      overlay.style.display = 'none';
    }, 400);
  }

  // ──────────────────────────────
  // Public API
  // ──────────────────────────────
  window.svuFeedback = {
    show: showModal,
    hide: hideModal,
    isDone: isDone,
    reset: function () {
      localStorage.removeItem(KEY);
      localStorage.removeItem('svu_feedback_data');
      submitted = false;
      rating = 0;
    },
  };
})();
