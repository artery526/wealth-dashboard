const { test, expect } = require('@playwright/test');
const path = require('node:path');

const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const standaloneUrl = 'file:///' + path.resolve(__dirname, '..', 'war-room.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => {
    window.isEmpireSessionUnlocked = () => true;
    window.API_URL = 'https://example.test/exec';
    const loginOverlay = document.getElementById('web-login-overlay');
    if (loginOverlay) { loginOverlay.classList.remove('open'); loginOverlay.style.display = 'none'; }
    window.warRoomLoads = [];
    const originalBriefingLoader = window.openAdvisorWorldSituation;
    window.openAdvisorWorldSituation = () => warRoomLoads.push('briefing');
    window.openAdvisorWorldSituation.__warRoomOriginal = originalBriefingLoader;
    window.loadBattleBrief = () => warRoomLoads.push('battle');
    window.loadMarketSectorRotation = () => warRoomLoads.push('sector');
    window.loadTaiwanMacro = () => warRoomLoads.push('taiwan');
  });
});

test('War Room opens on the briefing and fetches each other area only when selected', async ({ page }) => {
  await page.evaluate(() => { window.isWarRoomStandalone = () => true; openPanel('war-room'); });
  await expect(page.locator('#p-zh')).toHaveText('戰情室');
  await expect(page.locator('#p-tabs .ptab')).toHaveText(['帝國晨報', '戰情總匯報', '產業輪動', '台灣總體經濟']);
  expect(await page.evaluate(() => warRoomLoads)).toEqual(['briefing']);
  await page.getByRole('button', { name: '戰情總匯報' }).click();
  await page.getByRole('button', { name: '產業輪動' }).click();
  await page.getByRole('button', { name: '台灣總體經濟' }).click();
  expect(await page.evaluate(() => warRoomLoads)).toEqual(['briefing', 'battle', 'sector', 'taiwan']);
  await expect(page.locator('#pane-war-taiwan-macro')).toHaveClass(/active/);
});

test('Imperial Morning Brief renders stale saved data before refresh and keeps it when refresh fails', async ({ page }) => {
  await page.evaluate(async () => {
    window.openAdvisorWorldSituation = window.openAdvisorWorldSituation.__warRoomOriginal;
    window.isWarRoomStandalone = () => true;
    window.arkWallFetch = () => Promise.reject(new Error('snapshot unavailable'));
    window.apiGet = () => Promise.reject(new Error('refresh unavailable'));
    const oldSavedAt = Date.now() - 3 * 60 * 60 * 1000;
    localStorage.setItem(MARKET_DASHBOARD_CACHE_KEY, JSON.stringify({ savedAt: oldSavedAt, data: { summary: { updatedAt: '2026-10-03' } } }));
    localStorage.setItem(MARKET_MACRO_CACHE_KEY, JSON.stringify({ savedAt: oldSavedAt, data: { judgment: { date: '2026-10-03' } } }));
    localStorage.removeItem(MARKET_ADVISOR_WORLD_CACHE_KEY);
    openPanel('war-room');
  });
  const briefing = page.locator('#war-room-briefing-content');
  await expect(briefing.locator('.advisor-world-card')).toBeVisible();
  await expect(briefing).not.toContainText('諸葛亮正在整理戰報');
  await expect(briefing.locator('.advisor-world-refresh-status')).toHaveText('背景更新失敗，先顯示上次保存的資料。');
});

test('Military panel exposes only the Troop Roster tab', async ({ page }) => {
  await page.evaluate(async () => {
    await ensureMilitaryModule(); window.hasMainApiCredentials = () => true; window.loadCouncilDashboard = () => {}; window.renderCouncilPanel('battle-brief');
  });
  await expect(page.locator('#p-zh')).toHaveText('軍機處');
  await expect(page.locator('#p-tabs')).toBeHidden();
  await expect(page.locator('#pane-council-roster')).toBeVisible();
  await expect(page.locator('#council-content')).toBeAttached();
  await expect(page.locator('#pane-battle-brief')).toHaveCount(0);
});

test('legacy military shortcuts and voice routing open the matching War Room tab', async ({ page }) => {
  const results = await page.evaluate(() => ({
    shortcut: (() => { let opened; const original = window.openPanel, originalStandalone = window.isWarRoomStandalone; window.openPanel = (panel, tab) => { opened = { panel, tab }; }; window.isWarRoomStandalone = () => true; openEmpireCardShortcut({ stopPropagation() {} }, 'council', 'battle-brief'); window.openPanel = original; window.isWarRoomStandalone = originalStandalone; return opened; })(),
    parsed: advisorAIOpenTarget('戰情總匯報')
  }));
  expect(results.shortcut).toEqual({ panel: 'war-room', tab: 'war-battle-brief' });
  expect(results.parsed).toMatchObject({ panel: 'war-room', tab: 'war-battle-brief' });
});

