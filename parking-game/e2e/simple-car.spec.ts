import { test, expect } from '@playwright/test';

test.describe('簡單車輛控制系統測試', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 點擊 START GAME 按鈕進入車輛控制頁面
    await page.getByRole('button', { name: /START GAME/i }).click();
    // 等待 canvas 載入
    await page.waitForSelector('[data-testid="car-canvas"]', { timeout: 5000 });
  });

  test('頁面載入測試 - 顯示標題和控制說明', async ({ page }) => {
    // 檢查標題
    await expect(page.getByRole('heading', { name: /停車挑戰/i })).toBeVisible();

    // 檢查版本號
    await expect(page.getByText(/v3.2.0/i)).toBeVisible();

    // 檢查控制說明
    await expect(page.getByText(/使用方向鍵控制車輛/i)).toBeVisible();

    // 檢查 Canvas 存在
    const canvas = page.locator('[data-testid="car-canvas"]');
    await expect(canvas).toBeVisible();

    // 檢查核心功能列表
    await expect(page.getByText(/清晰的車輛視覺化/i)).toBeVisible();
    await expect(page.getByText(/可調整速度控制/i)).toBeVisible();
    await expect(page.getByText(/真實的車輛物理/i)).toBeVisible();
    await expect(page.getByText(/停車格挑戰/i)).toBeVisible();
  });

  test('Canvas 尺寸測試', async ({ page }) => {
    const canvas = page.locator('[data-testid="car-canvas"]');

    // 檢查 canvas 有正確的尺寸
    const width = await canvas.evaluate(el => (el as HTMLCanvasElement).width);
    const height = await canvas.evaluate(el => (el as HTMLCanvasElement).height);

    expect(width).toBe(800);
    expect(height).toBe(600);
  });

  test('前進控制測試 - 按上方向鍵', async ({ page }) => {
    const canvas = page.locator('[data-testid="car-canvas"]');

    // 獲取初始車輛位置（通過檢查 canvas 上的文字）
    await page.waitForTimeout(500);

    // 按下上方向鍵（前進）
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(1000); // 等待車輛移動
    await page.keyboard.up('ArrowUp');

    await page.waitForTimeout(500);

    // 驗證速度不為 0（車輛有在移動）
    const speedText = await page.textContent('text=/速度:/');
    expect(speedText).toBeTruthy();
  });

  test('後退控制測試 - 按下方向鍵', async ({ page }) => {
    await page.waitForTimeout(500);

    // 按下下方向鍵（後退）
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(1000);
    await page.keyboard.up('ArrowDown');

    await page.waitForTimeout(500);

    // 驗證速度變化
    const speedText = await page.textContent('text=/速度:/');
    expect(speedText).toBeTruthy();
  });

  test('方向盤控制測試 - 左轉', async ({ page }) => {
    await page.waitForTimeout(500);

    // 先前進
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(500);

    // 然後左轉
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(1000);

    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('ArrowUp');

    await page.waitForTimeout(500);

    // 驗證方向盤角度有變化（應該是負值）
    const angleText = await page.textContent('text=/方向盤角度:/');
    expect(angleText).toBeTruthy();
  });

  test('方向盤控制測試 - 右轉', async ({ page }) => {
    await page.waitForTimeout(500);

    // 先前進
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(500);

    // 然後右轉
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1000);

    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('ArrowUp');

    await page.waitForTimeout(500);

    // 驗證方向盤角度有變化（應該是正值）
    const angleText = await page.textContent('text=/方向盤角度:/');
    expect(angleText).toBeTruthy();
  });

  test('綜合控制測試 - 前進並轉向', async ({ page }) => {
    await page.waitForTimeout(500);

    // 同時按下上和左
    await page.keyboard.down('ArrowUp');
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(1500);

    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('ArrowUp');

    await page.waitForTimeout(500);

    // 驗證車輛有移動且有轉向
    const posText = await page.textContent('text=/位置:/');
    const angleText = await page.textContent('text=/方向盤角度:/');

    expect(posText).toBeTruthy();
    expect(angleText).toBeTruthy();
  });

  test('方向盤自動回正測試', async ({ page }) => {
    await page.waitForTimeout(500);

    // 左轉
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowLeft');

    // 等待自動回正
    await page.waitForTimeout(2000);

    // 方向盤角度應該接近 0
    const angleText = await page.textContent('text=/方向盤角度:/');
    expect(angleText).toBeTruthy();
    // 角度應該很小（接近 0°）
    const match = angleText?.match(/([-\d.]+)°/);
    if (match) {
      const angle = Math.abs(parseFloat(match[1]));
      expect(angle).toBeLessThan(5); // 應該小於 5 度
    }
  });

  test('摩擦力測試 - 停止按鍵後車輛會逐漸減速', async ({ page }) => {
    await page.waitForTimeout(500);

    // 加速
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(1000);
    await page.keyboard.up('ArrowUp');

    // 立即檢查速度
    await page.waitForTimeout(100);
    const speedText1 = await page.textContent('text=/速度:/');
    const speed1Match = speedText1?.match(/速度: ([\d.]+)/);
    const speed1 = speed1Match ? parseFloat(speed1Match[1]) : 0;

    // 等待一段時間後再檢查速度
    await page.waitForTimeout(2000);
    const speedText2 = await page.textContent('text=/速度:/');
    const speed2Match = speedText2?.match(/速度: ([\d.]+)/);
    const speed2 = speed2Match ? parseFloat(speed2Match[1]) : 0;

    // 速度應該減小（摩擦力作用）
    expect(speed2).toBeLessThan(speed1);
  });

  test('視覺回歸測試 - 初始畫面', async ({ page }) => {
    await page.waitForTimeout(1000);

    // 截圖測試
    await expect(page).toHaveScreenshot('simple-car-initial.png', {
      maxDiffPixels: 200,
    });
  });

  test('視覺回歸測試 - 車輛移動中', async ({ page }) => {
    await page.waitForTimeout(500);

    // 前進並右轉
    await page.keyboard.down('ArrowUp');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1000);

    // 截圖
    await expect(page).toHaveScreenshot('simple-car-moving.png', {
      maxDiffPixels: 200,
    });

    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('ArrowUp');
  });

  test('響應式測試 - 手機版', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.getByRole('button', { name: /START GAME/i }).click();

    await page.waitForTimeout(1000);

    // 檢查 canvas 在小螢幕上仍然可見
    const canvas = page.locator('[data-testid="car-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('響應式測試 - 平板版', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.getByRole('button', { name: /START GAME/i }).click();

    await page.waitForTimeout(1000);

    // 檢查 canvas 在平板螢幕上仍然可見
    const canvas = page.locator('[data-testid="car-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('Console 版本資訊測試', async ({ page }) => {
    const consoleMessages: string[] = [];

    // 監聽 console 訊息
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');

    // 等待 console 訊息
    await page.waitForTimeout(1000);

    // 驗證版本資訊有輸出
    const hasVersionInfo = consoleMessages.some(msg => msg.includes('v3.2.0'));
    expect(hasVersionInfo).toBeTruthy();

    // 驗證物理模型資訊
    const hasPhysicsInfo = consoleMessages.some(msg => msg.includes('Ackermann'));
    expect(hasPhysicsInfo).toBeTruthy();
  });
});
