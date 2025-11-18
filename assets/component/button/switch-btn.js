// Load lang-switcher component (lang-switcher.html) into #lang-switcher-root
(function loadLangSwitcherComponent(){
  function run() {
    let root = document.getElementById('lang-switcher-root');
    
    // Nếu không tồn tại, tự tạo và chèn vào trước header
    if (!root) {
      console.warn('lang-switcher root not found, creating it...');
      root = document.createElement('div');
      root.id = 'lang-switcher-root';
      
      const header = document.getElementById('header');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(root, header);
        console.log('Created #lang-switcher-root before #header');
      } else {
        document.body.insertBefore(root, document.body.firstChild);
        console.log('Created #lang-switcher-root at start of body');
      }
    }

    const candidates = [
      '/assets/component/button/lang-switcher.html',
      '../../component/button/lang-switcher.html',
      '../component/button/lang-switcher.html'
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
          root.appendChild(node);
          console.log('lang-switcher inserted into root from', url);
        }

        // Apply translations
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