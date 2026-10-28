import { test, expect } from '@playwright/test';

test('page title contains Playwright', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});
