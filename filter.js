// Đợi cho toàn bộ nội dung HTML tải xong
document.addEventListener('DOMContentLoaded', () => {
  // Lấy các phần tử (elements) TĨNH từ HTML
  const filterLocation = document.getElementById('filter-location');
  const filterNeed = document.getElementById('filter-need');
  const filterCriteria = document.getElementById('filter-criteria');
  const resultsContainer = document.getElementById('search-results');
  const searchButton = document.querySelector('.search-button');

  // Tạo một biến toàn cục để giữ data sau khi fetch
  let allCoffeeShops = [];

  // ----------------------------------------------------------------
  // HÀM CHÍNH: Tải dữ liệu và khởi chạy
  // ----------------------------------------------------------------
  async function initializeApp() {
    try {
      // 1. Tải dữ liệu từ file JSON (ĐÃ CẬP NHẬT ĐƯỜNG DẪN)
      const response = await fetch('assets/data/data.json'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCoffeeShops = await response.json(); // Gán data vào biến

      // 2. Dữ liệu đã sẵn sàng, giờ mới chạy các hàm logic
      populateFilters();
      
      // Hiển thị lời nhắc ban đầu (theo yêu cầu của bạn)
      resultsContainer.innerHTML = '<p class="initial-prompt">Vui lòng sử dụng bộ lọc để tìm quán cà phê.</p>';
      
      // 3. Gắn sự kiện
      addFilterListeners();

    } catch (error) {
      console.error("Không thể tải dữ liệu quán cà phê:", error);
      // Hiển thị lỗi cho người dùng
      resultsContainer.innerHTML = '<p class="error">Lỗi khi tải dữ liệu quán cafe.</p>';
    }
  }

  // ----------------------------------------------------------------
  // HÀM 1: Tải các lựa chọn (options) cho bộ lọc
  // ----------------------------------------------------------------
  function populateFilters() {
    // Lấy các giá trị duy nhất từ data
    const locations = [...new Set(allCoffeeShops.map(shop => shop.location_area))];
    const needs = [...new Set(allCoffeeShops.map(shop => shop.need))];
    const allCriteria = allCoffeeShops.flatMap(shop => shop.criteria);
    const criteria = [...new Set(allCriteria)]; // Lọc duy nhất

    // Tạo HTML cho các <option> và chèn vào <select>
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
  // HÀM 2: Hiển thị (Render) các quán cà phê
  // (Đã bao gồm link đến trang chi tiết)
  // ----------------------------------------------------------------
  function renderShops(shopsToRender) {
    resultsContainer.innerHTML = ''; // Xóa sạch

    if (shopsToRender.length === 0) {
      resultsContainer.innerHTML = '<p>Không tìm thấy quán cà phê phù hợp.</p>';
      return;
    }

    shopsToRender.forEach(shop => {
      const shopLinkWrapper = document.createElement('a');
      shopLinkWrapper.className = 'shop-card-link';
      // Link đến trang chi tiết
      shopLinkWrapper.href = `assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`;

      // Xử lý tag
      let tagsHTML = '';
      const tagsToShow = shop.criteria.slice(0, 2);
      tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
      if (shop.criteria.length > 2) {
        tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
      }

      // Tạo HTML cho card
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
      resultsContainer.appendChild(shopLinkWrapper);
    });
  }

  // ----------------------------------------------------------------
  // HÀM 3: Lọc danh sách quán
  // ----------------------------------------------------------------
  function filterShops() {
    const selectedLocation = filterLocation.value;
    const selectedNeed = filterNeed.value;
    const selectedCriteria = filterCriteria.value;

    let filteredShops = allCoffeeShops; // Lọc từ data đã tải

    // Lọc theo Khu vực
    if (selectedLocation !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.location_area === selectedLocation);
    }
    // Lọc theo Nhu cầu
    if (selectedNeed !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.need === selectedNeed);
    }
    // Lọc theo Tiêu chí
    if (selectedCriteria !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.criteria.includes(selectedCriteria));
    }

    renderShops(filteredShops);
  }

  // ----------------------------------------------------------------
  // HÀM 4: Gắn sự kiện (chỉ được gọi sau khi data đã tải)
  // ----------------------------------------------------------------
  function addFilterListeners() {
    filterLocation.addEventListener('change', filterShops);
    filterNeed.addEventListener('change', filterShops);
    filterCriteria.addEventListener('change', filterShops);
    
    // Nếu bạn muốn dùng nút "Tìm kiếm" thay vì real-time:
    // 1. Xóa 3 dòng ở trên
    // 2. Bỏ comment dòng dưới:
    // searchButton.addEventListener('click', filterShops);
  }

  // --- BẮT ĐẦU CHẠY APP ---
  initializeApp();

});