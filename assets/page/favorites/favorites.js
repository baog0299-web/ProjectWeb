document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.querySelector('.card-container');
    const countElement = document.querySelector('.desinations');
    const paginationContainer = document.querySelector('.pagination');
    const FAVORITES_KEY = 'favoriteCafes';
    
    // Các biến toàn cục để quản lý phân trang
    let currentCount = 0;
    let isUpdating = false;
    let likedShops = [];
    let currentPage = 1;
    const itemsPerPage = 6;

    // 1. GIÁM SÁT THAY ĐỔI NGÔN NGỮ
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
            const response = await fetch('../../../assets/data/data.json');
            if (!response.ok) throw new Error('Không thể tải file data.json');
            
            const allShops = await response.json();
            likedShops = allShops.filter(shop => favoriteIds.includes(Number(shop.id)));

            currentCount = likedShops.length;
            if (countElement && countElement.innerHTML.includes('{{n}}')) {
                 countElement.innerHTML = countElement.innerHTML.replace('{{n}}', `<strong>${currentCount}</strong>`);
            }

            if (likedShops.length === 0) {
                showEmptyState();
                return;
            }

            setupPagination();
            renderPage(1);

        } catch (error) {
            console.error("Lỗi:", error);
            // Thêm data-i18n cho error message
            listContainer.innerHTML = '<p style="text-align:center" data-i18n="error.loadingData">Có lỗi xảy ra khi tải dữ liệu.</p>';
        }
    }

    // 3. HÀM THIẾT LẬP PHÂN TRANG
    function setupPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const pageCount = Math.ceil(likedShops.length / itemsPerPage);
        
        if (pageCount <= 1) return;

        // Tạo nút số trang
        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn-page';
            btn.innerText = i;
            // Thêm aria-label cho accessibility
            btn.setAttribute('aria-label', `Page ${i}`);
            
            if (i === 1) btn.classList.add('active');

            btn.addEventListener('click', () => {
                renderPage(i);
            });
            
            paginationContainer.appendChild(btn);
        }
    }

    // 4. HÀM VẼ CARD THEO TRANG
    function renderPage(page) {
        currentPage = page;
        listContainer.innerHTML = '';

        const buttons = paginationContainer.querySelectorAll('.btn-page');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText == currentPage) {
                btn.classList.add('active');
            }
        });

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const shopsToShow = likedShops.slice(start, end);

        shopsToShow.forEach(shop => {
            createCardHTML(shop);
        });
    }

    // 5. HÀM TẠO HTML CHO 1 CARD (ĐÃ THÊM LOGIC BỎ TIM)
    function createCardHTML(shop) {
        const cardLink = document.createElement('a');
        cardLink.href = `../Shop-detail-page/shop-detail.html?id=${shop.id}`; 
        cardLink.className = 'shop-card-link'; 
        cardLink.style.textDecoration = 'none';

        let tagsHTML = '';
        const tagsToShow = shop.criteria ? shop.criteria.slice(0, 2) : [];
        tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
        if (shop.criteria && shop.criteria.length > 2) {
            tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
        }

        let imgSrc = shop.image;
        if (imgSrc.startsWith('/')) { imgSrc = imgSrc.substring(1); }
        if (imgSrc.startsWith('assets/')) { imgSrc = '../../../' + imgSrc; }

        const fallbackImg = '../../../assets/image/public/Container.png';

        cardLink.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <img src="${imgSrc}" alt="${shop.name}" onerror="this.onerror=null; this.src='${fallbackImg}'">
                    <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                    <div class="icon-top-right heart-icon" style="color: #D97706;">
                        <i class="fas fa-heart"></i>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-info">
                        <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
                        <h3 class="title">${shop.name}</h3>
                        <div class="location"><i class="fas fa-map-marker-alt"></i> <span>${shop.location_area}</span></div>
                    </div>
                    <div class="tag">${tagsHTML}</div>
                </div>
            </div>
        `;

        // --- LOGIC BỎ TIM (QUAN TRỌNG) ---
        const heartIcon = cardLink.querySelector('.heart-icon');
        const shopId = Number(shop.id);

        heartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Lấy danh sách yêu thích hiện tại
            let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
            currentFavs = currentFavs.map(id => Number(id));

            // Xóa ID khỏi localStorage
            currentFavs = currentFavs.filter(id => id !== shopId);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));

            // Xóa quán khỏi mảng likedShops
            likedShops = likedShops.filter(s => Number(s.id) !== shopId);
            currentCount = likedShops.length;

            // Cập nhật lại số lượng
            if (countElement) {
                const text = countElement.getAttribute('data-i18n');
                if (text) {
                    // Nếu có i18n, cần reload để trigger lại translation
                    isUpdating = true;
                    countElement.innerHTML = countElement.innerHTML.replace(/<strong>\d+<\/strong>/, `<strong>${currentCount}</strong>`);
                    isUpdating = false;
                }
            }

            // Kiểm tra nếu không còn quán nào
            if (likedShops.length === 0) {
                showEmptyState();
                return;
            }

            // Tính toán lại phân trang
            const pageCount = Math.ceil(likedShops.length / itemsPerPage);
            
            // Nếu trang hiện tại vượt quá số trang mới, quay về trang cuối
            if (currentPage > pageCount) {
                currentPage = pageCount;
            }

            // Vẽ lại phân trang và trang hiện tại
            setupPagination();
            renderPage(currentPage);
        });
        // --- HẾT LOGIC BỎ TIM ---

        listContainer.appendChild(cardLink);
    }

    // 6. HÀM HIỂN THỊ TRẠNG THÁI TRỐNG (ĐÃ THÊM I18N KEYS)
    function showEmptyState() {
        currentCount = 0;
        if (countElement && countElement.innerHTML.includes('{{n}}')) {
             countElement.innerHTML = countElement.innerHTML.replace('{{n}}', `<strong>0</strong>`);
        }
        
        if(paginationContainer) paginationContainer.innerHTML = '';
        
        listContainer.innerHTML = `
            <div style="text-align: center; width: 100%; margin-top: 40px; color: #6B4423;">
                <h3 data-i18n="empty.title">Chưa có quán nào trong bộ sưu tập</h3>
                <p data-i18n="empty.description">Hãy khám phá và thả tim cho những quán cà phê bạn yêu thích nhé!</p>
                <a href="../cafe-list/cafe-list.html" 
                   style="display: inline-block; margin-top: 20px; text-decoration: none; color: #D97706; font-weight: bold; border: 1px solid #D97706; padding: 10px 20px; border-radius: 20px;"
                   data-i18n="empty.exploreButton">
                   Khám phá ngay
                </a>
            </div>
        `;
    }

    loadFavorites();
});