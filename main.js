// Tự động tính toán đường dẫn tương đối đến component
function getRelativePath() {
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').filter(segment => segment && segment !== 'index.html').length;
    
    // Nếu ở root (index.html)
    if (depth <= 1) {
        return 'assets/';
    }
    // Nếu ở trong thư mục con (assets/page/...)
    return '../../';
}

// Load header
fetch(getRelativePath() + "component/header-footer/header.html")
    .then(res => res.text())
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong header
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo) {
                logo.src = getRelativePath() + "image/public/Container.png";
            }
            
            // Cập nhật navigation links
            const navLinks = headerDiv.querySelectorAll('.header-nav-links a');
            const basePath = window.location.pathname.includes('/assets/page/') ? '../../../' : '';
            
            if (navLinks[0]) navLinks[0].href = basePath + "index.html";
            if (navLinks[1]) navLinks[1].href = basePath + "assets/page/cafe-list/cafe-list.html";
            if (navLinks[2]) navLinks[2].href = basePath + "assets/page/favorites/favorites.html";
            if (navLinks[3]) navLinks[3].href = basePath + "assets/page/feedback/feedback.html";
            
            // Set active state dựa trên URL hiện tại
            const currentPath = window.location.pathname;
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPath = link.getAttribute('href');
                
                if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
                    if (linkPath.includes('index.html')) {
                        link.classList.add('active');
                    }
                } else if (currentPath.includes('cafe-list')) {
                    if (linkPath.includes('cafe-list')) {
                        link.classList.add('active');
                    }
                } else if (currentPath.includes('favorites')) {
                    if (linkPath.includes('favorites')) {
                        link.classList.add('active');
                    }
                } else if (currentPath.includes('feedback')) {
                    if (linkPath.includes('feedback')) {
                        link.classList.add('active');
                    }
                }
            });
        }
    });

// Load footer
fetch(getRelativePath() + "component/header-footer/footer.html")
    .then(res => res.text())
    .then(data => {
        const footerDiv = document.getElementById("footer");
        if (footerDiv) {
            footerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong footer
            const logo = footerDiv.querySelector('.logo img');
            if (logo) {
                logo.src = getRelativePath() + "image/public/Container.png";
            }
        }
    });

// Old Carousel functionality REPLACED by Modern Carousel System
// See assets/js/modern-carousel.js for new responsive implementation

// Modern Carousel initialization
window.modernCarousel = null;

// Initialize modern carousel - simplified
async function initializeModernCarousel() {
    console.log('Starting carousel initialization...');
    
    // Check if ResponsiveCarousel is loaded
    if (typeof ResponsiveCarousel === 'undefined') {
        console.error('ResponsiveCarousel class not found!');
        return;
    }
    
    // Clean up existing carousel
    if (window.modernCarousel) {
        window.modernCarousel.destroy();
    }
    
    // Create new carousel instance
    window.modernCarousel = new ResponsiveCarousel('carousel-track', {
        loop: true,
        autoplay: false,
        dragEnabled: true,
        indicators: false
    });
    
    // Initialize carousel
    await window.modernCarousel.initialize();
    console.log('Carousel initialization completed');
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing components...');
    
    // Initialize carousel if on homepage
    const carouselTrack = document.getElementById('carousel-track');
    if (carouselTrack) {
        console.log('Carousel track found, initializing...');
        setTimeout(() => {
            initializeModernCarousel().catch(error => {
                console.error('Modern carousel failed, using fallback:', error);
                initializeFallbackCarousel();
            });
        }, 300);
    } else {
        console.log('No carousel track found on this page');
    }
    
    // Initialize FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        console.log('FAQ items found, initializing...');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Đóng tất cả các FAQ items khác
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle item hiện tại
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
});

// Fallback carousel if modern carousel fails
function initializeFallbackCarousel() {
    console.log('Initializing fallback carousel...');
    
    const track = document.getElementById('carousel-track');
    const coffeeData = window.coffeeShopsData || window.allCoffeeShops;
    if (!track || !coffeeData) {
        console.error('Missing track or data for fallback carousel');
        return;
    }
    
    // Create simple cards
    track.innerHTML = '';
    const sampleShops = coffeeData.slice(0, 6);
    
    sampleShops.forEach(shop => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'carousel-card';
        cardDiv.style.width = '350px';
        cardDiv.style.flexShrink = '0';
        
        cardDiv.innerHTML = `
            <div class="card" onclick="window.location.href='assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}'">
                <div class="card-image">
                    <img src="${shop.image}" alt="${shop.name}" loading="lazy" onerror="this.src='assets/image/cfimg/lava1.png'">
                    <div class="icon-top-left">
                        <i class="fas fa-coffee"></i>
                    </div>
                    <div class="icon-top-right">
                        <i class="far fa-heart"></i>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-info">
                        <div class="rating">
                            <i class="fas fa-star"></i> ${shop.rating || '4.5'}
                        </div>
                        <h3 class="title">${shop.name}</h3>
                        <div class="location">
                            <i class="fas fa-map-marker-alt"></i> ${shop.location_area || 'Quận Gò Vấp'}
                        </div>
                    </div>
                    <div class="tag">
                        ${shop.criteria ? shop.criteria.slice(0, 2).map(tag => 
                            `<button class="btn-tag">${tag}</button>`
                        ).join('') : '<button class="btn-tag">Wifi miễn phí</button><button class="btn-tag">Không gian yên tĩnh</button>'}
                        ${shop.criteria && shop.criteria.length > 2 ? 
                            `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        track.appendChild(cardDiv);
    });
    
    // Setup basic styling
    track.style.display = 'flex';
    track.style.gap = '20px';
    track.style.padding = '20px';
    track.style.justifyContent = 'center';
    
    console.log('Fallback carousel initialized with', sampleShops.length, 'cards');
}

// End of main.js
