document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO ---
    const listContainer = document.getElementById('cafeGrid');
    const paginationContainer = document.querySelector('.pagination');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const FAVORITES_KEY = 'favoriteCafes';
    
    let allCoffeeShops = [];     // Dữ liệu gốc
    let currentDisplayList = []; // Dữ liệu đang hiển thị (đã lọc/tìm kiếm)
    let currentPage = 1;
    const itemsPerPage = 6;      // Số quán mỗi trang

    // --- 1. TẢI DỮ LIỆU ---
    async function loadAllCafes() {
        if (!listContainer) return;
        
        listContainer.innerHTML = '<p style="text-align:center; width:100%;">Đang tải dữ liệu...</p>';
        
        try {
            // SỬA LỖI 1: Dùng đường dẫn tuyệt đối từ gốc (root)
            // Không dùng ../../../ nữa để tránh lỗi trên Vercel
            const response = await fetch('/assets/data/data.json');
            
            if (!response.ok) throw new Error(`Lỗi tải data: ${response.status}`);
            
            allCoffeeShops = await response.json();

            // --- XỬ LÝ TÌM KIẾM (SEARCH PARAM) ---
            const urlParams = new URLSearchParams(window.location.search);
            const searchKeyword = urlParams.get('search');

            if (searchKeyword) {
                const decodedKeyword = decodeURIComponent(searchKeyword).toLowerCase();
                
                // Điền lại từ khóa vào ô tìm kiếm (nếu có header)
                setTimeout(() => {
                    const headerInput = document.querySelector('.header-search-bar input');
                    if (headerInput) headerInput.value = decodedURIComponent(searchKeyword);
                }, 500);

                // Lọc danh sách
                currentDisplayList = allCoffeeShops.filter(shop => {
                    const nameMatch = shop.name.toLowerCase().includes(decodedKeyword);
                    const addressMatch = shop.address.toLowerCase().includes(decodedKeyword);
                    return nameMatch || addressMatch;
                });
                
                // Tắt active của các tab lọc nếu đang tìm kiếm
                filterTabs.forEach(t => t.classList.remove('active'));

            } else {
                // Mặc định: Hiển thị tất cả (và lọc theo Mới nhất)
                currentDisplayList = [...allCoffeeShops];
                applyFilter('new'); // Mặc định sort theo ID giảm dần
            }

            // Hiển thị trang đầu tiên
            renderPage(1);
            setupPagination();

        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p style="text-align:center; color:red;">Không thể tải dữ liệu quán.</p>';
        }
    }

    // --- 2. HIỂN THỊ QUÁN (RENDER) ---
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

        // Tính toán cắt mảng
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = currentDisplayList.slice(startIndex, endIndex);

        // Lấy danh sách yêu thích từ LocalStorage
        let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        // Chuyển về dạng số để so sánh an toàn
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

            // Xử lý Ảnh (Dùng đường dẫn tuyệt đối nếu chưa có)
            let imgSrc = shop.image || '/assets/image/public/Container.png';
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
                 imgSrc = '/' + imgSrc; // Thêm / để thành đường dẫn tuyệt đối
            }

            // SỬA LỖI 2: Link chi tiết dùng đường dẫn TUYỆT ĐỐI
            // Đảm bảo thư mục 'shop-detail-page' viết thường trên GitHub/Vercel
            const detailLink = `/assets/page/shop-detail-page/shop-detail.html?id=${shop.id}`;

            // Tạo phần tử HTML
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

            // --- LOGIC TIM (YÊU THÍCH) ---
            const heartBtn = shopLinkWrapper.querySelector('.heart-icon');
            heartBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Chặn chuyển trang
                e.stopPropagation();
                
                // Cập nhật lại danh sách favorites mới nhất
                let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
                currentFavs = currentFavs.map(id => Number(id));

                if (currentFavs.includes(shopId)) {
                    // Bỏ like
                    currentFavs = currentFavs.filter(id => id !== shopId);
                    heartBtn.innerHTML = '<i class="far fa-heart"></i>';
                } else {
                    // Thêm like
                    currentFavs.push(shopId);
                    heartBtn.innerHTML = '<i class="fas fa-heart" style="color: #D97706;"></i>';
                }
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
            });

            listContainer.appendChild(shopLinkWrapper);
        });

        // Cập nhật nút phân trang active
        updatePaginationUI();
    }

    // --- 3. PHÂN TRANG (PAGINATION) ---
    function setupPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(currentDisplayList.length / itemsPerPage);
        if (totalPages <= 1) return;

        // Nút số 1, 2, 3...
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                renderPage(i);
                // Cuộn lên đầu lưới
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

    // --- 4. BỘ LỌC (FILTER TABS) ---
    function applyFilter(type) {
        let sortedList = [...allCoffeeShops]; // Reset về danh sách gốc để lọc

        if (type === 'new') {
            // Mới nhất (ID giảm dần)
            sortedList.sort((a, b) => b.id - a.id);
        } else if (type === 'rating' || type === 'topRated') {
            // Đánh giá cao
            sortedList.sort((a, b) => b.rating - a.rating);
        } else if (type === 'recommended') {
            // Gợi ý (Ngẫu nhiên)
            sortedList.sort(() => 0.5 - Math.random());
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

            // Ưu tiên dùng data-sort trong HTML, nếu không có thì dùng index
            let sortType = tab.getAttribute('data-sort');
            if (!sortType) {
                if (index === 0) sortType = 'new';
                else if (index === 1) sortType = 'recommended';
                else if (index === 2) sortType = 'rating';
            }
            
            applyFilter(sortType);
        });
    });

    // --- KHỞI CHẠY ---
    loadAllCafes();
});