const USER_API_URL = "https://67487d245801f515359120d0.mockapi.io/users/";
const ITEM_API_URL = "https://67487d245801f515359120d0.mockapi.io/item/";

let userData;

// 檢查登入狀態
window.onload = async function () {
    checkLoginStatus();

    // 設置會員資料
    setMemberData();

    // 載入歷史訂單
    await loadOrderHistory();

    // 側選欄切換功能
    $(".menu-item").on("click", function () {
        $(".menu-item").removeClass("active");
        $(this).addClass("active");

        const sectionToShow = $(this).data("section");
        $("section").removeClass("show").addClass("hide");
        $(`#${sectionToShow}`).removeClass("hide").addClass("show");
    });
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

function setMemberData() {
    $("#userid").text(userData.userid);
    $("#username").text(userData.name);
    const registerDate = new Date(userData.create).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
    $("#register-time").text(registerDate);
}

async function loadOrderHistory() {
    const response = await fetch(`${USER_API_URL}${userData.id}`);
    const result = await response.json();

    const records = result.record.sort((a, b) => b.time - a.time); // 新至舊排序
    const orderList = $("#order-list");
    orderList.empty();

    records.forEach(record => {
        const orderTime = new Date(record.time).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
        const items = record.order.map(item => `商品ID: ${item[0]}, 數量: ${item[1]}`).join("<br>");
        orderList.append(`<li>
            <strong>訂單時間：</strong>${orderTime}<br>
            <strong>訂單內容：</strong><br>${items}
        </li>`);
    });
}

$(document).ready(() => {
    $(document).on('click', '#back', function () {
        window.location = 'index.html';
    });
});
