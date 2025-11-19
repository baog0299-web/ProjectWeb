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

// Carousel functionality
let currentCarouselIndex = 0;
const cardsPerSlide = 3;
const totalCards = 9;

function createCarouselCard(shopData) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'carousel-card';
    
    // Giới hạn số tags hiển thị
    const displayTags = shopData.criteria.slice(0, 2);
    const remainingCount = shopData.criteria.length - 2;
    
    cardDiv.innerHTML = `
        <div class="card" data-shop-id="${shopData.id}">
            <div class="card-image">
                <img src="${shopData.image}" alt="${shopData.name}" onerror="this.src='assets/image/cfimg/lava1.png'">
                <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                <div class="icon-top-right" onclick="event.stopPropagation(); toggleFavorite(${shopData.id})"><i class="far fa-heart"></i></div>
            </div>
            <div class="card-content">
                <div class="card-info">
                    <div class="rating">
                        <i class="fas fa-star"></i> ${shopData.rating}
                    </div>
                    <h3 class="title">${shopData.name}</h3>
                    <div class="location">
                        <i class="fas fa-map-marker-alt"></i> ${shopData.location_area}
                    </div>
                </div>
                <div class="tag">
                    ${displayTags.map(tag => `<button class="btn-tag" onclick="event.stopPropagation()">${tag}</button>`).join('')}
                    ${remainingCount > 0 ? `<button class="btn-tag" id="small" onclick="event.stopPropagation()">+${remainingCount}</button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Thêm event listener cho click vào card
    const card = cardDiv.querySelector('.card');
    card.addEventListener('click', () => {
        navigateToShopDetail(shopData.id);
    });
    
    // Thêm cursor pointer để báo hiệu có thể click
    card.style.cursor = 'pointer';
    
    return cardDiv;
}

// Hàm điều hướng đến trang detail
function navigateToShopDetail(shopId) {
    const detailUrl = `assets/page/Shop-detail-page/shop-detail.html?id=${shopId}`;
    window.location.href = detailUrl;
}

// Hàm toggle favorite (tạm thời chỉ log, có thể phát triển sau)
function toggleFavorite(shopId) {
    console.log('Toggle favorite for shop ID:', shopId);
    // TODO: Implement favorite functionality
}

async function initializeCarousel() {
    let coffeeShopsData = [];
    
    // Kiểm tra dữ liệu từ data.js trước
    if (typeof allCoffeeShops !== 'undefined' && allCoffeeShops.length) {
        coffeeShopsData = allCoffeeShops;
    } else {
        // Nếu chưa có, thử load từ JSON
        try {
            const response = await fetch('/assets/data/data.json');
            if (response.ok) {
                coffeeShopsData = await response.json();
            } else {
                console.warn('Could not load data.json, retrying...');
                setTimeout(initializeCarousel, 100);
                return;
            }
        } catch (error) {
            console.warn('Error loading data, retrying...', error);
            setTimeout(initializeCarousel, 100);
            return;
        }
    }
    
    const track = document.getElementById('carousel-track');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    if (!track || !nextBtn || !prevBtn) {
        console.warn('Carousel elements not found, retrying...');
        setTimeout(initializeCarousel, 100);
        return;
    }
    
    console.log('Initializing carousel with', coffeeShopsData.length, 'coffee shops');
    
    // Tạo 9 cards từ dữ liệu có sẵn (lặp lại nếu cần)
    const carouselData = [];
    for (let i = 0; i < totalCards; i++) {
        const shopIndex = i % coffeeShopsData.length;
        carouselData.push(coffeeShopsData[shopIndex]);
    }
    
    // Tạo cards cho carousel
    const cards = carouselData.map(shop => createCarouselCard(shop));
    
    // Clone cards để tạo hiệu ứng vô tận
    const clonesToStart = cards.slice(-cardsPerSlide).map(card => card.cloneNode(true));
    const clonesToEnd = cards.slice(0, cardsPerSlide).map(card => card.cloneNode(true));
    
    // Clear track trước khi thêm cards mới
    track.innerHTML = '';
    
    // Thêm cards vào track
    clonesToStart.forEach(clone => track.appendChild(clone));
    cards.forEach(card => track.appendChild(card));
    clonesToEnd.forEach(clone => track.appendChild(clone));
    
    console.log('Added', track.children.length, 'cards to carousel');
    
    // Cấu hình carousel - tính toán responsive
    const getCardWidth = () => {
        if (window.innerWidth <= 480) return 280;
        if (window.innerWidth <= 768) return 300;
        return 388;
    };
    
    const getGap = () => {
        if (window.innerWidth <= 480) return 10;
        if (window.innerWidth <= 768) return 15;
        return 20;
    };
    
    const getPadding = () => {
        if (window.innerWidth <= 480) return 10;
        if (window.innerWidth <= 768) return 15;
        return 20;
    };
    
    let cardWidth = getCardWidth();
    let gap = getGap();
    let padding = getPadding();
    let slideWidth = cardWidth + gap;
    const speed = 500;
    
    // Vị trí ban đầu (bắt đầu từ cards thật)
    const startSlideIndex = clonesToStart.length;
    currentCarouselIndex = startSlideIndex;
    
    const updateTransform = (index, animate = true) => {
        track.style.transition = animate ? `transform ${speed}ms ease-in-out` : 'none';
        // Tính toán vị trí với padding để căn giữa 3 cards
        const translateX = -index * slideWidth;
        track.style.transform = `translateX(${translateX}px)`;
    };
    
    // Set vị trí đầu tiên
    updateTransform(currentCarouselIndex, false);
    
    let isTransitioning = false;
    
    // Xử lý nút Next
    const handleNext = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentCarouselIndex++;
        updateTransform(currentCarouselIndex);
    };
    
    // Xử lý nút Previous
    const handlePrev = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentCarouselIndex--;
        updateTransform(currentCarouselIndex);
    };
    
    // Remove existing listeners để tránh duplicate
    nextBtn.removeEventListener('click', handleNext);
    prevBtn.removeEventListener('click', handlePrev);
    
    // Add event listeners
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);
    
    // Xử lý kết thúc transition
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        
        const allCardsInTrack = track.children;
        
        // Reset về đầu nếu đang ở cuối
        if (currentCarouselIndex >= allCardsInTrack.length - clonesToEnd.length) {
            currentCarouselIndex = startSlideIndex;
            updateTransform(currentCarouselIndex, false);
        }
        
        // Reset về cuối nếu đang ở đầu
        if (currentCarouselIndex < startSlideIndex) {
            currentCarouselIndex = allCardsInTrack.length - clonesToEnd.length - 1;
            updateTransform(currentCarouselIndex, false);
        }
    });
    
    // Xử lý resize window
    const handleResize = () => {
        cardWidth = getCardWidth();
        gap = getGap();
        padding = getPadding();
        slideWidth = cardWidth + gap;
        updateTransform(currentCarouselIndex, false);
    };
    
    window.addEventListener('resize', handleResize);
    
    console.log('Carousel initialized successfully');
}

// FAQ accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel after a small delay to ensure all data is loaded
    setTimeout(() => {
        initializeCarousel();
    }, 100);
    
    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
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
});
