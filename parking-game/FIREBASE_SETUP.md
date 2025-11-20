# Firebase 設定指南

## 🔥 為什麼使用 Firebase？

- ☁️ **雲端儲存** - 自定義關卡永久保存
- 🌐 **跨裝置同步** - 手機、平板、電腦都能存取同一關卡
- 👥 **未來擴展** - 方便日後加入分享關卡功能
- 🆓 **免費方案** - Firebase Spark Plan 足夠個人使用

## 📋 設定步驟

### 1. 創建 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或「Add project」
3. 輸入專案名稱（例如：`parking-game`）
4. 選擇是否啟用 Google Analytics（建議啟用）
5. 點擊「建立專案」

### 2. 註冊網頁應用程式

1. 在專案總覽頁面，點擊「網頁」圖示 `</>`
2. 輸入應用程式暱稱（例如：`Parking Game Web`）
3. **不要**勾選「設定 Firebase Hosting」（我們使用 GitHub Pages）
4. 點擊「註冊應用程式」

### 3. 複製 Firebase 配置

Firebase 會顯示類似以下的配置：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "parking-game-xxxxx.firebaseapp.com",
  projectId: "parking-game-xxxxx",
  storageBucket: "parking-game-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

### 4. 創建本地環境變數檔案

在專案根目錄 `parking-game/` 創建 `.env` 檔案：

```bash
cd parking-game
cp .env.example .env
```

然後編輯 `.env` 檔案，填入你的 Firebase 配置：

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=parking-game-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=parking-game-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=parking-game-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxx
```

### 5. 啟用 Firestore Database

1. 在 Firebase Console 左側選單，點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」（開發階段）
4. 選擇位置（建議選 `asia-east1` 或 `asia-southeast1`）
5. 點擊「啟用」

### 6. 設定 Firestore 安全規則（重要！）

在 Firestore Database 頁面，點擊「規則」標籤，替換為以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許所有人讀取和寫入 customLevels（開發階段）
    match /customLevels/{levelId} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ 生產環境建議**：日後加入使用者驗證後，改為：
```javascript
match /customLevels/{levelId} {
  allow read: if true;  // 所有人可讀取
  allow write: if request.auth != null;  // 僅登入使用者可寫入
}
```

點擊「發布」儲存規則。

### 7. GitHub Actions 環境變數設定

為了讓 GitHub Actions 自動部署時也能使用 Firebase：

1. 前往 GitHub 儲存庫 Settings → Secrets and variables → Actions
2. 新增以下 Repository secrets：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. 更新 `.github/workflows/deploy.yml`，在 build 步驟加入環境變數：

```yaml
- name: Build project
  run: npm run build
  working-directory: ./parking-game
  env:
    NODE_ENV: production
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
```

### 8. 重啟開發伺服器

```bash
# 停止目前的開發伺服器 (Ctrl+C)
npm run dev
```

## ✅ 驗證設定

1. 開啟瀏覽器 Console (F12)
2. 應該看到：
   ```
   ✅ Firebase 初始化成功
   ```

3. 進入關卡編輯器，編輯任意關卡，點擊「💾 儲存關卡」
4. 應該看到彈窗：
   ```
   ✅ 關卡 X 已儲存至 Firebase ☁️
   ```

5. 前往 Firebase Console → Firestore Database
6. 應該會看到 `customLevels` collection 和你儲存的關卡

## 🛡️ 安全性注意事項

- ✅ `.env` 檔案已加入 `.gitignore`，不會提交到 Git
- ✅ Firebase API Key 可以公開（有 Domain 限制保護）
- ⚠️ 生產環境建議啟用 Firebase Authentication
- ⚠️ 定期檢查 Firebase 使用量，避免超出免費額度

## 📊 Firebase 免費額度

Spark Plan (免費方案) 包含：
- 儲存空間: 1 GB
- 每日讀取: 50,000 次
- 每日寫入: 20,000 次
- 每日刪除: 20,000 次

對於個人遊戲專案來說，這已經非常充足！

## 🔧 故障排除

### 問題：Console 顯示 "Firebase 初始化失敗"
**解決方案**：
1. 檢查 `.env` 檔案是否存在且填入正確的值
2. 重啟開發伺服器
3. 檢查 Firebase Console 專案是否已啟用 Firestore

### 問題：儲存時顯示權限錯誤
**解決方案**：
1. 前往 Firebase Console → Firestore Database → 規則
2. 確認規則允許讀寫：`allow read, write: if true;`
3. 點擊「發布」

### 問題：Console 顯示 "Firebase 未初始化，使用 localStorage"
**說明**：
- 這是正常的備援機制
- 即使 Firebase 無法連線，遊戲仍可使用 localStorage 運作
- 關卡會儲存在瀏覽器本地

## 📚 更多資源

- [Firebase 官方文檔](https://firebase.google.com/docs)
- [Firestore 快速入門](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase 定價](https://firebase.google.com/pricing)
