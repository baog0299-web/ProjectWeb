// Header and footer are loaded by header-loader.js
// Add any page-specific JavaScript here

// --- LOGIC XỬ LÝ FAQ (ACCORDION) ---
document.addEventListener('DOMContentLoaded', () => {
    const details = document.querySelectorAll("details.faq-item");

    details.forEach((targetDetail) => {
        const summary = targetDetail.querySelector("summary");
        const content = targetDetail.querySelector(".faq-body");

        // 1. Thiết lập trạng thái ban đầu
        // Nếu HTML không có sẵn 'open', set height = 0
        if (!targetDetail.hasAttribute('open')) {
            content.style.maxHeight = '0px';
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
        }

        summary.addEventListener("click", (e) => {
            e.preventDefault(); // Chặn hành vi mở mặc định để ta tự xử lý animation

            const isOpen = targetDetail.hasAttribute("open");

            // --- TÍNH NĂNG MỚI: Tự động đóng các câu hỏi khác ---
            if (!isOpen) {
                details.forEach((otherDetail) => {
                    if (otherDetail !== targetDetail && otherDetail.hasAttribute('open')) {
                        const otherContent = otherDetail.querySelector('.faq-body');
                        // Animation đóng
                        otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
                        setTimeout(() => {
                             otherContent.style.maxHeight = '0px';
                        }, 10);
                        // Sau khi hết thời gian animation (300ms) thì bỏ attribute open
                        setTimeout(() => {
                             otherDetail.removeAttribute('open');
                        }, 300);
                    }
                });
            }
            // ----------------------------------------------------

            if (isOpen) {
                // ĐANG MỞ -> CẦN ĐÓNG
                // Bước 1: Set cứng chiều cao hiện tại để trình duyệt nhận diện transition
                content.style.maxHeight = content.scrollHeight + 'px';
                
                // Bước 2: Đợi 1 chút rồi set về 0
                setTimeout(() => {
                    content.style.maxHeight = '0px';
                }, 10);

                // Bước 3: Sau khi animation xong (300ms), xóa thuộc tính open
                setTimeout(() => {
                    targetDetail.removeAttribute("open");
                }, 300); // 300ms phải khớp với transition trong CSS
            } else {
                // ĐANG ĐÓNG -> CẦN MỞ
                targetDetail.setAttribute("open", ""); // Thêm thuộc tính open ngay lập tức để hiện nội dung
                
                // Đợi DOM cập nhật rồi set chiều cao
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }, 10);
                
                // Sau khi mở xong, set lại thành none để content co giãn nếu màn hình thay đổi
                setTimeout(() => {
                    if(targetDetail.hasAttribute('open')){
                         content.style.maxHeight = 'none';
                    }
                }, 300);
            }
        });
});

// 1. Biến lưu dữ liệu ngôn ngữ
let currentLocaleData = null;

// Hàm lấy text từ JSON (hỗ trợ key lồng nhau)
function getTrans(path, localeObj) {
    if (!localeObj) return null;
    return path.split('.').reduce((o, k) => (o && o[k] ? o[k] : undefined), localeObj);
}

// 2. Hàm xử lý hiển thị trạng thái file (Tách riêng để dùng lại nhiều lần)
function updateFileUploadStatus() {
    const fileInput = document.getElementById('bonus');
    const fileNameDisplay = document.getElementById('file-name-display');
    const uploadIcon = document.querySelector('.feedback_button i'); 

    if (!fileInput || !fileNameDisplay) return;

    if (fileInput.files && fileInput.files.length > 0) {
        // --- TRƯỜNG HỢP CÓ FILE ---
        const count = fileInput.files.length;

        // Lấy mẫu câu từ JSON hiện tại. Ví dụ: "Selected {n} images"
        // Nếu chưa có data thì fallback về tiếng Việt
        let template = getTrans('upload.selected', currentLocaleData) || "Đã chọn {n} ảnh";
        
        // Thay thế số lượng
        fileNameDisplay.textContent = template.replace('{n}', count);
        
        // Style đậm/nghiêng
        fileNameDisplay.style.fontStyle = 'italic';
        fileNameDisplay.style.fontWeight = 'bold';

        // Icon tích xanh
        if (uploadIcon) {
            uploadIcon.classList.remove('fa-arrow-up-from-bracket');
            uploadIcon.classList.add('fa-check');
            uploadIcon.style.color = '#28a745';
        }

    } else {
        // --- TRƯỜNG HỢP KHÔNG CÓ FILE ---
        
        // Lấy chữ mặc định "Upload File" hoặc "Tải tệp" từ JSON
        let defaultText = getTrans('upload.button', currentLocaleData) || "Upload File";
        fileNameDisplay.textContent = defaultText;

        // Reset style
        fileNameDisplay.style.fontStyle = 'normal';
        fileNameDisplay.style.fontWeight = 'normal';

        // Icon mũi tên cũ
        if (uploadIcon) {
            uploadIcon.classList.remove('fa-check');
            uploadIcon.classList.add('fa-arrow-up-from-bracket');
            uploadIcon.style.color = ''; 
        }
    }
}

// 3. Lắng nghe sự kiện đổi ngôn ngữ (QUAN TRỌNG)
document.addEventListener('languageChanged', (e) => {
    // Cập nhật dữ liệu mới
    currentLocaleData = e.detail.locale;
    
    // Gọi ngay hàm cập nhật hiển thị để dịch lại dòng "Đã chọn X ảnh"
    updateFileUploadStatus();
});

// 4. Lắng nghe sự kiện chọn file
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('bonus');
    
    // Khi người dùng chọn file -> Gọi hàm cập nhật
    if (fileInput) {
        fileInput.addEventListener('change', updateFileUploadStatus);
    }
});
});

