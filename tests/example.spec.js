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
    window.councilDashboardCache = {
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110 }],
      councilRosterSnapshot: { groups: [] },
      holdingsLoaded: true
    };
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
  const reportSections = page.locator('.battle-report-grid > .battle-section');
  await expect(reportSections.nth(0).locator('.foodhouse-roster-title')).toHaveText('部隊兵力配置比例');
  await expect(reportSections.nth(1).locator('.battle-section-title')).toHaveText('00997A 持股變化與軍師短評');
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

test('remembered Pangtong verification restores the empire after reload', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'remembered-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    sessionStorage.removeItem('wealth_empire_unlocked_v1');
    window.API_URL = 'https://example.test/exec';
    window.WRITE_TOKEN = 'remembered-token';
    let verifyOptions = null;
    window.verifyWebAccess = options => {
      verifyOptions = options;
      return new Promise(resolve => setTimeout(resolve, 10));
    };
    const restorePromise = restoreRememberedWebAccess();
    const authorizedDuringRestore = webVerifyIsAuthorized();
    await restorePromise;
    return {
      authorizedDuringRestore,
      authorized: webVerifyIsAuthorized(),
      unlocked: document.getElementById('empire-cards').classList.contains('empire-unlocked'),
      status: webVerifyStoredStatus(),
      skippedConfig: verifyOptions && verifyOptions.skipConfig === true
    };
  });

  expect(result).toEqual({ authorizedDuringRestore: true, authorized: true, unlocked: true, status: 'ok', skippedConfig: true });
});

test('battle brief shows the cached army allocation before refreshing', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(() => {
    const cache = {
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110 }],
      councilRosterSnapshot: { groups: [] },
      cachedAt: Date.now()
    };
    localStorage.setItem('wealth_council_roster_v1', JSON.stringify(cache));
    councilDashboardCache = null;
    const battle = document.createElement('div');
    document.body.appendChild(battle);
    renderBattleBrief({ summary: {}, funds: [], market: [], holdings: [], etfHoldingChange: {} }, battle);
    return {
      title: battle.querySelector('.foodhouse-roster-title')?.textContent || '',
      hasSkeleton: !!battle.querySelector('.battle-council-roster-section .skel')
    };
  });

  expect(result).toEqual({ title: '部隊兵力配置比例', hasSkeleton: false });
});
