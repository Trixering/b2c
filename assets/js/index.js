import { addToCart } from './cart.js';

export const USER_API_URL = "https://67487d245801f515359120d0.mockapi.io/users/";
export const ITEM_API_URL = "https://67487d245801f515359120d0.mockapi.io/item/";
export let userData;
export let itemList = [];

// 檢查登入狀態
window.onload = checkLoginStatus();
function checkLoginStatus() {
    const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));
    if (!userCookie) {
        window.location = 'login.html?origin=index.html';
        return;
    }
    userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    if (Date.now() > userData.expiry) {
        window.location = 'login.html?origin=index.html';
    }
    getItems();
}

// 獲取商品清單
async function getItems() {
    const response = await fetch(ITEM_API_URL);
    itemList = await response.json();
    showItems();
    showAds();
}

// 分類並按照定價由低至高排列，顯示商品
function showItems() {
    const categories = ['meal', 'single', 'desert', 'drink'];
    const search = document.getElementById('search-bar');
    const ad = document.getElementById('carousel-items');
    if (search.value != "") {
        ad.style.display = 'none';
    }
    else {
        ad.style.display = 'block';
    }

    for (let cate of categories) {
        const items = itemList.filter(item => item.cate == cate && (search.value ? item.name.includes(search.value) : true)).sort((a, b) => a.price - b.price);
        const cateContainer = document.getElementById(cate);
        const cateSection = document.getElementById(`${cate}-sct`);

        // 清空上次已載入的餐點
        cateContainer.innerHTML = "";

        for (let item of items) {
            const div = document.createElement('div');
            div.classList.add('item');
            div.innerHTML = `
                        <img src="${item.pic}" alt="${item.name}" class="img-fluid" onerror="this.onerror=null;this.src='../assets/img/err${item.id % 2}.png';">
                        <div class="info">
                            <p class="item-name">${item.name}</p>
                            <div class="item-pands">
                                <p class="item-price">＄${item.price}</p>
                                <p class="item-price">⭐${getAvgStars(item.stars)} &nbsp;(${getSartsNum(item.stars)})</p>
                            </div>
                        </div>
                    `;
            cateContainer.appendChild(div);
            // 點擊商品顯示詳細資訊
            div.addEventListener('click', () => showItemDetails(item.id));
        };

        if (cateContainer.childNodes.length == 0) {
            cateSection.style.display = 'none';
        }
        else {
            cateSection.style.display = 'block';
        }
    };
}

// 平均分
function getAvgStars(stars) {
    const total = Object.values(stars).reduce((sum, val) => sum + val, 0);
    return (total / Object.values(stars).length).toFixed(2);
}

function getSartsNum(stars) {
    return Object.values(stars).length;
}

// 廣告區塊
function showAds() {
    const randomItems = getRandomItems(3);
    const carouselInner = document.getElementById('carousel-inner');
    carouselInner.innerHTML = ''; // 清空舊的 carousel 內容

    randomItems.forEach((item, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
            carouselItem.classList.add('active');
        }
        carouselItem.innerHTML = `
                    <div class="ad-container">
                    <img src="${item.pic}" class="d-block" alt="${item.name}" onerror="this.onerror=null;this.src='../assets/img/err${item.id % 2}.png';">
                    <div class="carousel-caption d-md-block">
                        <p class="ad-item-name">${item.name}</p>
                        <p class="ad-item-price">$${item.price}</p>
                    </div></div>
                `;
        carouselItem.addEventListener('click', () => showItemDetails(item.id));
        carouselInner.appendChild(carouselItem);
    });
}

// 隨機選取指定數量的商品
function getRandomItems(count) {
    // 排除售罄的餐點
    const items = itemList.filter(item => item.display).sort((a, b) => a.price - b.price);
    const sample = items.sort(() => 0.5 - Math.random());
    return sample.slice(0, count);
}

