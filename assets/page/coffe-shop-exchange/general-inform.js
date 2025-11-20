// General Information Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements with correct selectors based on HTML structure
    const allInputs = document.querySelectorAll('input[type="text"]');
    const nameInput = allInputs[0]; // First input is name
    const addressInput = allInputs[1]; // Second input is address
    const allTextareas = document.querySelectorAll('textarea');
    const descriptionTextarea = allTextareas[0]; // First textarea is description
    const tagInput = document.querySelector('.add-tag input');
    const addTagBtn = document.querySelector('.add-btn');
    const tagContainer = document.querySelector('.tags-container');
    
    console.log('Form elements found:', {
        nameInput: !!nameInput,
        addressInput: !!addressInput,
        descriptionTextarea: !!descriptionTextarea,
        tagInput: !!tagInput,
        addTagBtn: !!addTagBtn,
        tagContainer: !!tagContainer
    });
    
    console.log('Total inputs found:', allInputs.length);
    console.log('Total textareas found:', allTextareas.length);
    
    // Get buttons
    const cancelBtn = document.querySelector('.btn1');
    const saveBtn = document.querySelector('.btn2');
    
    // Get cafe ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cafeId = urlParams.get('id');
    
    let originalData = {};
    let currentData = {};
    
    // Load cafe data
    async function loadCafeData() {
        try {
            // Try multiple paths to find the data file
            const paths = [
                '../../assets/data/data.json',
                '../../../assets/data/data.json',
                '../../data/data.json',
                '../data/data.json',
                '/assets/data/data.json'
            ];
            
            let response;
            let cafes;
            
            for (const path of paths) {
                try {
                    console.log(`Trying path: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        cafes = await response.json();
                        console.log(`Successfully loaded data from: ${path}`);
                        break;
                    }
                } catch (e) {
                    console.log(`Failed to load from: ${path}`, e);
                    continue;
                }
            }
            
            if (!cafes) {
                throw new Error('Could not load data from any path');
            }
            
            const cafe = cafes.find(c => c.id == cafeId);
            
            if (cafe) {
                originalData = { ...cafe };
                currentData = { ...cafe };
                populateForm(cafe);
                updateHeader(cafe.name);
            } else {
                showError(`Không tìm thấy quán cafe với ID: ${cafeId}`);
            }
        } catch (error) {
            console.error('Error loading cafe data:', error);
            showError('Lỗi tải dữ liệu. Vui lòng thử lại.');
        }
    }
    
    // Populate form with cafe data
    function populateForm(cafe) {
        console.log('Populating form with:', cafe);
        
        if (nameInput) {
            nameInput.value = cafe.name || '';
            console.log('Set name input:', nameInput.value);
        } else {
            console.warn('Name input not found');
        }
        
        if (addressInput) {
            addressInput.value = cafe.address || '';
            console.log('Set address input:', addressInput.value);
        } else {
            console.warn('Address input not found');
        }
        
        if (descriptionTextarea) {
            descriptionTextarea.value = cafe.description || '';
            console.log('Set description textarea:', descriptionTextarea.value);
        } else {
            console.warn('Description textarea not found');
        }
        
        // Populate tags
        if (cafe.criteria && tagContainer) {
            renderTags(cafe.criteria);
            console.log('Rendered tags:', cafe.criteria);
        } else if (cafe.criteria) {
            console.warn('Tag container not found, but criteria exists:', cafe.criteria);
        }
    }
    
    // Update page header with cafe name
    function updateHeader(cafeName) {
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.textContent = `Chỉnh sửa quán: ${cafeName}`;
        }
    }
    
    // Render tags
    function renderTags(tags) {
        if (!tagContainer) {
            console.warn('Tag container not found');
            return;
        }
        
        console.log('Rendering tags:', tags);
        
        tagContainer.innerHTML = tags.map(tag => `
            <span class="tag">
                ${tag} 
                <button class="x-btn" data-tag="${tag}">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
        
        // Add event listeners for remove buttons
        const removeButtons = tagContainer.querySelectorAll('.x-btn');
        console.log('Remove buttons found:', removeButtons.length);
        
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tagToRemove = btn.getAttribute('data-tag');
                console.log('Removing tag:', tagToRemove);
                removeTag(tagToRemove);
            });
        });
    }
    
    // Add new tag
    function addTag() {
        if (!tagInput || !tagInput.value.trim()) return;
        
        const newTag = tagInput.value.trim();
        if (!currentData.criteria) currentData.criteria = [];
        
        if (!currentData.criteria.includes(newTag)) {
            currentData.criteria.push(newTag);
            renderTags(currentData.criteria);
            tagInput.value = '';
            markAsModified();
        } else {
            showToast('Tag này đã tồn tại!', 'warning');
        }
    }
    
    // Remove tag
    function removeTag(tagToRemove) {
        if (currentData.criteria) {
            currentData.criteria = currentData.criteria.filter(tag => tag !== tagToRemove);
            renderTags(currentData.criteria);
            markAsModified();
        }
    }
    
    // Check if data has been modified
    function hasChanges() {
        const nameChanged = nameInput && nameInput.value !== originalData.name;
        const addressChanged = addressInput && addressInput.value !== originalData.address;
        const descChanged = descriptionTextarea && descriptionTextarea.value !== originalData.description;
        const tagsChanged = JSON.stringify(currentData.criteria || []) !== JSON.stringify(originalData.criteria || []);
        
        return nameChanged || addressChanged || descChanged || tagsChanged;
    }
    
    // Mark form as modified
    function markAsModified() {
        if (saveBtn) {
            saveBtn.style.background = 'linear-gradient(135deg, #FF6B38, #FF8C66)';
            saveBtn.style.opacity = '1';
        }
    }
    
    // Save changes
    async function saveChanges() {
        try {
            // Update current data with form values
            if (nameInput) currentData.name = nameInput.value.trim();
            if (addressInput) currentData.address = addressInput.value.trim();
            if (descriptionTextarea) currentData.description = descriptionTextarea.value.trim();
            
            // Validate required fields
            if (!currentData.name) {
                showToast('Vui lòng nhập tên quán cafe!', 'error');
                return;
            }
            
            // Show loading
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
            saveBtn.style.pointerEvents = 'none';
            
            // Simulate API call (in real app, this would be an actual API)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update original data
            originalData = { ...currentData };
            
            // Show success message
            showToast('Đã lưu thành công!', 'success');
            
            // Update header
            updateHeader(currentData.name);
            
            // Reset save button
            resetSaveButton();
            
        } catch (error) {
            console.error('Error saving:', error);
            showToast('Lỗi khi lưu. Vui lòng thử lại!', 'error');
            resetSaveButton();
        }
    }
    
    // Reset save button
    function resetSaveButton() {
        if (saveBtn) {
            saveBtn.innerHTML = 'Lưu thay đổi';
            saveBtn.style.pointerEvents = '';
            saveBtn.style.background = '';
            saveBtn.style.opacity = '';
        }
    }
    
    // Cancel changes
    function cancelChanges() {
        if (hasChanges()) {
            if (confirm('Bạn có muốn hủy các thay đổi chưa lưu không?')) {
                // Reset form to original data
                populateForm(originalData);
                currentData = { ...originalData };
                resetSaveButton();
                showToast('Đã hủy thay đổi', 'info');
            }
        } else {
            // Navigate back to admin - try multiple paths
            const adminPaths = [
                '../admin/admin.html',
                '../../admin/admin.html',
                '/admin'
            ];
            
            // Try to navigate to admin page
            window.location.href = adminPaths[0];
        }
    }
    
    // Show error message
    function showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Có lỗi xảy ra</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-retry">Thử lại</button>
                </div>
            `;
        }
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
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    // Event listeners
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelChanges);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveChanges);
    }
    
    if (addTagBtn) {
        addTagBtn.addEventListener('click', addTag);
    }
    
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
    
    // Monitor form changes
    [nameInput, addressInput, descriptionTextarea].forEach(input => {
        if (input) {
            input.addEventListener('input', markAsModified);
        }
    });
    
    // Prevent accidental navigation away
    window.addEventListener('beforeunload', (e) => {
        if (hasChanges()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // Initialize
    console.log('Current URL:', window.location.href);
    console.log('Cafe ID from URL:', cafeId);
    
    if (cafeId) {
        loadCafeData();
    } else {
        console.warn('No cafe ID provided, using demo data');
        // Use demo data if no ID provided
        const demoData = {
            id: 2,
            name: 'Urban Brew Coffee',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            description: 'Quán cà phê hiện đại với không gian thoáng mát, view đẹp nhìn ra sông Sài Gòn. Phù hợp cho cả làm việc và gặp gỡ bạn bè.',
            criteria: ['Yên tĩnh', 'Wifi nhanh', 'Làm việc']
        };
        
        originalData = { ...demoData };
        currentData = { ...demoData };
        populateForm(demoData);
        updateHeader(demoData.name);
    }
});