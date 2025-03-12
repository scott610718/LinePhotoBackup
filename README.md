# LinePhotoBackup
設計一個能夠與LINE官方帳號連結並自動備份群組相簿的網站。
LINE群組相簿備份工具部署指南
這個工具可以連接您的LINE官方帳號，並將群組相簿自動備份到Google雲端硬碟。以下是部署與設定步驟。
部署到GitHub Pages

在GitHub創建一個新的儲存庫
將以下檔案上傳到儲存庫：

index.html
styles.css
app.js


在儲存庫設定中啟用GitHub Pages：

前往儲存庫 → Settings → Pages
Source選擇"main"分支
點擊"Save"按鈕



LINE官方帳號設定
您需要在LINE Developer Console建立一個LINE官方帳號應用程式：

前往 LINE Developers Console
創建一個新的Provider (如果尚未有)
創建一個Messaging API Channel
獲取以下資訊：

Channel ID
Channel Secret
Channel Access Token (長期有效的)


在Messaging API設定中，確保以下功能已啟用：

群組/聊天室成員資訊取得
相簿內容取得權限



Google API設定
您需要在Google Cloud Platform設定API存取：

前往 Google Cloud Console
創建一個新專案
啟用Google Drive API
創建OAuth同意畫面

設定應用程式名稱
添加必要的範圍 (https://www.googleapis.com/auth/drive)


創建OAuth客戶端ID

應用程式類型選擇"Web應用程式"
添加授權的JavaScript來源 (您的GitHub Pages URL)
添加授權重定向URI (您的GitHub Pages URL)


創建API金鑰

使用說明

第一步：LINE設定

輸入您的Channel ID、Channel Secret和Channel Access Token
點擊"儲存LINE設定"按鈕


第二步：Google設定

輸入您的Client ID和API Key
點擊"授權Google帳號"按鈕
在彈出的視窗中登入並授權您的Google帳號


第三步：執行備份

點擊"載入群組列表"按鈕來獲取可用的LINE群組
選擇要備份的群組
指定Google雲端硬碟的目錄名稱 (可選)
點擊"開始備份"按鈕
在進度條和日誌中查看備份進度



注意事項

安全性考量

所有設定資料僅儲存在瀏覽器本地，不會傳送至任何第三方伺服器
請勿與他人共享您的設定或API金鑰
建議定期更新您的API金鑰和Token


限制說明

由於GitHub Pages是靜態網站，實際的API請求需通過代理服務或雲端函數處理
當前實現是前端模擬，實際部署時需要額外的後端服務支持


進階設定

若需要完整功能，建議使用Firebase或其他支持後端功能的服務
可使用GitHub Actions自動部署



疑難排解
若在使用過程中遇到問題：

LINE API連接問題

確認Token是否有效
檢查Channel是否啟用了正確的權限


Google Drive連接問題

確認API金鑰和Client ID是否正確
檢查OAuth同意畫面是否包含正確的範圍


備份失敗

檢查網路連接
查看控制台錯誤日誌
確認Google帳號有足夠空間
