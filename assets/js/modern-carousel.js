// Modern Responsive Carousel System
class ResponsiveCarousel {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.track = null;
        this.nextBtn = null;
        this.prevBtn = null;
        
        // Configuration
        this.config = {
            autoplay: options.autoplay || false,
            autoplayDelay: options.autoplayDelay || 3000,
            loop: options.loop !== false, // default true
            items: options.items || [],
            dragEnabled: options.dragEnabled !== false,
            indicators: options.indicators || false
        };
        
        // State
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.isResetting = false;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.threshold = 50;
        

        this.breakpoints = {
            400: { itemsPerView: 1, gap: 0, cardWidth: 320 },
            600: { itemsPerView: 1, gap: 20, cardWidth: 360 },
            800: { itemsPerView: 2, gap: 20, cardWidth: 355 }, 
            1080: { itemsPerView: 2, gap: 20, cardWidth: 400 },
            1280: { itemsPerView: 3, gap: 20, cardWidth: 388 }
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        const breakpoints = Object.keys(this.breakpoints).map(Number).sort((a, b) => a - b);
        
        for (let i = breakpoints.length - 1; i >= 0; i--) {
            if (width >= breakpoints[i]) {
                const selectedBreakpoint = this.breakpoints[breakpoints[i]];

                return selectedBreakpoint;
            }
        }

        return this.breakpoints[400]; // fallback
    }
    
    createCard(shopData) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'carousel-card';
        cardDiv.style.width = `${this.currentBreakpoint.cardWidth}px`;
        cardDiv.style.flexShrink = '0';
        
