{/* <script>
  const coffeeShops = [
    {
      name: "Urban Roast",
      location: "TP.Hồ Chí Minh",
      need: "Wifi miễn phí",
      criteria: "Có sân vườn",
      rating: 4.8,
      image: "assets/component/card/card.jpg"
    },
    {
      name: "The Hidden Corner",
      location: "Hà Nội",
      need: "Yên tĩnh",
      criteria: "Lãng mạn",
      rating: 4.7,
      image: "assets/component/card/card.jpg"
    },
    {
      name: "Morning Beans",
      location: "TP.Hồ Chí Minh",
      need: "Yên tĩnh",
      criteria: "Có sân vườn",
      rating: 4.5,
      image: "assets/component/card/card.jpg"
    }
  ];

  const searchBtn = document.getElementById("search-btn");
  const resultsContainer = document.getElementById("search-results");

  searchBtn.addEventListener("click", function () {
    const location = document.getElementById("filter-location").value;
    const need = document.getElementById("filter-need").value;
    const criteria = document.getElementById("filter-criteria").value;

    // Lọc dữ liệu
    const filtered = coffeeShops.filter((shop) => {
      return (
        (location === "" || shop.location === location) &&
        (need === "" || shop.need === need) &&
        (criteria === "" || shop.criteria === criteria)
      );
    });

    // Hiển thị kết quả
    renderResults(filtered);
  });

  function renderResults(list) {
    resultsContainer.innerHTML = ""; // Xóa kết quả cũ

    if (list.length === 0) {
      resultsContainer.innerHTML = "<p class='no-result'>Không tìm thấy quán phù hợp.</p>";
      return;
    }

    list.forEach((shop) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="card-image">
          <img src="${shop.image}" alt="${shop.name}">
          <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
          <div class="icon-top-right"><i class="far fa-heart"></i></div>
        </div>
        <div class="card-content">
          <div class="rating"><i class="fas fa-star"></i> ${shop.rating}</div>
          <h3 class="title">${shop.name}</h3>
          <div class="location"><i class="fas fa-map-marker-alt"></i> ${shop.location}</div>
          <div class="tag">
            <button class="btn-tag">${shop.need}</button>
            <button class="btn-tag">${shop.criteria}</button>
          </div>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }
</script> */}
