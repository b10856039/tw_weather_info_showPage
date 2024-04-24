# Side Project 臺灣氣象查詢 - 前端展示網頁
此專案為透過Vue3.js建置前端網頁伺服器供使用者進行臺灣的氣象資訊查看。
目前已在Vercel進行上線，可透過以下網址前往前端網頁進行使用。

[臺灣氣象查詢](https://tw-weather-info-show-page.vercel.app/ "link")

## 開發規格與環境說明

### 開發環境
 * 作業系統 Window 10/11
 * 開發工具 Visual Studio Code 1.88.1 
 * 環境框架 Node.js 16.13.1
   
### 系統語言
 * Javascript ES6
   
### 系統套件

* 上線環境
   * vue 3.3.4
   * vue-router 4.2.4
   * fortawesome/fontawesome-svg-core 6.5.1,
   * fortawesome/free-brands-svg-icons 6.5.1
   * fortawesome/free-regular-svg-icons 6.5.1
   * fortawesome/free-solid-svg-icons 6.5.1
   * fortawesome/vue-fontawesome 3.0.6
   * chart.js 4.4.0
   * chartjs-plugin-datalabels 2.2.0
   * d3 7.8.5

* 開發環境
    * @babel/core 7.24.4
    * @babel/preset-env 7.24.4
    * @vitejs/plugin-vue 4.3.4
    * @vitejs/plugin-vue-jsx 3.0.2
    * babel-loader 9.1.3
    * css-loader 7.0.0
    * node-sass 9.0.0
    * sass 1.69.5
    * sass-loader 13.3.3
    * style-loader 3.3.4
    * terser-webpack-plugin 5.3.10
    * vite 4.4.9
    * vue-loader 17.4.2
    * vue-template-compiler 2.7.16
    * webpack 5.91.0
    * webpack-cli 5.1.4
    * gsap 3.12.5
   
### 雲端部署
 * 部署環境 Vercel

## 建置流程
1. 使用 git clone 或是 直接下載github的檔案。
2. 在有package.json的路徑使用template輸入並執行
   ``` XML
   npm install
   ```
   下載所需套件。
4. 找到.env檔案，將內部的config進行設定。
5. 在有index.js的路徑使用template輸入並執行
   ``` XML
   npm run dev
   ```
   即可啟動伺服器。

## 網頁功能說明

### 天氣地圖
天氣地圖頁面提供使用者以下功能協助進行氣象查詢 :
* 提供縣市地圖與鄉鎮詳細地圖介面。
* 直接點擊地區區塊獲取該區域氣象。
* 具有下拉式選單挑選地區
* 可透過定位功能直接查詢目前位置氣象，備註: 手機定位精準，電腦定位較差。
* 顯示地區氣象後可點選星號圖示加入或取消到個人氣象頁面儲存。

### 個人氣象
個人氣象頁面提供使用者直接查看儲存的地區氣象，本頁提供以下功能 :
* 可查詢儲存的地區資料，查詢方式 : "台北市"、"台北市中正區"、"台北市 中正區"、"中正區"
* 具有頁碼功能，不會一次顯示過多地區氣象資料
* 可透過點選星號圖示取消個人氣象頁面的資料
