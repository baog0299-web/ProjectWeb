// Add New Cafe Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const nameInput = document.getElementById('name');
    const describeInput = document.getElementById('describe');
    const tagInput = document.getElementById('example');
    const addressInput = document.querySelector('input[placeholder*="Nhập tên quán cafe..."]');
    const detailDescTextarea = document.querySelector('textarea[placeholder*="Mô tả chi tiết"]');
    const menuTextarea = document.querySelector('textarea[placeholder*="Liệt kê các món"]');
    const facilitiesTextarea = document.querySelector('textarea[placeholder*="Các tiện ích"]');
    const hoursInput = document.querySelector('input[placeholder*="7:00 - 22:00"]');
    const mapInput = document.querySelector('input[placeholder*="https://maps.google.com"]');
    
    // Upload areas
    const iconUpload = document.querySelector('.img-icon .add-btn');
    const coverUpload = document.querySelector('.upload-area');
    const galleryUpload = document.querySelectorAll('.upload-area')[1];
    
    // Tags
    const tagAddBtn = document.querySelector('.bar-wrapper .add-btn');
    const tagContainer = document.querySelector('.add-area');
    
    // Submit button
    const submitBtn = document.querySelector('.button');
    const backBtn = document.querySelector('.block-h2');
    
    // Data storage
    let cafeData = {
        name: '',
        shortDescription: '',
        address: '',
        detailDescription: '',
        menu: '',
        facilities: '',
        hours: '',
        mapLink: '',
        tags: [],
        images: {
            icon: null,
            cover: null,
            gallery: []
        }
    };
    

    
    // Initialize page
    function initializePage() {
        setupEventListeners();
        populateExistingTags();
        updateSubmitButtonState();
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Form inputs
        if (nameInput) nameInput.addEventListener('input', updateFormData);
        if (describeInput) describeInput.addEventListener('input', updateFormData);
        if (addressInput) addressInput.addEventListener('input', updateFormData);
        if (detailDescTextarea) detailDescTextarea.addEventListener('input', updateFormData);
        if (menuTextarea) menuTextarea.addEventListener('input', updateFormData);
        if (facilitiesTextarea) facilitiesTextarea.addEventListener('input', updateFormData);
        if (hoursInput) hoursInput.addEventListener('input', updateFormData);
        if (mapInput) mapInput.addEventListener('input', updateFormData);
        
        // Tag management
        if (tagAddBtn) tagAddBtn.addEventListener('click', addTag);
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                }
            });
        }
        
        // File uploads
        if (iconUpload) iconUpload.addEventListener('click', () => handleFileUpload('icon'));
        if (coverUpload) coverUpload.addEventListener('click', () => handleFileUpload('cover'));
        if (galleryUpload) galleryUpload.addEventListener('click', () => handleFileUpload('gallery'));
        
        // Submit and navigation
        if (submitBtn) submitBtn.addEventListener('click', submitForm);
        if (backBtn) backBtn.addEventListener('click', goBack);
    }
    
    // Update form data
    function updateFormData() {
        cafeData.name = nameInput?.value || '';
        cafeData.shortDescription = describeInput?.value || '';
        cafeData.address = addressInput?.value || '';
        cafeData.detailDescription = detailDescTextarea?.value || '';
        cafeData.menu = menuTextarea?.value || '';
        cafeData.facilities = facilitiesTextarea?.value || '';
        cafeData.hours = hoursInput?.value || '';
        cafeData.mapLink = mapInput?.value || '';
        
        updateSubmitButtonState();
    }
    
    // Add new tag
    function addTag() {
        if (!tagInput || !tagInput.value.trim()) return;
        
        const newTag = tagInput.value.trim();
        if (cafeData.tags.includes(newTag)) {
            showToast('Tag này đã tồn tại!', 'warning');
            return;
        }
        
        cafeData.tags.push(newTag);
        renderTags();
        tagInput.value = '';
        updateSubmitButtonState();
        showToast('Đã thêm tag mới!', 'success');
    }
    
    // Remove tag
    function removeTag(tagToRemove) {
        cafeData.tags = cafeData.tags.filter(tag => tag !== tagToRemove);
        renderTags();
        updateSubmitButtonState();
        showToast('Đã xóa tag!', 'info');
    }
    
    // Render tags
    function renderTags() {
        if (!tagContainer) return;
        
        tagContainer.innerHTML = cafeData.tags.map(tag => `
            <div class="element-card">
                <div class="add-content">${tag}</div>
                <button class="x-btn" data-tag="${tag}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Add event listeners to remove buttons
        tagContainer.querySelectorAll('.x-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tagToRemove = btn.getAttribute('data-tag');
                removeTag(tagToRemove);
            });
        });
    }
    
    // Populate existing tags from HTML
    function populateExistingTags() {
        if (!tagContainer) return;
        
        const existingTags = tagContainer.querySelectorAll('.element-card .add-content');
        existingTags.forEach(tagElement => {
            const tagText = tagElement.textContent.trim();
            if (tagText && !cafeData.tags.includes(tagText)) {
                cafeData.tags.push(tagText);
            }
        });
        
        renderTags();
    }
    
    // Handle file uploads
    function handleFileUpload(type) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = type === 'gallery';
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            handleFiles(files, type);
        };
        
        input.click();
    }
    
    // Handle selected files
    function handleFiles(files, type) {
        if (files.length === 0) return;
        
        switch (type) {
            case 'icon':
                if (files[0]) {
                    cafeData.images.icon = files[0];
                    showToast('Đã chọn icon cho quán!', 'success');
                    updateIconPreview(files[0]);
                }
                break;
            case 'cover':
                if (files[0]) {
                    cafeData.images.cover = files[0];
                    showToast('Đã chọn ảnh bìa!', 'success');
                    updateCoverPreview(files[0]);
                }
                break;
            case 'gallery':
                if (files.length >= 5) {
                    cafeData.images.gallery = files.slice(0, 10); // Max 10 images
                    showToast(`Đã chọn ${files.length} ảnh mô tả!`, 'success');
                    updateGalleryPreview(files);
                } else {
                    showToast('Vui lòng chọn ít nhất 5 ảnh!', 'warning');
                }
                break;
        }
        
        updateSubmitButtonState();
    }
    
    // Update icon preview
    function updateIconPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const iconBtn = iconUpload.querySelector('img');
            if (iconBtn) {
                iconBtn.src = e.target.result;
                iconBtn.style.width = '40px';
                iconBtn.style.height = '40px';
                iconBtn.style.borderRadius = '8px';
            }
        };
        reader.readAsDataURL(file);
    }
    
    // Update cover preview
    function updateCoverPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = coverUpload;
            uploadArea.style.backgroundImage = `url(${e.target.result})`;
            uploadArea.style.backgroundSize = 'cover';
            uploadArea.style.backgroundPosition = 'center';
            uploadArea.style.opacity = '0.8';
        };
        reader.readAsDataURL(file);
    }
    
    // Update gallery preview
    function updateGalleryPreview(files) {
        const galleryArea = galleryUpload;
        galleryArea.innerHTML = `
            <div class="gallery-preview">
                <div class="gallery-count">${files.length} ảnh đã chọn</div>
                <div class="gallery-status">✓ Đủ điều kiện</div>
            </div>
        `;
    }
    
    // Validate form
    function validateForm() {
        const errors = [];
        
        if (!cafeData.name.trim()) errors.push('Tên quán cafe');
        if (!cafeData.shortDescription.trim()) errors.push('Mô tả ngắn');
        if (!cafeData.address.trim()) errors.push('Địa chỉ');
        if (!cafeData.detailDescription.trim()) errors.push('Mô tả chi tiết');
        if (cafeData.tags.length === 0) errors.push('Ít nhất 1 tag');
        if (!cafeData.images.cover) errors.push('Ảnh bìa');
        if (cafeData.images.gallery.length < 5) errors.push('Ít nhất 5 ảnh mô tả');
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    // Update submit button state
    function updateSubmitButtonState() {
        if (!submitBtn) return;
        
        const validation = validateForm();
        const btnContent = submitBtn.querySelector('.btn-content');
        
        if (validation.isValid) {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            if (btnContent) btnContent.textContent = 'Gửi';
        } else {
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            if (btnContent) btnContent.textContent = `Thiếu: ${validation.errors.length} mục`;
        }
    }
    
    // Submit form
    async function submitForm(e) {
        e.preventDefault();
        
        const validation = validateForm();
        if (!validation.isValid) {
            showToast(`Vui lòng điền đầy đủ: ${validation.errors.join(', ')}`, 'error');
            return;
        }
        
        // Show loading
        const btnContent = submitBtn.querySelector('.btn-content');
        const originalText = btnContent.textContent;
        btnContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.style.pointerEvents = 'none';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate new cafe ID
            const newId = Date.now();
            
            // Create cafe object
            const newCafe = {
                id: newId,
                name: cafeData.name,
                description: cafeData.shortDescription,
                address: cafeData.address,
                location_area: extractAreaFromAddress(cafeData.address),
                criteria: cafeData.tags,
                rating: 0.0,
                image: cafeData.images.cover ? 'user-uploaded.jpg' : 'default-cafe.jpg',
                details: {
                    description: cafeData.detailDescription,
                    menu: cafeData.menu,
                    facilities: cafeData.facilities,
                    hours: cafeData.hours,
                    mapLink: cafeData.mapLink
                }
            };
            

            
            // Show success
            showToast('Đã thêm quán cafe thành công!', 'success');
            
            // Reset form
            setTimeout(() => {
                resetForm();
                showToast('Bạn có thể thêm quán mới khác!', 'info');
            }, 2000);
            
        } catch (error) {

            showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
        } finally {
            // Reset button
            btnContent.textContent = originalText;
            submitBtn.style.pointerEvents = '';
        }
    }
    
    // Extract area from address
    function extractAreaFromAddress(address) {
        const patterns = [
            /quận\s+\d+/i,
            /quận\s+\w+/i,
            /huyện\s+\w+/i,
            /thành phố\s+\w+/i
        ];
        
        for (const pattern of patterns) {
            const match = address.match(pattern);
            if (match) return match[0];
        }
        
        return 'Khu vực khác';
    }
    
    // Reset form
    function resetForm() {
        // Reset data
        cafeData = {
            name: '',
            shortDescription: '',
            address: '',
            detailDescription: '',
            menu: '',
            facilities: '',
            hours: '',
            mapLink: '',
            tags: [],
            images: { icon: null, cover: null, gallery: [] }
        };
        
        // Reset inputs
        document.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        
        // Reset tags
        if (tagContainer) tagContainer.innerHTML = '';
        
        // Reset previews
        // (Would reset image previews here)
        
        updateSubmitButtonState();
    }
    
    // Go back to dashboard
    function goBack() {
        if (hasUnsavedChanges()) {
            if (confirm('Bạn có muốn hủy và quay lại dashboard không? Dữ liệu chưa lưu sẽ bị mất.')) {
                window.location.href = '../admin/admin.html';
            }
        } else {
            window.location.href = '../admin/admin.html';
        }
    }
    
    // Check for unsaved changes
    function hasUnsavedChanges() {
        return cafeData.name.trim() !== '' || 
               cafeData.shortDescription.trim() !== '' ||
               cafeData.tags.length > 0 ||
               cafeData.images.cover !== null;
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Initialize page
    initializePage();
});