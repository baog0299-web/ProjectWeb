document.addEventListener('DOMContentLoaded', async () => {
  console.log('Shop detail page loaded');

  // --- 1. XỬ LÝ FOOTER ---
  const footer = document.getElementById('footer');
  if (footer && footer.parentElement !== document.body) {
    console.log('Moving footer back to body');
    document.body.appendChild(footer);
  }

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

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // --- 2. KHỞI TẠO TRANG ---
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
    setupImageSlider(cafe);
    loadSimilarCafes(data, cafe);

    hideLoading();
    showContent();

    console.log('Shop detail loaded successfully');

  } catch (error) {
    console.error('Error loading shop detail:', error);
    showError('Lỗi tải dữ liệu: ' + error.message);
  }

  // --- 3. CÁC HÀM XỬ LÝ DỮ LIỆU ---

  async function loadCafeData() {
    try {
      const response = await fetch('/assets/data/data.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('Trying alternative path...');
      const response = await fetch('../../data/data.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    }
  }

  function displayCafeData(cafe) {
    console.log('Displaying cafe:', cafe.name);

    // Tên quán
    const titleH1 = document.querySelector('.shopdetail_title h1');
    const titleP = document.querySelector('.shopdetail_name');
    const shopName = document.querySelector('.shop-name');
    if (titleH1) titleH1.textContent = cafe.name;
    if (titleP) titleP.textContent = cafe.name;
    if (shopName) shopName.textContent = cafe.name;

    // Địa chỉ
    const addressText = document.querySelector('.address-text');
    if (addressText) addressText.textContent = cafe.address || 'Chưa cập nhật';

    // Rating
    const ratingValue = document.querySelector('.rating-value');
    if (ratingValue) ratingValue.textContent = cafe.rating || '5';
    
    // Rating stars
    const ratingStars = document.querySelectorAll('.rating-stars i');
    if (ratingStars.length > 0) {
      const rating = parseFloat(cafe.rating || 5);
      ratingStars.forEach((star, index) => {
        if (index < Math.floor(rating)) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    }

    // Tags
    const tagsContainer = document.querySelector('.shopdetail_tag');
    const shopTags = document.querySelector('.shop-tags');
    
    if (cafe.criteria) {
      if (tagsContainer) {
        tagsContainer.innerHTML = '';
        cafe.criteria.slice(0, 5).forEach(tag => {
          const tagElement = document.createElement('p');
          tagElement.className = 'tag';
          tagElement.textContent = tag;
          tagsContainer.appendChild(tagElement);
        });
      }
      
      if (shopTags) {
        shopTags.innerHTML = '';
        cafe.criteria.slice(0, 5).forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'tag';
          tagElement.textContent = tag;
          shopTags.appendChild(tagElement);
        });
      }
    }

    // Images
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

    // Description
    const descContainer = document.querySelector('#mo-ta .shopdetail_text');
    if (descContainer) {
      descContainer.innerHTML = `<p>${cafe.description_detail || 'Chưa có mô tả chi tiết'}</p>`;
    }

    // Facilities Tab
    const facilitiesTab = document.getElementById('tien-ich');
    if (facilitiesTab && cafe.criteria) {
      let html = '<div class="shopdetail_text">';
      cafe.criteria.forEach(item => {
        html += `<p>✓ ${item}</p>`;
      });
      html += '</div>';
      facilitiesTab.innerHTML = html;
    }

    // Price Tab
    const priceTab = document.getElementById('khoang-gia');
    if (priceTab) {
      priceTab.innerHTML = `<div class="shopdetail_text"><p>${cafe.price_range || 'Chưa cập nhật'}</p></div>`;
    }

    // --- SỬA LỖI NÚT CHỈ ĐƯỜNG (Theo ảnh bạn gửi) ---
    // Tìm nút có class "direction-btn" (thay vì btn-direction như cũ)
    const directionBtn = document.querySelector('.direction-btn');
    
    if (directionBtn) {
      // Gán sự kiện onclick vì thẻ <button> không có href
      directionBtn.onclick = function() {
          let mapLink = '';
          
          // 1. Ưu tiên dùng link cứng trong data.json
          if (cafe.mapLink) {
             mapLink = cafe.mapLink;
          } 
          // 2. Nếu không có, tự động tạo link tìm kiếm
          else {
             const query = encodeURIComponent((cafe.name || '') + ' ' + (cafe.address || ''));
             mapLink = `https://www.google.com/maps/search/?api=1&query=${query}`;
          }

          // Mở link trong tab mới
          window.open(mapLink, '_blank');
      };
    }
    // ------------------------------------------------

    console.log('Data displayed successfully');
  }

  // --- 4. CÁC HÀM UI/UX KHÁC ---

  function setupTabs() {
    const tabLinks = document.querySelectorAll('.detail_tab-link');
    const tabContents = document.querySelectorAll('.shopdetail_tab-content');

    tabLinks.forEach(link => {
      link.addEventListener('click', () => {
        tabLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        link.classList.add('active');
        const targetId = link.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  function setupImageSlider(cafe) {
    if (!cafe.images_slider || cafe.images_slider.length <= 1) return;

    let currentImageIndex = 0;
    const images = cafe.images_slider;
    const sliderContainer = document.querySelector('.slider-column');
    const prevBtn = document.querySelector('.arrow-left');
    const nextBtn = document.querySelector('.arrow-right');

    if (!sliderContainer || !prevBtn || !nextBtn) return;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-crossfade-container';
    
    const currentImg = sliderContainer.querySelector('img');
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');
    
    img1.src = images[0];
    img1.className = 'slider-img';
    img1.style.opacity = '1';
    img1.style.zIndex = '2';
    
    img2.src = images[0];
    img2.className = 'slider-img';
    img2.style.opacity = '0';
    img2.style.zIndex = '1';
    
    imageContainer.appendChild(img1);
    imageContainer.appendChild(img2);
    currentImg.replaceWith(imageContainer);

    let isTransitioning = false;
    let activeImg = img1;
    let inactiveImg = img2;

    function changeImage(newIndex) {
      if (isTransitioning) return;
      isTransitioning = true;

      const tempImg = new Image();
      tempImg.onload = () => {
        inactiveImg.src = images[newIndex];
        
        activeImg.style.opacity = '0';
        inactiveImg.style.opacity = '1';
        
        const activeZ = activeImg.style.zIndex;
        activeImg.style.zIndex = inactiveImg.style.zIndex;
        inactiveImg.style.zIndex = activeZ;
        
        const temp = activeImg;
        activeImg = inactiveImg;
        inactiveImg = temp;
        
        setTimeout(() => {
          isTransitioning = false;
        }, 400);
      };
      
      tempImg.onerror = () => {
        isTransitioning = false;
      };
      
      tempImg.src = images[newIndex];
    }

    prevBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      currentImageIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      changeImage(currentImageIndex);
    });

    nextBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      currentImageIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      changeImage(currentImageIndex);
    });
  }

  function setupFavoriteButton(cafe) {
    const favoriteBtn = document.querySelector('.favorite-button');
    if (!favoriteBtn) return;

    const FAVORITES_KEY = 'favoriteCafes';
    const cafeId = Number(cafe.id);

    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    favorites = favorites.map(id => Number(id));

    let isLiked = favorites.includes(cafeId);
    updateFavoriteUI(favoriteBtn, isLiked);

    favoriteBtn.addEventListener('click', (e) => {
      e.preventDefault();

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
      if(icon) icon.className = 'fa-solid fa-heart favorite-icon';
      if(text) text.setAttribute('data-i18n', 'removedFromFavorites');
    } else {
      btn.classList.remove('active');
      if(icon) icon.className = 'fa-regular fa-heart favorite-icon';
      if(text) text.setAttribute('data-i18n', 'addToFavorites');
    }
    
    triggerTranslationUpdate();
  }
  
  function triggerTranslationUpdate() {
    const text = document.querySelector('.favorite-text');
    if (text) {
      const key = text.getAttribute('data-i18n');
      const currentLang = localStorage.getItem('site_lang') || 'vi';
      
      const fallbackTexts = {
        'vi': {
          'addToFavorites': 'Thêm vào yêu thích',
          'removedFromFavorites': 'Đã yêu thích'
        },
        'en': {
          'addToFavorites': 'Add to Favorites',
          'removedFromFavorites': 'Added to Favorites'
        }
      };
      
      if (fallbackTexts[currentLang] && fallbackTexts[currentLang][key]) {
        text.textContent = fallbackTexts[currentLang][key];
      }
    }
  }

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

  function loadSimilarCafes(allCafes, currentCafe) {
    const container = document.querySelector('.similar-cards-container');
    if (!container) return;

    const similarCafes = allCafes
      .filter(cafe => cafe.id != currentCafe.id)
      .slice(0, 2);

    container.innerHTML = '';

    similarCafes.forEach(cafe => {
      const cardElement = createCafeCard(cafe);
      container.appendChild(cardElement);
    });
  }

  function createCafeCard(cafe) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.cursor = 'pointer';

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

    cardDiv.addEventListener('click', () => {
      window.location.href = `shop-detail.html?id=${cafe.id}`;
    });

    return cardDiv;
  }

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