document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lấy "thùng chứa" card VÀ "thùng chứa" phân trang
    const listContainer = document.getElementById('cafeGrid');
    const paginationContainer = document.querySelector('.pagination');

    // Biến toàn cục để lưu trữ dữ liệu và trạng thái
    let allCoffeeShops = [];
    let currentPage = 1;
    const itemsPerPage = 6; // <-- QUY ĐỊNH: 6 card mỗi trang

    // ----------------------------------------------------------------
    // HÀM CHÍNH: Tải data, cài đặt phân trang, và hiển thị trang 1
    // ----------------------------------------------------------------
    async function loadAllCafes() {
        if (!listContainer || !paginationContainer) {
            console.error("Lỗi: Không tìm thấy #cafeGrid hoặc .pagination.");
            return;
        }
        
        listContainer.innerHTML = '<p>Đang tải danh sách quán...</p>';
        
        try {
            // Dùng đường dẫn tuyệt đối (bắt đầu bằng /)
            const response = await fetch('/assets/data/data.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allCoffeeShops = await response.json();
            
            // Dữ liệu đã sẵn sàng, giờ ta cài đặt 2 thứ:
            setupPagination(); // 1. "Vẽ" các nút 1, 2, 3...
            renderPage(1);     // 2. Hiển thị card cho trang 1
            
        } catch (error) {
            console.error('Lỗi khi tải danh sách quán:', error);
            listContainer.innerHTML = '<p style="color: red;">Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>';
        }
    }

    // ----------------------------------------------------------------
    // HÀM 2: "Vẽ" các card cho một trang cụ thể
    // ----------------------------------------------------------------
    function renderPage(pageNumber) {
        currentPage = pageNumber;
        listContainer.innerHTML = ''; // Xóa card của trang cũ

        // Tính toán card nào cần hiển thị
        // Trang 1: (1-1)*6 = 0 -> slice(0, 6)
        // Trang 2: (2-1)*6 = 6 -> slice(6, 12)
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToShow = allCoffeeShops.slice(startIndex, endIndex);

        // Nếu không có gì để hiển thị (ví dụ: data rỗng)
        if (itemsToShow.length === 0 && currentPage === 1) {
            listContainer.innerHTML = '<p>Không có quán cà phê nào để hiển thị.</p>';
            return;
        }

        // Cập nhật trạng thái "active" cho nút phân trang
        // 1. Xóa 'active' khỏi tất cả các nút
        document.querySelectorAll('.pagination .page-btn').forEach(button => {
            button.classList.remove('active');
        });
        // 2. Thêm 'active' cho nút vừa bấm
        const activeButton = document.querySelector(`.pagination .page-btn[data-page="${currentPage}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Lặp và "vẽ" card (code này giống hệt code cũ)
        itemsToShow.forEach(shop => {
            const shopLinkWrapper = document.createElement('a');
            shopLinkWrapper.className = 'shop-card-link';
            shopLinkWrapper.href = `/assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`; 

            let tagsHTML = '';
            const tagsToShow = shop.criteria.slice(0, 2);
            tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
            if (shop.criteria.length > 2) {
                tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
            }

            shopLinkWrapper.innerHTML = `
                <div class="card">
                  <div class="card-image">
                    <img src="${shop.image}" alt="${shop.name}">
                    <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                    <div class="icon-top-right"><i class="far fa-heart"></i></div>
                  </div>
                  <div class="card-content">
                    <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
                    <h3 class="title">${shop.name}</h3>
                    <div class="location"><i class="fas fa-map-marker-alt"></i> ${shop.location_area}</div>
                    <div class="tag">${tagsHTML}</div>
                  </div>
                </div>
            `;
            listContainer.appendChild(shopLinkWrapper);
        });
    }

    // ----------------------------------------------------------------
    // HÀM 3: Tạo các nút phân trang (1, 2, 3...) một cách tự động
    // ----------------------------------------------------------------
    function setupPagination() {
        // Xóa các nút 1, 2, 3, 4 cố định trong HTML
        paginationContainer.innerHTML = ''; 
        
        // Tính toán xem cần bao nhiêu nút
        // Ví dụ: 7 quán / 6 card mỗi trang = 1.16 -> làm tròn lên = 2 trang
        const pageCount = Math.ceil(allCoffeeShops.length / itemsPerPage);

        // (Nếu chỉ có 1 trang, không cần hiện nút nào cả)
        if (pageCount <= 1) return;

        // Tạo nút cho từng trang
        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-btn';
            pageButton.textContent = i;
            pageButton.dataset.page = i; // Thêm data-page để dễ chọn
            
            // Thêm "active" cho nút đầu tiên
            if (i === 1) {
                pageButton.classList.add('active');
            }

            // Thêm sự kiện click
            pageButton.addEventListener('click', () => {
                renderPage(i);
            });
            
            paginationContainer.appendChild(pageButton);
        }
        
        // (Tùy chọn: Thêm lại nút "Next")
        // Code này sẽ tự tạo nút Next nếu có nhiều hơn 1 trang
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn next';
        nextButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextButton.addEventListener('click', () => {
            const nextPageIndex = currentPage + 1;
            // Chỉ chạy nếu trang tiếp theo không vượt quá tổng số trang
            if (nextPageIndex <= pageCount) {
                renderPage(nextPageIndex);
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // --- BẮT ĐẦU CHẠY ---
    loadAllCafes(); 

});