const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('龐統軍師不再載入每日成長／三餐自煮介面或顯示其常用查詢選項', async ({ page }) => {
  await page.goto(dashboardUrl);

  await expect(page.locator('script[src*="daily-growth.js"]')).toHaveCount(0);
  await expect(page.locator('link[href*="daily-growth.css"]')).toHaveCount(0);

  const quickCommandLabels = await page.evaluate(() => advisorAIQuickCommands().map(item => item.label));
  expect(quickCommandLabels).not.toContain('每日成長');
  expect(await page.evaluate(() => typeof window.renderDailyGrowthPanel)).toBe('undefined');
});
