
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
    $("#cart-tips-bg div").removeClass("alert-danger");
    try {
        let count = parseInt($(`#quantity`).val());
        count %= 200000;
        if (count < 1) {
            tipsCtn.text("請輸入合理的數量。");
            $("#cart-tips-bg div").addClass("alert-danger");
            tipsBg.show();
            $(`#quantity`).val(1);
            return;
        }
        else if (orderList[`${item.id}`]) {
            orderList[`${item.id}`][1] += count;
        }
        else {
            orderList[`${item.id}`] = [item.id, count];
        }
        saveAsCookie(orderList);
        tipsCtn.text("你添加了 " + count + " 個" + item.name + "！");
        $("#cart-tips-bg div").addClass("alert-success");
        tipsBg.show();
        $(`#quantity`).val(count);
    } catch (error) {
        tipsCtn.text("發生未知錯誤。");
        $("#cart-tips-bg div").addClass("alert-danger");
        tipsBg.show();
        console.error(error);
    }
}





