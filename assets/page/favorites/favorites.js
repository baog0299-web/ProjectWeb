document.addEventListener('DOMContentLoaded', () => {
    // 1. SỬA SELECTOR: Trỏ vào thẻ con mới .favorites-grid
    const listContainer = document.querySelector('.favorites-grid') || document.getElementById('favoritesList');
    const countElement = document.querySelector('.desinations');
    const paginationContainer = document.querySelector('.pagination');
    const FAVORITES_KEY = 'favoriteCafes';
    
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
            // SỬA: Dùng đường dẫn tuyệt đối
            const response = await fetch('/assets/data/data.json');
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
            if(listContainer) listContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;" data-i18n="error.loadingData">Có lỗi xảy ra khi tải dữ liệu.</p>';
        }
    }

    // 3. HÀM THIẾT LẬP PHÂN TRANG
    function setupPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const pageCount = Math.ceil(likedShops.length / itemsPerPage);
        
        if (pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn-page';
            btn.innerText = i;
            if (i === 1) btn.classList.add('active');

            btn.addEventListener('click', () => {
                renderPage(i);
                // Cuộn lên đầu lưới
                const gridTop = document.querySelector('.collection');
                if(gridTop) gridTop.scrollIntoView({ behavior: 'smooth' });
            });
            
            paginationContainer.appendChild(btn);
        }
    }

    // 4. HÀM VẼ CARD THEO TRANG
    function renderPage(page) {
        currentPage = page;
        if(!listContainer) return;
        listContainer.innerHTML = '';

        const buttons = paginationContainer ? paginationContainer.querySelectorAll('.btn-page') : [];
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

    // 5. HÀM TẠO HTML CHO 1 CARD
    function createCardHTML(shop) {
        // SỬA: Link chi tiết tuyệt đối
        // Kiểm tra tên thư mục shop-detail-page trên GitHub của bạn (viết thường/hoa)
        const detailLink = `/assets/page/shop-detail-page/shop-detail.html?id=${shop.id}`;

        const cardLink = document.createElement('a');
        cardLink.href = detailLink; 
        cardLink.className = 'shop-card-link'; 
        cardLink.style.textDecoration = 'none';
        cardLink.style.color = 'inherit'; // Kế thừa màu chữ để không bị xanh/tím

        let tagsHTML = '';
        if (shop.criteria && shop.criteria.length > 0) {
            const tagsToShow = shop.criteria.slice(0, 2);
            tagsHTML = tagsToShow.map(tag => `<span class="btn-tag">${tag}</span>`).join('');
            if (shop.criteria.length > 2) {
                tagsHTML += `<span class="btn-tag" id="small">+${shop.criteria.length - 2}</span>`;
            }
        }

        let imgSrc = shop.image;
        // Nếu ảnh là đường dẫn tương đối (không bắt đầu bằng http hoặc /) thì thêm / vào
        if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
             imgSrc = '/' + imgSrc;
        }
        const fallbackImg = '/assets/image/public/Container.png'; // Đường dẫn tuyệt đối

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

        // --- LOGIC BỎ TIM ---
        const heartIcon = cardLink.querySelector('.heart-icon');
        const shopId = Number(shop.id);

        heartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
            currentFavs = currentFavs.map(id => Number(id));

            // Xóa ID
            currentFavs = currentFavs.filter(id => id !== shopId);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));

            // Xóa khỏi mảng hiển thị
            likedShops = likedShops.filter(s => Number(s.id) !== shopId);
            currentCount = likedShops.length;

            // Cập nhật số lượng
            if (countElement) {
                 // Cập nhật trực tiếp số lượng
                 // Hoặc dùng regex thay thế số cũ
                 const oldHTML = countElement.innerHTML;
                 // Tìm số nằm trong thẻ strong hoặc số đứng một mình
                 if(oldHTML.includes('<strong>')) {
                     countElement.innerHTML = oldHTML.replace(/<strong>\d+<\/strong>/, `<strong>${currentCount}</strong>`);
                 }
            }

            // Nếu hết quán
            if (likedShops.length === 0) {
                showEmptyState();
                return;
            }

            // Tính toán lại phân trang
            const pageCount = Math.ceil(likedShops.length / itemsPerPage);
            if (currentPage > pageCount) currentPage = pageCount;

            setupPagination();
            renderPage(currentPage);
        });

        listContainer.appendChild(cardLink);
    }

    // 6. HÀM HIỂN THỊ TRẠNG THÁI TRỐNG
    function showEmptyState() {
        currentCount = 0;
        if (countElement && countElement.innerHTML.includes('<strong>')) {
             countElement.innerHTML = countElement.innerHTML.replace(/<strong>\d+<\/strong>/, `<strong>0</strong>`);
        }
        
        if(paginationContainer) paginationContainer.innerHTML = '';
        
        if(listContainer) {
            // grid-column: 1/-1 để thông báo chiếm hết chiều ngang của Grid
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