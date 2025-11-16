// Đợi cho toàn bộ nội dung HTML tải xong
document.addEventListener('DOMContentLoaded', () => {

  // 1. Lấy các phần tử (elements) từ HTML của bạn
  const filterLocation = document.getElementById('filter-location');
  const filterNeed = document.getElementById('filter-need');
  const filterCriteria = document.getElementById('filter-criteria');
  const resultsContainer = document.getElementById('search-results');
  const searchButton = document.querySelector('.search-button');

  // ----------------------------------------------------------------
  // HÀM 1: Tải các lựa chọn (options) cho bộ lọc
  // (Hàm này sẽ đọc file data.js và tự điền vào 3 ô select)
  // ----------------------------------------------------------------
  function populateFilters() {
    // Lấy các giá trị duy nhất từ data
    const locations = [...new Set(allCoffeeShops.map(shop => shop.location_area))];
    const needs = [...new Set(allCoffeeShops.map(shop => shop.need))];
    
    // Lấy tất cả các tiêu chí (criteria là một mảng, nên cần xử lý khác)
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
  // HÀM 2: Hiển thị (Render) các quán cà phê ra màn hình
  // (Hàm này sẽ tạo HTML card giống hệt card "Nổi bật" của bạn)
  // ----------------------------------------------------------------
  function renderShops(shopsToRender) {
    // Xóa sạch kết quả tìm kiếm cũ
    resultsContainer.innerHTML = '';

    // Nếu không có quán nào, hiển thị thông báo
    if (shopsToRender.length === 0) {
      resultsContainer.innerHTML = '<p>Không tìm thấy quán cà phê phù hợp.</p>';
      return;
    }

    // Tạo card HTML cho mỗi quán và thêm vào danh sách
    shopsToRender.forEach(shop => {
      const shopCard = document.createElement('div');
      shopCard.className = 'card'; // Dùng class "card" y như của bạn

      // Xử lý phần tags (tiêu chí)
      // Hiển thị 2 tag đầu tiên, nếu nhiều hơn thì hiện "+..."
      let tagsHTML = '';
      const tagsToShow = shop.criteria.slice(0, 2); // Lấy 2 tag đầu
      tagsHTML = tagsToShow.map(tag => `<button class="btn-tag">${tag}</button>`).join('');
      
      if (shop.criteria.length > 2) {
        tagsHTML += `<button class="btn-tag" id="small">+${shop.criteria.length - 2}</button>`;
      }

      // Dùng template literal (dấu `) để tạo HTML
      // Đây là cấu trúc card LẤY TỪ FILE HTML của bạn
      shopCard.innerHTML = `
        <div class="card-image">
          <img src="${shop.image}" alt="${shop.name}">
          <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
          <div class="icon-top-right"><i class="far fa-heart"></i></div>
        </div>
        <div class="card-content">
          <div class="rating">
            <i class="fas fa-star"></i> ${shop.rating}
          </div>
          <h3 class="title">${shop.name}</h3>
          <div class="location">
            <i class="fas fa-map-marker-alt"></i> ${shop.location_area}
          </div>
          <div class="tag">
            ${tagsHTML}
          </div>
        </div>
      `;
      
      resultsContainer.appendChild(shopCard);
    });
  }

  // ----------------------------------------------------------------
  // HÀM 3: Lọc danh sách quán (Hàm này không đổi)
  // ----------------------------------------------------------------
  function filterShops() {
    // Lấy giá trị đang được chọn từ cả 3 bộ lọc
    const selectedLocation = filterLocation.value;
    const selectedNeed = filterNeed.value;
    const selectedCriteria = filterCriteria.value;

    // Bắt đầu bằng cách lấy toàn bộ danh sách
    let filteredShops = allCoffeeShops;

    // Lọc theo Khu vực (Location)
    if (selectedLocation !== 'all') {
      filteredShops = filteredShops.filter(shop => {
        return shop.location_area === selectedLocation;
      });
    }

    // Lọc theo Nhu cầu (Need)
    if (selectedNeed !== 'all') {
      filteredShops = filteredShops.filter(shop => {
        return shop.need === selectedNeed;
      });
    }

    // Lọc theo Tiêu chí (Criteria)
    if (selectedCriteria !== 'all') {
      filteredShops = filteredShops.filter(shop => {
        return shop.criteria.includes(selectedCriteria);
      });
    }

    // Sau khi lọc xong, gọi hàm render để hiển thị kết quả
    renderShops(filteredShops);
  }

  // ----------------------------------------------------------------
  // KHỞI CHẠY VÀ GẮN SỰ KIỆN
  // ----------------------------------------------------------------

  // 1. Tự động điền các lựa chọn vào bộ lọc
  populateFilters();
  
  // 2. Hiển thị tất cả các quán khi tải trang lần đầu
  // (Bạn có thể bỏ dòng này nếu muốn kết quả chỉ hiện khi tìm kiếm)
  resultsContainer.innerHTML = '<p class="initial-prompt">Vui lòng sử dụng bộ lọc để tìm quán cà phê.</p>';

  // 3. Gắn sự kiện "change" (thay đổi) cho cả 3 bộ lọc
  // Đây là tính năng "real-time" bạn muốn
  filterLocation.addEventListener('change', filterShops);
  filterNeed.addEventListener('change', filterShops);
  filterCriteria.addEventListener('change', filterShops);
  
  // 4. (Tùy chọn) Gắn sự kiện cho nút "Tìm kiếm"
  // Nếu bạn muốn lọc real-time, bạn không cần nút này.
  // Nhưng nếu bạn muốn người dùng phải bấm nút, hãy:
  // - Xóa 3 dòng addEventListener ở trên.
  // - Bỏ comment (dấu //) ở dòng dưới đây:
  // searchButton.addEventListener('click', filterShops);

});