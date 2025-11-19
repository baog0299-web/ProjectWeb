document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.querySelector('.card-container');
    const countElement = document.querySelector('.desinations');
    const paginationContainer = document.querySelector('.pagination'); // Lấy container phân trang
    const FAVORITES_KEY = 'favoriteCafes';
    
    // Các biến toàn cục để quản lý phân trang
    let currentCount = 0;
    let isUpdating = false;
    let likedShops = []; // Lưu trữ toàn bộ quán yêu thích để dùng chung
    let currentPage = 1;
    const itemsPerPage = 6; // Quy định 6 quán 1 trang

    // 1. GIÁM SÁT THAY ĐỔI NGÔN NGỮ (Giữ nguyên logic cũ)
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
            // Lọc ra danh sách các quán yêu thích
            likedShops = allShops.filter(shop => favoriteIds.includes(Number(shop.id)));

            // Cập nhật số lượng
            currentCount = likedShops.length;
            if (countElement && countElement.innerHTML.includes('{{n}}')) {
                 countElement.innerHTML = countElement.innerHTML.replace('{{n}}', `<strong>${currentCount}</strong>`);
            }

            if (likedShops.length === 0) {
                showEmptyState();
                return;
            }

            // --- THAY ĐỔI Ở ĐÂY: Không vẽ hết, mà cài đặt phân trang ---
            setupPagination();
            renderPage(1); // Luôn bắt đầu vẽ từ trang 1

        } catch (error) {
            console.error("Lỗi:", error);
            listContainer.innerHTML = '<p style="text-align:center">Có lỗi xảy ra khi tải dữ liệu.</p>';
        }
    }

    // Hàm thiết lập các nút phân trang (1, 2, 3...)
    function setupPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = ''; // Xóa các nút cũ

        const pageCount = Math.ceil(likedShops.length / itemsPerPage);
        
        // Nếu chỉ có 1 trang hoặc ít hơn thì không cần hiện thanh phân trang
        if (pageCount <= 1) return;

        // Tạo nút số trang
        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn-page'; // Class CSS của bạn
            btn.innerText = i;
            
            if (i === 1) btn.classList.add('active'); // Trang 1 luôn active đầu tiên

            btn.addEventListener('click', () => {
                renderPage(i);
            });
            
            paginationContainer.appendChild(btn);
        }
    }

    // Hàm vẽ card theo trang
    function renderPage(page) {
        currentPage = page;
        listContainer.innerHTML = ''; // Xóa card cũ

        // Cập nhật màu nút active
        const buttons = paginationContainer.querySelectorAll('.btn-page');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            // Kiểm tra nếu nút này là nút số trang hiện tại (bỏ qua các nút icon nếu có)
            if (btn.innerText == currentPage) {
                btn.classList.add('active');
            }
        });

        // Tính toán vị trí cắt mảng
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const shopsToShow = likedShops.slice(start, end);

        // Vẽ các card trong trang hiện tại
        shopsToShow.forEach(shop => {
            createCardHTML(shop);
        });
    }

    // Hàm tạo HTML cho 1 card (Tách ra cho gọn)
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
                    <div class="icon-top-right" style="color: #D97706;">
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
        listContainer.appendChild(cardLink);
    }

    function showEmptyState() {
        currentCount = 0;
        if (countElement && countElement.innerHTML.includes('{{n}}')) {
             countElement.innerHTML = countElement.innerHTML.replace('{{n}}', `<strong>0</strong>`);
        }
        // Xóa thanh phân trang nếu không có quán
        if(paginationContainer) paginationContainer.innerHTML = '';
        
        listContainer.innerHTML = `
            <div style="text-align: center; width: 100%; margin-top: 40px; color: #6B4423;">
                <h3>Chưa có quán nào trong bộ sưu tập</h3>
                <p>Hãy khám phá và thả tim cho những quán cà phê bạn yêu thích nhé!</p>
                <a href="../cafe-list/cafe-list.html" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #D97706; font-weight: bold; border: 1px solid #D97706; padding: 10px 20px; border-radius: 20px;">Khám phá ngay</a>
            </div>
        `;
    }

    loadFavorites();
});