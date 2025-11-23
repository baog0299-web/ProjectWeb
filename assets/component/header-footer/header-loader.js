// Ensure DOM is ready before loading header
function loadHeader() {
    // Load header
    fetch("/assets/component/header-footer/header.html")
    .then(res => {
        if (!res.ok) throw new Error(`Không tìm thấy header.html: ${res.status} ${res.statusText}`);
        return res.text();
    })
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            
            // ===== SỬA LỖI LOGO =====
            // Cập nhật đường dẫn logo - BẮT BUỘC phải sửa vì header.html dùng đường dẫn tương đối
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo) {
                // Đổi đường dẫn thành tuyệt đối
                logo.src = "/assets/image/public/Container.png";
                logo.alt = "CoffeeFinder Logo";
                
                // Xử lý lỗi nếu logo không tải được
                logo.onerror = function() {
                    console.error('Không thể tải logo từ:', this.src);
                    // Thử đường dẫn dự phòng
                    this.src = "/assets/image/public/logo.png";
                };
            }
            
            // Set active state cho navigation
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
            
            // ===== RESPONSIVE FUNCTIONALITY =====

            setupResponsiveHeader(headerDiv);
        }
    })
    .catch(err => console.error("Lỗi tải header:", err));
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    // DOM is already ready
    loadHeader();
}

// ===== GLOBAL STATE =====
// Use window object to persist across page reloads in SPA-like behavior
if (!window.headerGlobalState) {
    window.headerGlobalState = {
        eventListenersSetup: false,
        currentLang: localStorage.getItem('site_lang') || 'vi'
    };
}

