const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('battle brief panel renders with stable formatting', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(dashboardUrl);

  await page.evaluate(() => {
    window.API_URL = '';
    window.WRITE_TOKEN = '';
    window.loadBattleBriefPriceHistory = () => Promise.resolve(null);
    window.loadBattleFinanceSnapshots = () => Promise.resolve(null);
    window.battleFinanceSnapshotState = {
      range: '7d',
      error: '',
      data: {
        records: [
          {
            snapshotType: 'fund-nav',
            sourceDate: '2026-07-31',
            capturedAt: '2026-07-31T08:00:00+08:00',
            items: [
              { name: 'fund-a', code: 'fund-a', value: 49.8, snapshotType: 'fund-nav' },
              { name: 'fund-b', code: 'fund-b', value: 139.7, snapshotType: 'fund-nav' }
            ]
          },
          {
            snapshotType: 'fund-nav',
            sourceDate: '2026-08-01',
            capturedAt: '2026-08-01T08:00:00+08:00',
            items: [
              { name: 'fund-a', code: 'fund-a', value: 50.1, snapshotType: 'fund-nav' },
              { name: 'fund-b', code: 'fund-b', value: 140.8096, snapshotType: 'fund-nav' }
            ]
          },
          {
            snapshotType: 'twse-margin',
            sourceDate: '2026-07-31',
            capturedAt: '2026-07-31T08:00:00+08:00',
            items: [
              { name: '台股融資餘額', code: '^TWII', value: 500000000000, snapshotType: 'twse-margin' },
              { name: '台股維持率', code: '^TWII', value: 168, snapshotType: 'twse-margin' }
            ]
          },
          {
            snapshotType: 'twse-margin',
            sourceDate: '2026-08-01',
            capturedAt: '2026-08-01T08:00:00+08:00',
            items: [
              { name: '台股融資餘額', code: '^TWII', value: 507462771000, snapshotType: 'twse-margin' },
              { name: '台股維持率', code: '^TWII', value: 169.81, snapshotType: 'twse-margin' }
            ]
          }
        ]
      }
    };
    window.councilDashboardCache = {
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110 }],
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
    updateBattleFinanceSnapshotViews();
  });

  await expect(page.locator('.ptab.active')).toHaveAttribute('onclick', /battle-brief/);
  const reportSections = page.locator('.battle-report-grid > .battle-section');
  await expect(reportSections.nth(0).locator('.battle-section-title')).toHaveText('00997A 持股變化與軍師短評');
  const fundSection = page.locator('.battle-section', { hasText: '基金淨值' });
  const marginSection = page.locator('.battle-section', { hasText: '台股融資與維持率' });
  await expect(fundSection.locator('.battle-snapshot-row strong')).toHaveText(['50.1', '140.81']);
  await expect(marginSection.locator('.battle-snapshot-row strong')).toHaveText(['5074.63 億', '169.81%']);
  await expect(marginSection.locator('.battle-snapshot-row em').first()).toContainText('74.63 億');
  expect(pageErrors).toEqual([]);
});

test('legacy advisor video cards are removed while scene NPC controls remain', async ({ page }) => {
  await page.goto(dashboardUrl);

  await expect(page.locator('.advisor-duo-role')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '龐統，開啟角色面板' })).toBeVisible();
  await expect(page.getByRole('button', { name: '諸葛亮，開啟角色面板' })).toBeVisible();
});

test('mobile calendar defaults to a compact palace badge and expands the weekly view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(dashboardUrl);

  const slot = page.locator('#mobile-calendar-slot');
  const toggle = page.locator('#home-calendar-mobile-toggle');
  const details = page.locator('#home-calendar-details');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#home-calendar-mobile-lunar')).toHaveText(/^農曆M\d{2}/);
  await expect(page.locator('#home-calendar-mobile-date')).toHaveText(/^\d{4}\/\d{2}\/\d{2}（[日一二三四五六]）$/);
  await expect(details).toBeHidden();
  await expect(slot).not.toHaveClass(/is-expanded/);
  expect(await page.locator('#home-agenda-calendar').evaluate(element => element.parentElement.id)).toBe('mobile-calendar-slot');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(slot).toHaveClass(/is-expanded/);
  await expect(details).toBeVisible();
  await expect(page.locator('.mobile-calendar-slot .home-calendar-week-controls')).toBeVisible();
  await expect(page.locator('#home-calendar-grid .home-calendar-day')).toHaveCount(7);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
});

