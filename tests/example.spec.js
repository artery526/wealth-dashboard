const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('battle brief panel renders with stable formatting', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(dashboardUrl);

  await page.evaluate(() => {
    window.API_URL = '';
    window.WRITE_TOKEN = '';
    renderCouncilPanel();
    renderBattleBrief({
      date: '2026/08/01',
      updatedAt: '2026/08/01 16:00',
      summary: { sheetName: 'battle', marketStance: 'watch', upCount: 1, downCount: 1 },
      funds: [
        { name: 'fund-a', code: 'fund-a', current: 50.1, previous: '', change: '', changePct: '' },
        { name: 'fund-b', code: 'fund-b', current: 140.8096, previous: '', change: '', changePct: '' }
      ],
      market: [
        { category: 'margin', name: 'margin', code: '^TWII', current: 507462771000, previous: 500000000000, change: 7462771000, changePct: 1.4926 },
        { category: '台股維持率', name: '台股維持率', code: '^TWII', current: 169.81, previous: 168, change: 1.81, changePct: 1.0774 }
      ],
      holdings: [
        { name: 'QQQI', code: 'QQQI', current: 53.04, previous: 52.68, change: 0.36, changePct: 0.6834 }
      ]
    }, document.getElementById('battle-brief-content'));
  });

  await expect(page.locator('.ptab.active')).toHaveAttribute('onclick', /battle-brief/);
  await expect(page.locator('.battle-section').first().locator('.battle-section-title')).toHaveText('00997A 持股每日變化');
  const fundSection = page.locator('.battle-section', { hasText: '基金淨值' });
  const marginSection = page.locator('.battle-section', { hasText: '台股融資與維持率' });
  await expect(fundSection.locator('.battle-line-current')).toHaveText(['50.1', '140.81']);
  await expect(marginSection.locator('.battle-line-current')).toHaveText(['5,074.63 億', '169.81%']);
  await expect(marginSection.locator('.battle-line-delta').first()).toContainText('74.63 億');
  expect(pageErrors).toEqual([]);
});

test('pangtong battle brief is a standalone button below video download', async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => {
    window.API_URL = '';
    window.WRITE_TOKEN = '';
    openAdvisorAI();
  });

  await expect(page.locator('#advisor-ai-quick-select option[value="戰情總匯報"]')).toHaveCount(0);
  await expect(page.locator('.advisor-ai-video-stack button')).toHaveText(['影片下載', '戰情總匯報']);
});

test('intelligence office supports manual inspiration preview', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(dashboardUrl);
  await page.evaluate(() => {
    window.apiPost = async () => ({ text: '先把重要的事做好。🌿' });
  });

  await page.locator('.intelligence-orb').click();
  await expect(page.locator('#intelligence-overlay')).toHaveClass(/open/);
  await page.locator('#intelligence-source-text').fill('今天先把重要的事情做好，不急著一次完成所有事。');
  await page.locator('#intelligence-polish-btn').click();
  await expect(page.locator('#intelligence-source-text')).toHaveValue('先把重要的事做好。🌿');
  await page.getByRole('button', { name: '預覽' }).click();
  await expect(page.locator('#intelligence-preview')).toBeVisible();
  await expect(page.locator('#intelligence-preview-text')).toHaveText('先把重要的事做好。🌿');
  expect(pageErrors).toEqual([]);
});
