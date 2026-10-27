import { test, expect } from '@playwright/test';

test.describe('desktop layout', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test('the single project card spans the row and shows the diagram', async ({ page }) => {
    await page.goto('/');
    const section = (await page.locator('#projects > div').boundingBox())!;
    const card = (await page.locator('#projects article').boundingBox())!;
    expect(card.width).toBeGreaterThan(section.width * 0.95);
    const img = page.locator('#projects article img');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((e) => (e as HTMLImageElement).naturalWidth > 0)).toBe(true);
  });
  test('two talks fill two columns, not two of three', async ({ page }) => {
    await page.goto('/');
    const grid = (await page.locator('#talks > div.grid').boundingBox())!;
    const card = (await page.locator('#talks article').first().boundingBox())!;
    expect(card.width).toBeGreaterThan(grid.width * 0.45);
  });
  test('menu includes Projects', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/#projects');
  });
});

test('contact makes LinkedIn the clear next step', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contact');
  await expect(contact.getByText('The quickest way to reach me is a message on LinkedIn.')).toBeVisible();
  await expect(contact.getByRole('link', { name: 'Message me on LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/jamesjrmurray');
});

test('the hero does not repeat the name under the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="hero"] p').first()).toHaveText('Product leader for AI and data');
});
