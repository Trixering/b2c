
const USER_API_URL = "https://67487d245801f515359120d0.mockapi.io/users/";
const ITEM_API_URL = "https://67487d245801f515359120d0.mockapi.io/item/";

let itemList = [];

// 用來處理商品數據
async function fetchItems() {
    const response = await fetch(ITEM_API_URL);
    itemList = await response.json();
    renderItems(itemList);
    renderAds(itemList);
}

// 渲染商品列表
function renderItems(itemList) {
    const categories = ['meal', 'single', 'desert', 'drink'];
    categories.forEach(cate => {
        const items = itemList.filter(item => item.cate === cate).sort((a, b) => a.price - b.price);
        const cateContainer = document.getElementById(cate);
        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('item');
            div.innerHTML = `
                        <img src="${item.pic}" alt="${item.name}" class="img-fluid">
                        <div class="info">
                            <p class="item-name">${item.name}</p>
                            <div class="item-pands">
                                <p class="item-price">$${item.price}</p>
                                <p class="item-price">⭐${calculateAverageStars(item.stars)}</p>
                            </div>
                            
                        </div>
                    `;
            cateContainer.appendChild(div);

            // 點擊商品觸發 modal
            div.addEventListener('click', () => showItemDetails(item.id));
        });
    });
}

// 計算平均星級
function calculateAverageStars(stars) {
    const total = Object.values(stars).reduce((sum, val) => sum + val, 0);
    return (total / Object.values(stars).length).toFixed(2);
}

// 渲染廣告區塊
function renderAds(itemList) {
    const randomItems = getRandomItems(itemList, 3);
    const carousel = document.getElementById('carousel-items');
    randomItems.forEach(item => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        carouselItem.innerHTML = `
                    <img src="${item.pic}" class="d-block w-100" alt="${item.name}">
                    <div class="carousel-caption d-none d-md-block">
                        <p class="ad-item-name">${item.name}</p>
                        <p class="ad-item-price">$${item.price}</p>
                    </div>
                `;
        carousel.appendChild(carouselItem);
    });
}

// 隨機選取指定數量的商品
function getRandomItems(itemList, count) {
    const shuffled = itemList.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 顯示商品詳細資料
function showItemDetails(itemId) {
    const item = itemList.find(i => i.id == itemId);
    const detailModal = document.getElementById('detail-modal');
    detailModal.innerHTML = `
                <div class="modal-content">
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    <img src="${item.pic}" class="img-fluid" alt="${item.name}">
                    <p class="detail-name">${item.name}</p><br>
                    <p class="detail-price">$${item.price} | ⭐ ${calculateAverageStars(item.stars)}</p>
                    <p class="detail-rating">(${item.stars.length} 評分)</p>
                    <p>${item.info}</p>
                    <div class="d-flex">
                        <button class="btn btn-secondary" id="decreaseQty">-</button>
                        <input type="number" id="quantity" value="1" class="form-control w-25 mx-2">
                        <button class="btn btn-secondary" id="increaseQty">+</button>
                    </div>
                    <button class="btn btn-primary mt-3" onclick="addToCart(${item.id})">加入購物車</button>
                    <p>評論區</p>
                    <ul id="comments-list">
                        ${item.comments.map(c => `<li><p class="comment-username">${c.username}</p>: ${c.content}</li>`).join('')}
                    </ul>
                </div>
            `;
    new bootstrap.Modal(document.getElementById('detail')).show();
}

// 增加商品數量
document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'increaseQty') {
        const qtyInput = document.getElementById('quantity');
        qtyInput.value = parseInt(qtyInput.value) + 1;
    } else if (event.target && event.target.id === 'decreaseQty') {
        const qtyInput = document.getElementById('quantity');
        if (qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    }
});

// 加入購物車
function addToCart(itemId) {
    alert(`商品 ID ${itemId} 已加入購物車！`);
}