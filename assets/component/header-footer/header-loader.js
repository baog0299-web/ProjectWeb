// Tự động tính toán đường dẫn tương đối đến component
function getRelativePath() {
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').filter(segment => segment && segment !== 'index.html').length;
    
    // Nếu ở root (index.html)
    if (depth <= 1) {
        return 'assets/';
    }
    // Nếu ở trong thư mục con (assets/page/...)
    return '../../';
}

// Load header
fetch(getRelativePath() + "component/header-footer/header.html")
    .then(res => res.text())
    .then(data => {
        const headerDiv = document.getElementById("header");
        if (headerDiv) {
            headerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong header
            const logo = headerDiv.querySelector('.header-logo img');
            if (logo) {
                logo.src = getRelativePath() + "image/public/Container.png";
            }
            
            // Cập nhật navigation links
            const navLinks = headerDiv.querySelectorAll('.header-nav-links a');
            const basePath = window.location.pathname.includes('/assets/page/') ? '../../../' : '';
            
            if (navLinks[0]) navLinks[0].href = basePath + "index.html";
            if (navLinks[1]) navLinks[1].href = basePath + "assets/page/cafe-list/cafe-list.html";
            if (navLinks[2]) navLinks[2].href = basePath + "assets/page/favorites/favorites.html";
        }
    });

// Load footer
fetch(getRelativePath() + "component/header-footer/footer.html")
    .then(res => res.text())
    .then(data => {
        const footerDiv = document.getElementById("footer");
        if (footerDiv) {
            footerDiv.innerHTML = data;
            
            // Cập nhật đường dẫn logo trong footer
            const logo = footerDiv.querySelector('.logo img');
            if (logo) {
                logo.src = getRelativePath() + "image/public/Container.png";
            }
        }
    });
