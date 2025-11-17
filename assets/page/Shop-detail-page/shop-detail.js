<<<<<<< HEAD
<<<<<<< HEAD
fetch("../../component/header-footer/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    // Load CSS header vào <head>
    const headerLinks = document.getElementById("header").querySelectorAll("link[rel='stylesheet']");
    headerLinks.forEach(link => {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.href = "../../component/header-footer/header.css"; // đường dẫn từ homepage.html
      document.head.appendChild(newLink);
    });
  });
fetch("../../component/header-footer/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;

    // Load CSS header vào <footer>
    const headerLinks = document.getElementById("footer").querySelectorAll("link[rel='stylesheet']");
    headerLinks.forEach(link => {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.href = "../../component/header-footer/footer.css"; // đường dẫn từ homepage.html
      document.head.appendChild(newLink);
    });
  });
=======
// Header and footer are loaded by header-loader.js
// Add any page-specific JavaScript here
>>>>>>> d1cfd77953a282b978dbd48ab03a3b6258b59e36
=======
document.addEventListener('DOMContentLoaded', () => {

 // ----------------------------------------------------------------
 // HÀM CHÍNH: Tải data và hiển thị chi tiết
 // ----------------------------------------------------------------
 async function loadShopDetail() {
 let allCoffeeShops = [];
 try {
 const response = await fetch('/assets/data/data.json'); // Dùng đường dẫn tuyệt đối
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

    // 4. Điền dữ liệu
    
    // ----- SỬA LỖI TÊN QUÁN -----
    // 1. Tìm phần tử
    const titleH1 = document.querySelector('.shopdetail_title h1');
    const titleP = document.querySelector('.shopdetail_name');

    // 2. Điền tên
    if (titleH1) {
        titleH1.textContent = cafe.name;
        // 3. Xóa thuộc tính i18n để script khác không ghi đè
        titleH1.removeAttribute('data-i18n'); 
    }
    if (titleP) {
        titleP.textContent = cafe.name;
        // 3. Xóa thuộc tính i18n để script khác không ghi đè
        titleP.removeAttribute('data-i18n');
    }
    // ----------------------------

    // (Lý do địa chỉ hoạt động: .innerHTML đã vô tình xóa thẻ span[data-i18n] đi)
    document.querySelector('.shopdetail_address').innerHTML = `
        <span data-i18n="labels.addressLabel">Địa chỉ:</span><br>
        <span>${cafe.address}</span> 
    `;
    
    // (Lý do rating hoạt động: thẻ span không có data-i18n)
    document.querySelector('.rate span').textContent = cafe.rating;

    // 5. Điền các tag (Tiện ích) ở trên cùng
    const topTagsContainer = document.querySelector('.shopdetail_tag');
    topTagsContainer.innerHTML = '';
    cafe.criteria.slice(0, 5).forEach(tag => { 
      topTagsContainer.innerHTML += `<p class="tag">${tag}</p>`;
    });

 // 6. Điền Gallery ảnh (cần 5 ảnh trong data)
    if (cafe.images_slider && cafe.images_slider.length >= 5) {
      document.querySelector('.slider-column img').src = cafe.images_slider[0]; 
      const gridContainer = document.querySelector('.grid-column');
      gridContainer.innerHTML = `
        <img src="${cafe.images_slider[1]}" alt="${cafe.name} image 2">
        <img src="${cafe.images_slider[2]}" alt="${cafe.name} image 3">
        <img src="${cafe.images_slider[3]}" alt="${cafe.name} image 4">
        <img src="${cafe.images_slider[4]}" alt="${cafe.name} image 5">
      `;
    }

    // 7. Điền nội dung cho các TAB
    const descriptionContainer = document.querySelector('#mo-ta .shopdetail_text');
    if(descriptionContainer) {
        descriptionContainer.textContent = cafe.description_detail;
        descriptionContainer.removeAttribute('data-i18n'); // Tương tự, xóa i18n
    }

    const tienIchTab = document.getElementById('tien-ich');
    if (tienIchTab) {
      tienIchTab.innerHTML = '';
      cafe.criteria.forEach(tag => {
        tienIchTab.innerHTML += `<p class="utility-item">✓ ${tag}</p>`;
      });
    }

    const khoangGiaTab = document.getElementById('khoang-gia');
    if (khoangGiaTab) {
      khoangGiaTab.textContent = cafe.price_range;
    }
    
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
    // ... (Giữ nguyên hàm này) ...
    const tabLinks = document.querySelectorAll('.detail_tab-link');
    const tabContents = document.querySelectorAll('.shopdetail_tab-content');

    tabLinks.forEach(link => {
      link.addEventListener('click', () => {
        const tabId = link.getAttribute('data-tab'); 

        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));

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
>>>>>>> da503a4398abc298fead29770f2ef1f40a29d60f
