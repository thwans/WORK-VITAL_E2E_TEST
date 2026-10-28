import { test, expect } from '@playwright/test';

test('WORK VITAL header login link is visible', async ({ page }) => {
  await page.goto('https://claude.ai/artifact/PDoCQjYmUNZMevge89onRq#top');

  // Target the artifact content, which has its own login link.
  const artifact = page
    .getByTitle('User-generated artifact content', { exact: true })
    .contentFrame();
  const loginLink = artifact
    .getByRole('banner')
    .getByRole('link', { name: '로그인', exact: true });

  await expect(loginLink).toBeVisible({ timeout: 15_000 });
});
