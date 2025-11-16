document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------------
  // HÀM CHÍNH: Tải data và hiển thị chi tiết
  // ----------------------------------------------------------------
  async function loadShopDetail() {
    let allCoffeeShops = [];

    try {
      // 1. Tải data
      // Đường dẫn lùi 2 cấp về 'assets/' rồi vào 'data/data.json'
      const response = await fetch('../../data/data.json'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCoffeeShops = await response.json();

      // 2. Dữ liệu đã sẵn sàng, giờ mới tìm quán
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
    // 1. Lấy ID của quán từ URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const cafeId = urlParams.get('id');

    // 2. Tìm quán cà phê
    const cafe = allCoffeeShops.find(shop => shop.id == cafeId);

    // 3. Kiểm tra xem có tìm thấy quán không
    if (!cafe) {
      document.body.innerHTML = '<h1>Không tìm thấy quán cà phê này.</h1>';
      return;
    }

    // 4. Điền dữ liệu vào các CLASS của bạn
    document.querySelector('.shopdetail_title h1').textContent = cafe.name;
    document.querySelector('.shopdetail_name').textContent = cafe.name;
    document.querySelector('.shopdetail_address').innerHTML = `Địa chỉ:<br>${cafe.address}`;
    document.querySelector('.rate').innerHTML = `${cafe.rating} <i class="fa-solid fa-star"></i>`;

    // 5. Điền các tag (Tiện ích) ở trên cùng
    const topTagsContainer = document.querySelector('.shopdetail_tag');
    topTagsContainer.innerHTML = '';
    cafe.criteria.slice(0, 5).forEach(tag => { // Lấy 5 tag đầu
      topTagsContainer.innerHTML += `<p class="tag">${tag}</p>`;
    });

    // 6. Điền Gallery ảnh (cần 5 ảnh trong data)
    if (cafe.images_slider && cafe.images_slider.length >= 5) {
      document.querySelector('.slider-column img').src = cafe.images_slider[0]; // Ảnh slider
      const gridContainer = document.querySelector('.grid-column');
      // 4 ảnh lưới
      gridContainer.innerHTML = `
        <img src="${cafe.images_slider[1]}">
        <img src="${cafe.images_slider[2]}">
        <img src="${cafe.images_slider[3]}">
        <img src="${cafe.images_slider[4]}">
      `;
    }

    // 7. Điền nội dung cho các TAB
    // Tab "Mô tả"
    const descriptionContainer = document.querySelector('#mo-ta .shopdetail_text');
    if(descriptionContainer) {
        descriptionContainer.textContent = cafe.description_detail;
    }

    // Tab "Tiện ích"
    const tienIchTab = document.getElementById('tien-ich');
    if (tienIchTab) {
      tienIchTab.innerHTML = ''; // Xóa rỗng
      cafe.criteria.forEach(tag => {
        tienIchTab.innerHTML += `<p class="utility-item">✓ ${tag}</p>`;
      });
    }

    // Tab "Khoảng giá"
    const khoangGiaTab = document.getElementById('khoang-gia');
    if (khoangGiaTab) {
      khoangGiaTab.textContent = cafe.price_range;
    }
    
    // Tab "Menu"
    const menuTab = document.getElementById('menu');
    if (menuTab) {
        menuTab.innerHTML = '<p>Menu đang được cập nhật...</p>';
    }

    // 8. Gắn sự kiện cho TAB
    addTabListeners();
  }

  // ----------------------------------------------------------------
  // HÀM GẮN SỰ KIỆN TAB
  // ----------------------------------------------------------------
  function addTabListeners() {
    const tabLinks = document.querySelectorAll('.detail_tab-link');
    const tabContents = document.querySelectorAll('.shopdetail_tab-content');

    tabLinks.forEach(link => {
      link.addEventListener('click', () => {
        const tabId = link.getAttribute('data-tab'); // vd: "mo-ta"

        // Xóa "active" khỏi tất cả link và content
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));

        // Thêm "active" cho link và content được click
        link.classList.add('active');
        const activeContent = document.getElementById(tabId);
        if (activeContent) {
            activeContent.classList.add('active');
        }
      });
    });
  }

  // --- BẮT ĐẦU CHẠY ---
  loadShopDetail();

});