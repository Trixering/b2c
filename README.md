# ABC早午餐

<font size=5>**網站介紹**</font>
這是一個會員制點餐系統。透過API，賣方可以在後端調整餐點資料，而不動到html架構；也可以實現帳號系統、評論評論系統、下單系統。

<font size=5>**網站之發想過程**</font>
想到元氣小豬的點餐系統，就自己做一個試試看

<font size=5>**網頁排版說明(CSS Layout)**</font>
💀
Bootstrap+組員一同寫出的屎山

<font size=5>**遇到的問題與解決方案**</font>
因為頁面是由組員分工、不同時間下完成的，所以在各函式中會看到各種雜亂的取值方式、迴圈方式等，為了避免因改動而出現的BUG (沒時間了)，就沒有做語法統一了。

因為我們圖片的使用量很大，所以採用了webp格式儲存圖片，這讓圖片的平均大小達到差不多`30kb`，縮短了圖片加載時長。

既然是點餐系統，99%的使用者會用手機點餐，所以塞了一堆`clamp()`、`flex-wrap`、`部分物件.hide()`適配手機尺寸。


## 登入系統
在進入主頁面、結帳頁面、會員頁面後，會調用`checkLoginStatus()`檢查登入狀態，如果登入期限已過，就會導向`login.html?origin=原頁面`，要求使用者登入；要是在已登入狀態瀏覽`login.html`，也會重新導向回`index.html`。

登入狀態是用Cookie實現的。
 - **註冊系統**：調用`register()`，包含格式驗證、帳號去重等一系列步驟
 - **登入系統**：調用`login()`，檢驗帳密真實性，建立登入效期
 - **機器人驗證**：使用`hCaptcha`給予的三個函式

## 主頁面 (點餐頁面)

**頁面載入時**
 - 調用`getItems()`：獲得餐點清單`itemList`；執行`showItems()`、`showAds()`以顯示頁面內容，並加上`click`監聽執行`showItemDetails(itemId)`開啟詳細區塊。

**選單列**
- `#search-bar`設置`input`監聽，實時執行`getItems()`以篩選餐點名稱
- `#cate-link`設置`input`監聽，跳轉頁面至選擇的分類

**餐點詳細區塊**
- 評分評論系統`addCommentStar(itemId)`
- **選購系統**`cart.js`
   - 載入時執行`loadOrderList()`獲得購物車`orderList`
   - 加入購物車`addToCart(item)`

## 購物車頁面 (結帳頁面)

**頁面載入時**
- `loadOrderList()`獲得購物車`orderList`
- `getItems()`獲得餐點清單`itemList`
- `loadOrderList()`獲得購物車`orderList`
- `showCartList()`顯示購買清單：設有數量上限
- `getUserRecords()`獲得會員歷史下單紀錄`orderList`

**事件監聽**
- `delQty`、`addQty`增減數量按鈕：會實時計算金額
- `.qty`數量輸入框：防止用戶輸入非合理數值
- 總金額為`0`時，`#purchase-btn`結帳按鈕不可按
- `#clear-btn`清空購物車並儲存
- `.back-btn`儲存當前購物車，返回點餐頁面

**結帳**
- `createOrderId()`產生一個訂單編號
- `updateUserData(orderId)`送出訂單，並儲存於歷史紀錄

## 會員中心


**頁面載入時**
- 獲得餐點清單`itemList`、會員資料`userData`
- `setMemberData()`獲取歷史紀錄`userRecords`，並顯示資料
- `loadOrderHistory()`建立訂單收據區塊

**事件監聽**
- `.menu-item`選擇要顯示的區塊，有色彩變化特效
- `#log-out`登出按鈕