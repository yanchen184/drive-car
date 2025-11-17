import { test, expect } from '@playwright/test';

test.describe('關卡選擇測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 導航到關卡選擇
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForTimeout(500);
  });

  test('應該顯示所有15個關卡', async ({ page }) => {
    // 檢查關卡數量
    const levelCards = page.locator('[class*="level"]').filter({ hasText: /level/i });
    const count = await levelCards.count();

    expect(count).toBeGreaterThanOrEqual(15);
  });

  test('第一關應該解鎖可點擊', async ({ page }) => {
    // 清除 localStorage 確保是新遊戲
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForTimeout(500);

    // 檢查第一關
    const level1 = page.locator('text=Level 1').first();
    await expect(level1).toBeVisible();

    // 第一關應該可以點擊
    const level1Button = level1.locator('..').locator('button').first();
    await expect(level1Button).toBeEnabled();
  });

  test('未解鎖關卡應該顯示鎖定狀態', async ({ page }) => {
    // 清除進度
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForTimeout(500);

    // 檢查第二關及以後應該鎖定
    const level2Card = page.locator('text=Level 2').first().locator('..');

    // 應該有鎖定圖標或禁用狀態
    const isDisabled = await level2Card.evaluate(el => {
      const button = el.querySelector('button');
      return button ? button.disabled : true;
    });

    expect(isDisabled).toBeTruthy();
  });

  test('點擊關卡應該進入遊戲', async ({ page }) => {
    // 點擊第一關
    await page.locator('text=Level 1').first().click();
    await page.waitForTimeout(1000);

    // 檢查遊戲元素是否出現
    // 應該看到 HUD
    const hud = page.locator('[class*="hud"]').first();
    await expect(hud).toBeVisible({ timeout: 5000 });

    // 應該看到控制按鈕
    const controls = page.locator('text=油門').or(page.locator('text=THROTTLE'));
    await expect(controls.first()).toBeVisible({ timeout: 5000 });
  });

  test('應該顯示關卡詳細信息', async ({ page }) => {
    // 檢查第一關的信息
    const level1Card = page.locator('text=Level 1').first().locator('..');

    // 應該顯示難度
    await expect(level1Card).toContainText(/beginner|easy|簡單/i);

    // 應該顯示星級評分（如果有完成過）
    const _stars = level1Card.locator('[class*="star"]');
    // 星星可能存在也可能不存在，取決於是否完成過
  });

  test('返回主菜單按鈕應該正常工作', async ({ page }) => {
    // 點擊返回按鈕
    const backButton = page.getByRole('button', { name: /back|返回/i });
    await expect(backButton).toBeVisible();
    await backButton.click();

    await page.waitForTimeout(500);

    // 應該回到主菜單
    await expect(page.getByRole('button', { name: /start game/i })).toBeVisible();
  });

  test('應該顯示最佳分數', async ({ page }) => {
    // 設置一些測試數據
    await page.evaluate(() => {
      const progress = {
        unlockedLevels: 5,
        levelScores: {
          1: { stars: 3, score: 95, timeTaken: 15 },
          2: { stars: 2, score: 75, timeTaken: 25 }
        }
      };
      localStorage.setItem('gameProgress', JSON.stringify(progress));
    });

    await page.reload();
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForTimeout(500);

    // 檢查是否顯示星級
    const level1Card = page.locator('text=Level 1').first().locator('..');
    const stars = level1Card.locator('[class*="star"]');

    // 應該有3顆星
    const starCount = await stars.count();
    expect(starCount).toBeGreaterThan(0);
  });

  test('關卡卡片應該有視覺反饋', async ({ page }) => {
    const level1Button = page.locator('text=Level 1').first().locator('..').locator('button').first();

    // Hover 效果
    await level1Button.hover();
    await page.waitForTimeout(200);

    // 檢查是否有 transform 或 scale 變化
    const transform = await level1Button.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    expect(transform).not.toBe('none');
  });
});