        cardDiv.innerHTML = `
            <div class="card" onclick="window.location.href='assets/page/Shop-detail-page/shop-detail.html?id=${shopData.id}'">
                <div class="card-image">
                    <img src="${shopData.image}" alt="${shopData.name}" loading="lazy" onerror="this.src='assets/image/cfimg/lava1.png'">
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
                            <i class="fas fa-star"></i> ${shopData.rating || '4.5'}
                        </div>
                        <h3 class="title">${shopData.name}</h3>
                        <div class="location">
                            <i class="fas fa-map-marker-alt"></i> ${shopData.location_area || 'Quận Gò Vấp'}
                        </div>
                    </div>
                    <div class="tag">
                        ${shopData.criteria ? shopData.criteria.slice(0, 2).map(tag => 
                            `<button class="btn-tag">${tag}</button>`
                        ).join('') : '<button class="btn-tag">Wifi miễn phí</button><button class="btn-tag">Không gian yên tĩnh</button>'}
                        ${shopData.criteria && shopData.criteria.length > 2 ? 
                            `<button class="btn-tag" id="small">+${shopData.criteria.length - 2}</button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        return cardDiv;
    }
    
    async initialize(retryCount = 0) {
        const maxRetries = 10;
        

        
        // Check data - try both global variables
        const coffeeData = window.coffeeShopsData || window.allCoffeeShops;
        if (!coffeeData || coffeeData.length === 0) {

            if (retryCount < maxRetries) {
                setTimeout(() => this.initialize(retryCount + 1), 100);
                return;
            }

            throw new Error('Coffee shops data not available');
        }
        
        // Set the data if not already set
        if (!window.coffeeShopsData && window.allCoffeeShops) {
            window.coffeeShopsData = window.allCoffeeShops;
        }
        

        
        // Find DOM elements
        this.track = document.getElementById('carousel-track');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        

        
        if (!this.track || !this.nextBtn || !this.prevBtn) {
            if (retryCount < maxRetries) {
                setTimeout(() => this.initialize(retryCount + 1), 100);
                return;
            }

            return;
        }
        
        // Setup carousel data
        this.setupData();
        this.render();
        this.bindEvents();
        this.updatePosition(false);
        

    }
    
    setupData() {
        // Select random items for carousel
        const coffeeData = window.coffeeShopsData || window.allCoffeeShops;
        const shuffled = [...coffeeData].sort(() => 0.5 - Math.random());
        this.config.items = shuffled.slice(0, 6);
        
        // For infinite loop, add clones
        if (this.config.loop) {
            const itemsPerView = this.currentBreakpoint.itemsPerView;
            this.clonedItems = [
                ...this.config.items.slice(-itemsPerView),
                ...this.config.items,
                ...this.config.items.slice(0, itemsPerView)
            ];
            this.currentIndex = itemsPerView;
        } else {
            this.clonedItems = [...this.config.items];
            this.currentIndex = 0;
        }
    }
    
    render() {
        this.track.innerHTML = '';
        this.track.style.display = 'flex';
        this.track.style.gap = `${this.currentBreakpoint.gap}px`;
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.track.style.alignItems = 'center';
        this.track.style.justifyContent = this.currentBreakpoint.itemsPerView === 1 ? 'center' : 'flex-start';
        
        this.clonedItems.forEach(item => {
            const card = this.createCard(item);
            this.track.appendChild(card);
        });
    }
    
    updatePosition(animate = true) {
        const itemWidth = this.currentBreakpoint.cardWidth;
        const gap = this.currentBreakpoint.gap;
        const translateX = this.currentBreakpoint.itemsPerView === 1 
            ? -(this.currentIndex * itemWidth)
            : -(this.currentIndex * (itemWidth + gap));
        
        this.track.style.transition = animate && !this.isResetting ? 'transform 0.5s ease-in-out' : 'none';
        this.track.style.transform = `translateX(${translateX}px)`;
    }
    
    next() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex++;
        this.updatePosition();
    }
    
    prev() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex--;
        this.updatePosition();
    }
    
    goTo(index) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex = this.config.loop ? index + this.currentBreakpoint.itemsPerView : index;
        this.updatePosition();
    }
    
    bindEvents() {
        // Button events
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
        
        // Transition end
        this.track.addEventListener('transitionend', () => {
            this.isTransitioning = false;
            
            if (this.config.loop) {
                const itemsPerView = this.currentBreakpoint.itemsPerView;
                const maxIndex = this.clonedItems.length - itemsPerView;
                
                if (this.currentIndex >= maxIndex) {
                    this.isResetting = true;
                    this.currentIndex = itemsPerView;
                    this.updatePosition(false);
                    setTimeout(() => { this.isResetting = false; }, 50);
                }
                
                if (this.currentIndex < itemsPerView) {
                    this.isResetting = true;
                    this.currentIndex = maxIndex - 1;
                    this.updatePosition(false);
                    setTimeout(() => { this.isResetting = false; }, 50);
                }
            } else {
                this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.config.items.length - this.currentBreakpoint.itemsPerView));
            }
        });
        
        // Touch/drag events
        if (this.config.dragEnabled) {
            this.bindDragEvents();
        }
        
        // Resize
        this.resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
        
        // Autoplay
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }
    
    bindDragEvents() {
        // Touch events
        this.track.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0].clientX), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0].clientX), { passive: true });
        this.track.addEventListener('touchend', () => this.handleDragEnd(), { passive: true });
        
        // Mouse events
        this.track.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleDragStart(e.clientX);
        });
        
        this.mouseMoveHandler = (e) => {
            if (this.isDragging) this.handleDragMove(e.clientX);
        };
        
        this.mouseUpHandler = () => this.handleDragEnd();
        
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
    }
    
    handleDragStart(clientX) {
        this.isDragging = true;
        this.startX = clientX;
        this.track.style.transition = 'none';
    }
    
    handleDragMove(clientX) {
        if (!this.isDragging) return;
        
        this.currentX = clientX - this.startX;
        const itemWidth = this.currentBreakpoint.cardWidth;
        const gap = this.currentBreakpoint.gap;
        const currentTranslate = -(this.currentIndex * (itemWidth + gap));
        
        this.track.style.transform = `translateX(${currentTranslate + this.currentX}px)`;
    }
    
    handleDragEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.transition = 'transform 0.5s ease-in-out';
        
        if (Math.abs(this.currentX) > this.threshold) {
            if (this.currentX > 0) {
                this.prev();
            } else {
                this.next();
            }
        } else {
            this.updatePosition();
        }
        
        this.currentX = 0;
    }
    
    handleResize() {
        const newBreakpoint = this.getCurrentBreakpoint();
        if (JSON.stringify(newBreakpoint) !== JSON.stringify(this.currentBreakpoint)) {
            this.currentBreakpoint = newBreakpoint;
            this.setupData();
            this.render();
            this.updatePosition(false);
        }
    }
    
    startAutoplay() {
        this.autoplayTimer = setInterval(() => {
            if (!this.isDragging && !this.isTransitioning) {
                this.next();
            }
        }, this.config.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    destroy() {
        this.stopAutoplay();
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler);
        }
    }
}

// Global carousel instance
window.modernCarousel = null;

// Initialize modern carousel
async function initializeModernCarousel() {
    if (window.modernCarousel) {
        window.modernCarousel.destroy();
    }
    
    window.modernCarousel = new ResponsiveCarousel('carousel-track', {
        loop: true,
        autoplay: false,
        dragEnabled: true,
        indicators: false
    });
    
    await window.modernCarousel.initialize();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResponsiveCarousel, initializeModernCarousel };
}