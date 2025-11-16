// Header and footer are loaded by header-loader.js
// Add any page-specific JavaScript here

// Load lang-switcher component (lang-switcher.html) into #lang-switcher-root
(function loadLangSwitcherComponent(){
  const root = document.getElementById('lang-switcher-root');
  if (!root) return;
  fetch('../../component/button/lang-switcher.html', { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('Fetch failed');
      return res.text();
    })
    .then(html => {
      // parse to fragment and extract only the .lang-switcher element (avoid nested <html>/<body>)
      const frag = document.createRange().createContextualFragment(html);
      const el = frag.querySelector('.lang-switcher');
      if (el) {
        root.appendChild(el);
      } else {
        // fallback: insert raw html (if component file is partial)
        root.innerHTML = html;
      }
      // small delay to allow lang-switcher.js to bind if already loaded
      setTimeout(() => {
        if (window.langSwitcher && typeof window.langSwitcher.setLang === 'function') {
          window.langSwitcher.setLang(window.langSwitcher.currentLang());
        }
      }, 60);
    })
    .catch(err => console.warn('Could not load lang-switcher component:', err));
})();