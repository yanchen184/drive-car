import { test, expect } from '@playwright/test';

test.describe('主菜單測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('應該顯示主菜單', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/parking/i);

    // 檢查主菜單是否顯示
    const startButton = page.getByRole('button', { name: /start game/i });
    await expect(startButton).toBeVisible();
  });

  test('應該顯示所有菜單按鈕', async ({ page }) => {
    // 檢查所有主菜單按鈕
    await expect(page.getByRole('button', { name: /start game/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tutorial/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /leaderboard/i })).toBeVisible();
  });

  test('點擊 START GAME 應該進入關卡選擇', async ({ page }) => {
    // 點擊開始遊戲
    await page.getByRole('button', { name: /start game/i }).click();

    // 等待導航到關卡選擇
    await page.waitForTimeout(500);

    // 檢查是否顯示關卡選擇畫面
    const levelButtons = page.locator('[class*="level"]').filter({ hasText: /level/i });
    await expect(levelButtons.first()).toBeVisible();
  });

  test('主菜單應該有動畫效果', async ({ page }) => {
    // 檢查主菜單標題動畫
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    // 檢查按鈕有 hover 效果
    const startButton = page.getByRole('button', { name: /start game/i });
    const originalColor = await startButton.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    await startButton.hover();
    await page.waitForTimeout(300);

    const hoverColor = await startButton.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Hover 後顏色應該不同
    expect(originalColor).not.toBe(hoverColor);
  });

  test('應該響應式適配移動設備', async ({ page, isMobile }) => {
    if (isMobile) {
      // 檢查移動版本佈局
      const container = page.locator('.min-h-screen').first();
      await expect(container).toBeVisible();

      // 檢查按鈕可點擊
      const startButton = page.getByRole('button', { name: /start game/i });
      await expect(startButton).toBeVisible();
      await expect(startButton).toBeEnabled();
    }
  });
});