test('standalone route is a direct page and reuses the same-origin session', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => route.fulfill({
    status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true, data: { summary: { marketStance: '觀望', upCount: 1, downCount: 2 }, holdings: [], funds: [], market: [] } })
  }));
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  const requests = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.goto(`${standaloneUrl}?tab=war-battle-brief`);
  await expect(page.locator('h1')).toHaveText('諸葛軍師・戰情室');
  await expect(page.locator('.tabs button.active')).toHaveText('戰情總匯報');
  await expect(page.locator('#content .battle-hero h2')).toContainText('戰情總匯報');
  expect(await page.evaluate(() => sessionStorage.getItem('wealth_web_session_token'))).toBe('same-tab-session');
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(requests.some(path => path.endsWith('/index.html'))).toBe(false);
  expect(requests.some(path => path.endsWith('/junshifu-map.webp') || path.endsWith('/mobileBG.png'))).toBe(false);
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('standalone route renews an expired shared session before loading its selected tab', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now() - 8 * 86400000));
    sessionStorage.removeItem('wealth_web_session_token');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    let data = { sessionToken: 'renewed-session' };
    if (action === 'taiwanMacroOverview') data = { hasData: true, latest: { month: '2026/09', overall_state: '穩定' } };
    if (action === 'taiwanMacroHistory') data = { rows: [] };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  await page.goto(`${standaloneUrl}?tab=war-taiwan-macro`);
  await expect(page.locator('.tabs button.active')).toHaveText('台灣總體經濟');
  await expect(page.locator('#content')).toContainText('2026/09');
  expect(await page.evaluate(() => sessionStorage.getItem('wealth_web_session_token'))).toBe('renewed-session');
});

test('standalone tabs remain switchable from Taiwan macro back to Imperial Morning Brief', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    let data = {};
    if (action === 'taiwanMacroOverview') data = { hasData: true, latest: { month: '2026/09', overall_state: '穩定' } };
    if (action === 'taiwanMacroHistory') data = { rows: [] };
    if (action === 'advisorWorldBriefSnapshotRefresh') data = { snapshot: { market: { summary: { stance: '觀望', upCount: 2, downCount: 1 }, rows: [] }, macro: { judgment: { summary: '市場資料已更新，維持觀察。', date: '2026-10-03' }, indicators: [], valuations: {} }, capturedAt: '2026-10-03T12:00:00Z' } };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('.brief-hero h2')).toContainText('帝國晨報');
  await page.getByRole('button', { name: '台灣總體經濟' }).click();
  await expect(page.locator('.tabs button.active')).toHaveText('台灣總體經濟');
  await expect(page.locator('#content')).toContainText('2026/09');
  await page.getByRole('button', { name: '帝國晨報' }).click();
  await expect(page.locator('.tabs button.active')).toHaveText('帝國晨報');
  await expect(page.locator('.brief-insight')).toContainText('市場資料已更新');
});

test('sector rotation uses a ranked, responsive layout with source-backed metrics', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data: {
    sourceDate: '2026-10-03', source: 'NAS 快照', commentary: { summary: '半導體與工業類股相對動能較強。' },
    rows: [{ name: '半導體', code: 'SOXX', status: '強勢', quadrant: '領先', rotationScore: 82.5, return5d: 2.4, relative20d: 1.8, relative60d: 4.2 }, { name: '公用事業', code: 'XLU', status: '降溫', quadrant: '落後', rotationScore: 25, return5d: -1.2, relative20d: -2, relative60d: -3.1 }]
  } }) }));
  await page.goto(`${standaloneUrl}?tab=war-sector-rotation`);
  await expect(page.locator('.sector-card')).toHaveCount(2);
  await expect(page.locator('.sector-insight')).toContainText('半導體與工業類股');
  await expect(page.locator('.sector-summary')).toContainText('相對強勢');
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('Taiwan macro has grouped indicators, visible history controls, and mobile-safe charts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'taiwanMacroOverview' ? { hasData: true, latest: { month: '2026/09', updated_at: '2026-10-03T12:00:00Z', overall_state: '景氣平穩', business_cycle_light: '綠燈', leading_index_without_trend: 102.4, pmi: 52.1, exports_yoy: 18.5, export_orders_yoy: 12.3, industrial_production_yoy: 9.8, usdtwd: 31.2, usdtwd_trend: '台幣升值', m2_yoy: 4.1, directions: { score: { key: 'improve', label: '改善' }, exports: { key: 'improve', label: '回升' } } } } : { rows: [{ month: '2026/07', business_cycle_score: 31, exports_yoy: 12 }, { month: '2026/08', business_cycle_score: 34, exports_yoy: 15 }, { month: '2026/09', business_cycle_score: 38, exports_yoy: 18.5 }] };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.goto(`${standaloneUrl}?tab=war-taiwan-macro`);
  await expect(page.locator('.taiwan-indicator')).toHaveCount(8);
  await expect(page.locator('.taiwan-summary')).toContainText('景氣平穩');
  await expect(page.locator('.taiwan-chart-grid')).toContainText('3 筆歷史資料');
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('standalone page loads only its own package and does not request unrelated homepage data', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data: { snapshot: { market: { summary: {}, rows: [] }, macro: {}, capturedAt: '2026-10-03' } } }) }));
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('h1')).toHaveText('諸葛軍師・戰情室');
  await page.waitForTimeout(300);
  expect(requests.some(request => /(?:^|\/)index\.html(?:\?|$)/.test(request))).toBe(false);
  expect(requests.some(request => /(?:^|\/)war-room-app\.js(?:\?|$)/.test(request))).toBe(true);
  expect(requests.some(request => /(?:^|\/)war-room\.css(?:\?|$)/.test(request))).toBe(true);
  expect(requests.some(request => /api\.open-meteo\.com|characterAnimations\.js|AnimatedCharacter\.js|junshifu-map|mobileBG/.test(request))).toBe(false);
  expect(requests.some(request => /[?&]action=(?:config|dividendCenter|holdingsOverview|assetSnapshot)(?:&|$)/.test(request))).toBe(false);
});
