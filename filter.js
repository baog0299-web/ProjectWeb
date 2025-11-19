document.addEventListener('DOMContentLoaded', () => {
  const filterLocation = document.getElementById('filter-location');
  const filterNeed = document.getElementById('filter-need');
  const filterCriteria = document.getElementById('filter-criteria');
  const resultsContainer = document.getElementById('search-results');
  const featuredContainer = document.querySelector('.card-container');

  let allCoffeeShops = [];

  // ----------------------------------------------------------------
  // HÀM CHÍNH: Tải data và chạy
  // ----------------------------------------------------------------
  async function initializeApp() {
    try {
      const response = await fetch('/assets/data/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCoffeeShops = await response.json(); 

      if (filterLocation) {
        populateFilters();
      }
      if (resultsContainer) {
        // Thêm data-i18n cho initial prompt
        resultsContainer.innerHTML = '<p class="initial-prompt" data-i18n="search.initialPrompt">Vui lòng sử dụng bộ lọc để tìm quán cà phê.</p>';
      }
      if (featuredContainer) {
        loadFeaturedCards(allCoffeeShops);
      }
      
      addFilterListeners();

    } catch (error) {
      console.error("Không thể tải dữ liệu quán cà phê:", error);
      if(resultsContainer) {
          // Thêm data-i18n cho error message
          resultsContainer.innerHTML = '<p class="error" data-i18n="search.errorLoading">Lỗi khi tải dữ liệu quán cafe.</p>';
      }
    }
  }

  // ----------------------------------------------------------------
  // HÀM TẠO 1 CARD (ĐÃ thêm logic tim và i18n)
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
            <div class="card-info">
              <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
              <h3 class="title">${shop.name}</h3>
              <div class="location"><i class="fas fa-map-marker-alt"></i> ${shop.location_area}</div>
            </div>
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
      let isLiked = favorites.map(id => Number(id)).includes(shopId);

      const updateCardHeart = (active) => {
          if (active) {
              heartBtn.style.color = '#D97706';
              heartBtn.innerHTML = '<i class="fas fa-heart"></i>';
          } else {
              heartBtn.style.color = '#6B4423';
              heartBtn.innerHTML = '<i class="far fa-heart"></i>';
          }
      };
      updateCardHeart(isLiked);

      // 2. Gắn sự kiện click
      heartBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          let currentFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
          currentFavs = currentFavs.map(id => Number(id));

          if (isLiked) {
               currentFavs = currentFavs.filter(id => id !== shopId);
               isLiked = false;
          } else {
               if (!currentFavs.includes(shopId)) currentFavs.push(shopId);
               isLiked = true;
          }

          localStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavs));
          updateCardHeart(isLiked);
      });
      // --- HẾT PHẦN MỚI THÊM ---

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
          const cardElement = createShopCardLink(shop);
          featuredContainer.appendChild(cardElement);
      });
  }

  // ----------------------------------------------------------------
  // HÀM POPULATE FILTERS (Thêm i18n keys)
  // ----------------------------------------------------------------
  function populateFilters() {
    if (!filterLocation) return;
    
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
  // HÀM RENDER SHOPS (Thêm i18n key cho "không tìm thấy")
  // ----------------------------------------------------------------
  function renderShops(shopsToRender) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = ''; 
    
    if (shopsToRender.length === 0) {
      // Thêm data-i18n cho message "không tìm thấy"
      resultsContainer.innerHTML = '<p class="no-results" data-i18n="search.noResults">Không tìm thấy quán cà phê phù hợp.</p>';
      return;
    }
    
    shopsToRender.forEach(shop => {
        const cardElement = createShopCardLink(shop);
        resultsContainer.appendChild(cardElement);
    });
  }

  // ----------------------------------------------------------------
  // HÀM FILTER SHOPS
  // ----------------------------------------------------------------
  function filterShops() {
    if (!resultsContainer) return;
    
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
  // HÀM ADD FILTER LISTENERS
  // ----------------------------------------------------------------
  function addFilterListeners() {
    if (!filterLocation) return;
    filterLocation.addEventListener('change', filterShops);
    filterNeed.addEventListener('change', filterShops);
    filterCriteria.addEventListener('change', filterShops);
  }

  // --- BẮT ĐẦU CHẠY APP ---
  initializeApp();
});