document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------------
  // HÀM CHÍNH: Tải data và hiển thị chi tiết
  // ----------------------------------------------------------------
  async function loadShopDetail() {
    let allCoffeeShops = [];
    try {
      // Dùng đường dẫn tuyệt đối để đảm bảo tải được file
      const response = await fetch('/assets/data/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCoffeeShops = await response.json();
      processShopData(allCoffeeShops);

    } catch (error) {
      console.error("Không thể tải dữ liệu chi tiết:", error);
      document.body.innerHTML = '<h1>Lỗi tải dữ liệu.</h1>';
    }
  }

  // ----------------------------------------------------------------
  // HÀM XỬ LÝ: Điền dữ liệu vào trang
  // ----------------------------------------------------------------
  function processShopData(allCoffeeShops) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const cafeId = urlParams.get('id');
    const cafe = allCoffeeShops.find(shop => shop.id == cafeId);

    if (!cafe) {
      document.body.innerHTML = '<h1>Không tìm thấy quán cà phê này.</h1>';
      return;
    }

    console.log('Cafe data:', cafe);

    // 1. Điền thông tin cơ bản
    const titleH1 = document.querySelector('.shopdetail_title h1');
    const titleP = document.querySelector('.shopdetail_name');
    if (titleH1) {
      titleH1.textContent = cafe.name;
      titleH1.removeAttribute('data-i18n'); 
    }
    if (titleP) {
      titleP.textContent = cafe.name;
      titleP.removeAttribute('data-i18n');
    }

    const addressContainer = document.querySelector('.shopdetail_address');
    if (addressContainer) {
      addressContainer.innerHTML = `
        <span data-i18n="labels.addressLabel">Địa chỉ:</span><br>
        <span>${cafe.address}</span> 
      `;
    }
    
    const rateSpan = document.querySelector('.rate span');
    if (rateSpan) {
      rateSpan.textContent = cafe.rating || '5';
    }

    const topTagsContainer = document.querySelector('.shopdetail_tag');
    if (topTagsContainer) {
      topTagsContainer.innerHTML = '';
      const tags = cafe.criteria || [];
      tags.slice(0, 5).forEach(tag => { 
        topTagsContainer.innerHTML += `<p class="tag">${tag}</p>`;
      });
    }

    // 2. Xử lý hình ảnh
    if (cafe.images_slider && cafe.images_slider.length >= 1) {
      const mainImg = document.querySelector('.slider-column img');
      if (mainImg) {
        const imagePath = cafe.images_slider[0].startsWith('/') ? cafe.images_slider[0] : '/' + cafe.images_slider[0];
        mainImg.src = imagePath;
        mainImg.alt = `${cafe.name} main image`;
      }
      
      const gridContainer = document.querySelector('.grid-column');
      if (gridContainer && cafe.images_slider.length > 1) {
        gridContainer.innerHTML = '';
        for (let i = 1; i <= 4 && i < cafe.images_slider.length; i++) {
          const img = document.createElement('img');
          const imagePath = cafe.images_slider[i].startsWith('/') ? cafe.images_slider[i] : '/' + cafe.images_slider[i];
          img.src = imagePath;
          img.alt = `${cafe.name} image ${i + 1}`;
          gridContainer.appendChild(img);
        }
      }
    }

    // 3. Điền nội dung Tabs
    const descriptionContainer = document.querySelector('#mo-ta .shopdetail_text');
    if(descriptionContainer) {
      descriptionContainer.innerHTML = `<p>${cafe.description_detail || 'Chưa có mô tả'}</p>`;
    }

    const tienIchTab = document.getElementById('tien-ich');
    if (tienIchTab) {
      const criteria = cafe.criteria || [];
      let html = '<div class="shopdetail_text">';
      criteria.forEach(tag => { html += `<p class="utility-item">✓ ${tag}</p>`; });
      html += '</div>';
      tienIchTab.innerHTML = html;
    }

    const khoangGiaTab = document.getElementById('khoang-gia');
    if (khoangGiaTab) {
      khoangGiaTab.innerHTML = `<div class="shopdetail_text"><p>${cafe.price_range || 'Chưa cập nhật'}</p></div>`;
    }
    
    const menuTab = document.getElementById('menu');
    if (menuTab) {
      menuTab.innerHTML = '<div class="shopdetail_text"><p>Menu đang được cập nhật...</p></div>';
    }

    // 4. Gắn sự kiện Tab
    addTabListeners();

    // 5. QUAN TRỌNG: Xử lý nút Tim (Đã đưa vào ĐÚNG chỗ)
    handleFavoriteButton(cafe);
  }

  // --- Hàm phụ: Xử lý Tabs ---
  function addTabListeners() {
    const tabLinks = document.querySelectorAll('.detail_tab-link');
    const tabContents = document.querySelectorAll('.shopdetail_tab-content');

    tabLinks.forEach(link => {
      link.addEventListener('click', () => {
        const tabId = link.getAttribute('data-tab'); 
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
        const activeContent = document.getElementById(tabId);
        if (activeContent) activeContent.classList.add('active');
      });
    });
  }

  // --- Hàm phụ: Xử lý Nút Tim (Được tách ra cho gọn) ---
  function handleFavoriteButton(cafe) {
    const heartBtn = document.querySelector('.heart');
    const FAVORITES_KEY = 'favoriteCafes';

    if (!heartBtn) return;

    // Đảm bảo ID là số để so sánh chính xác
    const currentCafeId = Number(cafe.id);

    // Lấy danh sách từ localStorage
    let favoritesRaw = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    let favorites = favoritesRaw.map(id => Number(id)); // Ép kiểu về số

    // Kiểm tra trạng thái hiện tại
    let isLiked = favorites.includes(currentCafeId);
    updateHeartUI(heartBtn, isLiked);

    // Xử lý click (Dùng cloneNode để xóa các event cũ nếu có)
    const newHeartBtn = heartBtn.cloneNode(true);
    heartBtn.parentNode.replaceChild(newHeartBtn, heartBtn);

    newHeartBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Đọc lại từ storage để đảm bảo dữ liệu mới nhất
        let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        currentFavs = currentFavs.map(id => Number(id));

        if (isLiked) {
            // Xóa ID khỏi danh sách
            currentFavs = currentFavs.filter(id => id !== currentCafeId);
            isLiked = false;
            console.log("Đã xóa khỏi yêu thích:", currentCafeId);
        } else {
            // Thêm ID vào danh sách
            if (!currentFavs.includes(currentCafeId)) {
                currentFavs.push(currentCafeId);
            }
            isLiked = true;
            console.log("Đã thêm vào yêu thích:", currentCafeId);
        }

        // Lưu lại và cập nhật giao diện
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
        updateHeartUI(newHeartBtn, isLiked);
    });
  }

  function updateHeartUI(btn, active) {
    const icon = btn.querySelector('i');
    if (active) {
        btn.style.color = '#D97706'; // Màu cam
        icon.className = 'fa-solid fa-heart'; // Tim đặc
    } else {
        btn.style.color = '#6B4423'; // Màu nâu
        icon.className = 'fa-regular fa-heart'; // Tim rỗng
    }
  }

  // --- BẮT ĐẦU CHẠY ---
  loadShopDetail();
});