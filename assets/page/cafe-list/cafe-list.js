document.addEventListener('DOMContentLoaded', () => {

    const listContainer = document.getElementById('cafeGrid');
    const paginationContainer = document.querySelector('.pagination');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const FAVORITES_KEY = 'favoriteCafes';
    
    let allCoffeeShops = [];     // Dữ liệu gốc
    let currentDisplayList = []; // Dữ liệu đang hiển thị (đã lọc/tìm kiếm)
    let currentPage = 1;
    const itemsPerPage = 6;      // Số quán mỗi trang


    async function loadAllCafes() {
        if (!listContainer) return;
        
        listContainer.innerHTML = '<p style="text-align:center; width:100%;">Đang tải dữ liệu...</p>';
        
        try {
            // Dùng đường dẫn tuyệt đối từ gốc
            const response = await fetch('/assets/data/data.json');
            
            if (!response.ok) throw new Error(`Lỗi tải data: ${response.status}`);
            
            allCoffeeShops = await response.json();


            const urlParams = new URLSearchParams(window.location.search);
            const searchKeyword = urlParams.get('search');

            if (searchKeyword) {
                const decodedKeyword = decodeURIComponent(searchKeyword).toLowerCase();
                
                // Điền lại từ khóa vào ô tìm kiếm
                setTimeout(() => {
                    const headerInput = document.querySelector('.header-search-bar input');
                    if (headerInput) headerInput.value = decodedURIComponent(searchKeyword);
                }, 500);

                // Lọc danh sách theo từ khóa
                currentDisplayList = allCoffeeShops.filter(shop => {
                    const nameMatch = shop.name.toLowerCase().includes(decodedKeyword);
                    const addressMatch = shop.address.toLowerCase().includes(decodedKeyword);
                    return nameMatch || addressMatch;
                });
                
                // Tắt active của các tab lọc nếu đang tìm kiếm
                filterTabs.forEach(t => t.classList.remove('active'));

            } else {
                // Mặc định: Hiển thị tất cả (lọc theo Mới nhất)
                currentDisplayList = [...allCoffeeShops];
                applyFilter('new'); 
            }

            // Hiển thị trang đầu tiên
            renderPage(1);
            setupPagination();

        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p style="text-align:center; color:red;">Không thể tải dữ liệu quán.</p>';
        }
    }


    function renderPage(pageNumber) {
        currentPage = pageNumber;
        listContainer.innerHTML = ''; 

        if (currentDisplayList.length === 0) {
            listContainer.innerHTML = `
                <div class="no-result" style="width:100%; text-align:center; margin-top:40px; grid-column: 1/-1;">
                    <h3>Không tìm thấy quán nào phù hợp</h3>
                    <a href="/assets/page/cafe-list/cafe-list.html" style="color: #D97706; text-decoration: underline; margin-top: 10px; display: inline-block;">Xem tất cả quán</a>
                </div>`;
            if(paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        // Tính toán cắt mảng phân trang
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = currentDisplayList.slice(startIndex, endIndex);

        // Lấy danh sách yêu thích
        let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        favorites = favorites.map(id => Number(id));

        itemsToShow.forEach(shop => {
            const shopId = Number(shop.id);
            const isLiked = favorites.includes(shopId);

            // Xử lý Tags
            let tagsHTML = '';
            if (shop.criteria) {
                const tagsToShow = shop.criteria.slice(0, 2);
                tagsHTML = tagsToShow.map(tag => `<span class="btn-tag">${tag}</span>`).join('');
                if (shop.criteria.length > 2) {
                    tagsHTML += `<span class="btn-tag" id="small">+${shop.criteria.length - 2}</span>`;
                }
            }

            // Xử lý Ảnh
            let imgSrc = shop.image || '/assets/image/public/Container.png';
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
                 imgSrc = '/' + imgSrc;
            }

            // Link chi tiết
           const detailLink = `/assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`;

            // Tạo phần tử HTML card
            const shopLinkWrapper = document.createElement('a');
            shopLinkWrapper.className = 'shop-card-link';
            shopLinkWrapper.href = detailLink; 
            shopLinkWrapper.style.textDecoration = 'none';
            shopLinkWrapper.style.color = 'inherit';

            shopLinkWrapper.innerHTML = `
                <div class="card">
                  <div class="card-image">
                    <img src="${imgSrc}" alt="${shop.name}" loading="lazy">
                    <div class="icon-top-right heart-icon">
                        ${isLiked ? '<i class="fas fa-heart" style="color: #D97706;"></i>' : '<i class="far fa-heart"></i>'}
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

            // Xử lý nút tim (yêu thích)
            const heartBtn = shopLinkWrapper.querySelector('.heart-icon');
            heartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
                currentFavs = currentFavs.map(id => Number(id));

                if (currentFavs.includes(shopId)) {
                    currentFavs = currentFavs.filter(id => id !== shopId);
                    heartBtn.innerHTML = '<i class="far fa-heart"></i>';
                } else {
                    currentFavs.push(shopId);
                    heartBtn.innerHTML = '<i class="fas fa-heart" style="color: #D97706;"></i>';
                }
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
            });

            listContainer.appendChild(shopLinkWrapper);
        });

        updatePaginationUI();
    }


    function setupPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(currentDisplayList.length / itemsPerPage);
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                renderPage(i);
                const gridTop = document.querySelector('.filter-tabs');
                if(gridTop) gridTop.scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(btn);
        }
    }

    function updatePaginationUI() {
        const btns = document.querySelectorAll('.pagination .page-btn');
        btns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.textContent) === currentPage) btn.classList.add('active');
        });
    }


    function applyFilter(type) {
        let sortedList = [...allCoffeeShops];

        // --- ĐÃ XOÁ LOGIC 'recommended' Ở ĐÂY ---
        if (type === 'new') {
            // Mới nhất (ID giảm dần)
            sortedList.sort((a, b) => b.id - a.id);
        } else if (type === 'rating' || type === 'topRated') {
            // Đánh giá cao
            sortedList.sort((a, b) => b.rating - a.rating);
        }
        
        currentDisplayList = sortedList;
        currentPage = 1;
        renderPage(1);
        setupPagination();
    }

    // Gắn sự kiện cho các nút bộ lọc
    filterTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            let sortType = tab.getAttribute('data-sort');
            
            // Fallback logic nếu HTML không có data-sort
            if (!sortType) {
                if (index === 0) sortType = 'new';
                // --- ĐÃ XOÁ NÚT SỐ 1 (RECOMMENDED) Ở ĐÂY ---
                else sortType = 'rating'; // Mặc định các nút còn lại là rating
            }
            
            applyFilter(sortType);
        });
    });

    loadAllCafes();
});