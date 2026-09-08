const { test, expect } = require('@playwright/test');
const path = require('node:path');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => {
    API_URL = 'https://example.test/exec';
    setCouncilPanelStatusIfActive = () => {};
    loadBattleFinanceSnapshots = () => Promise.resolve(null);
    document.getElementById('overlay').classList.add('open');
    document.getElementById('panel').classList.add('council-wide');
    document.getElementById('p-body').innerHTML = '<div id="battle-brief-content"></div><div id="taiwan-macro-content"></div>';
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
