document.addEventListener('DOMContentLoaded', () => {
    // 1. SỬA SELECTOR
    const listContainer = document.querySelector('.favorites-grid') || document.getElementById('favoritesList');
    const countElement = document.querySelector('.desinations');
    // Đã xóa paginationContainer
    const FAVORITES_KEY = 'favoriteCafes';
    
    let currentCount = 0;
    let isUpdating = false;
    let likedShops = [];
    // Đã xóa currentPage, itemsPerPage

    // 1. GIÁM SÁT THAY ĐỔI NGÔN NGỮ (Giữ nguyên)
    if (countElement) {
        const observer = new MutationObserver(() => {
            if (isUpdating) return; 
            const text = countElement.innerHTML;
            if (text.includes('{{n}}')) {
                isUpdating = true; 
                countElement.innerHTML = text.replace('{{n}}', `<strong>${currentCount}</strong>`);
                isUpdating = false; 
            }
        });
        observer.observe(countElement, { childList: true, characterData: true, subtree: true });
    }

    // 2. HÀM LOGIC CHÍNH
    async function loadFavorites() {
        let favoriteIds = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        favoriteIds = favoriteIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);

        if (favoriteIds.length === 0) {
            showEmptyState();
            return;
        }

        try {
            // Dùng đường dẫn tuyệt đối
            const response = await fetch('/assets/data/data.json');
            if (!response.ok) throw new Error('Không thể tải file data.json');
            
            const allShops = await response.json();
            likedShops = allShops.filter(shop => favoriteIds.includes(Number(shop.id)));

            currentCount = likedShops.length;
            
            // Cập nhật số lượng hiển thị
            if (countElement) {
                 if (countElement.innerHTML.includes('{{n}}')) {
                     countElement.innerHTML = countElement.innerHTML.replace('{{n}}', `<strong>${currentCount}</strong>`);
                 } else if (countElement.innerHTML.includes('<strong>')) {
                     // Trường hợp load lại trang và số đã được render, cập nhật lại số
                     countElement.innerHTML = countElement.innerHTML.replace(/<strong>\d+<\/strong>/, `<strong>${currentCount}</strong>`);
                 }
            }

            if (likedShops.length === 0) {
                showEmptyState();
                return;
            }

            // --- THAY ĐỔI: Render toàn bộ danh sách, không phân trang ---
            if(listContainer) listContainer.innerHTML = '';
            likedShops.forEach(shop => {
                createCardHTML(shop);
            });

        } catch (error) {
            console.error(error);
            if(listContainer) listContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;" data-i18n="error.loadingData">Có lỗi xảy ra khi tải dữ liệu.</p>';
        }
    }

    // Đã xóa hàm setupPagination và renderPage

    // 3. HÀM TẠO HTML CHO 1 CARD
    function createCardHTML(shop) {
        const detailLink = `/assets/page/shop-detail-page/shop-detail.html?id=${shop.id}`;

        const cardLink = document.createElement('a');
        cardLink.href = detailLink; 
        cardLink.className = 'shop-card-link'; 
        cardLink.style.textDecoration = 'none';
        cardLink.style.color = 'inherit';

        let tagsHTML = '';
        if (shop.criteria && shop.criteria.length > 0) {
            const tagsToShow = shop.criteria.slice(0, 2);
            tagsHTML = tagsToShow.map(tag => `<span class="btn-tag">${tag}</span>`).join('');
            if (shop.criteria.length > 2) {
                tagsHTML += `<span class="btn-tag" id="small">+${shop.criteria.length - 2}</span>`;
            }
        }

        let imgSrc = shop.image;
        if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
             imgSrc = '/' + imgSrc;
        }
        const fallbackImg = '/assets/image/public/Container.png';

        cardLink.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <img src="${imgSrc || fallbackImg}" alt="${shop.name}" loading="lazy">
                    <div class="icon-top-right heart-icon" style="color: #D97706;">
                        <i class="fas fa-heart"></i>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="title">${shop.name}</h3>
                        <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
                    </div>
                    <div class="location"><i class="fas fa-map-marker-alt"></i> <span>${shop.address || shop.location_area}</span></div>
                    <div class="tags">${tagsHTML}</div>
                </div>
            </div>
        `;

        const heartIcon = cardLink.querySelector('.heart-icon');
        const shopId = Number(shop.id);

        heartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 1. Cập nhật LocalStorage
            let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
            currentFavs = currentFavs.map(id => Number(id));
            currentFavs = currentFavs.filter(id => id !== shopId);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));

            // 2. Cập nhật dữ liệu trong RAM
            likedShops = likedShops.filter(s => Number(s.id) !== shopId);
            currentCount = likedShops.length;

            // 3. Xóa Card khỏi giao diện ngay lập tức
            cardLink.remove();

            // 4. Cập nhật số lượng trên text
            if (countElement) {
                 const oldHTML = countElement.innerHTML;
                 if(oldHTML.includes('<strong>')) {
                     countElement.innerHTML = oldHTML.replace(/<strong>\d+<\/strong>/, `<strong>${currentCount}</strong>`);
                 }
            }

            // 5. Nếu hết quán thì hiện màn hình trống
            if (likedShops.length === 0) {
                showEmptyState();
            }
        });

        listContainer.appendChild(cardLink);
    }

    // 4. HÀM HIỂN THỊ TRẠNG THÁI TRỐNG
    function showEmptyState() {
        currentCount = 0;
        if (countElement && countElement.innerHTML.includes('<strong>')) {
             countElement.innerHTML = countElement.innerHTML.replace(/<strong>\d+<\/strong>/, `<strong>0</strong>`);
        }
        
        // Không cần xóa paginationContainer nữa vì đã bỏ

        if(listContainer) {
            listContainer.innerHTML = `
                <div style="text-align: center; width: 100%; margin-top: 40px; color: #6B4423; grid-column: 1 / -1;">
                    <h3 data-i18n="empty.title">Chưa có quán nào trong bộ sưu tập</h3>
                    <p data-i18n="empty.description">Hãy khám phá và thả tim cho những quán cà phê bạn yêu thích nhé!</p>
                    <a href="/assets/page/cafe-list/cafe-list.html" 
                       style="display: inline-block; margin-top: 20px; text-decoration: none; color: #D97706; font-weight: bold; border: 1px solid #D97706; padding: 10px 20px; border-radius: 20px;"
                       data-i18n="empty.exploreButton">
                       Khám phá ngay
                    </a>
                </div>
            `;
        }
    }

    loadFavorites();
});