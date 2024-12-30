
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
            orderList[`${item.id}`] += parseInt(count);
        }
        else {
            orderList[`${item.id}`] = parseInt(count);
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