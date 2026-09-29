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
  await page.evaluate(() => { hideMemberCard(); });
  await page.getByRole('button', {name:'關閉今日政務提醒'}).click();
  await expect(page.locator('#daily-briefing-mini')).toHaveCount(0);
  await page.getByRole('button', {name:'荀彧，開啟角色面板'}).click();
  await expect(page.locator('#daily-briefing-overlay')).not.toHaveClass(/hidden/);
  await expect(page.locator('#daily-briefing-body')).toContainText('📅 今日行程');
  await expect(page.locator('#daily-briefing-body')).toContainText('📜 待辦事項');
});

test('mobile opens Xunyu calendar and tasks by clicking the character without a dot bubble', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  const xunyu = page.getByRole('button', { name: '荀彧，開啟角色面板' });
  await expect(xunyu).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#daily-briefing-mini')).toHaveCount(0);

  await page.evaluate(() => {
    WRITE_TOKEN = '';
    localStorage.removeItem('wealth_write_token');
    setWebVerifyStatus('err', '尚未設定');
    setWebLoginVisible(false);
  });
  await xunyu.click({ force: true });
  await expect(page.locator('#daily-briefing-overlay')).not.toHaveClass(/hidden/);
  await expect(page.locator('#daily-briefing-body')).toContainText('各裝置的設定不會自動同步');
  await page.getByRole('button', { name: '關閉今日政務提醒' }).click();
  await expect(page.locator('#daily-briefing-mini')).toHaveCount(0);
  await xunyu.click({ force: true });
  await page.getByRole('button', {name:'設定 API 與驗證'}).click();
  await expect(page.locator('#daily-briefing-overlay')).toHaveClass(/hidden/);
  await expect(page.locator('#cfg-overlay')).toHaveClass(/open/);
});
