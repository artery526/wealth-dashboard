const { test, expect } = require('@playwright/test');
const path = require('node:path');

const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('hides the Xunyu dashboard while preserving its daily briefing popup', async ({ page }) => {
  await page.goto(url);

  await expect(page.locator('script[src*="xunyu-panel.js"]')).toHaveCount(0);
  await expect(page.locator('link[href*="xunyu-panel.css"]')).toHaveCount(0);
  await expect(page.locator('#member-card-grid img[src]')).toHaveCount(0);
  await expect(page.locator('.daily-briefing-avatar[src]')).toHaveCount(0);

  await page.evaluate(() => {
    API_URL = 'https://example.test/exec';
    WRITE_TOKEN = 'test-only';
    setWebVerifyStatus('ok', '測試已驗證');
    setWebLoginVisible(false);
    apiGet = params => Promise.resolve(params.action === 'todayCalendar' ? {events:[]} : {tasks:[]});
  });
  await page.getByRole('button', {name:'荀彧，開啟角色面板'}).click();
  await expect(page.locator('#daily-briefing-overlay')).not.toHaveClass(/hidden/);
  await expect(page.locator('#daily-briefing-body')).toContainText('今日行程');
  await expect(page.locator('#daily-briefing-body')).toContainText('待辦事項');
  await expect(page.locator('#xunyu-dashboard')).toHaveCount(0);
  await expect(page.locator('script[src*="xunyu-panel.js"]')).toHaveCount(0);

  await page.evaluate(() => { showMemberCards(); });
  await expect(page.locator('#member-card-grid img[src]')).toHaveCount(3);
  await expect(page.locator('#member-card-img')).toHaveAttribute('src', '+EGWGSR.png');

  await page.evaluate(() => { restoreDailyBriefingPopup(); });
  await expect(page.locator('.daily-briefing-avatar')).toHaveAttribute('src', './荀彧/文雅報告完畢12.webp?v=20260920-xunyu-webp1');
});
