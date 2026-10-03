const { test, expect } = require('@playwright/test');
const path = require('node:path');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await page.evaluate(async () => {
    await ensureMilitaryModule();
    const loginOverlay = document.getElementById('web-login-overlay');
    if (loginOverlay) {
      loginOverlay.classList.remove('open');
      loginOverlay.style.display = 'none';
    }
    API_URL = 'https://example.test/exec';
    setCouncilPanelStatusIfActive = () => {};
    loadBattleFinanceSnapshots = () => Promise.resolve(null);
    document.getElementById('overlay').classList.add('open');
    document.getElementById('panel').classList.add('council-wide');
    document.getElementById('p-body').innerHTML = '<div id="battle-freshness"></div><div id="battle-brief-content"></div><div id="taiwan-macro-content"></div><div id="market-sector-rotation-body"></div>';
  });
});

test('repeated forced battle refresh shares request and retains visible report on failure', async ({ page }) => {
  const result = await page.evaluate(async () => {
    renderBattleBrief({ date: '2026/09/08', summary: {} }, document.getElementById('battle-brief-content'));
    let fail, calls = 0;
    apiGet = () => { calls++; return new Promise((resolve, reject) => { fail = reject; }); };
    const first = loadBattleBrief(true), second = loadBattleBrief(true);
    fail(new Error('offline'));
    await Promise.all([first, second]);
    return { calls, retained: !!document.querySelector('.battle-report-head'), warnings: document.querySelectorAll('.battle-refresh-warning').length, disabled: document.querySelector('.battle-report-refresh').disabled };
  });
  expect(result).toEqual({ calls: 1, retained: true, warnings: 1, disabled: false });
  await expect(page.locator('.battle-refresh-warning')).toContainText('保留上次成功資料');
});

test('battle brief shows even expired cached report while refreshing in the background', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(BATTLE_BRIEF_CACHE_KEY, JSON.stringify({ savedAt: Date.now() - MARKET_CACHE_TTL - 1000, data: { date: '2026-10-01', summary: { marketStance: '舊快取' }, holdings: [], funds: [], etfHoldingChange: {} } }));
    apiGet = () => new Promise(resolve => { window.finishBattleRefresh = resolve; });
    window.battleRefresh = loadBattleBrief(false);
  });
  await expect(page.locator('.battle-report-date')).toContainText('2026-10-01');
  await expect(page.locator('#battle-freshness')).toContainText('顯示快取');
  await page.evaluate(() => finishBattleRefresh({ date: '2026-10-03', summary: { marketStance: '新資料' }, holdings: [], funds: [], etfHoldingChange: {} }));
  await page.evaluate(() => battleRefresh);
  await expect(page.locator('.battle-report-date')).toContainText('2026-10-03');
});

test('sector rotation shows expired snapshot while refreshing in the background', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(MARKET_SECTOR_ROTATION_CACHE_KEY, JSON.stringify({ savedAt: Date.now() - MARKET_CACHE_TTL - 1000, data: { sourceDate: '2026-10-01', source: 'test cache', rows: [{ name: '舊快取產業', code: 'OLD', rotationScore: 1 }] } }));
    apiGet = () => new Promise(resolve => { window.finishSectorRefresh = resolve; });
    window.sectorRefresh = loadMarketSectorRotation();
  });
  await expect(page.locator('#market-sector-rotation-body')).toContainText('舊快取產業');
  await expect(page.locator('#market-sector-rotation-body [role="status"]')).toContainText('背景更新中');
  await page.evaluate(() => finishSectorRefresh({ sourceDate: '2026-10-03', source: 'test refresh', rows: [{ name: '新資料產業', code: 'NEW', rotationScore: 2 }] }));
  await page.evaluate(() => sectorRefresh);
  await expect(page.locator('#market-sector-rotation-body')).toContainText('新資料產業');
});

test('Taiwan macro renders its saved overview and history before refreshing both', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(TAIWAN_MACRO_CACHE_KEY, JSON.stringify({
      overview: { savedAt: Date.now() - 86400000, data: { hasData: true, latest: { overall_state: '快取景氣資料', month: '2026-08' } } },
      history: { '1Y': { savedAt: Date.now() - 86400000, data: { rows: [] } } }
    }));
    apiGet = params => new Promise(resolve => { (window.macroResolvers || (window.macroResolvers = {}))[params.range ? 'history' : 'overview'] = resolve; });
    window.macroRefresh = loadTaiwanMacro(false, '1Y');
  });
  await expect(page.locator('[data-taiwan-overview]')).toContainText('快取景氣資料');
  await expect(page.locator('[data-taiwan-overview]')).toContainText('顯示上次成功資料');
  await expect(page.locator('[data-taiwan-history]')).toContainText('顯示上次成功資料');
  await page.waitForFunction(() => window.macroResolvers && macroResolvers.overview && macroResolvers.history);
  await page.evaluate(() => {
    macroResolvers.overview({ hasData: true, latest: { overall_state: '最新景氣資料', month: '2026-09' } });
    macroResolvers.history({ rows: [] });
  });
  await page.evaluate(() => macroRefresh);
  await expect(page.locator('[data-taiwan-overview]')).toContainText('最新景氣資料');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem(TAIWAN_MACRO_CACHE_KEY)).overview.data.latest.overall_state)).toBe('最新景氣資料');
});

