const API_BASE_URL = "https://67487d245801f515359120d0.mockapi.io/users";
const bcrypt = dcodeIO.bcrypt;

// 加密器
async function encoder(password) {
    const saltRounds = 1;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
}

// 註冊功能
async function register() {
    const username = document.getElementById("usernick").value;
    const userid = document.getElementById("userid").value;
    const userpasswd = document.getElementById("userpasswd").value;
    const passwordConfirm = document.getElementById("password_confirm").value;
    const failBg = document.getElementById("rg-failed-bg");
    const failCtn = document.getElementById("rg-failed-ctn");


    // 驗證帳號ID格式
    const userIdRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,16}$/;
    if (!userIdRegex.test(userid)) {
        failCtn.innerHTML = "帳號ID需為 6~16 位，包含小寫英文字母與數字。"
        failBg.style.display = 'block';
        document.getElementById("userid").value = "";
        return;
    }

    // 驗證密碼格式
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    if (!passwordRegex.test(userpasswd)) {
        failCtn.innerHTML = "密碼需為 8~20 位，包含大小寫英文字母、數字及特殊符號。"
        failBg.style.display = 'block';
        document.getElementById("userpasswd").value == "";
        document.getElementById("password_confirm").value == "";
        return;
    }

    // 確認密碼一致
    if (userpasswd !== passwordConfirm) {
        failCtn.innerHTML = "密碼與確認密碼不一致！"
        failBg.style.display = 'block';
        document.getElementById("userpasswd").value == "";
        document.getElementById("password_confirm").value == "";
        return;
    }

    // 檢查帳號ID是否重複
    const response = await fetch(`${API_BASE_URL}?userid=${userid}`);
    if (response.status !== 404) {

        const userDataList = (await response.json());
        for (var i = 0; i < userDataList.length; i++) {
            if (userData[i].userid == userid) {
                failCtn.innerHTML = "此帳號ID已被使用！"
                failBg.style.display = 'block';
                return;
            }
        }

    }

    // 加密密碼並註冊
    const hashedPassword = await encoder(userpasswd);
    const userData = {
        createdAt: Date.now(),
        name: username,
        record: [],
        userid: userid,
        passwd: hashedPassword
    };

    const registerResponse = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    if (registerResponse.ok) {
        alert("註冊成功！");
        location.reload();
    } else {
        console.error(await registerResponse.text());
    }
}

// 登入功能
async function login() {
    const status = false;
    const loginid = document.getElementById("loginid").value;
    const loginidpasswd = document.getElementById("loginidpasswd").value;
    const failBg = $("#lg-failed-bg");
    const failCtn = $("#lg-failed-ctn");

    // 檢查 hCaptcha
    if (!(await verifyCaptcha())) {
        failCtn.text("請完成 hCaptcha 驗證！");
        $("#lg-failed-bg div").addClass("alert-danger")
        failBg.show();
        return;
    }

    // 查詢是否有此帳號ID
    const response = await fetch(`${API_BASE_URL}?userid=${loginid}`);
    // 沒有就不給登入
    if (response.status === 404) {
        failCtn.text("請輸入正確的帳號ID或密碼！");
        $("#lg-failed-bg div").addClass("alert-danger")
        failBg.show();
        $('#loginid').val("");
        $('#loginidpasswd').val("");
        return;
    }


    const userDataList = (await response.json());
    // 因為此API的篩選機制並非完全一致，而是有包含在內就加入清單，所以要再次比對
    // 例如篩選"a"，所有包含"a"的帳號ID都會被篩選出來
    // 但篩選出的帳號清單仍較短，所以效率會更快
    for (var i = 0; i < userDataList.length; i++) {
        // 驗證密碼與帳號ID
        if ((bcrypt.compareSync(loginidpasswd, userDataList[i].passwd)) & (loginid == userDataList[i].userid)) {
            // 用Cookie建立登入效期並儲存用戶資料，需要用到時就能拿來用
            const userCookie = {
                id: userDataList[i].id,
                name: userDataList[i].name,
                userid: userDataList[i].userid,
                expiry: Date.now() + 900000
            };
            document.cookie = `user=${encodeURIComponent(JSON.stringify(userCookie))}; path=/;`;

            // 導向至原來的頁面
            var queryString = window.location.search;
            var params = new URLSearchParams(queryString);
            if (params.has("origin")) {
                var origin = params.get("origin");
                window.location = origin;
            } else {
                window.location = 'index.html'
            }
            status = true;
        }
    }
    // 密碼或帳號ID錯了
    // 現在大多數網站不會告訴你輸錯的是帳號ID還是密碼，不是我在偷懶
    if (!status) {
        failCtn.text("請輸入正確的帳號ID或密碼！");
        $("#lg-failed-bg div").addClass("alert-danger")
        failBg.show();
        $('#loginid').val("");
        $('#loginidpasswd').val("");
    }
}

// 檢查登入狀態
function checkLoginStatus() {
    const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));
    if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        // 過期了就初始化Cookie
        if (Date.now() > userData.expiry) {
            document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        } // 沒過期就導向原頁面
        else {
            var queryString = window.location.search;
            var params = new URLSearchParams(queryString);
            if (params.has("origin")) {
                var origin = params.get("origin");
                window.location = origin;
            } else {
                window.location = 'index.html'
            }
        }
    }
}

// 驗證 hCaptcha
async function verifyCaptcha() {
    const hCaptchaToken = document.querySelector('#h-captcha-response-lg').value;

    // 不得已而為之
    if (!hCaptchaToken) {
        return false;
    }
    return true;


}

function setCaptchaToken(token) {
    document.getElementById('h-captcha-response-lg').value = token;
}

function resetCaptcha() {
    if (window.hcaptcha) {
        hcaptcha.reset();
        document.getElementById('h-captcha-response-lg').value = ""; // 清空舊的 token
    }
}