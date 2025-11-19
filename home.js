document.addEventListener('DOMContentLoaded', () => {
    let allShops = [];

    // Hàm lấy ngôn ngữ
    function getCurrentLang() {
        return localStorage.getItem('site_lang') || 'vi';
    }

    // Tải dữ liệu (Tự động chọn data_vi.json hoặc data_en.json)
    async function loadHomeData() {
        try {
            const lang = getCurrentLang();
            const response = await fetch(`/assets/data/data_${lang}.json`);
            
            if (!response.ok) throw new Error('Không tải được data');

            allShops = await response.json();

            // Mặc định: Hiển thị 4 quán có Rating cao nhất
            const topRated = [...allShops].sort((a, b) => b.rating - a.rating).slice(0, 4);
            renderHomeGrid(topRated);

        } catch (error) {
            console.error("Lỗi tải data:", error);
        }
    }

    // Vẽ danh sách quán ra màn hình
    function renderHomeGrid(shops) {
        const grid = document.getElementById('home-grid');
        if (!grid) return; // Nếu trang chủ không có div này thì thoát

        grid.innerHTML = '';

        if (shops.length === 0) {
            grid.innerHTML = '<p style="width:100%; text-align:center;">Không tìm thấy kết quả nào.</p>';
            return;
        }

        shops.forEach(shop => {
            // Xử lý Tags: lấy 2 tag đầu tiên
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
    }

    // Xử lý ô Tìm kiếm (Search Box)
    const searchInput = document.getElementById('home-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const lang = getCurrentLang();

            if (keyword === '') {
                // Nếu xóa trắng -> Hiện lại Top 4 quán ngon
                const topRated = [...allShops].sort((a, b) => b.rating - a.rating).slice(0, 4);
                renderHomeGrid(topRated);
                
                // Đổi tiêu đề về mặc định
                const titleEl = document.querySelector('.section-title span');
                if(titleEl) titleEl.textContent = lang === 'en' ? 'Featured Coffee Shops' : 'Quán nổi bật';
            } else {
                // Lọc theo Tên hoặc Địa chỉ
                const filtered = allShops.filter(shop => {
                    const name = shop.name.toLowerCase();
                    const address = shop.address.toLowerCase();
                    return name.includes(keyword) || address.includes(keyword);
                });
                
                renderHomeGrid(filtered);
                
                // Đổi tiêu đề thành kết quả tìm kiếm
                const titleEl = document.querySelector('.section-title span');
                if(titleEl) titleEl.textContent = lang === 'en' ? `Results for "${keyword}"` : `Kết quả cho "${keyword}"`;
            }
        });
    }

    // Lắng nghe sự kiện đổi ngôn ngữ để tải lại data
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lang]');
        if (btn) {
            setTimeout(() => { 
                loadHomeData(); 
                // Nếu đang tìm kiếm dở thì trigger lại để dịch kết quả tìm kiếm
                if (searchInput && searchInput.value) {
                     searchInput.dispatchEvent(new Event('input'));
                }
            }, 50);
        }
    });

    // Chạy hàm khi file tải xong
    loadHomeData();
});