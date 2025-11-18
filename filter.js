document.addEventListener('DOMContentLoaded', () => {
  const filterLocation = document.getElementById('filter-location');
  const filterNeed = document.getElementById('filter-need');
  const filterCriteria = document.getElementById('filter-criteria');
  const resultsContainer = document.getElementById('search-results');
  const featuredContainer = document.querySelector('.card-container'); // Container "Nổi bật"

  let allCoffeeShops = [];

  // ----------------------------------------------------------------
  // HÀM CHÍNH: Tải data và chạy
  // ----------------------------------------------------------------
  async function initializeApp() {
    try {
      const response = await fetch('/assets/data/data.json'); // Dùng đường dẫn tuyệt đối
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCoffeeShops = await response.json(); 

      // Chạy các hàm logic
      if (filterLocation) {
        populateFilters();
      }
      if (resultsContainer) {
        resultsContainer.innerHTML = '<p class="initial-prompt">Vui lòng sử dụng bộ lọc để tìm quán cà phê.</p>';
      }
      if (featuredContainer) {
        loadFeaturedCards(allCoffeeShops); // Tải card "Nổi bật"
      }
      
      addFilterListeners();

    } catch (error) {
      console.error("Không thể tải dữ liệu quán cà phê:", error);
      if(resultsContainer) {
          resultsContainer.innerHTML = '<p class="error">Lỗi khi tải dữ liệu quán cafe.</p>';
      }
    }
  }

  // ----------------------------------------------------------------
  // HÀM TẠO 1 CARD (QUAN TRỌNG)
  // ----------------------------------------------------------------
  function createShopCardLink(shop) {
      const shopLinkWrapper = document.createElement('a');
      shopLinkWrapper.className = 'shop-card-link';
      
      // *** ĐẢM BẢO DÒNG NÀY ĐÚNG ***
      // Nó phải dùng "shop.id" để tạo link động
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
      return shopLinkWrapper;
  }

  // ----------------------------------------------------------------
  // HÀM TẢI CARD "NỔI BẬT"
  // ----------------------------------------------------------------
  function loadFeaturedCards(allShops) {
      if (!featuredContainer) return; 

      const shuffled = [...allShops].sort(() => 0.5 - Math.random());
      const randomShops = shuffled.slice(0, 3);
      
      featuredContainer.innerHTML = '';
      randomShops.forEach(shop => {
          // Tái sử dụng hàm tạo card
          const cardElement = createShopCardLink(shop);
          featuredContainer.appendChild(cardElement);
      });
  }

  // (Các hàm populateFilters, renderShops, filterShops, addFilterListeners
  //  giữ nguyên như code tôi đã gửi bạn lúc 5:48 PM)
  
  // ... (Dán các hàm còn lại vào đây: populateFilters, renderShops, filterShops, addFilterListeners) ...
  
  // (Tôi sẽ dán lại chúng ở đây cho chắc chắn)
  
  function populateFilters() {
    if (!filterLocation) return;
    const locations = [...new Set(allCoffeeShops.map(shop => shop.location_area))];
    const needs = [...new Set(allCoffeeShops.map(shop => shop.need))];
    const allCriteria = allCoffeeShops.flatMap(shop => shop.criteria);
    const criteria = [...new Set(allCriteria)]; 
    locations.forEach(location => { filterLocation.innerHTML += `<option value="${location}">${location}</option>`; });
    needs.forEach(need => { filterNeed.innerHTML += `<option value="${need}">${need}</option>`; });
    criteria.forEach(criterion => { filterCriteria.innerHTML += `<option value="${criterion}">${criterion}</option>`; });
  }

  function renderShops(shopsToRender) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = ''; 
    if (shopsToRender.length === 0) {
      resultsContainer.innerHTML = '<p>Không tìm thấy quán cà phê phù hợp.</p>';
      return;
    }
    shopsToRender.forEach(shop => {
        const cardElement = createShopCardLink(shop);
        resultsContainer.appendChild(cardElement);
    });
  }

  function filterShops() {
    if (!resultsContainer) return;
    const selectedLocation = filterLocation.value;
    const selectedNeed = filterNeed.value;
    const selectedCriteria = filterCriteria.value;
    let filteredShops = allCoffeeShops; 
    if (selectedLocation !== 'all') { filteredShops = filteredShops.filter(shop => shop.location_area === selectedLocation); }
    if (selectedNeed !== 'all') { filteredShops = filteredShops.filter(shop => shop.need === selectedNeed); }
    if (selectedCriteria !== 'all') { filteredShops = filteredShops.filter(shop => shop.criteria.includes(selectedCriteria)); }
    renderShops(filteredShops);
  }

  function addFilterListeners() {
    if (!filterLocation) return;
    filterLocation.addEventListener('change', filterShops);
    filterNeed.addEventListener('change', filterShops);
    filterCriteria.addEventListener('change', filterShops);
  }
  // ----------------------------------------------------------------
  // HÀM TẠO 1 CARD (Đã thêm logic tim)
  // ----------------------------------------------------------------
  function createShopCardLink(shop) {
      const shopLinkWrapper = document.createElement('a');
      shopLinkWrapper.className = 'shop-card-link';
      shopLinkWrapper.href = `/assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`;

      let tagsHTML = '';
      const tagsToShow = shop.criteria ? shop.criteria.slice(0, 2) : [];
      tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
      if (shop.criteria && shop.criteria.length > 2) {
          tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
      }

      shopLinkWrapper.innerHTML = `
        <div class="card">
          <div class="card-image">
            <img src="${shop.image}" alt="${shop.name}" onerror="this.src='assets/image/public/Container.png'">
            <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
            <div class="icon-top-right heart-icon"><i class="far fa-heart"></i></div>
          </div>
          <div class="card-content">
            <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
            <h3 class="title">${shop.name}</h3>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${shop.location_area}</div>
            <div class="tag">${tagsHTML}</div>
          </div>
        </div>
      `;

      // --- PHẦN MỚI THÊM: Logic trái tim ---
      const heartBtn = shopLinkWrapper.querySelector('.heart-icon');
      const FAVORITES_KEY = 'favoriteCafes';
      const shopId = Number(shop.id);

      // 1. Kiểm tra trạng thái ban đầu
      let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
      // Ép kiểu về số để so sánh chuẩn
      let isLiked = favorites.map(id => Number(id)).includes(shopId);

      const updateCardHeart = (active) => {
          if (active) {
              heartBtn.style.color = '#D97706'; // Màu cam
              heartBtn.innerHTML = '<i class="fas fa-heart"></i>'; // Tim đặc
          } else {
              heartBtn.style.color = '#6B4423'; // Màu nâu gốc (hoặc bỏ trống để lấy từ CSS)
              heartBtn.innerHTML = '<i class="far fa-heart"></i>'; // Tim rỗng
          }
      };
      updateCardHeart(isLiked);

      // 2. Gắn sự kiện click
      heartBtn.addEventListener('click', (e) => {
          e.preventDefault(); // Ngăn không cho thẻ a chuyển trang
          e.stopPropagation(); // Ngăn sự kiện nổi bọt

          // Đọc lại storage mới nhất
          let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
          currentFavs = currentFavs.map(id => Number(id));

          if (isLiked) {
               // Bỏ tim: Xóa ID
               currentFavs = currentFavs.filter(id => id !== shopId);
               isLiked = false;
          } else {
               // Thả tim: Thêm ID
               if (!currentFavs.includes(shopId)) currentFavs.push(shopId);
               isLiked = true;
          }

          localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
          updateCardHeart(isLiked);
      });
      // --- HẾT PHẦN MỚI THÊM ---

      return shopLinkWrapper;
  }

  // --- BẮT ĐẦU CHẠY APP ---
  initializeApp();
});