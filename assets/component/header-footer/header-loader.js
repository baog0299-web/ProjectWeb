// Load header
fetch("/assets/component/header-footer/header.html")
    .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy header.html');
        return res.text();
    })
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            
            // ===== SỬA LỖI LOGO =====
            // Cập nhật đường dẫn logo - BẮT BUỘC phải sửa vì header.html dùng đường dẫn tương đối
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo) {
                // Đổi đường dẫn thành tuyệt đối
                logo.src = "/assets/image/public/Container.png";
                logo.alt = "CoffeeFinder Logo";
                
                // Xử lý lỗi nếu logo không tải được
                logo.onerror = function() {
                    console.error('Không thể tải logo từ:', this.src);
                    // Thử đường dẫn dự phòng
                    this.src = "/assets/image/public/logo.png";
                };
            }
            
            // Set active state cho navigation
            const navLinks = headerDiv.querySelectorAll('.header-nav-links a');
            const currentPath = window.location.pathname;
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPath = link.getAttribute('href');
                
                if (currentPath === linkPath || (currentPath === '/index.html' && linkPath === '/')) {
                    link.classList.add('active');
                } else if (linkPath !== '/' && linkPath !== '/index.html' && currentPath.startsWith(linkPath)) {
                    link.classList.add('active');
                }
            });
        }
    })
    .catch(err => console.error("Lỗi tải header:", err));

// Load footer
fetch("/assets/component/header-footer/footer.html")
    .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy footer.html');
        return res.text();
    })
    .then(data => {
        const footerDiv = document.getElementById("footer");
        if (footerDiv) {
            footerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong footer
            const logo = footerDiv.querySelector('.logo img');
            if (logo) {
                logo.src = "/assets/image/public/Container.png";
                logo.alt = "CoffeeFinder Logo";
                
                logo.onerror = function() {
                    console.error('Không thể tải logo footer từ:', this.src);
                    this.src = "/assets/image/public/logo.png";
                };
            }
        }
    })
    .catch(err => console.error("Lỗi tải footer:", err));