// ===== RESPONSIVE HEADER FUNCTIONALITY =====
function setupResponsiveHeader(headerDiv) {
    // Find all required elements
    const hamburgerBtn = headerDiv.querySelector('.hamburger-btn');
    const mobileNavMenu = headerDiv.querySelector('.mobile-nav-menu');
    const mobileSearchBtn = headerDiv.querySelector('.mobile-search-btn');
    const mobileSearchBar = headerDiv.querySelector('.mobile-search-bar');
    const mobileSearchClose = headerDiv.querySelector('.mobile-search-close');
    const mobileLangToggle = headerDiv.querySelector('.mobile-lang-toggle');
    const desktopLangBtns = headerDiv.querySelectorAll('.desktop-logo .lang-btn');
    const mobileOverlay = headerDiv.querySelector('.mobile-overlay');
    
    // Use global current language
    window.headerGlobalState.currentLang = localStorage.getItem('site_lang') || 'vi';
    let currentLang = window.headerGlobalState.currentLang;
    
    // ===== HAMBURGER MENU TOGGLE =====
    if (hamburgerBtn && mobileNavMenu) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                // Close menu
                this.classList.remove('active');
                mobileNavMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
            } else {
                // Open menu
                this.classList.add('active');
                mobileNavMenu.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                
                // Close search if open
                if (mobileSearchBar && mobileSearchBar.classList.contains('active')) {
                    mobileSearchBar.classList.remove('active');
                }
            }
        });
        
        // Mark that event listener is attached
        hamburgerBtn._hasEventListeners = true;
    }
    
    // ===== MOBILE SEARCH TOGGLE =====
    if (mobileSearchBtn && mobileSearchBar) {
        console.log('Setting up mobile search button event listener');
        mobileSearchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Mobile search button clicked');
            
            mobileSearchBar.classList.add('active');
            if (mobileOverlay) mobileOverlay.classList.add('active');
            
            // Close hamburger menu if open
            if (hamburgerBtn && hamburgerBtn.classList.contains('active')) {
                hamburgerBtn.classList.remove('active');
                mobileNavMenu.classList.remove('active');
            }
            
            // Focus on search input
            const searchInput = mobileSearchBar.querySelector('input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
        
        // Mark that event listener is attached
        mobileSearchBtn._hasEventListeners = true;
    }
    
    if (mobileSearchClose && mobileSearchBar) {
        mobileSearchClose.addEventListener('click', function() {
            mobileSearchBar.classList.remove('active');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
        });
    }
    
    // ===== OVERLAY CLICK TO CLOSE =====
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            // Close all mobile menus
            if (hamburgerBtn) hamburgerBtn.classList.remove('active');
            if (mobileNavMenu) mobileNavMenu.classList.remove('active');
            if (mobileSearchBar) mobileSearchBar.classList.remove('active');
            this.classList.remove('active');
        });
    }
    
    // ===== INITIALIZE CURRENT LANGUAGE =====
    // Get current language from existing system
    if (window.langSwitcher && typeof window.langSwitcher.currentLang === 'function') {
        currentLang = window.langSwitcher.currentLang();
    }
    
    // Update mobile toggle to match current language
    if (mobileLangToggle) {
        const langText = mobileLangToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = currentLang.toUpperCase();
        }
        mobileLangToggle.setAttribute('data-current-lang', currentLang);
    }
    
    // ===== MOBILE LANGUAGE TOGGLE =====
    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get current language from the button's data attribute
            const currentDisplayLang = this.getAttribute('data-current-lang') || currentLang;
            const newLang = currentDisplayLang === 'vi' ? 'en' : 'vi';
            
            // Update current language variables
            currentLang = newLang;
            window.headerGlobalState.currentLang = newLang;
            
            // Use existing language system if available
            if (window.langSwitcher && typeof window.langSwitcher.setLang === 'function') {
                window.langSwitcher.setLang(newLang);
            } else {
                // Fallback: manual update
                updateLanguageDisplay(newLang);
                
                // Update localStorage manually if langSwitcher is not available
                localStorage.setItem('site_lang', newLang);
                
                // Trigger custom event for other parts of the app
                const langChangeEvent = new CustomEvent('languageChange', {
                    detail: { language: newLang }
                });
                document.dispatchEvent(langChangeEvent);
            }
        });
    }
    
    // ===== DESKTOP LANGUAGE BUTTONS =====
    // Remove existing click handlers and let lang-switcher.js handle them
    // Just sync the mobile toggle when language changes
    
    // ===== SETUP GLOBAL EVENT LISTENERS =====
    // Always setup global listeners as they work with current DOM elements
        
        // ===== CLOSE MOBILE MENUS ON OUTSIDE CLICK =====
        document.addEventListener('click', function(e) {
            const currentHeader = document.querySelector('#header');
            const currentMobileNavMenu = currentHeader?.querySelector('.mobile-nav-menu');
            const currentMobileSearchBar = currentHeader?.querySelector('.mobile-search-bar');
            const currentHamburgerBtn = currentHeader?.querySelector('.hamburger-btn');
            const currentMobileOverlay = currentHeader?.querySelector('.mobile-overlay');
            
            // Close mobile nav if clicking outside (but not on overlay, as overlay has its own handler)
            if (currentMobileNavMenu && currentMobileNavMenu.classList.contains('active')) {
                if (!currentHeader.contains(e.target) && !e.target.classList.contains('mobile-overlay')) {
                    currentHamburgerBtn.classList.remove('active');
                    currentMobileNavMenu.classList.remove('active');
                    if (currentMobileOverlay) currentMobileOverlay.classList.remove('active');
                }
            }
            
            // Close mobile search if clicking outside (but not on overlay)
            if (currentMobileSearchBar && currentMobileSearchBar.classList.contains('active')) {
                if (!currentHeader.contains(e.target) && !e.target.classList.contains('mobile-overlay')) {
                    currentMobileSearchBar.classList.remove('active');
                    if (currentMobileOverlay) currentMobileOverlay.classList.remove('active');
                }
            }
        });
        
        // ===== HANDLE WINDOW RESIZE =====
        window.addEventListener('resize', function() {
            // Close mobile menus when resizing to desktop
            if (window.innerWidth >= 1080) {
                const currentHeader = document.querySelector('#header');
                if (currentHeader) {
                    const currentHamburgerBtn = currentHeader.querySelector('.hamburger-btn');
                    const currentMobileNavMenu = currentHeader.querySelector('.mobile-nav-menu');
                    const currentMobileSearchBar = currentHeader.querySelector('.mobile-search-bar');
                    const currentMobileOverlay = currentHeader.querySelector('.mobile-overlay');
                    
                    if (currentHamburgerBtn) currentHamburgerBtn.classList.remove('active');
                    if (currentMobileNavMenu) currentMobileNavMenu.classList.remove('active');
                    if (currentMobileSearchBar) currentMobileSearchBar.classList.remove('active');
                    if (currentMobileOverlay) currentMobileOverlay.classList.remove('active');
                }
            }
        });
        
        // ===== KEYBOARD NAVIGATION =====
        document.addEventListener('keydown', function(e) {
            // ESC key closes mobile menus
            if (e.key === 'Escape') {
                const currentHeader = document.querySelector('#header');
                if (currentHeader) {
                    const currentHamburgerBtn = currentHeader.querySelector('.hamburger-btn'); 
                    const currentMobileNavMenu = currentHeader.querySelector('.mobile-nav-menu');
                    const currentMobileSearchBar = currentHeader.querySelector('.mobile-search-bar');
                    const currentMobileOverlay = currentHeader.querySelector('.mobile-overlay');
                    
                    if (currentHamburgerBtn && currentHamburgerBtn.classList.contains('active')) {
                        currentHamburgerBtn.classList.remove('active');
                        currentMobileNavMenu.classList.remove('active');
                    }
                    if (currentMobileSearchBar && currentMobileSearchBar.classList.contains('active')) {
                        currentMobileSearchBar.classList.remove('active');
                    }
                    if (currentMobileOverlay) currentMobileOverlay.classList.remove('active');
                }
            }
        });
    // End of global event listeners setup
}



