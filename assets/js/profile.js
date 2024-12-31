const USER_API_URL = "https://67487d245801f515359120d0.mockapi.io/users/";
const ITEM_API_URL = "https://67487d245801f515359120d0.mockapi.io/item/";

let userData;
let userRecords;
let itemList; 

// 檢查登入狀態
window.onload = async function () {
    checkLoginStatus();
    await getItems();

    // 設置會員資料
    await setMemberData();
    $("#member-data").show();

    // 載入歷史訂單
    loadOrderHistory();


};

function checkLoginStatus() {
    const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));
    if (!userCookie) {
        window.location = 'login.html?origin=profile.html';
        return;
    }
    userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    if (Date.now() > userData.expiry) {
        window.location = 'login.html?origin=profile.html';
    }
}

async function getItems() {
    const response = await fetch(ITEM_API_URL);
    const result = await response.json();
    itemList = Object.fromEntries(result.map(i => [i.id, i]));
}

async function setMemberData() {
    $("#userid").val(userData.userid);
    $("#username").val(userData.name);
    const registerDate = new Date(userData.create).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
    $("#register-time").val(registerDate);
    const response = await fetch(`${USER_API_URL}${userData.id}`);
    const result = await response.json();
    userRecords = result.record.sort((a, b) => b.time - a.time); // 新至舊排序
    $("#order-count").val(userRecords.length);
    $("#history-total-price").val(calcHistoryTotalPrice());
}

function calcHistoryTotalPrice() {
    let totalPrice = 0;
    for (let record of userRecords) {
        totalPrice += record.payment;
    }
    return totalPrice;
}

function loadOrderHistory() {
    const orderList = $("#order-list");
    orderList.empty(); // 清空現有的訂單列表
    if (userRecords.length === 0) {
        $("#order-none").show();
        return;
    }

    for (let record of userRecords) {
        const orderTime = new Date(record.time).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
        let paymentNameCol = '';
        let paymentCountCol = '';
        let paymentPriceCol = '';
        let totalPayment = 0;

        for (let [itemID, count] of record.order) {
            itemID = String(itemID);
            let item = itemList[itemID];
            if (item) {
                paymentNameCol += `<p>${item.name}</p>`;
                paymentCountCol += `<p>x${count}</p>`;
                let itemTotalPrice = item.price * count;
                paymentPriceCol += `<p>$${itemTotalPrice}</p>`;
                totalPayment += itemTotalPrice;
            } else {
                console.error(`Item with ID ${itemID} not found in itemList`);
            }
        }

        const orderItemHTML = `
            <div class="order-item">
                <div class="order-time-ctn">
                    <p class="order-id">P${record.orderid}</p>
                    <p class="order-date">${orderTime}</p>
                </div>
                <hr>
                <div class="order-payment-ctn">
                    <div class="payment-name-col">
                        ${paymentNameCol}
                    </div>
                    <div class="payment-count-col">
                        ${paymentCountCol}
                    </div>
                    <div class="payment-price-col">
                        ${paymentPriceCol}
                    </div>
                </div>
                <hr>
                <p class="order-total-price">總金額：$${totalPayment}</p>
            </div>
        `;

        orderList.append(orderItemHTML);
    }
}

function logout() {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location = 'login.html';
}

$(document).ready(() => {
    $(document).on('click', '#back', function () {
        window.location = 'index.html';
    });

    // 目錄選擇
    $(".menu-item").on("click", function () {
        $(".menu-item").removeClass("blue");
        $(this).addClass("blue");

        var sct = $(this).data("section");
        $("section").hide();
        $(`#${sct}`).show();
    });

    $("#fake-btn").on("click", function () {
        $("#issue-tips-bg").show();
    });

    $("#log-out").on("click", function () {
        logout();
    });

    $(document).on('click', '#issue-tips-cls', function () {
        $('#issue-tips-bg').hide();
    });
});
