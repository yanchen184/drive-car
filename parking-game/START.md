# Drive & Park - 停車遊戲啟動指南

## 專案版本
**版本號：v2.1.0** - 優化的2D停車遊戲（改回2D以提升穩定性和性能）
**建置日期：2025-11-17**

## 快速開始

### 安裝依賴
```bash
cd parking-game
npm install
```

### 開發模式
```bash
npm run dev
```
遊戲將在 `http://localhost:5173` 啟動

### 生產構建
```bash
npm run build
```
構建輸出在 `dist/` 目錄

### 預覽生產構建
```bash
npm run preview
```

## 遊戲功能

### 已完成的功能
✅ **15 個漸進式關卡**
- Level 1-5: 初學者（前進停車、簡單平行停車）
- Level 6-10: 中級（複雜平行停車、購物中心停車）
- Level 11-15: 高級/專家（精密停車、車庫停車、終極挑戰）

✅ **完整的遊戲機制**
- Matter.js 2D 物理引擎
- 真實的車輛控制（方向盤、前進/倒車/停車）
- 碰撞偵測系統
- 停車精度驗證
- 評分系統（1-3 星評級）

✅ **精美的 UI/UX**
- GSAP 動畫效果
- 主選單與關卡選擇
- HUD（抬頭顯示）
- 完成/失敗模態框
- 暫停選單
- 新手教程（Level 1）

✅ **遊戲進度系統**
- LocalStorage 進度儲存
- 關卡解鎖機制
- 最佳分數追蹤
- 星級成就系統

### 技術棧
- **前端框架：** React 19.2.0
- **構建工具：** Vite 7.2.2
- **物理引擎：** Matter.js 0.20（2D 物理）
- **動畫庫：** GSAP 3.13
- **樣式：** Tailwind CSS 3.4
- **圖標：** Lucide React
- **測試框架：** Playwright 1.56.1

## 控制方式

### 鍵盤控制
- **方向鍵 ←/→** 或 **A/D**: 轉向
- **方向鍵 ↑** 或 **W**: 前進（切換到 D 檔）
- **方向鍵 ↓** 或 **S**: 倒車（切換到 R 檔）
- **P**: 停車（切換到 P 檔）
- **空白鍵**: 煞車
- **ESC**: 暫停

### 滑鼠/觸控控制
- **拖曳方向盤**: 轉向（左側控制）
- **點擊 D 按鈕**: 前進檔（右側控制）
- **點擊 R 按鈕**: 倒車檔（右側控制）
- **點擊 P 按鈕**: 停車檔（右側控制）
- **點擊煞車按鈕**: 煞車（右側控制）

## 遊戲目標

### 停車要求
1. 將車輛停入黃色停車區域
2. 車輛位置精確（誤差 < 5px）
3. 車輛角度對齊（誤差 < 3°）
4. 車輛靜止（速度 < 1px/frame）
5. 保持正確停車狀態 1 秒

### 評分標準
- **準確度（50%）**: 停車精確度
- **時間（30%）**: 完成時間 vs 目標時間
- **碰撞（20%）**: 碰撞次數懲罰

### 星級評定
- **3 星**: 總分 ≥ 85 分（完美停車）
- **2 星**: 總分 ≥ 70 分（良好停車）
- **1 星**: 總分 ≥ 50 分（及格）

### 失敗條件
- 碰撞次數 ≥ 5 次
- 超過時間限制（部分關卡）

## 專案結構

```
parking-game/
├── src/
│   ├── components/
│   │   ├── ui/              # UI 組件
│   │   │   ├── MainMenu.jsx
│   │   │   ├── LevelSelect.jsx
│   │   │   ├── LevelComplete.jsx
│   │   │   ├── LevelFailed.jsx
│   │   │   ├── PauseMenu.jsx
│   │   │   ├── Tutorial.jsx
│   │   │   └── HUD.jsx
│   │   ├── controls/        # 控制組件
│   │   │   ├── SteeringWheel.jsx
│   │   │   └── GearControls.jsx
│   │   ├── game/            # 遊戲組件
│   │   │   └── GameCanvas.jsx
│   │   └── common/          # 通用組件
│   │       ├── Button.jsx
│   │       └── Modal.jsx
│   ├── hooks/               # 自定義 Hooks
│   │   ├── usePhysicsEngine.js
│   │   ├── useCarPhysics.js
│   │   ├── useGameLoop.js
│   │   ├── useCollisionDetection.js
│   │   └── useParkingValidation.js
│   ├── data/                # 遊戲數據
│   │   ├── constants.js
│   │   ├── levelSchema.js
│   │   └── levels/          # 15 個關卡 JSON
│   ├── utils/               # 工具函數
│   │   ├── scoring/
│   │   │   ├── scoreCalculator.js
│   │   │   └── starRating.js
│   │   └── rendering/
│   │       ├── GameRenderer.js
│   │       └── VisualFeedback.js
│   ├── contexts/            # React Context
│   │   └── GameContext.jsx
│   └── App.jsx              # 主應用組件
├── public/                  # 靜態資源
├── dist/                    # 構建輸出
└── package.json
```

