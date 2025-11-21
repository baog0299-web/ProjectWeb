async function loadLocales(lang) {
  const res = await fetch(`${lang}.json`);
  return res.json();
}

async function initI18n() {
  const savedLang = localStorage.getItem("lang") || "vi";
  const resources = {};

  // Load cả 2 file JSON
  resources.vi = { translation: await loadLocales("vi-facility") };
  resources.en = { translation: await loadLocales("en-facility") };

  i18next.init({
    lng: savedLang,
    debug: false,
    resources: resources
  }, () => {
    updateContent();
  });
}

function updateContent() {
  document.querySelectorAll("[lang-key]").forEach(el => {
    const key = el.getAttribute("lang-key");
    const translated = i18next.t(key);

    if (el.hasAttribute("placeholder")) {
      el.setAttribute("placeholder", translated);
    } else {
      el.innerHTML = translated;
    }
  });
}

function changeLang(lang) {
  i18next.changeLanguage(lang, () => {
    updateContent();
    localStorage.setItem("lang", lang);
  });
}

// Khởi động
initI18n();
