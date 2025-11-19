// Improved language switcher with custom validation messages
(function () {
  const STORAGE_KEY = 'site_lang';
  const DEFAULT_LANG = 'vi';
  let lastLocale = null;
  let currentPageName = '';

  // Detect current page name from URL
  function detectPageName() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop().replace('.html', '');
    
    const pageMap = {
      'index': 'home',
      'cafe-list': 'cafe-list',
      'favorites': 'favorites',
      'feedback': 'feedback',
      'shop-detail': 'shop-detail'
    };
    
    return pageMap[fileName] || fileName || 'home';
  }

  function getJsonUrlForLang(lang) {
    currentPageName = detectPageName();
    const possiblePaths = [
      `/assets/locale/${currentPageName}-${lang}.json`,
      `/assets/page/${currentPageName}/${lang}.json`,
      `./locales/${lang}.json`,
      `./${lang}.json`,
      `../../locale/${currentPageName}-${lang}.json`
    ];
    return possiblePaths;
  }

  function fetchLocale(lang) {
    const urls = getJsonUrlForLang(lang);
    function tryUrls(urlList, index = 0) {
      if (index >= urlList.length) {
        return Promise.reject(new Error('No locale file found for: ' + lang));
      }
      const url = urlList[index];
      return fetch(url, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .catch(() => tryUrls(urlList, index + 1));
    }
    return tryUrls(urls);
  }

  function getByPath(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce((o, k) => (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined, obj);
  }

  // --- NEW FUNCTION: Handle Form Validation Messages ---
  function updateValidationMessages(locale) {
    // Lấy thông báo từ JSON, nếu không có thì dùng fallback cứng
    const requiredMsg = getByPath(locale, 'validation.required') || 
                        (currentLang() === 'vi' ? "Vui lòng điền vào trường này" : "Please fill out this field");
    
    const emailMsg = getByPath(locale, 'validation.email') || 
                     (currentLang() === 'vi' ? "Email không hợp lệ" : "Invalid email address");

    // Chọn tất cả các input cần validate
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Sự kiện khi input bị lỗi (bấm submit mà chưa điền)
      input.oninvalid = function(e) {
        e.target.setCustomValidity(""); // Reset để hệ thống kiểm tra lại trạng thái thực
        
        if (!e.target.validity.valid) {
          // Lỗi bỏ trống (Required)
          if (e.target.validity.valueMissing) {
            e.target.setCustomValidity(requiredMsg);
          } 
          // Lỗi định dạng (ví dụ sai email)
          else if (e.target.validity.typeMismatch) {
            e.target.setCustomValidity(emailMsg);
          }
        }
      };

      // Sự kiện khi người dùng bắt đầu gõ phím -> Xóa lỗi ngay lập tức
      input.oninput = function(e) {
        e.target.setCustomValidity("");
      };
    });
  }
  // -------------------------------------------------------

  function applyTranslations(locale) {
    if (!locale) return;
    lastLocale = locale;

    const title = getByPath(locale, 'pageTitle');
    if (title) document.title = title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(locale, key);
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getByPath(locale, key);
      if (val !== undefined) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getByPath(locale, key);
      if (val !== undefined) el.setAttribute('placeholder', val);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const val = getByPath(locale, key);
      if (val !== undefined) el.setAttribute('alt', val);
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      const val = getByPath(locale, key);
      if (val !== undefined) el.value = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = getByPath(locale, key);
      if (val !== undefined) el.setAttribute('aria-label', val);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = getByPath(locale, key);
      if (val !== undefined) el.setAttribute('title', val);
    });

    document.querySelectorAll('[data-lang]').forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === currentLang();
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // --- GỌI HÀM VALIDATION Ở ĐÂY ---
    updateValidationMessages(locale);

    document.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang: currentLang(), locale } 
    }));
  }

  function currentLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!lang) return;
    localStorage.setItem(STORAGE_KEY, lang);
    
    fetchLocale(lang)
      .then(locale => {
        applyTranslations(locale);
      })
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

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    setLang(lang);
  });

  function startDomObserver() {
    if (typeof MutationObserver === 'undefined') return;
    
    const obs = new MutationObserver(() => {
      if (!lastLocale) return;
      clearTimeout(window.__i18n_apply_timeout);
      window.__i18n_apply_timeout = setTimeout(() => {
        applyTranslations(lastLocale);
      }, 100);
    });
    
    obs.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLang(currentLang());
    startDomObserver();
  });

  window.langSwitcher = { 
    setLang, 
    currentLang,
    applyTranslations,
    fetchLocale
  };
})();