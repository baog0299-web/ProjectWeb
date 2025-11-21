document.addEventListener('DOMContentLoaded', () => {
    // --- CẤU HÌNH ---
    const ITEMS_PER_PAGE = 9; // Số quán hiển thị trên 1 trang

    // --- BIẾN TRẠNG THÁI ---
    let allShops = [];      // Chứa toàn bộ dữ liệu gốc
    let currentShops = [];  // Chứa dữ liệu đang hiển thị (đã lọc)
    let currentPage = 1;    // Trang hiện tại

    // 1. Hàm hỗ trợ lấy ngôn ngữ (Mặc định là 'vi')
    function getCurrentLang() {
        return localStorage.getItem('site_lang') || 'vi';
    }

    // 2. Hàm tải dữ liệu từ file JSON
    async function loadData() {
        try {
            // Tải file data chung (dùng 1 file data.json như bạn đã chốt)
            const response = await fetch('/assets/data/data.json');
            if (!response.ok) throw new Error('Lỗi tải data.json');
            
            allShops = await response.json();
            
            // Mặc định khi vào trang sẽ lọc theo "Mới nhất"
            filterShops('new'); 
            
        } catch (error) {
            console.error("Lỗi:", error);
            document.getElementById('cafeGrid').innerHTML = '<p style="text-align:center;">Đang tải dữ liệu...</p>';
        }
    }

    // 3. Hàm vẽ danh sách quán (Render)
    function renderPageData() {
        const grid = document.getElementById('cafeGrid');
        
        // Tính toán vị trí cắt mảng cho phân trang
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const shopsToRender = currentShops.slice(startIndex, endIndex);

        grid.innerHTML = '';

        // Nếu không có quán nào
        if (shopsToRender.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Không tìm thấy quán nào.</p>';
            document.getElementById('pagination').innerHTML = ''; // Ẩn phân trang
            return;
        }

        shopsToRender.forEach(shop => {
            // Xử lý hiển thị Tags (chỉ lấy tối đa 2 tag đầu)
            let tagsHTML = '';
            if (shop.criteria && shop.criteria.length > 0) {
                tagsHTML += `<span class="btn-tag">${shop.criteria[0]}</span>`;
                if (shop.criteria.length > 1) tagsHTML += `<span class="btn-tag">${shop.criteria[1]}</span>`;
                if (shop.criteria.length > 2) tagsHTML += `<span class="btn-tag" id="small">+${shop.criteria.length - 2}</span>`;
            }

            // --- PHẦN QUAN TRỌNG NHẤT: SỬA ĐƯỜNG DẪN ---
            // Sử dụng '../' để lùi ra khỏi thư mục 'cafe-list' và đi vào 'shop-detail-page'
            const detailLink = `../shop-detail-page/shop-detail.html?id=${shop.id}`;

            const cardHTML = `
                <div class="card" onclick="window.location.href='${detailLink}'">
                    <div class="card-image">
                        <img src="${shop.image || '/assets/image/default.png'}" alt="${shop.name}" loading="lazy">
                        <div class="icon-top-right"><i class="far fa-heart"></i></div>
                    </div>
                    <div class="card-content">
                        <div class="card-header">
                            <h3 class="title">${shop.name}</h3>
                            <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
                        </div>
                        <div class="location">
                            <i class="fas fa-map-marker-alt"></i> 
                            <span>${shop.address}</span>
                        </div>
                        <div class="tags">${tagsHTML}</div>
                    </div>
                </div>
            `;
            grid.innerHTML += cardHTML;
        });

        // Vẽ xong danh sách thì vẽ nút phân trang
        renderPagination();
    }

    // 4. Hàm vẽ thanh phân trang (Pagination)
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        const totalPages = Math.ceil(currentShops.length / ITEMS_PER_PAGE);

        paginationContainer.innerHTML = '';

        // Nếu chỉ có 1 trang thì không cần hiện nút
        if (totalPages <= 1) return;

        // Nút Prev
        if (currentPage > 1) {
            const prevBtn = createPageBtn('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1);
            paginationContainer.appendChild(prevBtn);
        }

        // Các nút số (1, 2, 3...)
        for (let i = 1; i <= totalPages; i++) {
            const btn = createPageBtn(i, i);
            if (i === currentPage) btn.classList.add('active');
            paginationContainer.appendChild(btn);
        }

        // Nút Next
        if (currentPage < totalPages) {
            const nextBtn = createPageBtn('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1);
            paginationContainer.appendChild(nextBtn);
        }
    }

    // Helper tạo nút trang
    function createPageBtn(content, pageTarget) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.innerHTML = content;
        btn.onclick = () => {
            currentPage = pageTarget;
            renderPageData();
            // Cuộn nhẹ lên đầu danh sách
            const gridTop = document.querySelector('.filter-tabs');
            if(gridTop) gridTop.scrollIntoView({ behavior: 'smooth' });
        };
        return btn;
    }

    // 5. Logic Bộ lọc (Filter & Sort)
    function filterShops(sortType) {
        let sortedList = [...allShops]; // Copy mảng gốc

        switch (sortType) {
            case 'new': // Mới nhất (ID giảm dần)
                sortedList.sort((a, b) => b.id - a.id);
                break;
            case 'rating': // Đánh giá cao
                sortedList.sort((a, b) => b.rating - a.rating);
                break;
            case 'recommended': // Gợi ý (Ngẫu nhiên)
                sortedList.sort(() => 0.5 - Math.random());
                break;
            default:
                sortedList.sort((a, b) => b.id - a.id);
        }

        currentShops = sortedList;
        currentPage = 1; // Reset về trang 1
        renderPageData();
    }

    // 6. Sự kiện click nút bộ lọc
    const filterButtons = document.querySelectorAll('.filter-tab');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Đổi class active
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Lọc dữ liệu
            filterShops(btn.getAttribute('data-sort'));
        });
    });

    // 7. Sự kiện click đổi ngôn ngữ (Load lại để cập nhật chữ nếu cần)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lang]');
        if (btn) {
            setTimeout(() => {
                loadData();
            }, 50);
        }
    });

    // Khởi chạy lần đầu
    loadData();
});