// Load lang-switcher component (lang-switcher.html) into #lang-switcher-root
(function loadLangSwitcherComponent(){
  function run() {
    let root = document.getElementById('lang-switcher-root');
    
    // Nếu không tồn tại, tự tạo và chèn vào trước header
    if (!root) {

      root = document.createElement('div');
      root.id = 'lang-switcher-root';
      
      const header = document.getElementById('header');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(root, header);

      } else {
        document.body.insertBefore(root, document.body.firstChild);

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

      return fetch(url, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) {

            return tryFetchList(list);
          }
          return res.text().then(text => ({ url, text }));
        })
        .catch(err => {

          return tryFetchList(list);
        });
    }

    tryFetchList(candidates.slice())
      .then(({ url, text }) => {
        const frag = document.createRange().createContextualFragment(text);
        const node = frag.querySelector('.lang-switcher') || frag.firstElementChild;
        if (!node) {
          root.innerHTML = text;

        } else {
          root.appendChild(node);

        }

        // Apply translations
        let attempts = 0;
        const maxAttempts = 10;
        const interval = 150;
        const t = setInterval(() => {
          attempts++;
          if (window.langSwitcher && typeof window.langSwitcher.setLang === 'function') {
            try {

              window.langSwitcher.setLang(window.langSwitcher.currentLang());
            } catch (e) {

            }
            clearInterval(t);
            return;
          }
          if (attempts >= maxAttempts) {

            clearInterval(t);
          }
        }, interval);
      })
      .catch(err => {

      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();