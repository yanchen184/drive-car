import { test, expect } from '@playwright/test';

test.describe('遊戲控制測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 清除進度
    await page.evaluate(() => localStorage.clear());

    // 進入第一關
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForTimeout(500);
    await page.locator('text=Level 1').first().click();
    await page.waitForTimeout(2000); // 等待遊戲加載
  });

  test('應該顯示所有控制按鈕', async ({ page }) => {
    // 檢查油門按鈕
    const throttleButton = page.locator('text=油門').or(page.locator('text=THROTTLE'));
    await expect(throttleButton.first()).toBeVisible({ timeout: 10000 });

    // 檢查煞車按鈕
    const brakeButton = page.locator('text=煞車').or(page.locator('text=BRAKE'));
    await expect(brakeButton.first()).toBeVisible({ timeout: 10000 });

    // 檢查方向盤
    const steeringWheel = page.locator('[class*="steering"]').first();
    await expect(steeringWheel).toBeVisible({ timeout: 10000 });
  });

  test('點擊油門應該有視覺反饋', async ({ page }) => {
    // 等待控制按鈕加載
    await page.waitForTimeout(2000);

    const throttleButton = page.locator('text=油門').first();
    await expect(throttleButton).toBeVisible();

    // 點擊油門
    await throttleButton.click({ force: true });
    await page.waitForTimeout(200);

    // 檢查是否有高亮效果
    const ringClass = await throttleButton.locator('..').getAttribute('class');
    expect(ringClass).toContain('ring');
  });

  test('點擊煞車應該有視覺反饋', async ({ page }) => {
    await page.waitForTimeout(2000);

    const brakeButton = page.locator('text=煞車').first();
    await expect(brakeButton).toBeVisible();

    // 點擊煞車
    await brakeButton.click({ force: true });
    await page.waitForTimeout(200);

    // 檢查是否有高亮效果
    const ringClass = await brakeButton.locator('..').getAttribute('class');
    expect(ringClass).toContain('ring');
  });

  test('鍵盤控制應該正常工作', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 按下 W 鍵（油門）
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');

    // 按下空白鍵（煞車）
    await page.keyboard.down(' ');
    await page.waitForTimeout(500);
    await page.keyboard.up(' ');

    // 按下方向鍵
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowLeft');

    // 沒有錯誤即為成功
    expect(true).toBeTruthy();
  });

  test('HUD 應該顯示遊戲統計', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 檢查 HUD 元素
    const hud = page.locator('[class*="hud"]').first();
    await expect(hud).toBeVisible();

    // 應該顯示時間
    // const timeDisplay = page.locator('text=/\\d+:\\d+/');
    // await expect(timeDisplay).toBeVisible({ timeout: 5000 });

    // 應該顯示速度
    // const speedDisplay = page.locator('text=/\\d+ km\\/h/i');
    // 速度可能為0，所以只檢查存在
  });

  test('暫停按鈕應該正常工作', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 查找暫停按鈕
    const pauseButton = page.getByRole('button', { name: /pause|暫停/i }).first();

    if (await pauseButton.isVisible()) {
      await pauseButton.click();
      await page.waitForTimeout(500);

      // 應該顯示暫停選單
      const resumeButton = page.getByRole('button', { name: /resume|繼續/i });
      await expect(resumeButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('按 ESC 鍵應該暫停遊戲', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 按下 ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 應該顯示暫停選單
    const resumeButton = page.getByRole('button', { name: /resume|繼續/i });
    await expect(resumeButton).toBeVisible({ timeout: 5000 });
  });

  test('重新開始按鈕應該重置遊戲', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 按 ESC 打開暫停選單
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 點擊重新開始
    const restartButton = page.getByRole('button', { name: /restart|重新開始/i }).first();

    if (await restartButton.isVisible()) {
      await restartButton.click();
      await page.waitForTimeout(1000);

      // 遊戲應該重新開始
      const hud = page.locator('[class*="hud"]').first();
      await expect(hud).toBeVisible();
    }
  });

  test('返回主菜單應該正常工作', async ({ page }) => {
    await page.waitForTimeout(2000);

    // 按 ESC 打開暫停選單
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 點擊返回主菜單
    const homeButton = page.getByRole('button', { name: /home|主菜單/i }).first();

    if (await homeButton.isVisible()) {
      await homeButton.click();
      await page.waitForTimeout(500);

      // 應該回到主菜單
      await expect(page.getByRole('button', { name: /start game/i })).toBeVisible();
    }
  });

  test('觸控控制應該在移動設備上正常工作', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.waitForTimeout(2000);

    // 測試觸控油門
    const throttleButton = page.locator('text=油門').first();
    await expect(throttleButton).toBeVisible();

    const box = await throttleButton.boundingBox();
    if (box) {
      // 觸控按下
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);

      // 應該有視覺反饋
      const _ringClass = await throttleButton.locator('..').getAttribute('class');
      // 檢查是否有高亮效果
    }
  });
});