// 顯示商品詳細資料
function showItemDetails(itemId) {
    const item = itemList.find(i => i.id == itemId);
    const detailModal = document.getElementById('detail-modal');
    detailModal.innerHTML = `
                <div class="modal-content gap-3 mb-5">
                    <button type="button" class="btn-close btn-lg position-absolute m-1" data-bs-dismiss="modal"></button>
                    <div class="d-flex gap-2">
                        <img src="${item.pic}" alt="${item.name}"
                            onerror="this.onerror=null;this.src='../assets/img/err${item.id % 2}.png';">
                        <div class="d-flex flex-column">
                            <p class="detail-name">${item.name}</p>
                            <p class="detail-price">$${item.price}</p>
                            <p class="detail-rating">⭐${getAvgStars(item.stars)} &nbsp;(${getSartsNum(item.stars)})</p>
                            <p>${item.info}</p>
                        </div>
                    </div>
                    <div id="cart-tips-bg" class="mt-2" style="display: none;">
                        <div class="alert alert-dismissible fade show m-0 px-3 py-2">
                            <span id="cart-tips-ctn"></span>
                            <a id="cart-tips-cls" class="link-secondary ms-2">Ｘ</a>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-secondary" id="delQty">-</button>
                        <input type="number" id="quantity" value="1" class="form-control">
                        <button class="btn btn-secondary" id="addQty">+</button>
                        <button id="add2cart" class="btn btn-primary">加入購物車</button>
                    </div>
                    <div>
                        <textarea id="comment" class="form-control" name="cmt" placeholder="選填..."></textarea>
                        <div id="rate-tips-bg" class="mt-2" style="display: none;">
                            <div class="alert alert-dismissible fade show m-0 px-3 py-2">
                                <span id="rate-tips-ctn"></span>
                                <a id="rate-tips-cls" class="link-secondary ms-2">Ｘ</a>
                            </div>
                        </div>
                        <div id="rating" class="d-flex align-items-center" value="0">
                            <div class="rating d-flex gap-1">
                                <span id="star-1" class="star"></span>
                                <span id="star-2" class="star"></span>
                                <span id="star-3" class="star"></span>
                                <span id="star-4" class="star"></span>
                                <span id="star-5" class="star"></span>
                            </div>
                            <button id="addcmt" class="btn btn-success">送出</button>
                        </div>
                    </div>
                    <div>
                        <p>評論區</p>
                        <ul id="comments-list" class="">
                            ${item.comments.sort((a, b) => b.time - a.time).map(c => `<li>
                                <p class="comment-username fs-5">${c.username}</p> ${c.content}
                            </li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

    $(`#addcmt`).click(() => addCommentStar(item.id));
    $(`#add2cart`).click(() => addToCart(item));
    new bootstrap.Modal(document.getElementById('detail')).show();
}

// 增加商品數量
document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'addQty') {
        const qtyInput = document.getElementById('quantity');
        qtyInput.value = parseInt(qtyInput.value) + 1;
    } else if (event.target && event.target.id === 'delQty') {
        const qtyInput = document.getElementById('quantity');
        if (qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    }
});


async function addCommentStar(itemId) {
    const tipsBg = $("#rate-tips-bg");
    const tipsCtn = $("#rate-tips-ctn");
    var rating = parseInt($('#rating').attr('value'))
    if (rating == 0) {
        tipsCtn.text("請先評分再送出。")
        $("#rate-tips-bg div").addClass("alert-warning")
        tipsBg.show();
        return;
    }
    var comment = $('#comment').val();
    const response = await fetch(ITEM_API_URL + itemId);
    var item = await response.json();
    var stars = item.stars;
    var comments = item.comments;
    stars[userData.userid] = rating;
    var submit = {
        stars: stars
    }
    if (comment.length > 0) {
        var commentDetail = {
            time: Date.now(),
            username: userData.name,
            content: comment.replace(/\n/g, " ")
        }
        comments.push(commentDetail);
        submit.comments = comments;
    }
    try {
        console.log(JSON.stringify(submit))
        const registerResponse = await fetch(ITEM_API_URL + itemId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submit)
        });
        if (registerResponse.ok) {
            tipsCtn.text("已送出！")
            $("#rate-tips-bg div").addClass("alert-success")
            tipsBg.show();
            getItems();
        } else {
            tipsCtn.text("發生未知錯誤。")
            $("#rate-tips-bg div").addClass("alert-danger")
            tipsBg.show();
            console.error(await registerResponse.text());
        }
    }
    catch {
        tipsCtn.text("發生未知錯誤。")
        $("#rate-tips-bg div").addClass("alert-danger")
        tipsBg.show();
        console.error(await registerResponse.text());

    }
}

