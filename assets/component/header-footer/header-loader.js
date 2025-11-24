// --- 1. LOAD HEADER ---
function loadHeader() {
    fetch("/assets/component/header-footer/header.html")
    .then(res => {
        if (!res.ok) throw new Error(`Không tìm thấy header.html: ${res.status}`);
        return res.text();
    })
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            
            // Fix đường dẫn Logo
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo) {
                logo.src = "/assets/image/public/Container.png";
                logo.onerror = function() { this.src = "/assets/image/public/logo.png"; };
            }
            
            // Highlight menu đang Active (Trang chủ, Danh sách...)
            const navLinks = headerDiv.querySelectorAll('.header-nav-links a, .mobile-nav-menu a');
            const currentPath = window.location.pathname;
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPath = link.getAttribute('href');
                if (currentPath === linkPath || (currentPath === '/index.html' && linkPath === '/')) {
                    link.classList.add('active');
                } else if (linkPath !== '/' && linkPath !== '/index.html' && currentPath.startsWith(linkPath)) {
                    link.classList.add('active');
                }
            });
            
            // Khởi tạo các chức năng của Header
            setupResponsiveHeader(headerDiv);
        }
    })
    .catch(err => console.error("Lỗi load header:", err));
}

// Chạy loadHeader khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}

// Khởi tạo Global State
if (!window.headerGlobalState) {
    window.headerGlobalState = {
        translations: {} 
    };
}

