document.addEventListener('DOMContentLoaded', () => {
    // --- CẤU HÌNH ---
    const ITEMS_PER_PAGE = 6; // Để 6 quán/trang để chắc chắn hiện phân trang (vì bạn có 18 quán)

    // --- STATE ---
    let allShops = [];      
    let currentShops = [];  
    let currentPage = 1;    

    // 1. Tải dữ liệu (File data.json duy nhất)
    async function loadData() {
        try {
            const response = await fetch('/assets/data/data.json');
            if (!response.ok) throw new Error('Lỗi tải data.json');
            
            allShops = await response.json();
            
            // Mặc định lọc theo Mới nhất
            filterShops('new'); 
            
        } catch (error) {
            console.error("Lỗi:", error);
            document.getElementById('cafeGrid').innerHTML = '<p style="text-align:center;">Lỗi tải dữ liệu.</p>';
        }
    }

    // 2. Vẽ danh sách quán (Card)
    function renderPageData() {
        const grid = document.getElementById('cafeGrid');
        
        // Tính toán cắt mảng dữ liệu cho trang hiện tại
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const shopsToRender = currentShops.slice(startIndex, endIndex);

        grid.innerHTML = '';

        if (shopsToRender.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Không tìm thấy quán nào.</p>';
            document.getElementById('pagination').innerHTML = ''; // Xóa phân trang
            return;
        }

        shopsToRender.forEach(shop => {
            // Xử lý Tags (Lấy tối đa 2 tag)
            let tagsHTML = '';
            if (shop.criteria && shop.criteria.length > 0) {
                tagsHTML += `<span class="btn-tag">${shop.criteria[0]}</span>`;
                if (shop.criteria.length > 1) tagsHTML += `<span class="btn-tag">${shop.criteria[1]}</span>`;
                if (shop.criteria.length > 2) tagsHTML += `<span class="btn-tag" id="small">+${shop.criteria.length - 2}</span>`;
            }

            const cardHTML = `
                <div class="card" onclick="window.location.href='/assets/page/shop-detail-page/shop-detail.html?id=${shop.id}'">
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

        // QUAN TRỌNG: Gọi hàm vẽ phân trang sau khi vẽ xong danh sách
        renderPagination();
    }

    // 3. Vẽ thanh phân trang (Pagination)
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        const totalPages = Math.ceil(currentShops.length / ITEMS_PER_PAGE);

        paginationContainer.innerHTML = '';

        // Nếu chỉ có 1 trang hoặc không có trang nào -> Ẩn phân trang
        if (totalPages <= 1) {
            return;
        }

        // Nút Prev (<)
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

        // Nút Next (>)
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
            // Cuộn lên đầu danh sách khi chuyển trang
            const gridTop = document.querySelector('.filter-tabs');
            if(gridTop) gridTop.scrollIntoView({ behavior: 'smooth' });
        };
        return btn;
    }

    // 4. Logic Bộ lọc (Sort)
    function filterShops(sortType) {
        let sortedList = [...allShops];

        if (sortType === 'new') {
            // Mới nhất (ID lớn nhất lên đầu)
            sortedList.sort((a, b) => b.id - a.id);
        } else if (sortType === 'rating') {
            // Đánh giá cao nhất
            sortedList.sort((a, b) => b.rating - a.rating);
        } else if (sortType === 'recommended') {
            // Gợi ý (Ngẫu nhiên)
            sortedList.sort(() => 0.5 - Math.random());
        }

        currentShops = sortedList;
        currentPage = 1; // Reset về trang 1 khi lọc lại
        renderPageData();
    }

    // 5. Sự kiện Click Bộ lọc
    const filterButtons = document.querySelectorAll('.filter-tab');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterShops(btn.getAttribute('data-sort'));
        });
    });

    // Khởi chạy
    loadData();
});