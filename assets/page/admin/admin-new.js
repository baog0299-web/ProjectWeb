// Admin Panel JavaScript Logic
document.addEventListener('DOMContentLoaded', function() {
    let allCafes = [];
    let filteredCafes = [];
    
    // DOM Elements
    const cardContainer = document.getElementById('card-container');
    const searchInput = document.getElementById('search-input');
    const refreshBtn = document.getElementById('refresh-btn');
    const loading = document.getElementById('loading');
    const noData = document.getElementById('no-data');
    const totalCafesElement = document.getElementById('total-cafes');
    const lastUpdateElement = document.getElementById('last-update');
    
    // Modal Elements
    const deleteModal = document.getElementById('delete-modal');
    const modalClose = document.querySelector('.modal-close');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    
    let cafeToDelete = null;

    // Initialize Admin Panel
    async function initializeAdmin() {
        showLoading();
        try {
            await loadCafesData();
            updateStatistics();
            renderCafes(allCafes);
            updateLastUpdate();
        } catch (error) {
            console.error('Error initializing admin:', error);
            showError('Lỗi tải dữ liệu. Vui lòng thử lại.');
        } finally {
            hideLoading();
        }
    }

    // Load cafes data from JSON
    async function loadCafesData() {
        try {
            // Try multiple paths to find the data file
            let response;
            const paths = [
                '../../assets/data/data.json',
                '../../../assets/data/data.json',
                '../../data/data.json',
                '../data/data.json'
            ];
            
            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                throw new Error('Could not load data from any path');
            }
            
            allCafes = await response.json();
            filteredCafes = [...allCafes];
            return allCafes;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    // Render cafes cards
    function renderCafes(cafes) {
        if (!cafes || cafes.length === 0) {
            cardContainer.style.display = 'none';
            noData.style.display = 'block';
            return;
        }

        cardContainer.style.display = 'grid';
        noData.style.display = 'none';
        
        cardContainer.innerHTML = cafes.map(cafe => createCafeCard(cafe)).join('');
        
        // Add event listeners to new cards
        addCardEventListeners();
    }

    // Create cafe card HTML
    function createCafeCard(cafe) {
        const tags = cafe.criteria ? cafe.criteria.slice(0, 2) : [];
        const remainingTags = cafe.criteria ? Math.max(0, cafe.criteria.length - 2) : 0;
        const imagePath = cafe.image || '../../image/public/card.jpg';
        
        return `
            <div class="card" data-cafe-id="${cafe.id}">
                <div class="card-image">
                    <img src="${imagePath}" alt="${cafe.name}" onerror="this.src='../../image/public/card.jpg'">
                    <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
                    <div class="icon-top-right status-indicator ${cafe.status || 'active'}">
                        <i class="fas ${cafe.status === 'inactive' ? 'fa-pause' : 'fa-check'}"></i>
                    </div>
                </div>

                <div class="card-content">
                    <div class="rating"><i class="fas fa-star"></i> ${cafe.rating || '0.0'}</div>
                    <h3 class="title">${cafe.name}</h3>
                    <div class="location"><i class="fas fa-map-marker-alt"></i> ${cafe.location_area || cafe.address || 'Chưa cập nhật'}</div>

                    <div class="tag">
                        ${tags.map(tag => `<button class="btn-tag">${tag}</button>`).join('')}
                        ${remainingTags > 0 ? `<button class="btn-tag" id="small">+${remainingTags}</button>` : ''}
                    </div>
                    
                    <div class="admin-actions">
                        <button class="btn-edit" onclick="editCafe(${cafe.id})">
                            <i class="fas fa-edit"></i> Chỉnh sửa
                        </button>
                        <button class="btn-delete" onclick="confirmDeleteCafe(${cafe.id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                        <button class="btn-view" onclick="viewCafe(${cafe.id})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Add event listeners to cards
    function addCardEventListeners() {
        // Any additional card-specific event listeners can be added here
    }

    // Search functionality
    function searchCafes(query) {
        if (!query.trim()) {
            filteredCafes = [...allCafes];
        } else {
            filteredCafes = allCafes.filter(cafe => 
                cafe.name.toLowerCase().includes(query.toLowerCase()) ||
                cafe.location_area?.toLowerCase().includes(query.toLowerCase()) ||
                cafe.address?.toLowerCase().includes(query.toLowerCase()) ||
                cafe.criteria?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
        }
        renderCafes(filteredCafes);
    }

    // Update statistics
    function updateStatistics() {
        if (totalCafesElement) {
            totalCafesElement.textContent = allCafes.length;
        }
    }

    // Update last update time
    function updateLastUpdate() {
        if (lastUpdateElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('vi-VN');
            lastUpdateElement.textContent = `Cập nhật lần cuối: ${timeString}`;
        }
    }

    // Show/Hide loading
    function showLoading() {
        loading.style.display = 'flex';
        cardContainer.style.display = 'none';
        noData.style.display = 'none';
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    // Show error message
    function showError(message) {
        cardContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Có lỗi xảy ra</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-retry">Thử lại</button>
            </div>
        `;
        cardContainer.style.display = 'block';
    }

    // Modal functions
    function showDeleteModal() {
        if (deleteModal) {
            deleteModal.style.display = 'block';
        }
    }

    function hideDeleteModal() {
        if (deleteModal) {
            deleteModal.style.display = 'none';
        }
        cafeToDelete = null;
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchCafes(e.target.value);
    });

    refreshBtn.addEventListener('click', () => {
        initializeAdmin();
    });

    // Modal event listeners
    if (modalClose) {
        modalClose.addEventListener('click', hideDeleteModal);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (cafeToDelete) {
                deleteCafe(cafeToDelete);
            }
        });
    }

    // Click outside modal to close
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                hideDeleteModal();
            }
        });
    }

    // Global functions for card actions
    window.editCafe = function(cafeId) {
        window.location.href = `../coffe-shop-exchange/general-inform.html?id=${cafeId}`;
    };

    window.viewCafe = function(cafeId) {
        window.location.href = `../Shop-detail-page/shop-detail.html?id=${cafeId}`;
    };

    window.confirmDeleteCafe = function(cafeId) {
        cafeToDelete = cafeId;
        showDeleteModal();
    };

    window.deleteCafe = function(cafeId) {
        // In a real application, this would make an API call
        // For now, we'll just remove from local array and update UI
        allCafes = allCafes.filter(cafe => cafe.id !== cafeId);
        filteredCafes = filteredCafes.filter(cafe => cafe.id !== cafeId);
        
        updateStatistics();
        renderCafes(filteredCafes);
        hideDeleteModal();
        
        // Show success message
        showToast('Đã xóa quán cafe thành công!', 'success');
        
        console.log(`Deleted cafe with ID: ${cafeId}`);
    };

    // Toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Initialize the admin panel
    initializeAdmin();
});