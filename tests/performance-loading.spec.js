const { test, expect } = require('@playwright/test');
const path = require('node:path');

const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('defers the Xunyu panel script and noncritical images until requested', async ({ page }) => {
  await page.goto(url);

  await expect(page.locator('script[src*="xunyu-panel.js"]')).toHaveCount(0);
  await expect(page.locator('#member-card-grid img[src]')).toHaveCount(0);
  await expect(page.locator('.daily-briefing-avatar[src]')).toHaveCount(0);

  await page.evaluate(async () => { await openXunyuPanel(); });
  await expect(page.locator('script[src*="xunyu-panel.js"]')).toHaveCount(1);

  await page.evaluate(() => { showMemberCards(); });
  await expect(page.locator('#member-card-grid img[src]')).toHaveCount(3);
  await expect(page.locator('#member-card-img')).toHaveAttribute('src', '+EGWGSR.png');

  await page.evaluate(() => { restoreDailyBriefingPopup(); });
  await expect(page.locator('.daily-briefing-avatar')).toHaveAttribute('src', './荀彧/文雅報告完畢12.webp?v=20260920-xunyu-webp1');
});