test('overview appears before history and history failure retries independently', async ({ page }) => {
  await page.evaluate(async () => {
    window.calls = [];
    apiGet = params => {
      calls.push(params.action);
      if (params.action === 'taiwanMacroOverview') return Promise.resolve({ hasData: true, latest: { overall_state: '已取得景氣', month: '2026-08' } });
      return new Promise((resolve, reject) => { window.failHistory = reject; });
    };
    window.loading = loadTaiwanMacro(false, '1Y');
  });
  await expect(page.locator('[data-taiwan-overview]')).toContainText('已取得景氣');
  await page.evaluate(async () => { failHistory(new Error('history offline')); await loading; });
  await expect(page.locator('[data-taiwan-history]')).toContainText('history offline');
  await expect(page.locator('[data-taiwan-overview]')).toContainText('已取得景氣');
  await page.evaluate(() => { apiGet = params => { calls.push(params.action); return Promise.resolve({ rows: [] }); }; });
  await page.locator('[data-taiwan-history] button', { hasText: '重試此區' }).click();
  await expect(page.locator('[data-taiwan-history]')).not.toContainText('history offline');
  expect(await page.evaluate(() => calls)).toEqual(['taiwanMacroOverview', 'taiwanMacroHistory', 'taiwanMacroHistory']);
});

test('latest range wins over late responses and refresh retains selected range', async ({ page }) => {
  await page.evaluate(() => {
    window.resolvers = {};
    window.calls = [];
    apiGet = params => {
      calls.push(params.range || 'overview');
      if (!params.range) return Promise.resolve({ hasData: true, latest: { overall_state: '景氣' } });
      return new Promise(resolve => { resolvers[params.range] = resolve; });
    };
    window.first = loadTaiwanMacro(false, '1Y');
  });
  await page.locator('[data-taiwan-history] button', { hasText: '5Y', exact: true }).click();
  await page.evaluate(async () => { resolvers['5Y']({ rows: [] }); await new Promise(r => setTimeout(r, 0)); resolvers['1Y']({ rows: [] }); await first; });
  await expect(page.locator('.taiwan-macro-range button.active')).toHaveText('5Y');
  await page.evaluate(async () => { apiGet = params => { calls.push(params.range || 'overview'); return Promise.resolve(params.range ? { rows: [] } : { hasData: true, latest: {} }); }; await loadTaiwanMacro(true); });
  expect(await page.evaluate(() => calls.slice(-2))).toEqual(['overview', '5Y']);
  await expect(page.locator('.taiwan-macro-range button.active')).toHaveText('5Y');
});

test('failed refresh retains both successful sections and deduplicates each request', async ({ page }) => {
  const result = await page.evaluate(async () => {
    apiGet = params => Promise.resolve(params.range ? { rows: [] } : { hasData: true, latest: { overall_state: '保留景氣' } });
    await loadTaiwanMacro(false, '3Y');
    let calls = 0;
    apiGet = () => { calls++; return Promise.reject(new Error('offline')); };
    await Promise.all([loadTaiwanMacro(true), loadTaiwanMacro(true)]);
    return { calls, range: taiwanMacroView.range };
  });
  expect(result).toEqual({ calls: 2, range: '3Y' });
  await expect(page.locator('[data-taiwan-overview]')).toContainText('保留景氣');
  await expect(page.locator('[data-taiwan-history]')).toContainText('保留上次成功資料');
});

test('history remains available when overview fails without cached data', async ({ page }) => {
  await page.evaluate(async () => {
    apiGet = params => params.range ? Promise.resolve({ rows: [] }) : Promise.reject(new Error('overview offline'));
    await loadTaiwanMacro(false, '6M');
  });
  await expect(page.locator('[data-taiwan-overview]')).toContainText('overview offline');
  await expect(page.locator('[data-taiwan-history]')).toContainText('歷史趨勢');
  await expect(page.locator('.taiwan-macro-range button.active')).toHaveText('6M');
});

test('roster data preloads at entry and the panel uses the fresh cache without another API request', async ({ page }) => {
  const result = await page.evaluate(async () => {
    localStorage.removeItem(COUNCIL_ROSTER_STORAGE_KEY);
    councilDashboardCache = null;
    councilDashboardFetchedAt = 0;
    API_URL = 'https://example.test/exec';
    window.hasMainApiCredentials = () => true;
    window.isEmpireSessionUnlocked = () => true;
    let rosterCalls = 0, summaryCalls = 0;
    window.loadCouncilDashboardData = () => {
      rosterCalls++;
      return Promise.resolve({ heroes: [], holdings: [{ symbol: 'TEST' }], holdingsLoaded: true });
    };
    window.loadCouncilDashboardSummaryData = () => {
      summaryCalls++;
      return Promise.resolve({ assetSnapshot: { latest: { totalAssetValue: 123 } }, dividendProjection: null });
    };
    window.renderCouncilRoster = (rows, el) => { el.innerHTML = '<div class="test-roster">持股資料已預載</div>'; };
    const preloaded = await preloadCouncilDashboard();
    openPanel('council');
    await new Promise(resolve => setTimeout(resolve, 0));
    return {
      preloaded, rosterCalls, summaryCalls,
      cachedSymbol: councilDashboardCache.holdings[0].symbol,
      panelContent: document.getElementById('council-content').innerText
    };
  });
  expect(result).toEqual({ preloaded: true, rosterCalls: 1, summaryCalls: 1, cachedSymbol: 'TEST', panelContent: '持股資料已預載' });
});
