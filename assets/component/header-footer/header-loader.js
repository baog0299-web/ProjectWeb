document.addEventListener("DOMContentLoaded", () => {
    // 1. Hàm tính toán đường dẫn gốc (Root Path)
    function getRootPath() {
        const path = window.location.pathname;
        if (path.endsWith("index.html") || path.endsWith("/")) {
            if (path.includes("/assets/page/")) return "../../../";
            return "";
        }
        if (path.includes("/assets/page/")) return "../../../";
        return "";
    }

    const rootPath = getRootPath();

    // 2. Hàm nạp dữ liệu an toàn (Tránh lỗi tải 2 lần)
    function loadSearchData(callback) {
        // Nếu biến allCoffeeShops đã tồn tại (do trang chủ đã load data.js), dùng luôn
        if (typeof allCoffeeShops !== 'undefined') {
            callback(allCoffeeShops);
            return;
        }

        // Nếu chưa có, tự động tải file data.js
        const script = document.createElement('script');
        script.src = `${rootPath}data.js`;
        script.onload = () => {
            if (typeof allCoffeeShops !== 'undefined') {
                callback(allCoffeeShops);
            } else {
                callback([]);
            }
        };
        script.onerror = () => {
            console.warn("Không tải được data.js, tính năng gợi ý sẽ tắt.");
            callback([]);
        };
        document.head.appendChild(script);
    }

    // 3. Tải Header
    fetch(`${rootPath}assets/component/header-footer/header.html`)
        .then(res => {
            if (!res.ok) throw new Error('Không tải được header');
            return res.text();
        })
        .then(data => {
            const headerDiv = document.getElementById("header");
            if (headerDiv) {
                headerDiv.innerHTML = data;

                // --- A. Sửa lại Logo & Link ---
                const logo = headerDiv.querySelector('.header-logo img');
                if (logo) {
                    logo.src = `${rootPath}assets/image/public/Container.png`;
                    const logoLink = logo.closest('a');
                    if (logoLink) logoLink.href = `${rootPath}index.html`;
                }

                // --- B. Sửa Menu Active ---
                const navLinks = headerDiv.querySelectorAll('.header-nav-links a');
                const currentHref = window.location.href;

                navLinks.forEach(link => {
                    const originalHref = link.getAttribute('href');
                    const cleanHref = originalHref.startsWith('/') ? originalHref.substring(1) : originalHref;
                    link.href = rootPath + cleanHref;

                    link.classList.remove('active');
                    if (currentHref.includes("index.html") && originalHref.includes("index.html")) {
                        link.classList.add('active');
                    } else if (currentHref.includes("cafe-list") && originalHref.includes("cafe_list")) {
                        link.classList.add('active');
                    } else if (currentHref.includes("favorites") && originalHref.includes("favorites")) {
                        link.classList.add('active');
                    } else if (currentHref.includes("feedback") && originalHref.includes("feedback")) {
                        link.classList.add('active');
                    }
                });

                // --- C. LOGIC TÌM KIẾM & GỢI Ý ---
                const searchInput = headerDiv.querySelector('.header-search-bar input');
                const searchIcon = headerDiv.querySelector('.header-search-bar i');
                const searchContainer = headerDiv.querySelector('.header-search-bar');

                // Tạo hộp chứa gợi ý
                const suggestionBox = document.createElement('div');
                suggestionBox.className = 'search-suggestions';
                searchContainer.appendChild(suggestionBox);

                // Gọi hàm lấy dữ liệu để kích hoạt tìm kiếm
                loadSearchData((data) => {
                    // Xử lý khi gõ phím
                    searchInput.addEventListener('input', (e) => {
                        const keyword = e.target.value.toLowerCase().trim();
                        suggestionBox.innerHTML = ''; // Xóa cũ

                        if (keyword.length < 1) {
                            suggestionBox.classList.remove('show');
                            return;
                        }

                        // Lọc quán
                        const matches = data.filter(shop => 
                            shop.name.toLowerCase().includes(keyword) ||
                            (shop.location_area && shop.location_area.toLowerCase().includes(keyword))
                        );

                        // Hiển thị gợi ý
                        if (matches.length > 0) {
                            matches.slice(0, 5).forEach(shop => {
                                // Xử lý ảnh
                                let imgUrl = shop.image;
                                if (imgUrl && imgUrl.startsWith('/')) imgUrl = imgUrl.substring(1);
                                imgUrl = rootPath + imgUrl;

                                const item = document.createElement('a');
                                item.className = 'suggestion-item';
                                item.href = `${rootPath}assets/page/Shop-detail-page/shop-detail.html?id=${shop.id}`;
                                item.innerHTML = `
                                    <img src="${imgUrl}" onerror="this.src='${rootPath}assets/image/public/Container.png'">
                                    <div class="suggestion-info">
                                        <h4>${shop.name}</h4>
                                        <p>${shop.location_area || 'TP.HCM'}</p>
                                    </div>
                                `;
                                suggestionBox.appendChild(item);
                            });
                            suggestionBox.classList.add('show');
                        } else {
                            suggestionBox.classList.remove('show');
                        }
                    });
                });

                // Ẩn khi click ra ngoài
                document.addEventListener('click', (e) => {
                    if (!searchContainer.contains(e.target)) {
                        suggestionBox.classList.remove('show');
                    }
                });

                // Xử lý Enter / Click Icon để tìm kiếm
                function handleSearch() {
                    const keyword = searchInput.value.trim();
                    if (keyword) {
                        window.location.href = `${rootPath}assets/page/cafe-list/cafe-list.html?search=${encodeURIComponent(keyword)}`;
                    }
                }

                if (searchInput) {
                    searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') handleSearch();
                    });
                }
                if (searchIcon) {
                    searchIcon.style.cursor = 'pointer';
                    searchIcon.addEventListener('click', handleSearch);
                }
            }
        })
        .catch(err => console.error("Lỗi tải header:", err));

    // 4. Tải Footer
    fetch(`${rootPath}assets/component/header-footer/footer.html`)
        .then(res => {
            if (!res.ok) throw new Error('Không tải được footer');
            return res.text();
        })
        .then(data => {
            const footerDiv = document.getElementById("footer");
            if (footerDiv) {
                footerDiv.innerHTML = data;
                const logo = footerDiv.querySelector('.logo img');
                if (logo) {
                    logo.src = `${rootPath}assets/image/public/Container.png`;
                    const logoLink = logo.closest('a');
                    if(logoLink) logoLink.href = `${rootPath}index.html`;
                }
                // Sửa link footer
                const links = footerDiv.querySelectorAll('a');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('#')) {
                        const cleanHref = href.startsWith('/') ? href.substring(1) : href;
                        link.href = rootPath + cleanHref;
                    }
                });
            }
        })
        .catch(err => console.error("Lỗi tải footer:", err));
});