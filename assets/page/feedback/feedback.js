// Header and footer are loaded by header-loader.js

// --- 1. XỬ LÝ HIỆU ỨNG FAQ (ACCORDION) MƯỢT MÀ ---
document.addEventListener('DOMContentLoaded', () => {
    const details = document.querySelectorAll('.faq-item');

    details.forEach((targetDetail) => {
        const summary = targetDetail.querySelector('summary');
        const content = targetDetail.querySelector('.faq-body');
        
        summary.addEventListener('click', (e) => {
            e.preventDefault();

            if (targetDetail.hasAttribute('open')) {
                // --- ĐÓNG ---
                content.style.maxHeight = content.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    content.style.maxHeight = '0px';
                });
                content.addEventListener('transitionend', function() {
                    targetDetail.removeAttribute('open');
                }, { once: true });

            } else {
                // --- MỞ ---
                targetDetail.setAttribute('open', '');
                content.style.maxHeight = '0px';
                requestAnimationFrame(() => {
                    content.style.maxHeight = content.scrollHeight + 'px';
                });
                
                // Đóng các tab khác
                details.forEach(otherDetail => {
                    if (otherDetail !== targetDetail && otherDetail.hasAttribute('open')) {
                        const otherContent = otherDetail.querySelector('.faq-body');
                        otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
                        requestAnimationFrame(() => {
                            otherContent.style.maxHeight = '0px';
                        });
                        otherContent.addEventListener('transitionend', () => {
                            otherDetail.removeAttribute('open');
                        }, { once: true });
                    }
                });
            }
        });
    });
});

// --- 2. QUẢN LÝ NGÔN NGỮ & FILE UPLOAD ---
(function() {
    let currentLocaleData = null;

    function getTrans(path, localeObj) {
        if (!localeObj) return null;
        return path.split('.').reduce((o, k) => (o && o[k] ? o[k] : undefined), localeObj);
    }

    // Hàm cập nhật trạng thái file (SỬA: Icon xanh, Chữ thường)
    function updateFileUploadStatus() {
        const fileInput = document.getElementById('bonus');
        const fileNameDisplay = document.getElementById('file-name-display');
        const uploadIcon = document.querySelector('.feedback_button i'); 

        if (!fileInput || !fileNameDisplay) return;

        if (fileInput.files && fileInput.files.length > 0) {
            // --- CÓ FILE ---
            
            // 1. Text: "Đã chọn ảnh"
            let statusText = getTrans('upload.selected', currentLocaleData) || "Đã chọn ảnh";
            statusText = statusText.replace('{n}', '1'); 
            fileNameDisplay.textContent = statusText;

            // 2. Style Chữ: Đậm, Nghiêng, MÀU MẶC ĐỊNH (không xanh)
            fileNameDisplay.style.fontStyle = 'italic';
            fileNameDisplay.style.fontWeight = 'bold';
            fileNameDisplay.style.color = ''; 

            // 3. Icon: Dấu tích VÀ MÀU XANH LÁ
            if (uploadIcon) {
                uploadIcon.className = 'fa-solid fa-check';
                uploadIcon.style.color = '#28a745'; // Xanh lá
            }

        } else {
            // --- KHÔNG CÓ FILE ---
            let defaultText = getTrans('upload.button', currentLocaleData) || "Upload File";
            fileNameDisplay.textContent = defaultText;

            // Reset style chữ
            fileNameDisplay.style.fontStyle = 'normal';
            fileNameDisplay.style.fontWeight = 'normal';
            fileNameDisplay.style.color = '';

            // Reset Icon
            if (uploadIcon) {
                uploadIcon.className = 'fa-solid fa-arrow-up-from-bracket'; 
                uploadIcon.style.color = ''; // Reset màu icon
            }
        }
    }

    document.addEventListener('languageChanged', (e) => {
        currentLocaleData = e.detail.locale;
        updateFileUploadStatus();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const fileInput = document.getElementById('bonus');
        if (fileInput) {
            fileInput.addEventListener('change', updateFileUploadStatus);
        }
    });
})();