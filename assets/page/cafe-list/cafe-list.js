document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('cafeGrid');
    const paginationContainer = document.querySelector('.pagination');
    
    let allCoffeeShops = [];
    let currentPage = 1;
    const itemsPerPage = 6;

    async function loadAllCafes() {
        if (!listContainer || !paginationContainer) return;
        
        listContainer.innerHTML = '<p>Đang tải danh sách quán...</p>';
        
        try {
            // Lùi 3 cấp để về thư mục gốc
            const response = await fetch('../../../assets/data/data.json'); 
            
            if (!response.ok) {
                const response2 = await fetch('../../data/data.json');
                if (!response2.ok) throw new Error('Lỗi tải dữ liệu');
                allCoffeeShops = await response2.json();
            } else {
                allCoffeeShops = await response.json();
            }

            setupPagination();
            renderPage(1);
        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p>Lỗi khi tải dữ liệu.</p>';
        }
    }

    function renderPage(pageNumber) {
        currentPage = pageNumber;
        listContainer.innerHTML = ''; 

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allCoffeeShops.slice(startIndex, endIndex);

        document.querySelectorAll('.pagination .page-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.pagination .page-btn[data-page="${currentPage}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        itemsToShow.forEach(shop => {
            const shopLinkWrapper = document.createElement('a');
            shopLinkWrapper.className = 'shop-card-link';
            shopLinkWrapper.href = `../Shop-detail-page/shop-detail.html?id=${shop.id}`; 
            shopLinkWrapper.style.textDecoration = 'none';

            let tagsHTML = '';
            const tagsToShow = shop.criteria ? shop.criteria.slice(0, 2) : [];
            tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
            if (shop.criteria && shop.criteria.length > 2) {
                tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
            }

            // Xử lý đường dẫn ảnh
            let imgSrc = shop.image;
            if (imgSrc.startsWith('/')) { imgSrc = imgSrc.substring(1); }
            if (imgSrc.startsWith('assets/')) { imgSrc = '../../../' + imgSrc; }
            
            const fallbackImg = '../../../assets/image/public/Container.png';

            shopLinkWrapper.innerHTML = `
                <div class="card">
                  <div class="card-image">
                    <img src="${imgSrc}" alt="${shop.name}" onerror="this.onerror=null; this.src='${fallbackImg}'">
                    <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                    <div class="icon-top-right">
                        <i class="far fa-heart"></i>
                    </div>
                  </div>
                  <div class="card-content">
                    <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
                    <h3 class="title">${shop.name}</h3>
                    <div class="location"><i class="fas fa-map-marker-alt"></i> ${shop.location_area}</div>
                    <div class="tag">${tagsHTML}</div>
                  </div>
                </div>
            `;

            // --- LOGIC TIM (Đã sửa màu) ---
            const heartBtn = shopLinkWrapper.querySelector('.icon-top-right');
            const FAVORITES_KEY = 'favoriteCafes';
            const shopId = Number(shop.id);
            let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
            let isLiked = favorites.map(id => Number(id)).includes(shopId);

            const updateCardHeart = (active) => {
                if (active) {
                    // ĐÃ THÍCH: Màu cam (#D97706)
                    heartBtn.innerHTML = '<i class="fas fa-heart" style="color: #D97706 !important;"></i>';
                } else {
                    // CHƯA THÍCH: Màu nâu (#6B4423) <--- SỬA Ở ĐÂY (Trước là #fff nên bị tàng hình)
                    heartBtn.innerHTML = '<i class="far fa-heart" style="color: #6B4423 !important;"></i>';
                }
            };
            updateCardHeart(isLiked);

            heartBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation();
                let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
                currentFavs = currentFavs.map(id => Number(id));
                if (isLiked) {
                     currentFavs = currentFavs.filter(id => id !== shopId);
                     isLiked = false;
                } else {
                     if (!currentFavs.includes(shopId)) currentFavs.push(shopId);
                     isLiked = true;
                }
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
                updateCardHeart(isLiked);
            });

            listContainer.appendChild(shopLinkWrapper);
        });
    }

    function setupPagination() {
        paginationContainer.innerHTML = ''; 
        const pageCount = Math.ceil(allCoffeeShops.length / itemsPerPage);
        if (pageCount <= 1) return;
        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-btn';
            pageButton.textContent = i;
            pageButton.dataset.page = i;
            if (i === 1) pageButton.classList.add('active');
            pageButton.addEventListener('click', () => renderPage(i));
            paginationContainer.appendChild(pageButton);
        }
    }
    
    loadAllCafes(); 
});