document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('cafeGrid');
    const paginationContainer = document.querySelector('.pagination');
    
    let allCoffeeShops = [];
    let currentDisplayList = []; // Danh sách quán sẽ được hiển thị (sau khi lọc)
    let currentPage = 1;
    const itemsPerPage = 6;

    // Hàm tải dữ liệu và xử lý tìm kiếm
    async function loadAllCafes() {
        if (!listContainer || !paginationContainer) return;
        
        listContainer.innerHTML = '<p style="text-align:center; width:100%;">Đang tải dữ liệu...</p>';
        
        try {
            // Tải dữ liệu từ file JSON
            // Thử đường dẫn tương đối từ trang cafe-list
            let response = await fetch('../../../assets/data/data.json');
            
            if (!response.ok) {
                // Thử đường dẫn dự phòng nếu lỗi
                response = await fetch('../../data/data.json');
            }
            
            if (!response.ok) throw new Error('Không thể tải data.json');
            
            allCoffeeShops = await response.json();

            // ===== LOGIC NHẬN TỪ KHÓA TÌM KIẾM =====
            const urlParams = new URLSearchParams(window.location.search);
            const searchKeyword = urlParams.get('search');

            if (searchKeyword) {
                // Giải mã từ khóa (VD: "cafe%20đẹp" -> "cafe đẹp")
                const decodedKeyword = decodeURIComponent(searchKeyword).toLowerCase();
                
                // Điền lại từ khóa vào ô tìm kiếm trên header (để người dùng biết mình đang tìm gì)
                setTimeout(() => {
                    const headerInput = document.querySelector('.header-search-bar input');
                    if (headerInput) headerInput.value = decodedURIComponent(searchKeyword);
                }, 800); // Đợi header load xong

                // Lọc danh sách quán
                currentDisplayList = allCoffeeShops.filter(shop => {
                    const nameMatch = shop.name.toLowerCase().includes(decodedKeyword);
                    const addressMatch = shop.address.toLowerCase().includes(decodedKeyword);
                    // Có thể tìm thêm theo tiêu chí nếu muốn
                    // const criteriaMatch = shop.criteria && shop.criteria.some(c => c.toLowerCase().includes(decodedKeyword));
                    
                    return nameMatch || addressMatch;
                });

                // Thông báo nếu không tìm thấy
                if (currentDisplayList.length === 0) {
                    listContainer.innerHTML = `
                        <div class="no-result" style="width:100%; text-align:center; margin-top:40px;">
                            <h3>Không tìm thấy quán nào phù hợp 😞</h3>
                            <p>Bạn thử tìm với từ khóa khác xem sao nhé: "${decodeURIComponent(searchKeyword)}"</p>
                            <a href="cafe-list.html" style="color: #D97706; text-decoration: underline; margin-top: 10px; display: inline-block;">Xem tất cả quán</a>
                        </div>`;
                    paginationContainer.innerHTML = '';
                    return;
                }
            } else {
                // Nếu không có từ khóa tìm kiếm -> Hiển thị tất cả
                currentDisplayList = [...allCoffeeShops];
            }

            // Thiết lập phân trang và hiển thị trang 1
            setupPagination();
            renderPage(1);

        } catch (error) {
            console.error(error);
            listContainer.innerHTML = '<p style="text-align:center; color:red;">Lỗi khi tải dữ liệu quán.</p>';
        }
    }

    // Hàm hiển thị các quán theo trang (đã sửa để dùng currentDisplayList)
    function renderPage(pageNumber) {
        currentPage = pageNumber;
        listContainer.innerHTML = ''; 

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Lấy danh sách quán cần hiện cho trang này
        const itemsToShow = currentDisplayList.slice(startIndex, endIndex);

        // Cập nhật nút active ở phân trang
        document.querySelectorAll('.pagination .page-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.innerText) === currentPage) btn.classList.add('active');
        });

        // Vẽ từng thẻ quán (Card)
        itemsToShow.forEach(shop => {
            const shopLinkWrapper = document.createElement('a');
            shopLinkWrapper.className = 'shop-card-link';
            shopLinkWrapper.href = `../Shop-detail-page/shop-detail.html?id=${shop.id}`; 
            shopLinkWrapper.style.textDecoration = 'none';

            // Xử lý Tags
            let tagsHTML = '';
            if (shop.criteria) {
                const tagsToShow = shop.criteria.slice(0, 2);
                tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
                if (shop.criteria.length > 2) {
                    tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
                }
            }

            // Xử lý ảnh (Fallback nếu lỗi)
            let imgSrc = shop.image;
            // Đảm bảo đường dẫn ảnh đúng khi đang ở thư mục con
            if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
                 imgSrc = '../../../' + imgSrc;
            }
            
            const fallbackImg = '../../../assets/image/public/Container.png';

            shopLinkWrapper.innerHTML = `
                <div class="card">
                  <div class="card-image">
                    <img src="${imgSrc}" alt="${shop.name}" onerror="this.onerror=null; this.src='${fallbackImg}'">
                    <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                    <div class="icon-top-right heart-icon">
                        <i class="far fa-heart"></i>
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

            // --- LOGIC YÊU THÍCH (TIM) ---
            const heartBtn = shopLinkWrapper.querySelector('.heart-icon');
            const FAVORITES_KEY = 'favoriteCafes';
            const shopId = Number(shop.id);
            
            // Kiểm tra trạng thái đã like chưa
            let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
            let isLiked = favorites.map(id => Number(id)).includes(shopId);

            const updateCardHeart = (active) => {
                if (active) {
                    heartBtn.innerHTML = '<i class="fas fa-heart" style="color: #D97706;"></i>'; // Tim đặc màu cam
                } else {
                    heartBtn.innerHTML = '<i class="far fa-heart" style="color: #6B4423;"></i>'; // Tim rỗng màu nâu
                }
            };
            updateCardHeart(isLiked);

            // Bắt sự kiện click vào tim
            heartBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation(); // Ngăn không cho click vào thẻ cha (chuyển trang)
                
                let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
                currentFavs = currentFavs.map(id => Number(id));
                
                if (isLiked) {
                     currentFavs = currentFavs.filter(id => id !== shopId);
                     isLiked = false;
                } else {
                     if (!currentFavs.includes(shopId)) currentFavs.push(shopId);
                     isLiked = true;
                }
                
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
                updateCardHeart(isLiked);
            });

            listContainer.appendChild(shopLinkWrapper);
        });
    }

    // Hàm tạo nút phân trang (đã sửa để dùng currentDisplayList)
    function setupPagination() {
        paginationContainer.innerHTML = ''; 
        
        // Tính tổng số trang dựa trên danh sách ĐÃ LỌC
        const pageCount = Math.ceil(currentDisplayList.length / itemsPerPage);
        
        if (pageCount <= 1) return; // Nếu chỉ có 1 trang thì khỏi hiện nút
        
        // Nút Trước
        /* const prevBtn = document.createElement('button');
        prevBtn.className = 'btn-page';
        prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
        prevBtn.onclick = () => { if(currentPage > 1) renderPage(currentPage - 1); };
        paginationContainer.appendChild(prevBtn);
        */

        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'btn-page'; // Lưu ý class này phải khớp CSS của bạn (btn-page hoặc page-btn)
            pageButton.textContent = i;
            if (i === 1) pageButton.classList.add('active');
            
            pageButton.addEventListener('click', () => renderPage(i));
            paginationContainer.appendChild(pageButton);
        }
        
        // Nút Sau (Next)
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-page';
        nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
        nextBtn.addEventListener('click', () => { 
            if(currentPage < pageCount) renderPage(currentPage + 1); 
        });
        paginationContainer.appendChild(nextBtn);
    }
    
    // Khởi chạy
    loadAllCafes(); 
});