const USER_API_URL = "https://67487d245801f515359120d0.mockapi.io/users/";
const ITEM_API_URL = "https://67487d245801f515359120d0.mockapi.io/item/";

let userData;
let userRecords;
let itemList;
let orderList = {};

// 檢查登入狀態
window.onload = async function () {
    checkLoginStatus();
    loadOrderList()
    await getItems();
    showCartList();
    await getUserRecords();
};

function checkLoginStatus() {
    const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));
    if (!userCookie) {
        window.location = 'login.html?origin=purchase.html';
        return;
    }
    userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    if (Date.now() > userData.expiry) {
        window.location = 'login.html?origin=purchase.html';
    }
}

function loadOrderList() {
    const orderCookie = document.cookie.split("; ").find(row => row.startsWith("order="));
    if (!orderCookie) {
        saveAsCookie(orderList);
        return;
    }
    orderList = JSON.parse(decodeURIComponent(orderCookie.split("=")[1]));
}

function saveAsCookie(orderList) {
    orderList = Object.fromEntries(
        Object.entries(orderList).filter(([itemID, [id, count]]) => count > 0)
    );
    document.cookie = `order=${encodeURIComponent(JSON.stringify(orderList))}; path=/;`;
}

async function getItems() {
    const response = await fetch(ITEM_API_URL);
    const result = await response.json();
    itemList = Object.fromEntries(result.map(i => [i.id, i]));
}

async function getUserRecords() {
    const response = await fetch(`${USER_API_URL}${userData.id}`);
    const result = await response.json();
    userRecords = result.record;
}

function showCartList() {
    const cartList = $("#cart-list");
    const cartNone = $("#cart-none");
    const cartBtnCtn = $("#cart-btn-ctn");
    const cartTotalPrice = $("#cart-total-price");

    cartList.empty(); // 清空現有的購物車列表
    console.log(orderList);

    if (Object.keys(orderList).length == 0) {
        console.log("empty");
        cartNone.show();
        $("#cart-btns").removeClass("justify-content-between");
        $("#cart-btns").addClass("justify-content-center");
        $("#ctp-p").text("");
        cartBtnCtn.hide();
        return;
    } else {
        cartNone.hide();
        cartBtnCtn.show();
    }

    let totalPrice = 0;

    for (let [itemID, [id, count]] of Object.entries(orderList)) {
        itemID = String(itemID);
        const item = itemList[itemID];
        const itemTotalPrice = item.price * count;
        totalPrice += itemTotalPrice;

        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.pic}" alt="${item.name}"
                    onerror="this.onerror=null;this.src='../assets/img/err${item.id % 2}.webp';" class="cart-item-img">
                <div class="cart-item-ctn">
                    <div class="item-info">
                        <p class="item-name">${item.name}</p>
                        <p class="item-price">$${item.price}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-secondary delQty" data-item="${itemID}">-</button>
                        <input type="number" value="${count}" class="form-control qty" min="0" data-item="${itemID}">
                        <button class="btn btn-secondary addQty" data-item="${itemID}">+</button>
                    </div>
                </div>
                <p class="item-total-price" data-item="${itemID}">$${itemTotalPrice}</p>
            </div>
            <hr>
        `;

        cartList.append(cartItemHTML);


    }

    cartTotalPrice.text(`$${totalPrice}`);

    $(".delQty").click(function () {
        const itemID = $(this).data("item");
        const qtyInput = $(`input[data-item='${itemID}']`);
        let count = parseInt(qtyInput.val());
        if (count > 0) {
            count--;
            qtyInput.val(count);
            updateItemTotalPrice(itemID, count);
        }
    });

    $(".addQty").click(function () {
        const itemID = $(this).data("item");
        const qtyInput = $(`input[data-item='${itemID}']`);
        let count = parseInt(qtyInput.val());
        count++;
        qtyInput.val(count);
        updateItemTotalPrice(itemID, count);
    });

    $('.qty').on('input', function () {
        const itemID = $(this).data("item");
        const qtyInput = $(`input[data-item='${itemID}']`);
        let count = parseInt(qtyInput.val());
        if (String(count) === "NaN" || count < 0) {
            count = 0;
        }
        qtyInput.val(count);
        updateItemTotalPrice(itemID, count);
    });
}

function updateItemTotalPrice(itemID, count) {
    const item = itemList[itemID];
    const itemTotalPrice = item.price * count;
    $(`.item-total-price[data-item='${itemID}']`).text(`$${itemTotalPrice}`);
    orderList[itemID][1] = count;
    updateCartTotalPrice();
}

function updateCartTotalPrice() {
    let totalPrice = 0;
    for (let [itemID, [id, count]] of Object.entries(orderList)) {
        const item = itemList[itemID];
        totalPrice += item.price * count;
    }
    $("#cart-total-price").text(`$${totalPrice}`);
}

function createOrderId() {
    var date = new Date();
    var year = date.getFullYear();
    var day = parseInt((date.getTime() - Date.parse(year)) / 86400000);
    day = String(day).padStart(3, "0");
    

    // 取時間戳的xxxx.xx秒
    // 一小時只有3600秒，所以不會重複
    var time = date.getTime().toString().slice(5, 12);

    var orderId = String(year).slice(-1)+day+time;

    return orderId;
}

function saveOrderRecord() {
    const orderTime = Date.now();
    const payment = parseInt($("#cart-total-price").text().slice(1));
    const order = Object.entries(orderList).filter(([itemID, [id, count]]) => count >= 1).map(([itemID, [id, count]]) => [parseInt(itemID), count]);
    const orderId = createOrderId();
    if (payment == 0) {
        alert("選購數量必須為大於0的整數。");
        orderList = {};
        showCartList();
        saveAsCookie(orderList);
        return;
    }
    const newRecord = {
        orderid: orderId,
        time: orderTime,
        payment: payment,
        order: order
    }

    userRecords.push(newRecord);
    return orderId;
}

async function updateUserData(orderId) {
    try {
        const response = await fetch(`${USER_API_URL}${userData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ record: userRecords })
        });

        if (!response.ok) {
            if (response.status >= 500) {
                alert('伺服器錯誤，請稍後再試。');
            } else if (response.status >= 400) {
                alert('下單失敗，請檢查您的選購數量是否正確。');
            } else {
                alert(`發生未知錯誤: ${response.statusText}`);
            }
        }
        else {
            $("#cart").hide();
            $("#order-id").text("P" + orderId);
            $("#submit").show();
            orderList = {};
            showCartList();
            saveAsCookie(orderList);
            return;
        }
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            alert('無法連接到伺服器，請檢查您的網路連接。');
        } else {
            alert(`發生未知錯誤: ${error.message}`);
        }
    }
}

$(document).ready(() => {

    $("#clear-btn").click(function () {
        orderList = {};
        showCartList();
        saveAsCookie(orderList);
    });

    $("#purchase-btn").click(async function () {
        var orderId = saveOrderRecord();
        await updateUserData(orderId);
    });

    $(".back-btn").click(function () {
        saveAsCookie(orderList);
        window.location.href = "index.html";
    });
})