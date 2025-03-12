// app.js
document.addEventListener('DOMContentLoaded', function() {
    // 常數定義
    const CONFIG_STORAGE_KEY = 'lineAlbumBackupConfig';
    
    // DOM元素
    const saveLineConfigBtn = document.getElementById('saveLineConfig');
    const authorizeGoogleBtn = document.getElementById('authorizeGoogle');
    const loadGroupsBtn = document.getElementById('loadGroups');
    const startBackupBtn = document.getElementById('startBackup');
    const groupSelect = document.getElementById('groupSelect');
    const backupProgress = document.getElementById('backupProgress');
    const backupStatus = document.getElementById('backupStatus');
    const backupLog = document.getElementById('backupLog');
    const googleAuthStatus = document.getElementById('googleAuthStatus');
    
    // 載入已儲存的設定
    loadSavedConfig();
    
    // 事件監聽器設定
    saveLineConfigBtn.addEventListener('click', saveLineConfig);
    authorizeGoogleBtn.addEventListener('click', initGoogleAuth);
    loadGroupsBtn.addEventListener('click', loadGroupList);
    startBackupBtn.addEventListener('click', startBackupProcess);
    
    // 儲存LINE設定到本地儲存
    function saveLineConfig() {
        const channelId = document.getElementById('lineChannelId').value.trim();
        const channelSecret = document.getElementById('lineChannelSecret').value.trim();
        const accessToken = document.getElementById('lineAccessToken').value.trim();
        
        if (!channelId || !channelSecret || !accessToken) {
            showMessage(backupStatus, '請填寫所有LINE設定欄位', 'danger');
            return;
        }
        
        const config = getConfig();
        config.line = {
            channelId,
            channelSecret,
            accessToken
        };
        
        saveConfig(config);
        showMessage(backupStatus, 'LINE設定已儲存', 'success');
        
        // 切換到下一個標籤
        const googleTab = document.getElementById('google-tab');
        const tabTrigger = new bootstrap.Tab(googleTab);
        tabTrigger.show();
    }
    
    // 初始化Google驗證
    function initGoogleAuth() {
        const clientId = document.getElementById('googleClientId').value.trim();
        const apiKey = document.getElementById('googleApiKey').value.trim();
        
        if (!clientId || !apiKey) {
            showMessage(backupStatus, '請填寫所有Google設定欄位', 'danger');
            return;
        }
        
        const config = getConfig();
        config.google = {
            clientId,
            apiKey,
            isAuthorized: false
        };
        
        saveConfig(config);
        
        // 載入Google客戶端API
        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: apiKey,
                clientId: clientId,
                scope: 'https://www.googleapis.com/auth/drive',
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            }).then(() => {
                // 監聽驗證狀態變化
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
                
                // 處理當前驗證狀態
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                
                // 驗證用戶
                gapi.auth2.getAuthInstance().signIn();
            }).catch(error => {
                console.error('Google API初始化錯誤:', error);
                showMessage(backupStatus, '無法初始化Google API: ' + error.details, 'danger');
            });
        });
    }
    
    // 更新登入狀態
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            const config = getConfig();
            config.google.isAuthorized = true;
            saveConfig(config);
            
            googleAuthStatus.classList.remove('d-none');
            showMessage(backupStatus, '已成功連接到Google帳號', 'success');
            
            // 切換到執行備份標籤
            const backupTab = document.getElementById('backup-tab');
            const tabTrigger = new bootstrap.Tab(backupTab);
            tabTrigger.show();
        } else {
            googleAuthStatus.classList.add('d-none');
            showMessage(backupStatus, '尚未連接到Google帳號', 'warning');
        }
    }
    
    // 載入群組列表
    function loadGroupList() {
        const config = getConfig();
        
        if (!config.line || !config.line.accessToken) {
            showMessage(backupStatus, '請先完成LINE設定', 'danger');
            return;
        }
        
        showMessage(backupStatus, '正在載入群組列表...', 'info');
        logMessage('正在從LINE取得群組列表...');
        
        // 這裡是模擬從LINE API獲取群組的操作
        // 實際實現需使用LINE Messaging API請求
        // 由於GitHub Pages限制，實際上我們無法在前端直接調用LINE API，這裡僅做示意
        
        // 模擬API調用延遲
        setTimeout(() => {
            // 模擬資料
            const groups = [
                { id: 'group1', name: '家庭群組' },
                { id: 'group2', name: '工作團隊' },
                { id: 'group3', name: '朋友聚會' }
            ];
            
            // 清空下拉選單
            groupSelect.innerHTML = '';
            
            // 添加選項
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                groupSelect.appendChild(option);
            });
            
            startBackupBtn.disabled = false;
            showMessage(backupStatus, '群組列表已載入，請選擇要備份的群組', 'success');
            logMessage('已成功載入群組列表，找到 ' + groups.length + ' 個群組');
        }, 1500);
    }
    
    // 開始備份過程
    function startBackupProcess() {
        const groupId = groupSelect.value;
        const folderName = document.getElementById('folderName').value.trim() || 'LINE群組相簿備份_' + new Date().toISOString().slice(0, 10);
        
        if (!groupId) {
            showMessage(backupStatus, '請選擇要備份的群組', 'danger');
            return;
        }
        
        const config = getConfig();
        if (!config.google || !config.google.isAuthorized) {
            showMessage(backupStatus, '請先授權Google帳號', 'danger');
            return;
        }
        
        showMessage(backupStatus, '開始備份過程...', 'info');
        backupProgress.classList.remove('d-none');
        backupLog.classList.remove('d-none');
        updateProgress(5);
        
        logMessage('開始備份 "' + groupSelect.options[groupSelect.selectedIndex].text + '" 的相簿');
        logMessage('備份目標: Google雲端硬碟 /' + folderName);
        
        // 步驟1: 創建Google Drive文件夾
        simulateStep('正在Google雲端硬碟建立目錄: ' + folderName, 10, () => {
            // 步驟2: 獲取相簿中的照片列表
            simulateStep('正在取得相簿照片列表...', 30, () => {
                // 這裡應該實際呼叫LINE API獲取照片列表
                const photosCount = Math.floor(Math.random() * 20) + 5; // 模擬5-25張照片
                logMessage('找到 ' + photosCount + ' 張照片需要備份');
                
                // 步驟3: 下載每張照片並上傳
                let completedPhotos = 0;
                
                // 模擬每張照片的處理
                const photoInterval = setInterval(() => {
                    completedPhotos++;
                    const photoProgress = 30 + Math.round((completedPhotos / photosCount) * 60);
                    logMessage('已處理照片 ' + completedPhotos + '/' + photosCount);
                    updateProgress(photoProgress);
                    
                    if (completedPhotos >= photosCount) {
                        clearInterval(photoInterval);
                        
                        // 完成備份
                        simulateStep('備份完成！所有照片已成功儲存到Google雲端硬碟', 100, () => {
                            showMessage(backupStatus, '備份完成！', 'success');
                            logMessage('備份過程完成，檔案已儲存至 Google雲端硬碟/' + folderName);
                        });
                    }
                }, 500);
            });
        });
    }
    
    // 模擬執行步驟
    function simulateStep(message, progressValue, callback) {
        logMessage(message);
        updateProgress(progressValue);
        setTimeout(callback, 1000);
    }
    
    // 更新進度條
    function updateProgress(value) {
        const progressBar = backupProgress.querySelector('.progress-bar');
        progressBar.style.width = value + '%';
        progressBar.setAttribute('aria-valuenow', value);
    }
    
    // 顯示訊息
    function showMessage(element, message, type) {
        element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
    
    // 添加日誌訊息
    function logMessage(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `<span class="text-muted">[${timestamp}]</span> ${message}`;
        backupLog.appendChild(logEntry);
        backupLog.scrollTop = backupLog.scrollHeight;
    }
    
    // 獲取儲存的設定
    function getConfig() {
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        return savedConfig ? JSON.parse(savedConfig) : {};
    }
    
    // 儲存設定
    function saveConfig(config) {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
    
    // 載入已儲存的設定
    function loadSavedConfig() {
        const config = getConfig();
        
        // 填入LINE設定
        if (config.line) {
            document.getElementById('lineChannelId').value = config.line.channelId || '';
            document.getElementById('lineChannelSecret').value = config.line.channelSecret || '';
            document.getElementById('lineAccessToken').value = config.line.accessToken || '';
        }
        
        // 填入Google設定
        if (config.google) {
            document.getElementById('googleClientId').value = config.google.clientId || '';
            document.getElementById('googleApiKey').value = config.google.apiKey || '';
            
            if (config.google.isAuthorized) {
                googleAuthStatus.classList.remove('d-none');
            }
        }
    }
});