// Load footer function
function loadFooter() {
    fetch("/assets/component/header-footer/footer.html")
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy footer.html');
            return res.text();
        })
        .then(data => {
            const footerDiv = document.getElementById("footer");
            if (footerDiv) {
                footerDiv.innerHTML = data;
                
                // Cập nhật đường dẫn logo trong footer
                const logo = footerDiv.querySelector('.logo img');
                if (logo) {
                    logo.src = "/assets/image/public/Container.png";
                    logo.alt = "CoffeeFinder Logo";
                    
                    logo.onerror = function() {
                        console.error('Không thể tải logo footer từ:', this.src);
                        this.src = "/assets/image/public/logo.png";
                    };
                }
            }
        })
        .catch(err => console.error("Lỗi tải footer:", err));
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}

// ===== HELPER FUNCTION =====
function updateLanguageDisplay(newLang) {
    // Update mobile language toggle (use current header)
    const currentHeader = document.querySelector('#header');
    const mobileLangToggle = currentHeader?.querySelector('.mobile-lang-toggle');
    if (mobileLangToggle) {
        const langText = mobileLangToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = newLang.toUpperCase();
        }
        mobileLangToggle.setAttribute('data-current-lang', newLang);
        
        // Update the title attribute for better UX
        const titleText = newLang === 'vi' ? 'Chuyển sang English' : 'Chuyển sang Tiếng Việt';
        mobileLangToggle.setAttribute('title', titleText);
    }
}

// ===== INTEGRATION WITH EXISTING LANGUAGE SYSTEM =====
// Listen for language changes from lang-switcher.js
document.addEventListener('languageChanged', function(e) {
    const newLang = e.detail.lang;
    if (window.headerGlobalState) {
        window.headerGlobalState.currentLang = newLang;
    }
    updateLanguageDisplay(newLang);
});

// Fallback listener for custom languageChange event
document.addEventListener('languageChange', function(e) {
    const newLang = e.detail.language;
    if (window.headerGlobalState) {
        window.headerGlobalState.currentLang = newLang;
    }
    updateLanguageDisplay(newLang);
});