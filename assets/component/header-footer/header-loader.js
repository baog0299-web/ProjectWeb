// Load header
fetch("/assets/component/header-footer/header.html") // Đường dẫn tuyệt đối
    .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy header.html');
        return res.text();
    })
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong header (nếu cần, nhưng header.html đã sửa)
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo && !logo.src.includes('/assets/')) {
                 logo.src = "/assets/image/public/Container.png";
            }
            
            // Set active state
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
fetch("/assets/component/header-footer/footer.html") // Đường dẫn tuyệt đối
    .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy footer.html');
        return res.text();
    })
    .then(data => {
        const footerDiv = document.getElementById("footer");
        if (footerDiv) {
            footerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong footer (tương tự)
            const logo = footerDiv.querySelector('.logo img');
            if (logo && !logo.src.includes('/assets/')) {
                logo.src = "/assets/image/public/Container.png";
            }
        }
    })
    .catch(err => console.error("Lỗi tải footer:", err));