test('desktop calendar uses the same compact palace badge and weekly view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(dashboardUrl);

  const slot = page.locator('#mobile-calendar-slot');
  const toggle = page.locator('#home-calendar-mobile-toggle');
  const details = page.locator('#home-calendar-details');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
  expect(await page.locator('#home-agenda-calendar').evaluate(element => element.parentElement.id)).toBe('mobile-calendar-slot');

  await toggle.click();
  await expect(slot).toHaveClass(/is-expanded/);
  await expect(details).toBeVisible();
  await expect(page.locator('.mobile-calendar-slot .home-calendar-week-controls')).toBeVisible();
  await expect(page.locator('#home-calendar-grid .home-calendar-day')).toHaveCount(7);
  await expect(page.locator('#home-agenda-court .agenda-section')).toHaveCount(2);
});

test('remembered Pangtong verification restores the empire without blocking re-verification', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'remembered-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    sessionStorage.removeItem('wealth_empire_unlocked_v1');
    window.API_URL = 'https://example.test/exec';
    window.WRITE_TOKEN = 'remembered-token';
    let verifyCalls = 0;
    window.verifyWebAccess = () => {
      verifyCalls += 1;
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
      verifyCalls
    };
  });

  expect(result).toEqual({ authorizedDuringRestore: true, authorized: true, unlocked: true, status: 'ok', verifyCalls: 0 });
});

test('battle brief no longer renders the retired army allocation snapshot', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(() => {
    const cache = {
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110 }],
      cachedAt: Date.now()
    };
    localStorage.setItem('wealth_council_roster_v1', JSON.stringify(cache));
    councilDashboardCache = null;
    const battle = document.createElement('div');
    document.body.appendChild(battle);
    renderBattleBrief({ summary: {}, funds: [], market: [], holdings: [], etfHoldingChange: {} }, battle);
    return {
      title: battle.querySelector('.foodhouse-roster-title')?.textContent || '',
      hasArmyAllocation: !!battle.querySelector('.battle-council-roster-section')
    };
  });

  expect(result).toEqual({ title: '', hasArmyAllocation: false });
});

test('council roster shows the cached roster before refreshing', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    const cache = {
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110, shares: 1 }],
      cachedAt: Date.now()
    };
    localStorage.setItem('wealth_council_roster_v1', JSON.stringify(cache));
    councilDashboardCache = null;
    API_URL = 'https://example.test/exec';
    WRITE_TOKEN = 'remembered-token';
    setWebVerifyStatus('ok', '網頁驗證成功');
    const roster = document.createElement('div');
    roster.id = 'council-content';
    document.body.appendChild(roster);
    loadCouncilDashboardData = () => new Promise(resolve => setTimeout(() => resolve({
      heroes: [
        { symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 },
        { symbol: 'AIPI', assetName: 'AIPI', heroName: 'AIPI', enabled: true, sortOrder: 2 }
      ],
      holdings: [
        { symbol: 'QQQI', name: 'QQQI', cost: 200, marketValue: 220, shares: 1 },
        { symbol: 'AIPI', name: 'AIPI', cost: 300, marketValue: 330, shares: 1 }
      ],
      assetSnapshot: null,
      dividendProjection: null,
      holdingsLoaded: true
    }), 120));
    const refreshPromise = loadCouncilDashboard();
    await new Promise(resolve => setTimeout(resolve, 20));
    const oldValue = roster.querySelector('.council-stat-v')?.textContent || '';
    const hasSkeleton = !!roster.querySelector('.skel');
    await refreshPromise;
    const newValue = roster.querySelector('.council-stat-v')?.textContent || '';
    return { oldValue, newValue, hasSkeleton };
  });

  expect(result).toEqual({ oldValue: '1 檔', newValue: '2 檔', hasSkeleton: false });
});

test('store panel shows cached records before a refresh and reuses fresh data', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    API_URL = 'https://example.test/exec';
    WRITE_TOKEN = 'remembered-token';
    setWebVerifyStatus('ok', '網頁驗證成功');
    storeRecordsCache = [{ row: 5, itemName: '備用 HDMI 線', location: '三樓 A 區', code: 'W3-A-001', description: '', recordDate: '2026/08/28' }];
    storeFilterYear = '2026';
    storeFilterMonth = '08';
    storeRecordsCacheFetchedAt = Date.now();
    let apiCalls = 0;
    apiGet = () => { apiCalls += 1; return Promise.resolve({ records: [{ row: 5, itemName: '備用 HDMI 線', location: '三樓 A 區', code: 'W3-A-001', description: '', recordDate: '2026/08/28' }] }); };
    renderStorePanel('store-list');
    const immediate = document.querySelector('.store-item-name')?.textContent || '';
    await loadStoreRecords(false);
    return { immediate, apiCalls };
  });

  expect(result).toEqual({ immediate: '備用 HDMI 線', apiCalls: 0 });
});
