document.addEventListener('DOMContentLoaded', async () => {
  console.log('Shop detail page loaded');

  // Đảm bảo footer luôn ở cuối body
  const footer = document.getElementById('footer');
  if (footer && footer.parentElement !== document.body) {
    console.log('Moving footer back to body');
    document.body.appendChild(footer);
  }

  // Observer để theo dõi DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const footer = document.getElementById('footer');
        if (footer && footer.parentElement !== document.body) {
          console.log('Footer moved, fixing position');
          document.body.appendChild(footer);
        }
      }
    });
  });

  // Theo dõi toàn bộ document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Lấy ID từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const cafeId = urlParams.get('id');
  
  const loadingContainer = document.getElementById('loading-container');
  const mainContent = document.getElementById('main-content');

  console.log('Cafe ID:', cafeId);

  if (!cafeId) {
    showError('Không có ID quán cà phê trong URL');
    return;
  }

  try {
    // Hiển thị loading
    showLoading();

    // Load dữ liệu
    const data = await loadCafeData();
    const cafe = data.find(shop => shop.id == cafeId);

    if (!cafe) {
      showError(`Không tìm thấy quán cà phê với ID: ${cafeId}`);
      return;
    }

    // Hiển thị dữ liệu
    displayCafeData(cafe);
    setupTabs();
    setupFavoriteButton(cafe);
    loadSimilarCafes(data, cafe);

    // Hiển thị nội dung
    hideLoading();
    showContent();

    console.log('Shop detail loaded successfully');

  } catch (error) {
    console.error('Error loading shop detail:', error);
    showError('Lỗi tải dữ liệu: ' + error.message);
  }

  // Hàm load dữ liệu
  async function loadCafeData() {
    try {
      const response = await fetch('/assets/data/data.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.log('Trying alternative path...');
      const response = await fetch('../../data/data.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    }
  }

  // Hàm hiển thị dữ liệu
  function displayCafeData(cafe) {
    console.log('Displaying cafe:', cafe.name);

    // Tên quán
    const titleH1 = document.querySelector('.shopdetail_title h1');
    const titleP = document.querySelector('.shopdetail_name');
    if (titleH1) titleH1.textContent = cafe.name;
    if (titleP) titleP.textContent = cafe.name;

    // Địa chỉ
    const addressText = document.querySelector('.address-text');
    if (addressText) addressText.textContent = cafe.address || 'Chưa cập nhật';

    // Rating
    const ratingValue = document.querySelector('.rating-value');
    if (ratingValue) ratingValue.textContent = cafe.rating || '5';

    // Tags
    const tagsContainer = document.querySelector('.shopdetail_tag');
    if (tagsContainer && cafe.criteria) {
      tagsContainer.innerHTML = '';
      cafe.criteria.slice(0, 5).forEach(tag => {
        const tagElement = document.createElement('p');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    }

    // Hình ảnh
    if (cafe.images_slider && cafe.images_slider.length > 0) {
      const mainImg = document.querySelector('.slider-column img');
      if (mainImg) {
        mainImg.src = cafe.images_slider[0];
        mainImg.alt = cafe.name;
      }

      const gridImages = document.querySelectorAll('.grid-column img');
      gridImages.forEach((img, index) => {
        if (cafe.images_slider[index + 1]) {
          img.src = cafe.images_slider[index + 1];
          img.alt = `${cafe.name} ${index + 2}`;
        }
      });
    }

    // Mô tả
    const descContainer = document.querySelector('#mo-ta .shopdetail_text');
    if (descContainer) {
      descContainer.innerHTML = `<p>${cafe.description_detail || 'Chưa có mô tả chi tiết'}</p>`;
    }

    // Tiện ích
    const facilitiesTab = document.getElementById('tien-ich');
    if (facilitiesTab && cafe.criteria) {
      let html = '<div class="shopdetail_text">';
      cafe.criteria.forEach(item => {
        html += `<p>✓ ${item}</p>`;
      });
      html += '</div>';
      facilitiesTab.innerHTML = html;
    }

    // Khoảng giá
    const priceTab = document.getElementById('khoang-gia');
    if (priceTab) {
      priceTab.innerHTML = `<div class="shopdetail_text"><p>${cafe.price_range || 'Chưa cập nhật'}</p></div>`;
    }

    console.log('Data displayed successfully');
  }

  // Hàm setup tabs
  function setupTabs() {
    const tabLinks = document.querySelectorAll('.detail_tab-link');
    const tabContents = document.querySelectorAll('.shopdetail_tab-content');

    tabLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Remove active class from all
        tabLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab
        link.classList.add('active');
        const targetId = link.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // Hàm setup favorite button
  function setupFavoriteButton(cafe) {
    const favoriteBtn = document.querySelector('.favorite-button');
    if (!favoriteBtn) return;

    const FAVORITES_KEY = 'favoriteCafes';
    const cafeId = Number(cafe.id);

    // Get current favorites
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    favorites = favorites.map(id => Number(id));

    let isLiked = favorites.includes(cafeId);
    updateFavoriteUI(favoriteBtn, isLiked);

    favoriteBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Update favorites
      let currentFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
      currentFavorites = currentFavorites.map(id => Number(id));

      if (isLiked) {
        currentFavorites = currentFavorites.filter(id => id !== cafeId);
        isLiked = false;
      } else {
        if (!currentFavorites.includes(cafeId)) {
          currentFavorites.push(cafeId);
        }
        isLiked = true;
      }

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavorites));
      updateFavoriteUI(favoriteBtn, isLiked);
    });
  }

  function updateFavoriteUI(btn, active) {
    const icon = btn.querySelector('.favorite-icon');
    const text = btn.querySelector('.favorite-text');
    
    if (active) {
      btn.classList.add('active');
      icon.className = 'fa-solid fa-heart favorite-icon';
      text.textContent = 'Đã yêu thích';
    } else {
      btn.classList.remove('active');
      icon.className = 'fa-regular fa-heart favorite-icon';
      text.textContent = 'Thêm trang yêu thích';
    }
  }

  // Utility functions
  function showLoading() {
    if (loadingContainer) loadingContainer.style.display = 'flex';
    if (mainContent) mainContent.classList.remove('show');
  }

  function hideLoading() {
    if (loadingContainer) loadingContainer.style.display = 'none';
  }

  function showContent() {
    if (mainContent) mainContent.classList.add('show');
  }

  function showError(message) {
    if (loadingContainer) {
      loadingContainer.innerHTML = `
        <h1 style="color: #D97706;">Lỗi</h1>
        <p style="color: #6B4423; margin: 20px 0;">${message}</p>
        <button onclick="window.history.back()" style="padding: 10px 20px; background: #FF7043; color: white; border: none; border-radius: 5px; cursor: pointer;">Quay lại</button>
      `;
    }
  }

  // Hàm load similar cafes
  function loadSimilarCafes(allCafes, currentCafe) {
    const container = document.querySelector('.similar-cards-container');
    if (!container) return;

    // Lấy 2 quán khác (không phải quán hiện tại)
    const similarCafes = allCafes
      .filter(cafe => cafe.id !== currentCafe.id)
      .slice(0, 2);

    container.innerHTML = '';

    similarCafes.forEach(cafe => {
      const cardElement = createCafeCard(cafe);
      container.appendChild(cardElement);
    });
  }

  // Hàm tạo card component
  function createCafeCard(cafe) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.cursor = 'pointer';

    // Lấy 2 tags đầu tiên
    const displayTags = cafe.criteria ? cafe.criteria.slice(0, 2) : [];
    const remainingCount = cafe.criteria ? Math.max(0, cafe.criteria.length - 2) : 0;

    cardDiv.innerHTML = `
      <div class="card-image">
        <img src="${cafe.images_slider ? cafe.images_slider[0] : '/assets/image/cfimg/lava1.png'}" alt="${cafe.name}">
        <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
        <div class="icon-top-right" onclick="event.stopPropagation(); toggleCardFavorite(${cafe.id}, this)">
          <i class="far fa-heart"></i>
        </div>
      </div>
      <div class="card-content">
        <div class="card-info">
          <div class="rating">
            <i class="fas fa-star"></i> ${cafe.rating}
          </div>
          <h3 class="title">${cafe.name}</h3>
          <div class="location">
            <i class="fas fa-map-marker-alt"></i> ${cafe.location_area}
          </div>
        </div>
        <div class="tags">
          ${displayTags.map(tag => `<button class="btn-tag" onclick="event.stopPropagation()">${tag}</button>`).join('')}
          ${remainingCount > 0 ? `<button class="btn-tag" id="small" onclick="event.stopPropagation()">+${remainingCount}</button>` : ''}
        </div>
      </div>
    `;

    // Thêm click handler để navigate to detail
    cardDiv.addEventListener('click', () => {
      window.location.href = `shop-detail.html?id=${cafe.id}`;
    });

    return cardDiv;
  }

  // Global function cho favorite toggle trong similar cards
  window.toggleCardFavorite = function(cafeId, element) {
    const FAVORITES_KEY = 'favoriteCafes';
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    favorites = favorites.map(id => Number(id));
    
    const icon = element.querySelector('i');
    const isLiked = favorites.includes(Number(cafeId));
    
    if (isLiked) {
      favorites = favorites.filter(id => id !== Number(cafeId));
      icon.className = 'far fa-heart';
    } else {
      favorites.push(Number(cafeId));
      icon.className = 'fas fa-heart';
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  };
});