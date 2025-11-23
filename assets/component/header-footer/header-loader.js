function loadHeader() {
    fetch("/assets/component/header-footer/header.html")
    .then(res => {
        if (!res.ok) throw new Error(`Không tìm thấy header.html: ${res.status} ${res.statusText}`);
        return res.text();
    })
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo) {
                logo.src = "/assets/image/public/Container.png";
                logo.alt = "CoffeeFinder Logo";
                
                logo.onerror = function() {

                    this.src = "/assets/image/public/logo.png";
                };
            }
            
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
            
            setupResponsiveHeader(headerDiv);
        }
    })
    .catch(err => {});
}

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    // DOM is already ready
    loadHeader();
}


if (!window.headerGlobalState) {
    window.headerGlobalState = {
        eventListenersSetup: false,
        currentLang: localStorage.getItem('site_lang') || 'vi'
    };
}


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
                    if (mobileSearchBtn) mobileSearchBtn.classList.remove('active');
                }
            }
        });
    }
    

    if (mobileSearchBtn && mobileSearchBar) {
        mobileSearchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isActive = mobileSearchBar.classList.contains('active');
            
            if (isActive) {
                // Close search
                mobileSearchBar.classList.remove('active');
                this.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
            } else {
                // Open search
                mobileSearchBar.classList.add('active');
                this.classList.add('active');
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
            }
        });
    }
    

    if (mobileSearchClose && mobileSearchBar) {
        mobileSearchClose.addEventListener('click', function(e) {
            e.preventDefault();
            mobileSearchBar.classList.remove('active');
            if (mobileSearchBtn) mobileSearchBtn.classList.remove('active');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
        });
    }
    

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            // Close all mobile menus
            if (hamburgerBtn) hamburgerBtn.classList.remove('active');
            if (mobileNavMenu) mobileNavMenu.classList.remove('active');
            if (mobileSearchBtn) mobileSearchBtn.classList.remove('active');
            if (mobileSearchBar) mobileSearchBar.classList.remove('active');
            this.classList.remove('active');
        });
    }
    

    
    // Update language display
    function updateLanguageDisplay(lang) {
        // Update mobile language toggle
        if (mobileLangToggle) {
            mobileLangToggle.textContent = lang.toUpperCase();
            mobileLangToggle.setAttribute('data-current-lang', lang);
        }
        
        // Update desktop language buttons
        desktopLangBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === lang) {
                btn.classList.add('active');
            }
        });
    }
    
    // Initialize language display
    updateLanguageDisplay(currentLang);
    
    // Mobile language toggle
    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const currentLang = this.getAttribute('data-current-lang') || 'vi';
            const newLang = currentLang === 'vi' ? 'en' : 'vi';
            
            // Update localStorage
            localStorage.setItem('site_lang', newLang);
            window.headerGlobalState.currentLang = newLang;
            
            // Update display
            updateLanguageDisplay(newLang);
            
            // Trigger language change event
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: newLang } 
            }));
        });
    }
    
    // Desktop language buttons
    desktopLangBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const newLang = this.textContent.toLowerCase();
            
            // Update localStorage
            localStorage.setItem('site_lang', newLang);
            window.headerGlobalState.currentLang = newLang;
            
            // Update display
            updateLanguageDisplay(newLang);
            
            // Trigger language change event
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: newLang } 
            }));
        });
    });
    

    
    let searchData = []; // Cache search data
    let searchSuggestions = null; // Search suggestions dropdown
    
    // Load search data for suggestions
    async function loadSearchData() {
        try {
            if (searchData.length === 0) {
                const response = await fetch('/assets/data/data.json');
                if (response.ok) {
                    searchData = await response.json();
                }
            }
        } catch (error) {

        }
    }
    
    // Create search suggestions dropdown
    function createSearchSuggestions(inputElement) {
        if (searchSuggestions) return searchSuggestions;
        
        searchSuggestions = document.createElement('div');
        searchSuggestions.className = 'search-suggestions';
        searchSuggestions.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        let searchContainer = inputElement.closest('.header-search-bar');
        
        // For mobile, attach to header instead of mobile-search-bar to prevent layout shift
        if (!searchContainer) {
            const mobileContainer = inputElement.closest('.mobile-search-container');
            if (mobileContainer) {
                searchContainer = mobileContainer.closest('.header, .head');
                
                // Custom positioning for mobile suggestions with breakpoint detection
                if (searchContainer) {
                    // Check if screen width is 1080px or above
                    const isDesktop = window.innerWidth >= 1080;
                    const marginTop = isDesktop ? '20px' : '75px';
                    
                    searchSuggestions.style.cssText = `
                        position: absolute;
                        top: 100%;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        max-height: 300px;
                        overflow-y: auto;
                        z-index: 1001;
                        display: none;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        margin-top: ${marginTop};
                    `;
                }
            }
        }
        
        if (searchContainer) {
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(searchSuggestions);
        }
        
        return searchSuggestions;
    }
    
    // Show search suggestions
    function showSearchSuggestions(inputElement, query) {
        if (!searchData.length || !query || query.length < 2) {
            hideSearchSuggestions();
            return;
        }
        
        const suggestions = createSearchSuggestions(inputElement);
        const normalizedQuery = query.toLowerCase();
        
        // Filter matching cafes
        const matches = searchData.filter(cafe => 
            cafe.name.toLowerCase().includes(normalizedQuery) ||
            cafe.address.toLowerCase().includes(normalizedQuery) ||
            (cafe.description && cafe.description.toLowerCase().includes(normalizedQuery))
        ).slice(0, 8); // Limit to 8 suggestions
        
        if (matches.length === 0) {
            suggestions.innerHTML = `
                <div class="no-results" style="
                    padding: 20px; 
                    color: #999; 
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                ">
                    <i class="fas fa-search" style="font-size: 24px; color: #ddd;"></i>
                    <span>Không tìm thấy quán cafe nào</span>
                </div>
            `;
        } else {
            suggestions.innerHTML = matches.map(cafe => `
                <div class="search-suggestion-item" data-cafe-name="${cafe.name}" data-cafe-address="${cafe.address}">
                    <div class="suggestion-image">
                        <img src="${cafe.image || '/assets/image/cfimg/default-cafe.jpg'}" 
                             alt="${cafe.name}"
                             onerror="this.src='/assets/image/public/Container.png'">
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-name">${highlightMatch(cafe.name, query)}</div>
                        <div class="suggestion-address">
                            <i class="fas fa-map-marker-alt"></i>
                            ${highlightMatch(cafe.address, query)}
                        </div>
                        <div class="suggestion-meta">
                            ${cafe.rating ? `<span class="rating"><i class="fas fa-star"></i> ${cafe.rating}</span>` : ''}
                            ${cafe.priceRange ? `<span class="price">${cafe.priceRange}</span>` : ''}
                        </div>
                    </div>
                    <div class="suggestion-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers for suggestions
            suggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    const cafeName = this.dataset.cafeName;
                    inputElement.value = cafeName;
                    hideSearchSuggestions();
                    performSearch(cafeName);
                });
            });
        }
        
        suggestions.style.display = 'block';
    }
    
    // Hide search suggestions
    function hideSearchSuggestions() {
        if (searchSuggestions) {
            searchSuggestions.style.display = 'none';
        }
    }
    
    // Highlight matching text
    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<strong style="color: #b87444;">$1</strong>');
    }
    
    // Perform search
    function performSearch(searchTerm) {
        if (!searchTerm.trim()) return;
        
        // Save search to history
        saveSearchHistory(searchTerm);
        
        // Navigate to search results
        const searchUrl = `/assets/page/cafe-list/cafe-list.html?search=${encodeURIComponent(searchTerm.trim())}`;
        window.location.href = searchUrl;
    }
    
    // Save search history
    function saveSearchHistory(searchTerm) {
        try {
            let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            searchHistory = searchHistory.filter(term => term !== searchTerm); // Remove if exists
            searchHistory.unshift(searchTerm); // Add to beginning
            searchHistory = searchHistory.slice(0, 10); // Keep only 10 recent searches
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        } catch (error) {

        }
    }
    
    // Handle search forms and inputs
    const searchInputs = headerDiv.querySelectorAll('.header-search-bar input, .mobile-search-container input');
    const searchForms = headerDiv.querySelectorAll('.header-search-bar form, .mobile-search-container form');
    
    // Load search data
    loadSearchData();
    
    // Setup search inputs
    searchInputs.forEach(input => {
        let searchTimeout;
        
        // Real-time search suggestions
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    showSearchSuggestions(this, query);
                }, 300);
            } else {
                hideSearchSuggestions();
            }
        });
        
        // Focus events
        input.addEventListener('focus', function() {
            if (this.value.trim().length >= 2) {
                showSearchSuggestions(this, this.value.trim());
            }
        });
        
        // Keyboard navigation
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideSearchSuggestions();
                this.blur();
            }
        });
    });
    
    // Handle form submissions
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = this.querySelector('input[type="search"], input[type="text"]');
            if (searchInput && searchInput.value.trim()) {
                hideSearchSuggestions();
                performSearch(searchInput.value.trim());
            }
        });
    });
    
    // Handle search icon clicks
    const searchIcons = headerDiv.querySelectorAll('.header-search-bar i.fa-magnifying-glass, .mobile-search-container i.fa-magnifying-glass');
    searchIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const form = this.closest('form');
            const input = form ? form.querySelector('input') : null;
            if (input && input.value.trim()) {
                hideSearchSuggestions();
                performSearch(input.value.trim());
            } else if (input) {
                input.focus();
            }
        });
    });
    
    // Click outside to hide suggestions
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-search-bar') && !e.target.closest('.mobile-search-container')) {
            hideSearchSuggestions();
        }
    });
    
    // Update suggestions positioning on window resize
    window.addEventListener('resize', function() {
        if (searchSuggestions) {
            const isDesktop = window.innerWidth >= 1080;
            const marginTop = isDesktop ? '20px' : '75px';
            searchSuggestions.style.marginTop = marginTop;
        }
    });
    
    // End of setup
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
            }
        })
        .catch(err => {});
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    // DOM is already ready
    loadFooter();
}