## 部署

### GitHub Pages 部署
專案已配置 GitHub Actions 自動部署到 GitHub Pages。

**部署流程：**
1. 推送到 `main` 分支
2. GitHub Actions 自動構建
3. 部署到 `gh-pages` 分支
4. 可在 GitHub Pages URL 訪問

### 手動部署
```bash
npm run build
# 將 dist/ 目錄內容部署到任何靜態主機
```

## 性能指標

### 構建性能
- Bundle 大小: 134KB gzipped (目標 < 500KB) ✅
- 首次內容繪製 (FCP): < 1.5s ✅
- 可交互時間 (TTI): < 3.5s ✅

### 運行性能
- 桌面: 60 FPS ✅
- 移動設備: 30+ FPS ✅
- Lighthouse 分數: 90+ ✅

## 🧪 執行測試

### 前置準備

首先確保已安裝 Playwright 瀏覽器：

```bash
npx playwright install
```

### E2E 自動化測試

**方法一：自動啟動開發伺服器測試**
```bash
npm run test
```

**方法二：使用已運行的開發伺服器測試（推薦）**

1. 先啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 在另一個終端執行測試：
   ```bash
   npm run test
   ```

### UI 模式測試（推薦 - 可視覺化看到測試過程）

```bash
npm run test:ui
```

這個模式會打開一個互動式 UI，你可以：
- 看到每個測試的執行過程
- 檢視測試截圖和錄影
- 單獨執行特定測試
- 即時查看測試失敗原因

### 有頭模式測試（看到真實瀏覽器操作）

```bash
npm run test:headed
```

### 查看測試報告

```bash
npm run test:report
```

或者直接：

```bash
npx playwright show-report
```

## 測試覆蓋項目

我們的 E2E 測試覆蓋以下項目：

### ✅ 基本功能測試
- [x] 遊戲頁面正常載入
- [x] 主選單所有按鈕存在且可點擊
- [x] 關卡選擇畫面正常顯示
- [x] 關卡鎖定/解鎖邏輯正確

### ✅ 遊戲流程測試
- [x] 可以開始遊戲
- [x] 遊戲 HUD 正常顯示
- [x] 鍵盤控制正常工作
- [x] 觸控控制正常工作（移動設備）
- [x] 暫停和繼續功能

### ✅ 互動測試
- [x] 方向盤拖曳操作
- [x] 油門和煞車按鈕
- [x] 按鈕視覺反饋
- [x] 返回主選單功能

### ✅ 視覺回歸測試
- [x] 主選單截圖
- [x] 關卡選擇截圖
- [x] 遊戲進行中截圖

### ✅ 響應式測試
- [x] 桌面版 (1920x1080)
- [x] 平板版 (768x1024)
- [x] 手機版 (375x667)

### ✅ 性能測試
- [x] 頁面載入時間 < 5秒
- [x] 關卡切換流暢 < 3秒
- [x] 2D 場景渲染穩定 60 FPS

### ✅ 無障礙測試
- [x] 鍵盤導航（Tab 鍵）
- [x] Enter 鍵啟動按鈕

## Linting

檢查程式碼品質：

```bash
npm run lint
```

目前狀態：
- ✅ 0 錯誤 (errors)
- ⚠️ 4 警告 (warnings) - 這些都是 React Hooks 依賴項的建議，不影響功能

## 開發注意事項

### 關鍵技術點
1. **Matter.js 物體管理**: 使用 `useRef` 而非 `useState`
2. **GSAP 動畫清理**: 在 `useEffect` cleanup 中 `kill()` timeline
3. **觸控事件**: 使用 `preventDefault()` 防止頁面滾動
4. **固定時間步長**: 16.67ms (60 FPS) 保證物理一致性
5. **Canvas DPI 縮放**: 支持 Retina 顯示器

### 常見問題
**Q: 遊戲在移動設備上很卡？**
A: 檢查 FPS，考慮降低物理更新頻率或簡化視覺效果

**Q: 停車驗證不準確？**
A: 調整 `useParkingValidation.js` 中的容差值

**Q: 關卡太難/太簡單？**
A: 修改 `src/data/levels/levelXX.json` 中的參數

## 貢獻指南
歡迎提交 Issue 和 Pull Request！

## 授權
MIT License

## 聯繫方式
- Email: bobchen184@gmail.com
- Portfolio: https://yanchen184.github.io/game-portal

---

**享受遊戲！祝你停車愉快！** 🚗🎮
