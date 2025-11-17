import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 測試配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // 測試超時時間
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // 失敗時的行為
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 測試報告
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // 共享設置
  use: {
    // 基礎 URL
    baseURL: 'http://localhost:5173',

    // 截圖設置
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 追蹤
    trace: 'on-first-retry',
  },

  // 測試項目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移動端測試
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 開發服務器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // 使用已存在的伺服器
    timeout: 120 * 1000,
  },
});