// --- 2. SETUP CHỨC NĂNG HEADER (Menu, Lang, Search) ---
function setupResponsiveHeader(headerDiv) {
    // Lấy các element cần thiết
    const elements = {
        hamburgerBtn: headerDiv.querySelector('.hamburger-btn'),
        menu: headerDiv.querySelector('.mobile-nav-menu'),
        searchBtn: headerDiv.querySelector('.mobile-search-btn'),
        searchBar: headerDiv.querySelector('.mobile-search-bar'),
        searchClose: headerDiv.querySelector('.mobile-search-close'),
        langToggle: headerDiv.querySelector('.mobile-lang-toggle'),
        desktopLangBtns: headerDiv.querySelectorAll('.desktop-logo .lang-btn'), // Lấy danh sách nút Desktop
        overlay: headerDiv.querySelector('.mobile-overlay')
    };

    // Lấy ngôn ngữ hiện tại từ bộ nhớ (Mặc định là 'vi')
    let currentLang = localStorage.getItem('site_lang') || 'vi';

    /* --- A. XỬ LÝ MENU MOBILE --- */
    if (elements.hamburgerBtn) {
        elements.hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.hamburgerBtn.classList.toggle('active');
            if(elements.menu) elements.menu.classList.toggle('active');
            if(elements.overlay) elements.overlay.classList.toggle('active');
            
            if (elements.searchBar && elements.searchBar.classList.contains('active')) {
                elements.searchBar.classList.remove('active');
                if(elements.searchBtn) elements.searchBtn.classList.remove('active');
            }
        });
    }

    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.searchBar.classList.contains('active')) {
                elements.searchBar.classList.remove('active');
                elements.searchBtn.classList.remove('active');
                if(elements.overlay) elements.overlay.classList.remove('active');
            } else {
                elements.searchBar.classList.add('active');
                elements.searchBtn.classList.add('active');
                if(elements.overlay) elements.overlay.classList.add('active');
                if(elements.hamburgerBtn) elements.hamburgerBtn.classList.remove('active');
                if(elements.menu) elements.menu.classList.remove('active');
                const input = elements.searchBar.querySelector('input');
                if(input) setTimeout(() => input.focus(), 100);
            }
        });
    }

    if (elements.searchClose) {
        elements.searchClose.addEventListener('click', (e) => {
            e.preventDefault();
            elements.searchBar.classList.remove('active');
            if(elements.searchBtn) elements.searchBtn.classList.remove('active');
            if(elements.overlay) elements.overlay.classList.remove('active');
        });
    }

    if (elements.overlay) {
        elements.overlay.addEventListener('click', () => {
            if(elements.hamburgerBtn) elements.hamburgerBtn.classList.remove('active');
            if(elements.menu) elements.menu.classList.remove('active');
            if(elements.searchBtn) elements.searchBtn.classList.remove('active');
            if(elements.searchBar) elements.searchBar.classList.remove('active');
            elements.overlay.classList.remove('active');
        });
    }

    /* --- B. LOGIC DỊCH THUẬT & UI --- */
    
    function getCurrentPageJsonName() {
        const path = window.location.pathname;
        if (path.includes('cafe-list')) return 'cafe-list';
        if (path.includes('favorites')) return 'favorites';
        if (path.includes('feedback')) return 'feedback';
        if (path.includes('shop-detail')) return 'shop-detail';
        return 'home';
    }

    async function translatePage(lang) {
        const pageName = getCurrentPageJsonName();
        const jsonKey = `${pageName}-${lang}`;
        const filePath = `/assets/locale/${pageName}-${lang}.json`; 

        try {
            if (!window.headerGlobalState.translations[jsonKey]) {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`HTTP ${response.status} - Không tìm thấy: ${filePath}`);
                window.headerGlobalState.translations[jsonKey] = await response.json();
            }

            const data = window.headerGlobalState.translations[jsonKey];
            const getVal = (obj, path) => path.split('.').reduce((p, c) => p ? p[c] : null, obj);

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const trans = getVal(data, key);
                if (trans) el.textContent = trans;
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const trans = getVal(data, key);
                if (trans) el.setAttribute('placeholder', trans);
            });

            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang }, bubbles: true 
            }));

        } catch (error) {
            console.error("Lỗi dịch thuật:", error);
        }
    }

    // --- HÀM CẬP NHẬT GIAO DIỆN NÚT (ĐÃ SỬA LOGIC SO SÁNH) ---
    function updateLanguageUI(lang) {
        // Mobile UI
        if (elements.langToggle) {
            elements.langToggle.innerHTML = `
                <span class="lang-text">${lang.toUpperCase()}</span>
                <i class="fa-solid fa-globe"></i>
            `;
        }
        
        // Desktop UI: So sánh bằng data-lang thay vì textContent
        if (elements.desktopLangBtns) {
            elements.desktopLangBtns.forEach(btn => {
                // Lấy ngôn ngữ của nút từ attribute data-lang (chuẩn nhất)
                const btnLang = btn.getAttribute('data-lang') || btn.textContent.trim().toLowerCase();
                
                // Reset trạng thái trước
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');

                // Nếu khớp ngôn ngữ đang chọn -> Active
                if (btnLang === lang) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                }
            });
        }
    }

    function handleSwitch(newLang) {
        localStorage.setItem('site_lang', newLang); 
        updateLanguageUI(newLang); 
        translatePage(newLang); 
    }

    // --- KHỞI CHẠY ---
    updateLanguageUI(currentLang);
    translatePage(currentLang);

    // Sự kiện Click Mobile
    if (elements.langToggle) {
        const newBtn = elements.langToggle.cloneNode(true);
        elements.langToggle.parentNode.replaceChild(newBtn, elements.langToggle);
        elements.langToggle = newBtn; 

        elements.langToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const storedLang = localStorage.getItem('site_lang') || 'vi';
            const next = storedLang === 'vi' ? 'en' : 'vi';
            handleSwitch(next);
        });
    }

    // Sự kiện Click Desktop
    elements.desktopLangBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Lấy ngôn ngữ từ data-lang
            const next = this.getAttribute('data-lang') || this.textContent.toLowerCase().trim();
            handleSwitch(next);
        });
    });

    /* --- C. LOGIC TÌM KIẾM --- */
    let searchData = []; 
    let searchSuggestions = null; 
    
    async function loadSearchData() {
        try {
            if (searchData.length === 0) {
                const response = await fetch('/assets/data/data.json');
                if (response.ok) searchData = await response.json();
            }
        } catch (error) {}
    }
    loadSearchData();

    function createSearchSuggestions(inputElement) {
        if (searchSuggestions) return searchSuggestions;
        searchSuggestions = document.createElement('div');
        searchSuggestions.className = 'search-suggestions';
        
        let searchContainer = inputElement.closest('.header-search-bar');
        let commonCss = `
            background: white; border: 1px solid #ddd; border-top: none;
            border-radius: 8px; max-height: 300px; overflow-y: auto;
            z-index: 1001; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        if (!searchContainer) {
            const mobileContainer = inputElement.closest('.mobile-search-container');
            if (mobileContainer) {
                searchContainer = mobileContainer.closest('.header, .head');
                const isDesktop = window.innerWidth >= 1080;
                const marginTop = isDesktop ? '20px' : '75px';
                searchSuggestions.style.cssText = `
                    position: absolute; top: 100%; left: 0; right: 0;
                    ${commonCss}
                    margin-top: ${marginTop};
                `;
            }
        } else {
            searchSuggestions.style.cssText = `
                position: absolute; top: 100%; left: 0; right: 0;
                ${commonCss}
            `;
        }
        
        if (searchContainer) {
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(searchSuggestions);
        }
        return searchSuggestions;
    }
    
    function showSearchSuggestions(inputElement, query) {
        if (!searchData.length || !query || query.length < 2) {
            if (searchSuggestions) searchSuggestions.style.display = 'none';
            return;
        }
        const suggestions = createSearchSuggestions(inputElement);
        const normalizedQuery = query.toLowerCase();
        
        const matches = searchData.filter(cafe => 
            cafe.name.toLowerCase().includes(normalizedQuery) ||
            cafe.address.toLowerCase().includes(normalizedQuery)
        ).slice(0, 8);
        
        if (matches.length === 0) {
            suggestions.innerHTML = `
                <div class="no-results" style="padding: 20px; color: #999; text-align: center;">
                    <i class="fas fa-search" style="font-size: 24px; color: #ddd;"></i>
                    <p style="margin-top:5px">Không tìm thấy quán nào</p>
                </div>`;
        } else {
            suggestions.innerHTML = matches.map(cafe => `
                <div class="search-suggestion-item" data-cafe-name="${cafe.name}" 
                     onclick="window.location.href='/assets/page/shop-detail-page/shop-detail.html?id=${cafe.id}'" 
                     style="padding: 10px; cursor: pointer; display: flex; align-items: center; border-bottom: 1px solid #eee;">
                    <img src="${cafe.image || '/assets/image/cfimg/default-cafe.jpg'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover; margin-right: 10px;" onerror="this.src='/assets/image/public/Container.png'">
                    <div>
                        <div style="font-weight: bold; color: #6B4423;">${highlightMatch(cafe.name, query)}</div>
                        <div style="font-size: 0.85em; color: #666;">${highlightMatch(cafe.address, query)}</div>
                    </div>
                </div>
            `).join('');
        }
        suggestions.style.display = 'block';
    }
    
    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<strong style="color: #b87444;">$1</strong>');
    }
    
    const searchInputs = headerDiv.querySelectorAll('.header-search-bar input, .mobile-search-container input');
    searchInputs.forEach(input => {
        let searchTimeout;
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => showSearchSuggestions(this, query), 300);
            } else {
                if (searchSuggestions) searchSuggestions.style.display = 'none';
            }
        });
        input.addEventListener('focus', function() {
            if (this.value.trim().length >= 2) showSearchSuggestions(this, this.value.trim());
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-search-bar') && !e.target.closest('.mobile-search-container')) {
            if (searchSuggestions) searchSuggestions.style.display = 'none';
        }
    });

    const searchForms = headerDiv.querySelectorAll('.header-search-bar form, .mobile-search-container form');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input');
            if (input && input.value.trim()) {
                window.location.href = `/assets/page/cafe-list/cafe-list.html?search=${encodeURIComponent(input.value.trim())}`;
            }
        });
    });
}

// --- 3. LOAD FOOTER ---
function loadFooter() {
    fetch("/assets/component/header-footer/footer.html")
    .then(res => res.text())
    .then(data => {
        const f = document.getElementById("footer");
        if(f) f.innerHTML = data;
    })
    .catch(err => console.log("Lỗi footer:", err));
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}