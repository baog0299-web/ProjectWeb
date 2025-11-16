document.addEventListener('DOMContentLoaded', () => {
  // === PHẦN 1: KHAI BÁO CÁC PHẦN TỬ ===
  
  // Bộ lọc tìm kiếm
  const filterLocation = document.getElementById('filter-location');
  const filterNeed = document.getElementById('filter-need');
  const filterCriteria = document.getElementById('filter-criteria');
  const resultsContainer = document.getElementById('search-results');
  const searchButton = document.querySelector('.search-button');

  // Phần "Nổi bật"
  const featuredContainer = document.querySelector('.card-container');

  // Biến toàn cục để giữ data
  let allCoffeeShops = [];

  // ----------------------------------------------------------------
  // HÀM CHÍNH: Tải dữ liệu và khởi chạy
  // ----------------------------------------------------------------
  async function initializeApp() {
    try {
      // 1. Tải dữ liệu từ file JSON
      const response = await fetch('/assets/data/data.json'); // Dùng đường dẫn tuyệt đối
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCoffeeShops = await response.json(); 

      // 2. Chạy các hàm logic
      
      // A. Điền các lựa chọn cho bộ lọc
      populateFilters();
      
      // B. Hiển thị lời nhắc cho bộ lọc
      if(resultsContainer) {
          resultsContainer.innerHTML = '<p class="initial-prompt">Vui lòng sử dụng bộ lọc để tìm quán cà phê.</p>';
      }
      
      // C. (CHỨC NĂNG MỚI) Tải 3 card ngẫu nhiên cho phần "Nổi bật"
      loadFeaturedCards(allCoffeeShops);
      
      // 3. Gắn sự kiện cho bộ lọc
      addFilterListeners();

    } catch (error) {
      console.error("Không thể tải dữ liệu quán cà phê:", error);
      if(resultsContainer) {
          resultsContainer.innerHTML = '<p class="error">Lỗi khi tải dữ liệu quán cafe.</p>';
      }
    }
  }

  // ----------------------------------------------------------------
  // (CHỨC NĂNG MỚI) HÀM TẠO 1 CARD (ĐỂ TÁI SỬ DỤNG)
  // ----------------------------------------------------------------
  function createShopCardLink(shop) {
      const shopLinkWrapper = document.createElement('a');
      shopLinkWrapper.className = 'shop-card-link';
      // Link đến trang chi tiết (dùng đường dẫn tuyệt đối)
      shopLinkWrapper.href = `/assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`;

      // Xử lý tag
      let tagsHTML = '';
      const tagsToShow = shop.criteria.slice(0, 2);
      tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
      if (shop.criteria.length > 2) {
          tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
      }

      // Tạo HTML cho card (dùng cấu trúc từ card.css của bạn)
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
  // (CHỨC NĂNG MỚI) HÀM TẢI CARD "NỔI BẬT"
  // ----------------------------------------------------------------
  function loadFeaturedCards(allShops) {
      if (!featuredContainer) {
          // Nếu không tìm thấy .card-container (ví dụ: ở trang khác), thì bỏ qua
          return; 
      }

      // 1. Xáo trộn mảng dữ liệu
      const shuffled = [...allShops].sort(() => 0.5 - Math.random());
      
      // 2. Lấy 3 quán đầu tiên sau khi xáo trộn
      const randomShops = shuffled.slice(0, 3);
      
      // 3. Xóa nội dung cũ và "vẽ" 3 card mới
      featuredContainer.innerHTML = '';
      randomShops.forEach(shop => {
          const cardElement = createShopCardLink(shop);
          featuredContainer.appendChild(cardElement);
      });
  }


  // ----------------------------------------------------------------
  // HÀM 1: Tải các lựa chọn (options) cho bộ lọc
  // ----------------------------------------------------------------
  function populateFilters() {
    if (!filterLocation) return; // Chỉ chạy nếu có bộ lọc

    const locations = [...new Set(allCoffeeShops.map(shop => shop.location_area))];
    const needs = [...new Set(allCoffeeShops.map(shop => shop.need))];
    const allCriteria = allCoffeeShops.flatMap(shop => shop.criteria);
    const criteria = [...new Set(allCriteria)]; 

    locations.forEach(location => {
      filterLocation.innerHTML += `<option value="${location}">${location}</option>`;
    });
    needs.forEach(need => {
      filterNeed.innerHTML += `<option value="${need}">${need}</option>`;
    });
    criteria.forEach(criterion => {
      filterCriteria.innerHTML += `<option value="${criterion}">${criterion}</option>`;
    });
  }

  // ----------------------------------------------------------------
  // HÀM 2: Hiển thị (Render) các quán cà phê (cho BỘ LỌC)
  // ----------------------------------------------------------------
  function renderShops(shopsToRender) {
    if (!resultsContainer) return; // Chỉ chạy nếu có
    resultsContainer.innerHTML = ''; // Xóa sạch

    if (shopsToRender.length === 0) {
      resultsContainer.innerHTML = '<p>Không tìm thấy quán cà phê phù hợp.</p>';
      return;
    }

    shopsToRender.forEach(shop => {
        // Tái sử dụng hàm tạo card
        const cardElement = createShopCardLink(shop);
        resultsContainer.appendChild(cardElement);
    });
  }

  // ----------------------------------------------------------------
  // HÀM 3: Lọc danh sách quán (cho BỘ LỌC)
  // ----------------------------------------------------------------
  function filterShops() {
    if (!resultsContainer) return; // Chỉ chạy nếu có

    const selectedLocation = filterLocation.value;
    const selectedNeed = filterNeed.value;
    const selectedCriteria = filterCriteria.value;

    let filteredShops = allCoffeeShops; 

    if (selectedLocation !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.location_area === selectedLocation);
    }
    if (selectedNeed !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.need === selectedNeed);
    }
    if (selectedCriteria !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.criteria.includes(selectedCriteria));
    }

    renderShops(filteredShops);
  }

  // ----------------------------------------------------------------
  // HÀM 4: Gắn sự kiện (cho BỘ LỌC)
  // ----------------------------------------------------------------
  function addFilterListeners() {
    if (!filterLocation) return; // Chỉ chạy nếu có
    
    filterLocation.addEventListener('change', filterShops);
    filterNeed.addEventListener('change', filterShops);
    filterCriteria.addEventListener('change', filterShops);
  }

  // --- BẮT ĐẦU CHẠY APP ---
  initializeApp();

});