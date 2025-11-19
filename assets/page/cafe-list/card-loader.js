
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lấy "thùng chứa" card từ file HTML của bạn
    const listContainer = document.getElementById('cafeGrid');

    // ----------------------------------------------------------------
    // HÀM CHÍNH: Tải data và hiển thị
    // ----------------------------------------------------------------
    async function loadAllCafes() {
        if (!listContainer) {
            console.error("Lỗi: Không tìm thấy #cafeGrid.");
            return;
        }
        
        // Hiển thị thông báo tạm thời
        listContainer.innerHTML = '<p>Đang tải danh sách quán...</p>';
        
        try {
            // 2. Tải file data.json
            // Đường dẫn lùi 2 cấp (../../) vì file cafe-list.html nằm trong assets/page/
            const response = await fetch('../../data/data.json'); 
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const allCoffeeShops = await response.json();
            
            // 3. Gọi hàm "vẽ" các card lên trang
            renderAllShops(allCoffeeShops);
            
        } catch (error) {
            console.error('Lỗi khi tải danh sách quán:', error);
            listContainer.innerHTML = '<p style="color: red;">Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>';
        }
    }

    // ----------------------------------------------------------------
    // HÀM 2: "Vẽ" các card lên màn hình
    // ----------------------------------------------------------------
    function renderAllShops(shops) {
        listContainer.innerHTML = ''; // Xóa chữ "Đang tải..."

        if (!shops || shops.length === 0) {
            listContainer.innerHTML = '<p>Không có quán cà phê nào để hiển thị.</p>';
            return;
        }

        // 4. Lặp qua từng quán cafe và tạo HTML
        shops.forEach(shop => {
            const shopLinkWrapper = document.createElement('a');
            shopLinkWrapper.className = 'shop-card-link'; // Class để CSS (bỏ gạch chân)
            
            // Dùng đường dẫn tuyệt đối (bắt đầu bằng /)
            // để nó hoạt động chính xác từ trang cafe-list
            shopLinkWrapper.href = `/assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`; 

            // Xử lý tag (lấy 2 tag đầu tiên)
            let tagsHTML = '';
            const tagsToShow = shop.criteria.slice(0, 2);
            tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
            
            // Thêm nút "+..." nếu có nhiều hơn 2 tag
            if (shop.criteria.length > 2) {
                tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
            }

            // 5. Tạo cấu trúc HTML cho card
            // (Cấu trúc này dựa trên file card.css bạn đã nạp)
            shopLinkWrapper.innerHTML = `
                <div class="card">
                  <div class="card-image">
                    <img src="${shop.image}" alt="${shop.name}">
                    <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                    <div class="icon-top-right"><i class="far fa-heart"></i></div>
                  </div>
                  <div class="card-content">
                    <div class="card-info">
                      <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
                      <h3 class="title">${shop.name}</h3>
                      <div class="location"><i class="fas fa-map-marker-alt"></i> ${shop.location_area}</div>
                    </div>
                    <div class="tag">${tagsHTML}</div>
                  </div>
                </div>
            `;
            
            // 6. Thêm card vào "thùng chứa"
            listContainer.appendChild(shopLinkWrapper);
        });
    }
    
    // --- BẮT ĐẦU CHẠY ---
    loadAllCafes(); 
});