import { test, expect } from '@playwright/test';

test('homepage responds with the site title', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/James Murray/);
});
