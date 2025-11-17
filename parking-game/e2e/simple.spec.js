import { test, expect } from '@playwright/test';

test('simple test', async ({ page }) => {
  await page.goto('http://localhost:5173/drive-car/');
  await expect(page).toHaveTitle(/parking/i);
});
