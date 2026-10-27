import { test, expect } from '@playwright/test';

test('privacy notice is reachable from the footer and the cookie banner', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Cookie consent' }).getByRole('link', { name: 'Privacy notice' })).toHaveAttribute('href', '/privacy/');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy notice');
  for (const h of ['Analytics, only if you accept', 'Cookies and storage', 'Who handles your data', 'Your choices and rights']) {
    await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
  }
});
