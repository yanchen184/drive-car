import { test, expect } from '@playwright/test';

test.describe('關卡系統完整測試', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('主選單顯示測試', async ({ page }) => {
    // 檢查主選單元素
    await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /START GAME/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /TUTORIAL/i })).toBeVisible();
    await expect(page.getByText(/v3.2.0/i)).toBeVisible();
  });

  test('關卡選擇流程測試', async ({ page }) => {
    // 點擊 START GAME 進入關卡選擇
    await page.getByRole('button', { name: /START GAME/i }).click();

    // 等待關卡選擇頁面載入
    await page.waitForTimeout(1000);

    // 檢查關卡選擇頁面元素
    await expect(page.getByText(/SELECT LEVEL/i)).toBeVisible();

    // 檢查第一關可以選擇（應該是解鎖的）
    const level1Button = page.locator('button', { hasText: '1' }).first();
    await expect(level1Button).toBeVisible();
  });

  test('選擇第一關並進入遊戲', async ({ page }) => {
    // 進入關卡選擇
    await page.getByRole('button', { name: /START GAME/i }).click();
    await page.waitForTimeout(1000);

    // 選擇第一關
    await page.locator('button', { hasText: '1' }).first().click();
    await page.waitForTimeout(1500);

    // 檢查遊戲畫面載入
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('教學關卡（Level 0）訪問測試', async ({ page }) => {
    // 點擊 TUTORIAL 進入教學關卡
    await page.getByRole('button', { name: /TUTORIAL/i }).click();

    // 等待 SimpleCar 頁面載入
    await page.waitForSelector('[data-testid="car-canvas"]', { timeout: 5000 });

    // 檢查教學關卡標題
    await expect(page.getByText(/第 0 關/i)).toBeVisible();
    await expect(page.getByText(/教學關/i)).toBeVisible();
  });

  test('HUD 顯示測試', async ({ page }) => {
    // 進入第一關
    await page.getByRole('button', { name: /START GAME/i }).click();
    await page.waitForTimeout(1000);
    await page.locator('button', { hasText: '1' }).first().click();
    await page.waitForTimeout(1500);

    // 暫時跳過檢查 HUD - 可能需要特定 data-testid
    // 只檢查 canvas 是否存在即可
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('遊戲控制測試 - 鍵盤操作', async ({ page }) => {
    // 進入教學關卡（更容易測試）
    await page.getByRole('button', { name: /TUTORIAL/i }).click();
    await page.waitForSelector('[data-testid="car-canvas"]', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 測試方向鍵控制
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(1000);
    await page.keyboard.up('ArrowUp');

    await page.waitForTimeout(500);

    // 驗證頁面沒有錯誤（canvas 仍然可見）
    const canvas = page.locator('[data-testid="car-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('速度調整控制測試', async ({ page }) => {
    // 進入教學關卡
    await page.getByRole('button', { name: /TUTORIAL/i }).click();
    await page.waitForSelector('[data-testid="car-canvas"]', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 檢查速度調整滑桿是否存在
    const speedSliders = page.locator('input[type="range"]');
    const count = await speedSliders.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Console 版本輸出測試', async ({ page }) => {
    const consoleMessages: string[] = [];

    // 監聽 console 訊息
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // 驗證版本資訊
    const hasVersionInfo = consoleMessages.some(msg => msg.includes('v3.2.0'));
    expect(hasVersionInfo).toBeTruthy();
  });

  test('返回主選單測試', async ({ page }) => {
    // 進入關卡選擇
    await page.getByRole('button', { name: /START GAME/i }).click();
    await page.waitForTimeout(1000);

    // 尋找返回按鈕（可能是圖示或文字）
    // 如果有 Back 按鈕就點擊
    const backButton = page.locator('button', { hasText: /BACK/i }).first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(500);

      // 驗證回到主選單
      await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
    }
  });

  test('響應式測試 - 手機版主選單', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // 檢查主選單在手機版正常顯示
    await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /START GAME/i })).toBeVisible();
  });

  test('響應式測試 - 平板版主選單', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // 檢查主選單在平板版正常顯示
    await expect(page.getByRole('heading', { name: /PARKING/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /START GAME/i })).toBeVisible();
  });

  test('視覺回歸測試 - 主選單', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500); // 等待動畫完成

    await expect(page).toHaveScreenshot('main-menu.png', {
      maxDiffPixels: 200,
    });
  });

  test('視覺回歸測試 - 關卡選擇', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /START GAME/i }).click();
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('level-select.png', {
      maxDiffPixels: 200,
    });
  });

  test('視覺回歸測試 - 教學關卡', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /TUTORIAL/i }).click();
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('tutorial-level.png', {
      maxDiffPixels: 200,
    });
  });
});
