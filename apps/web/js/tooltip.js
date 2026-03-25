/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Tooltip System v1
 * يظهر شرحاً عند hover على أي عنصر فيه data-tooltip
 * ════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  let STYLE_ID = 'svu-tooltip-css';
  let TOOLTIP_ID = 'svu-tooltip-el';
  let SHOW_DELAY = 350;
  let HIDE_DELAY = 150;

  let timer = null;
  let tip = null;
  let currentTarget = null;

  // ── Inject CSS ──
  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    let s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '#svu-tooltip-el{' +
        'position:fixed;z-index:99999;pointer-events:none;' +
        'max-width:280px;padding:10px 14px;' +
        'background:linear-gradient(160deg,rgba(15,23,42,.97),rgba(30,41,59,.95));' +
        'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
        'border:1px solid rgba(255,255,255,.1);border-radius:12px;' +
        'box-shadow:0 12px 40px rgba(0,0,0,.45);' +
        'font-family:inherit;font-size:13px;line-height:1.6;color:rgba(255,255,255,.85);' +
        'opacity:0;transform:translateY(6px);' +
        'transition:opacity .2s ease,transform .2s ease;' +
        'text-align:start;' +
      '}' +
      '#svu-tooltip-el.svt-show{opacity:1;transform:translateY(0)}' +
      '#svu-tooltip-el .svt-arrow{' +
        'position:absolute;width:10px;height:10px;' +
        'background:rgba(15,23,42,.97);border:1px solid rgba(255,255,255,.1);' +
        'transform:rotate(45deg);z-index:-1;' +
      '}' +
      '#svu-tooltip-el .svt-title{' +
        'font-weight:700;color:#fff;margin-bottom:2px;font-size:13px;' +
      '}' +
      '#svu-tooltip-el .svt-desc{' +
        'color:rgba(255,255,255,.7);font-size:12px;' +
      '}' +
      '[data-tooltip]{cursor:help}' +
      '@media(max-width:639px){#svu-tooltip-el{max-width:220px;font-size:12px;padding:8px 12px}}';
    document.head.appendChild(s);
  }

  // ── Create tooltip element ──
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = TOOLTIP_ID;
    tip.innerHTML = '<div class="svt-arrow"></div><div class="svt-title"></div><div class="svt-desc"></div>';
    tip.style.display = 'none';
    document.body.appendChild(tip);
    return tip;
  }

  // ── Get translation ─
  function t(key) {
    return (window.i18n && window.i18n.t(key)) || key;
  }

  // ── Parse tooltip data ──
  function parseTooltip(el) {
    let raw = el.getAttribute('data-tooltip') || '';
    if (!raw) return null;

    // Support format: "titleKey|descKey" or just "key"
    let parts = raw.split('|');
    let titleKey = parts[0] ? parts[0].trim() : '';
    let descKey = parts[1] ? parts[1].trim() : '';

    let title = titleKey ? t(titleKey) : '';
    let desc = descKey ? t(descKey) : '';

    // If no translation found, use raw text
    if (title === titleKey && !descKey) {
      // Single key — treat as description only
      return { title: '', desc: raw };
    }

    return { title: title, desc: desc };
  }

  // ── Position tooltip ──
  function position(el) {
    let r = el.getBoundingClientRect();
    let tw = tip.offsetWidth;
    let th = tip.offsetHeight;
    let vw = window.innerWidth;
    let gap = 10;
    let arrow = tip.querySelector('.svt-arrow');

    // Best position: below center
    let top = r.bottom + gap;
    let left = r.left + (r.width / 2) - (tw / 2);

    // If doesn't fit below, put above
    if (top + th > window.innerHeight - 10) {
      top = r.top - th - gap;
    }

    // Clamp horizontal
    if (left < 8) left = 8;
    if (left + tw > vw - 8) left = vw - tw - 8;

    // RTL: prefer right-align
    let isRtl = document.documentElement.dir === 'rtl';
    if (isRtl) {
      left = r.right - tw;
      if (left < 8) left = 8;
    }

    tip.style.top = top + 'px';
    tip.style.left = left + 'px';

    // Arrow position
    if (arrow) {
      let arrowLeft = r.left + r.width / 2 - left - 5;
      if (top < r.top) {
        // Tooltip is above
        arrow.style.top = 'auto';
        arrow.style.bottom = '-5px';
        arrow.style.borderTop = 'none';
        arrow.style.borderLeft = 'none';
      } else {
        // Tooltip is below
        arrow.style.top = '-5px';
        arrow.style.bottom = 'auto';
        arrow.style.borderBottom = 'none';
        arrow.style.borderRight = 'none';
      }
      arrow.style.left = Math.max(12, Math.min(arrowLeft, tw - 22)) + 'px';
    }
  }

  // ── Show ──
  function show(el) {
    let data = parseTooltip(el);
    if (!data || (!data.title && !data.desc)) return;

    ensureTip();
    tip.querySelector('.svt-title').textContent = data.title;
    tip.querySelector('.svt-desc').textContent = data.desc;
    tip.querySelector('.svt-title').style.display = data.title ? '' : 'none';
    tip.querySelector('.svt-desc').style.display = data.desc ? '' : 'none';

    tip.style.display = 'block';
    tip.classList.remove('svt-show');

    // Position after display so offsetWidth/Height are available
    requestAnimationFrame(function () {
      position(el);
      requestAnimationFrame(function () {
        tip.classList.add('svt-show');
      });
    });

    currentTarget = el;
  }

  // ── Hide ──
  function hide() {
    if (!tip) return;
    tip.classList.remove('svt-show');
    currentTarget = null;
    setTimeout(function () {
      if (!currentTarget && tip) tip.style.display = 'none';
    }, HIDE_DELAY);
  }

  // ── Event delegation ──
  function onMouseEnter(e) {
    let target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    let el = target.closest('[data-tooltip]');
    if (!el) return;
    clearTimeout(timer);
    timer = setTimeout(function () { show(el); }, SHOW_DELAY);
  }

  function onMouseLeave(e) {
    let target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    let el = target.closest('[data-tooltip]');
    if (!el) return;
    clearTimeout(timer);
    hide();
  }

  function onFocus(e) {
    let target = e.target;
    if (!target || typeof target.closest !== 'function') return;
    let el = target.closest('[data-tooltip]');
    if (!el) return;
    clearTimeout(timer);
    timer = setTimeout(function () { show(el); }, SHOW_DELAY);
  }

  function onBlur(e) {
    clearTimeout(timer);
    hide();
  }

  // ── Init ──
  function init() {
    injectCSS();
    ensureTip();

    document.addEventListener('mouseenter', onMouseEnter, true);
    document.addEventListener('mouseleave', onMouseLeave, true);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);

    // Reposition on scroll/resize
    let reposition = function () {
      if (currentTarget && tip && tip.classList.contains('svt-show')) {
        position(currentTarget);
      }
    };
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.svuTooltip = {
    init: init,
    show: show,
    hide: hide,
    refresh: function () {
      // Re-parse current target tooltip text
      if (currentTarget) show(currentTarget);
    }
  };
})();
