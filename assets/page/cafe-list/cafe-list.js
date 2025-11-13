// Load 9 cafe cards using component
const cafeGrid = document.getElementById('cafeGrid');

for (let i = 0; i < 9; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-image">
            <img src="../../component/card/card.jpg" alt="Urban Roast">
            <div class="icon-top-left"><i class="fas fa-coffee"></i></div>
            <div class="icon-top-right"><i class="far fa-heart"></i></div>
        </div>
        <div class="card-content">
            <div class="rating">
                <i class="fas fa-star"></i> 4.8
            </div>
            <h3 class="title">Urban Roast</h3>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i> TP. Hồ Chí Minh
            </div>
            <div class="tag">
                <button class="btn-tag">Wifi miễn phí</button>
                <button class="btn-tag">Wifi miễn phí</button>
                <button class="btn-tag" id="small">+1</button>
            </div>
        </div>
    `;
    cafeGrid.appendChild(card);
}