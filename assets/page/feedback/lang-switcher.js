// Simple language switcher. Place language buttons with attribute: data-lang="en" or data-lang="vi"
// Mark translatable elements with data-i18n="path.to.key"
// Optionally use data-i18n-html / -placeholder / -alt / -value to set other attributes
// Stores chosen lang in localStorage under key 'site_lang'

(function () {
  const STORAGE_KEY = 'site_lang';
  const DEFAULT_LANG = 'vi';
  let lastLocale = null;

  function getJsonUrlForLang(lang) {
    // locale files are next to this page (feedback.html)
    const base = window.location.pathname.replace(/\/[^/]*$/, '/');
    return base + lang + '.json';
  }

  function fetchLocale(lang) {
    const url = getJsonUrlForLang(lang);
    return fetch(url, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Locale not found: ' + url);
        return res.json();
      });
  }

  function getByPath(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce((o, k) => (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined, obj);
  }

  function applyTranslations(locale) {
    if (!locale) return;
    lastLocale = locale;

    const title = getByPath(locale, 'pageTitle');
    if (title) document.title = title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(locale, key);
      if (val === undefined) return;
      el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getByPath(locale, key);
      if (val === undefined) return;
      el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getByPath(locale, key);
      if (val === undefined) return;
      el.setAttribute('placeholder', val);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const val = getByPath(locale, key);
      if (val === undefined) return;
      el.setAttribute('alt', val);
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      const val = getByPath(locale, key);
      if (val === undefined) return;
      el.value = val;
    });

    // update language buttons state
    document.querySelectorAll('[data-lang]').forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === currentLang();
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function currentLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!lang) return;
    localStorage.setItem(STORAGE_KEY, lang);
    fetchLocale(lang)
      .then(locale => applyTranslations(locale))
      .catch(err => {
        console.warn('Locale load failed:', err);
        if (lang !== DEFAULT_LANG) {
          fetchLocale(DEFAULT_LANG)
            .then(locale => {
              localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
              applyTranslations(locale);
            })
            .catch(e => console.error('Failed to load default locale:', e));
        }
      });
  }

  // click handler for language buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    setLang(lang);
  });

  // observe DOM changes to re-apply translations for dynamically injected parts (footer/header)
  function startDomObserver() {
    if (typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => {
      if (!lastLocale) return;
      clearTimeout(window.__i18n_apply_timeout);
      window.__i18n_apply_timeout = setTimeout(() => applyTranslations(lastLocale), 60);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // apply saved/default language
    setLang(currentLang());
    startDomObserver();
  });

  // expose
  window.langSwitcher = { setLang, currentLang };
})();