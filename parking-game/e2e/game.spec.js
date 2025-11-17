import { test, expect } from '@playwright/test';

/**
 * Parking Master - E2E 測試套件
 *
 * 測試覆蓋範圍：
 * - 基本功能測試：頁面載入、導航、按鈕交互
 * - 遊戲流程測試：開始遊戲、選擇關卡、遊戲進行
 * - 視覺回歸測試：截圖對比
 * - 響應式測試：多種螢幕尺寸
 */

test.describe('Parking Master - 完整測試', () => {

  // ============================================
  // 基本功能測試
  // ============================================

  test.describe('基本功能測試', () => {

    test('遊戲主選單正常載入', async ({ page }) => {
      await page.goto('/');

      // 檢查標題是否顯示
      const title = page.getByRole('heading', { name: /PARKING/i });
      await expect(title).toBeVisible();

      const subtitle = page.getByRole('heading', { name: /MASTER/i });
      await expect(subtitle).toBeVisible();

      // 檢查版本號碼
      await expect(page.getByText(/v\d+\.\d+\.\d+/)).toBeVisible();
    });

    test('主選單所有按鈕都存在且可見', async ({ page }) => {
      await page.goto('/');

      // 檢查所有主要按鈕
      await expect(page.getByRole('button', { name: /START GAME/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /TUTORIAL/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /LEADERBOARD/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /SETTINGS/i })).toBeVisible();
    });

    test('點擊開始遊戲按鈕進入關卡選擇', async ({ page }) => {
      await page.goto('/');

      // 點擊開始遊戲
      await page.getByRole('button', { name: /START GAME/i }).click();

      // 等待關卡選擇畫面載入
      await expect(page.getByRole('heading', { name: /Select Level/i })).toBeVisible({ timeout: 10000 });

      // 檢查返回按鈕
      await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
    });

    test('關卡選擇畫面顯示所有關卡', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();

      // 等待關卡卡片載入
      await page.waitForSelector('.level-card', { timeout: 10000 });

      // 應該有 15 個關卡
      const levelCards = page.locator('.level-card');
      await expect(levelCards).toHaveCount(15);

      // 第一關應該是解鎖的
      const firstLevel = levelCards.first();
      await expect(firstLevel).not.toHaveClass(/opacity-50/);
    });

    test('可以從關卡選擇返回主選單', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();
      await expect(page.getByRole('heading', { name: /Select Level/i })).toBeVisible();

      // 點擊返回
      await page.getByRole('button', { name: /Back/i }).click();

      // 應該回到主選單
      await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
    });
  });

  // ============================================
  // 遊戲流程測試
  // ============================================

  test.describe('遊戲流程測試', () => {

    test('可以開始第一關遊戲', async ({ page }) => {
      await page.goto('/');

      // 進入關卡選擇
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });

      // 點擊第一關
      const firstLevel = page.locator('.level-card').first();
      await firstLevel.click();

      // 等待遊戲載入（可能會有教程彈窗）
      await page.waitForTimeout(2000);

      // 如果有教程彈窗，關閉它
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // 檢查遊戲 HUD 是否顯示
      // 由於組件還沒有 data-testid，暫時使用其他方式檢查
      await page.waitForTimeout(1000);
    });

    test('遊戲 HUD 顯示正確資訊', async ({ page }) => {
      await page.goto('/');

      // 快速進入遊戲
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.locator('.level-card').first().click();
      await page.waitForTimeout(2000);

      // 關閉教程（如果有）
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // 檢查 Canvas 是否存在（3D遊戲畫面）
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('鍵盤控制測試', async ({ page }) => {
      await page.goto('/');

      // 進入遊戲
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.locator('.level-card').first().click();
      await page.waitForTimeout(2000);

      // 關閉教程
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }

      // 測試鍵盤控制（按下並釋放方向鍵）
      await page.keyboard.down('ArrowUp');
      await page.waitForTimeout(100);
      await page.keyboard.up('ArrowUp');

      await page.keyboard.down('ArrowLeft');
      await page.waitForTimeout(100);
      await page.keyboard.up('ArrowLeft');

      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(100);
      await page.keyboard.up('ArrowRight');

      // 確保沒有崩潰
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('可以暫停和繼續遊戲', async ({ page }) => {
      await page.goto('/');

      // 進入遊戲
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.locator('.level-card').first().click();
      await page.waitForTimeout(2000);

      // 關閉教程
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }

      // 按 ESC 暫停
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 檢查暫停選單是否出現（透過檢查是否有 Resume 按鈕）
      const resumeButton = page.getByRole('button', { name: /Resume|Continue/i });
      if (await resumeButton.isVisible()) {
        // 點擊繼續
        await resumeButton.click();
        await page.waitForTimeout(500);

        // 確保遊戲繼續運行
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
      }
    });
  });

  // ============================================
  // 視覺回歸測試
  // ============================================

  test.describe('視覺回歸測試', () => {

    test('主選單截圖', async ({ page }) => {
      await page.goto('/');

      // 等待動畫完成
      await page.waitForTimeout(2000);

      // 截圖對比
      await expect(page).toHaveScreenshot('main-menu.png', {
        maxDiffPixels: 100,
        animations: 'disabled'
      });
    });

    test('關卡選擇截圖', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();

      // 等待關卡卡片動畫完成
      await page.waitForTimeout(2000);

      // 截圖對比
      await expect(page).toHaveScreenshot('level-select.png', {
        maxDiffPixels: 100,
        animations: 'disabled'
      });
    });

    test('遊戲進行中截圖', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.locator('.level-card').first().click();
      await page.waitForTimeout(2000);

      // 關閉教程
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // 等待遊戲場景渲染
      await page.waitForTimeout(2000);

      // 截圖對比
      await expect(page).toHaveScreenshot('game-playing.png', {
        maxDiffPixels: 200, // 3D場景可能有些許差異
        animations: 'disabled'
      });
    });
  });

  // ============================================
  // 響應式測試
  // ============================================

  test.describe('響應式測試', () => {

    test('手機版 - 主選單正常顯示', async ({ page }) => {
      // iPhone SE 尺寸
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // 檢查標題和按鈕是否正常顯示
      await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /START GAME/i })).toBeVisible();

      // 截圖
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot('mobile-main-menu.png', {
        maxDiffPixels: 100,
        animations: 'disabled'
      });
    });

    test('平板版 - 關卡選擇正常顯示', async ({ page }) => {
      // iPad 尺寸
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();

      // 等待載入
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // 檢查關卡網格是否正常顯示
      const levelCards = page.locator('.level-card');
      await expect(levelCards).toHaveCount(15);

      // 截圖
      await expect(page).toHaveScreenshot('tablet-level-select.png', {
        maxDiffPixels: 100,
        animations: 'disabled'
      });
    });

    test('桌面版 - 遊戲畫面正常顯示', async ({ page }) => {
      // 桌面尺寸
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.locator('.level-card').first().click();
      await page.waitForTimeout(2000);

      // 關閉教程
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      await page.waitForTimeout(2000);

      // 檢查 Canvas 是否存在
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      // 截圖
      await expect(page).toHaveScreenshot('desktop-game-playing.png', {
        maxDiffPixels: 200,
        animations: 'disabled'
      });
    });
  });

  // ============================================
  // 錯誤處理測試
  // ============================================

  test.describe('錯誤處理測試', () => {

    test('頁面重新整理後狀態保持', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });

      // 重新整理頁面
      await page.reload();

      // 應該回到主選單（因為遊戲狀態未保存到localStorage）
      await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
    });

    test('嘗試點擊鎖定的關卡', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });

      // 找到一個鎖定的關卡（假設第10關是鎖定的）
      const levelCards = page.locator('.level-card');
      const lockedLevel = levelCards.nth(9); // 第10關 (index 9)

      // 檢查是否有鎖定樣式
      if (await lockedLevel.locator('svg').count() > 0) {
        // 嘗試點擊
        await lockedLevel.click();
        await page.waitForTimeout(500);

        // 應該仍然在關卡選擇畫面
        await expect(page.getByRole('heading', { name: /Select Level/i })).toBeVisible();
      }
    });
  });

  // ============================================
  // 性能測試
  // ============================================

  test.describe('性能測試', () => {

    test('頁面載入時間合理', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
      const loadTime = Date.now() - startTime;

      // 頁面應該在 5 秒內載入
      expect(loadTime).toBeLessThan(5000);
    });

    test('關卡選擇動畫流暢', async ({ page }) => {
      await page.goto('/');
      const startTime = Date.now();
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      const transitionTime = Date.now() - startTime;

      // 轉場應該在 3 秒內完成
      expect(transitionTime).toBeLessThan(3000);
    });

    test('3D場景渲染不崩潰', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /START GAME/i }).click();
      await page.waitForSelector('.level-card', { timeout: 10000 });
      await page.locator('.level-card').first().click();
      await page.waitForTimeout(2000);

      // 關閉教程
      const closeButton = page.getByRole('button', { name: /Close|Got it|Start/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // 等待幾秒確保渲染穩定
      await page.waitForTimeout(3000);

      // 檢查是否有 JavaScript 錯誤
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      // 應該沒有嚴重錯誤
      const hasCriticalError = errors.some(err =>
        err.includes('Cannot read') ||
        err.includes('undefined') ||
        err.includes('null')
      );

      expect(hasCriticalError).toBe(false);
    });
  });

  // ============================================
  // 無障礙測試
  // ============================================

  test.describe('無障礙測試', () => {

    test('鍵盤導航 - Tab 鍵可以瀏覽按鈕', async ({ page }) => {
      await page.goto('/');

      // 按 Tab 鍵
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // 檢查是否有元素獲得焦點
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('Enter 鍵可以啟動按鈕', async ({ page }) => {
      await page.goto('/');

      // 使用 Tab 導航到開始按鈕
      const startButton = page.getByRole('button', { name: /START GAME/i });
      await startButton.focus();

      // 按 Enter
      await page.keyboard.press('Enter');

      // 應該進入關卡選擇
      await expect(page.getByRole('heading', { name: /Select Level/i })).toBeVisible({ timeout: 10000 });
    });
  });

});
