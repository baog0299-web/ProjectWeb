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

    console.log('Cafe data:', cafe); // Debug

    // Điền tên quán
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

    // Điền địa chỉ
    const addressContainer = document.querySelector('.shopdetail_address');
    if (addressContainer) {
      addressContainer.innerHTML = `
        <span data-i18n="labels.addressLabel">Địa chỉ:</span><br>
        <span>${cafe.address}</span> 
      `;
    }
    
    // Điền rating
    const rateSpan = document.querySelector('.rate span');
    if (rateSpan) {
      rateSpan.textContent = cafe.rating || '5';
    }

    // Điền các tag
    const topTagsContainer = document.querySelector('.shopdetail_tag');
    if (topTagsContainer) {
      topTagsContainer.innerHTML = '';
      const tags = cafe.criteria || [];
      tags.slice(0, 5).forEach(tag => { 
        topTagsContainer.innerHTML += `<p class="tag">${tag}</p>`;
      });
    }

    // ===== SỬA LỖI HIỂN THỊ ẢNH =====
    console.log('Images slider:', cafe.images_slider); // Debug
    
    if (cafe.images_slider && cafe.images_slider.length >= 5) {
      // Ảnh chính (slider)
      const mainImg = document.querySelector('.slider-column img');
      if (mainImg) {
        // Chuyển đổi đường dẫn tương đối thành tuyệt đối
        const imagePath = cafe.images_slider[0].startsWith('/') 
          ? cafe.images_slider[0] 
          : '/' + cafe.images_slider[0];
        
        mainImg.src = imagePath;
        mainImg.alt = `${cafe.name} main image`;
        
        console.log('Main image path:', imagePath); // Debug
        
        // Xử lý lỗi nếu ảnh không load được
        mainImg.onerror = function() {
          console.warn('Không load được ảnh:', this.src);
          this.style.display = 'none';
        };
      }
      
      // 4 ảnh grid
      const gridContainer = document.querySelector('.grid-column');
      if (gridContainer) {
        gridContainer.innerHTML = '';
        for (let i = 1; i <= 4 && i < cafe.images_slider.length; i++) {
          const img = document.createElement('img');
          
          // Chuyển đổi đường dẫn tương đối thành tuyệt đối
          const imagePath = cafe.images_slider[i].startsWith('/') 
            ? cafe.images_slider[i] 
            : '/' + cafe.images_slider[i];
          
          img.src = imagePath;
          img.alt = `${cafe.name} image ${i + 1}`;
          
          console.log(`Grid image ${i} path:`, imagePath); // Debug
          
          // Xử lý lỗi cho từng ảnh
          img.onerror = function() {
            console.warn('Không load được ảnh:', this.src);
            this.style.display = 'none';
          };
          
          gridContainer.appendChild(img);
        }
      }
    } else {
      console.warn('Không đủ ảnh trong data (cần 5 ảnh), số ảnh hiện có:', cafe.images_slider?.length || 0);
    }

    // Điền nội dung các TAB
    const descriptionContainer = document.querySelector('#mo-ta .shopdetail_text');
    if(descriptionContainer) {
      descriptionContainer.innerHTML = `<p>${cafe.description_detail || 'Chưa có mô tả'}</p>`;
      descriptionContainer.removeAttribute('data-i18n');
    }

    const tienIchTab = document.getElementById('tien-ich');
    if (tienIchTab) {
      const criteria = cafe.criteria || [];
      tienIchTab.innerHTML = '<div class="shopdetail_text">';
      criteria.forEach(tag => {
        tienIchTab.innerHTML += `<p class="utility-item">✓ ${tag}</p>`;
      });
      tienIchTab.innerHTML += '</div>';
    }

    const khoangGiaTab = document.getElementById('khoang-gia');
    if (khoangGiaTab) {
      khoangGiaTab.innerHTML = `<div class="shopdetail_text"><p>${cafe.price_range || 'Chưa cập nhật'}</p></div>`;
    }
    
    const menuTab = document.getElementById('menu');
    if (menuTab) {
      menuTab.innerHTML = '<div class="shopdetail_text"><p>Menu đang được cập nhật...</p></div>';
    }

    // Gắn sự kiện cho TAB
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
        const tabId = link.getAttribute('data-tab'); 

        // Xóa active khỏi tất cả tabs
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));

        // Thêm active cho tab được chọn
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
