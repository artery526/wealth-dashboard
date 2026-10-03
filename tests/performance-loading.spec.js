const { test, expect } = require('@playwright/test');
const path = require('node:path');

const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('尚書臺公告與荀彧角色已從首頁移除', async ({ page }) => {
  await page.goto(url);

  await expect(page.getByRole('button', { name: '龐統，開啟角色面板' })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#daily-briefing-overlay')).toHaveCount(0);
  await expect(page.locator('#xunyu-dashboard')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '荀彧，開啟角色面板' })).toHaveCount(0);
  await expect(page.locator('script[src*="xunyu-panel.js"]')).toHaveCount(0);
  await expect(page.locator('link[href*="xunyu-panel.css"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.xunyuAnimations)).toBeUndefined();
  await expect(page.locator('#member-card-grid img[src]')).toHaveCount(0);
  await page.evaluate(() => { showMemberCards(); });
  await expect(page.locator('#member-card-grid img[src]')).toHaveCount(3);
  await expect(page.locator('#member-card-img')).toHaveAttribute('src', '+EGWGSR.png');
  await page.evaluate(() => { hideMemberCard(); });
});

test('手機版首頁也不建立荀彧角色或政務公告', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);

  await expect(page.getByRole('button', { name: '龐統，開啟角色面板' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: '荀彧，開啟角色面板' })).toHaveCount(0);
  await expect(page.locator('#daily-briefing-overlay')).toHaveCount(0);
});
