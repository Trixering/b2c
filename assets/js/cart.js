
let orderList = {};

window.onload = loadOrderList();
function loadOrderList() {
    const orderCookie = document.cookie.split("; ").find(row => row.startsWith("order="));
    if (!orderCookie) {
        saveAsCookie(orderList);
        return;
    }
    orderList = JSON.parse(decodeURIComponent(orderCookie.split("=")[1]));
}

function saveAsCookie(orderList) {
    document.cookie = `order=${encodeURIComponent(JSON.stringify(orderList))}; path=/;`;
}

// 加入購物車
export function addToCart(item) {
    const tipsBg = $("#cart-tips-bg");
    const tipsCtn = $("#cart-tips-ctn");
    try {
        let count = $(`#quantity`).val();
        if (orderList[`${item.id}`]) {
            orderList[`${item.id}`][1] += parseInt(count);
        }
        else {
            orderList[`${item.id}`] = [item.id,parseInt(count)];
        }
        saveAsCookie(orderList);
        tipsCtn.text("你添加了 " + count + " 個" + item.name + "！");
        $("#cart-tips-bg div").addClass("alert-success");
        tipsBg.show();
    } catch (error) {
        tipsCtn.text("發生未知錯誤。");
        $("#cart-tips-bg div").addClass("alert-danger");
        tipsBg.show();
        console.error(error);
    }
}

export function removeFromCart(itemID) {
    if (orderList[`${itemID}`]) {
        orderList[`${itemID}`] -= 1;
    }
    saveAsCookie(orderList);
}

function createOrderId() {
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" });
    const date = new Date(now);

    // 取YYYY的後1位
    const year = date.getFullYear().toString().slice(-1);

    // 取時間戳的8-11位
    const time = Date.now().toString().slice(8,12);

    // 隨機產生10-99的2位數
    const num = Math.floor(Math.random() * 90) + 10;
    const orderId = year + time + num;

    return orderId;
}

