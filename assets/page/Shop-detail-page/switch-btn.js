// Load lang-switcher component (lang-switcher.html) into #lang-switcher-root
(function loadLangSwitcherComponent(){
  function run() {
    const root = document.getElementById('lang-switcher-root');
    if (!root) {
      console.warn('lang-switcher root not found (#lang-switcher-root)');
      return;
    }

    // candidate URLs (absolute from server root first, then relative)
    const candidates = [
      '/assets/component/button/lang-switcher.html',
      '/assets/page/feedback/../../component/button/lang-switcher.html',
      '../../component/button/lang-switcher.html'
    ];

    function tryFetchList(list) {
      if (!list.length) return Promise.reject(new Error('No candidate URLs left'));
      const url = list.shift();
      console.log('Attempting to load lang-switcher from:', url);
      return fetch(url, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) {
            console.warn('Fetch failed for', url, res.status);
            return tryFetchList(list);
          }
          return res.text().then(text => ({ url, text }));
        })
        .catch(err => {
          console.warn('Fetch error for', url, err);
          return tryFetchList(list);
        });
    }

    tryFetchList(candidates.slice())
      .then(({ url, text }) => {
        const frag = document.createRange().createContextualFragment(text);
        const node = frag.querySelector('.lang-switcher') || frag.firstElementChild;
        if (!node) {
          root.innerHTML = text;
          console.log('lang-switcher raw HTML inserted from', url);
        } else {
          // try insert right AFTER header if header exists, otherwise append to root
          const headerEl = document.getElementById('header');
          if (headerEl && headerEl.parentNode) {
            headerEl.parentNode.insertBefore(node, headerEl.nextSibling);
            console.log('lang-switcher inserted after #header from', url);
          } else {
            root.appendChild(node);
            console.log('lang-switcher inserted into root from', url);
          }
        }

        // ensure lang-switcher logic is applied after insertion; retry if not ready
        let attempts = 0;
        const maxAttempts = 10;
        const interval = 150;
        const t = setInterval(() => {
          attempts++;
          if (window.langSwitcher && typeof window.langSwitcher.setLang === 'function') {
            try {
              console.log('Invoking langSwitcher.setLang with', window.langSwitcher.currentLang());
              window.langSwitcher.setLang(window.langSwitcher.currentLang());
            } catch (e) {
              console.error('langSwitcher.setLang error', e);
            }
            clearInterval(t);
            return;
          }
          if (attempts >= maxAttempts) {
            console.warn('langSwitcher not available after retries.');
            clearInterval(t);
          }
        }, interval);
      })
      .catch(err => {
        console.error('Could not load lang-switcher component:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();