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
    window.loadTaiwanMacro = () => warRoomLoads.push('taiwan');
  });
});

test('War Room opens on the briefing and fetches its remaining areas only when selected', async ({ page }) => {
  await page.evaluate(() => { window.isWarRoomStandalone = () => true; openPanel('war-room'); });
  await expect(page.locator('#p-zh')).toHaveText('戰情室');
  await expect(page.locator('#p-tabs .ptab')).toHaveText(['帝國晨報', '台灣總體經濟']);
  expect(await page.evaluate(() => warRoomLoads)).toEqual(['briefing']);
  await page.getByRole('button', { name: '台灣總體經濟' }).click();
  expect(await page.evaluate(() => warRoomLoads)).toEqual(['briefing', 'taiwan']);
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

test('Imperial Morning Brief combines Taiwan P/E values into the Taiwan after-hours card on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.apiGet = ({ action }) => action === 'nasdaq100Valuation'
      ? Promise.resolve({ trailingPE: 30.52, trailingDataDate: '2026-10-22', forwardPE: 19.61, forwardDataDate: '2026-10-21', stale: false })
      : Promise.resolve({});
    const panel = document.createElement('div');
    panel.id = 'war-room-briefing-content';
    document.body.appendChild(panel);
    advisorWorldRenderSnapshot(panel, { market: {}, macro: { valuations: { taiex: {
      trailingPE: 19.54, historicalPEMedian: { tenYear: 16.88 }, pb: 3.31, historicalPBMedian: { tenYear: 1.92 },
      dataDate: '2026-10-22', source: 'MoneyDJ PE/PB河流圖反算；TWSE同日收盤指數核對通過', status: '已更新'
    } } }, capturedAt: '2026-10-23T00:00:00Z' });
  });
  const valuation = page.locator('.advisor-nasdaq-valuation');
  await expect(valuation.locator('.advisor-nasdaq-trailing')).toHaveText('30.52×');
  await expect(valuation.locator('.advisor-nasdaq-forward')).toHaveText('19.61×');
  await expect(valuation.locator('.advisor-nasdaq-trailing-date')).toContainText('2026/10/22');
  await expect(valuation.locator('.advisor-nasdaq-forward-date')).toContainText('2026/10/21');
  await valuation.locator('details > summary').click();
  await expect(valuation.locator('a')).toHaveAttribute('href', 'https://historyofmarket.com/nasdaq/ndx-forward-pe/');
  const afterHours = page.locator('.advisor-twse-after-hours');
  const taiwanValuation = afterHours.locator('.advisor-twse-valuation');
  await expect(taiwanValuation.locator('.advisor-twse-valuation-head')).toHaveText('📊 台股估值');
  await expect(taiwanValuation).toContainText('近四季 Trailing P/E');
  await expect(afterHours).toContainText('19.54×');
  await expect(taiwanValuation).toContainText('10 年中位數 P/E');
  await expect(taiwanValuation).toContainText('16.88×');
  await expect(taiwanValuation).toContainText('2026/10/22');
  await expect(taiwanValuation.locator('.advisor-twse-valuation-grid > div').nth(0).locator('small')).toHaveText(['近四季 Trailing P/E', '資料日 2026/10/22']);
  await expect(taiwanValuation.locator('.advisor-twse-valuation-grid > div').nth(1).locator('small')).toHaveText(['10 年中位數 P/E', '歷史比較基準']);
  const matchingTaiwanTypography = await afterHours.evaluate(card => {
    const styles = selector => getComputedStyle(card.querySelector(selector));
    return {
      headings: [styles('.advisor-twse-after-hours-head strong').fontSize, styles('.advisor-twse-valuation-head').fontSize],
      labels: [styles('.advisor-twse-after-hours-grid small').fontSize, styles('.advisor-twse-valuation-grid small').fontSize],
      values: [styles('.advisor-twse-after-hours-grid strong').fontSize, styles('.advisor-twse-valuation-grid strong').fontSize],
      columns: [styles('.advisor-twse-after-hours-grid').gridTemplateColumns.split(' ').length, styles('.advisor-twse-valuation-grid').gridTemplateColumns.split(' ').length]
    };
  });
  expect(matchingTaiwanTypography).toEqual({ headings: ['13px', '13px'], labels: ['10px', '10px'], values: ['18px', '18px'], columns: [1, 1] });
  const mobileDimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(mobileDimensions.scrollWidth).toBeLessThanOrEqual(mobileDimensions.clientWidth);
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopTaiwanTypography = await afterHours.evaluate(card => {
    const styles = selector => getComputedStyle(card.querySelector(selector));
    return {
      headings: [styles('.advisor-twse-after-hours-head strong').fontSize, styles('.advisor-twse-valuation-head').fontSize],
      labels: [styles('.advisor-twse-after-hours-grid small').fontSize, styles('.advisor-twse-valuation-grid small').fontSize],
      values: [styles('.advisor-twse-after-hours-grid strong').fontSize, styles('.advisor-twse-valuation-grid strong').fontSize],
      columns: [styles('.advisor-twse-after-hours-grid').gridTemplateColumns.split(' ').length, styles('.advisor-twse-valuation-grid').gridTemplateColumns.split(' ').length]
    };
  });
  expect(desktopTaiwanTypography).toEqual({ headings: ['13px', '13px'], labels: ['10px', '10px'], values: ['18px', '18px'], columns: [2, 2] });
  await expect(taiwanValuation.locator('.advisor-twse-valuation-source')).toBeHidden();
  await taiwanValuation.locator('details > summary').click();
  await expect(taiwanValuation).toContainText('MoneyDJ PE/PB河流圖反算');
  await expect(taiwanValuation).not.toContainText('3.31×');
  await expect(taiwanValuation).not.toContainText('已更新');
  const embeddedFonts = await taiwanValuation.evaluate(el => Array.from(new Set([el, ...el.querySelectorAll('*')].map(node => getComputedStyle(node).fontFamily))));
  expect(embeddedFonts).toHaveLength(1);
  await expect(page.locator('.advisor-brief-grid')).not.toContainText('台股估值');
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
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
  expect(results.shortcut).toEqual({ panel: 'war-room', tab: 'war-briefing' });
  expect(results.parsed).toMatchObject({ panel: 'war-room', tab: 'war-briefing' });
});

test('Advisor menu opens the War Room in a new tab and preserves the Command Center page', async ({ page }) => {
  const originalUrl = page.url();
  await page.evaluate(() => {
    window.openedWarRoomTabs = [];
    window.open = (...args) => { window.openedWarRoomTabs.push(args); return null; };
    const section = Array.from(document.querySelectorAll('.advisor-menu-section')).find(item => item.querySelector('.advisor-menu-toggle')?.textContent.includes('戰情室'));
    const button = section && section.querySelector('.advisor-btn');
    if (!button) throw new Error('Advisor War Room shortcut was not found');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(await page.evaluate(() => window.openedWarRoomTabs)).toEqual([['./war-room.html?tab=war-briefing', '_blank', 'noopener']]);
  await expect(page).toHaveURL(originalUrl);
});

test('Clicking Zhuge in the Command Center opens the War Room in a new tab', async ({ page }) => {
  const originalUrl = page.url();
  await page.evaluate(() => {
    window.openedWarRoomTabs = [];
    window.open = (...args) => { window.openedWarRoomTabs.push(args); return null; };
  });
  const zhuge = page.locator('.animated-character[aria-label="諸葛亮，開啟角色面板"]');
  await expect(zhuge).toBeVisible();
  await zhuge.click();

  expect(await page.evaluate(() => window.openedWarRoomTabs)).toEqual([['./war-room.html?tab=war-briefing', '_blank', 'noopener']]);
  await expect(page).toHaveURL(originalUrl);
});

test('legacy battle report route redirects to the briefing without requesting battle data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  await page.route('https://example.test/**', route => {
    actions.push(new URL(route.request().url()).searchParams.get('action'));
    return route.fulfill({
    status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true, data: { summary: { marketStance: '觀望', upCount: 1, downCount: 2 }, holdings: [], funds: [], market: [
      { name: '台股融資餘額', current: 507462771000, previous: 500000000000 },
      { name: '台股維持率', current: 169.81, previous: 168 }
    ] } })
    });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  const requests = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.goto(`${standaloneUrl}?tab=war-battle-brief`);
  await expect(page.locator('h1')).toHaveText('諸葛軍師・戰情室');
  await expect(page).toHaveURL(/tab=war-briefing$/);
  await expect(page.locator('.tabs button.active')).toHaveText('帝國晨報');
  await expect(page.locator('#content')).not.toContainText('戰情總匯報');
  expect(actions).not.toContain('battleBrief');
  expect(await page.evaluate(() => sessionStorage.getItem('wealth_web_session_token'))).toBe('same-tab-session');
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(requests.some(path => path.endsWith('/index.html'))).toBe(false);
  expect(requests.some(path => path.endsWith('/junshifu-map.webp') || path.endsWith('/mobileBG.png'))).toBe(false);
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('legacy battle report link redirects without collecting foreign YTD data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  await page.route('https://example.test/**', async route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    actions.push(action);
    let data = {};
    if (action === 'advisorWorldBriefSnapshotRefresh') data = { snapshot: {
      market: { summary: { stance: '舊市場燈號' }, rows: [
        { code: 'NASDAQ:QQQM', name: '納斯達克100 ETF', price: 278.45, changePct: 0.43 },
        { code: 'NYSEARCA:SPY', name: '標普500 ETF', price: 6000, changePct: -0.2 },
        { code: '^TWII', name: '台灣加權指數', price: 27000, changePct: 0.1 }
      ] },
      macro: { judgment: { signal: '觀察', summary: '依總經資料觀察。' }, indicators: [], valuations: {} }, capturedAt: '2026-11-19T00:00:00Z'
    } };
    if (action === 'nasdaq100Valuation') data = { trailingPE: 30.52, trailingDataDate: '2026-11-18', forwardPE: 19.61, forwardDataDate: '2026-11-18', stale: false };
    if (action === 'warRoomTaiwanValuation') {
      await new Promise(resolve => setTimeout(resolve, 300));
      data = { trailingPE: 19.54, pb: 3.31, historicalPEMedian: { tenYear: 16.88 }, historicalPBMedian: { tenYear: 1.92 }, dataDate: '2026-11-18', source: 'MoneyDJ / TWSE' };
    }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('h2.section-title', { hasText: '核心市場' })).toHaveCount(0);
  await expect(page.locator('.brief-market-row')).toHaveCount(0);
  await expect(page.locator('.brief-state')).toHaveCount(1);
  await expect(page.locator('.brief-state')).toContainText('總經風險');
  await expect(page.locator('body')).not.toContainText(/納斯達克100 ETF|標普500 ETF|台灣加權指數|漲 \/ 跌|舊市場燈號/);
  const nasdaqCard = page.locator('.nasdaq-valuation-card:not(.taiex-valuation-card)');
  await expect(nasdaqCard).toContainText('30.52×');
  await expect(page.locator('.twse-valuation')).toContainText('19.54×');
  expect(actions).not.toContain('marketDashboard');
  expect(actions).not.toContain('warRoomQQQMQuote');
  expect(actions).toContain('advisorWorldBriefSnapshotRefresh');
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('Imperial Morning Brief hides market payload from the expandable snapshot on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'advisorWorldBriefSnapshotRefresh' ? { snapshot: {
      market: { summary: { stance: '歷史市場資料' }, rows: [{ code: 'NASDAQ:QQQM', name: '隱藏行情測試標的', price: 123.45 }] },
      macro: { judgment: { summary: '維持觀察。' }, indicators: [], valuations: {} },
      capturedAt: '2026-10-15T12:00:00Z'
    } } : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('details.details summary', { hasText: '完整快照資料' })).toBeVisible();
  await page.locator('details.details summary', { hasText: '完整快照資料' }).click();
  await expect(page.locator('details.details pre')).not.toContainText(/marketDashboard|NASDAQ:QQQM|隱藏行情測試標的|歷史市場資料/);
  await expect(page.locator('.brief-market-row')).toHaveCount(0);
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('Imperial Morning Brief shows TWSE verified Taiwan close data with DeepSeek summary on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    actions.push(action);
    const report = action === 'warRoomTaiwanCloseReport' ? {
      report: {
        status: 'published', marketDate: '2026-11-23',
        index: { name: '加權指數', close: 26800.25, changePoints: -120.5, changePercent: -0.45 },
        headline: '大盤震盪收低', summary: '加權指數收跌，報告僅整理當日已公布行情，不推論未來價格。',
        observations: ['上市市場成交集中於電子類股。'], mainRisk: '媒體來源對類股解讀不同，請以原始市場資料為準。',
        analysis: {
          technical: {
            dataDate: '2026-11-23', sessions: 80,
            returns: { fiveSession: 1.25, twentySession: 3.4, sixtySession: -2.1 },
            movingAverages: { five: 26700, twenty: 26500, sixty: 27000 },
            closeVsMovingAveragePercent: { five: 0.37, twenty: 1.13, sixty: -0.74 }, rsi14: 58.4
          },
          sectors: {
            advancing: 28, declining: 9,
            leaders: [{ name: '半導體類指數', changePercent: 2.8 }, { name: '電子零組件類指數', changePercent: 2.1 }],
            laggards: [{ name: '金融保險類指數', changePercent: -1.2 }, { name: '運動休閒類指數', changePercent: -0.8 }],
            note: '僅列單日產業指數強弱，不能據此判定持續輪動。'
          }
        },
        source: 'TWSE 官方行情與技術計算；DeepSeek 摘要',
        generatedAt: '2026-11-23T08:20:00.000Z',
        sources: [{ title: 'TWSE 每日收盤行情（價格指數）', url: 'https://www.twse.com.tw/exchangeReport/MI_INDEX?date=20261123&response=html&type=IND' }]
      }, status: 'published', stale: false
    } : {};
    return route.fulfill({ status:  200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data: report }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  const closeReport = page.locator('.taiwan-close-report');
  await expect(closeReport).toContainText('台股盤後報告');
  await expect(closeReport).toContainText('26,800.25');
  await expect(closeReport).toContainText('-120.50 點');
  await expect(closeReport).toContainText('-0.45%');
  await expect(closeReport).toContainText('資料日 2026-11-23');
  await expect(closeReport).toContainText('TWSE 官方資料 · DeepSeek 摘要');
  await expect(closeReport).toContainText('技術觀察');
  await expect(closeReport).toContainText('短線 · 5 日');
  await expect(closeReport).toContainText('RSI · 14 日');
  await expect(closeReport).toContainText('今日產業強弱');
  await expect(closeReport).toContainText('半導體');
  await expect(closeReport).toContainText('單日產業指數強弱');
  await expect(closeReport.locator('a')).toHaveAttribute('href', 'https://www.twse.com.tw/exchangeReport/MI_INDEX?date=20261123&response=html&type=IND');
  const reportFontSizes = await closeReport.evaluate(el => {
    const size = selector => getComputedStyle(el.querySelector(selector)).fontSize;
    return {
      title: size('.taiwan-close-report-head'),
      summary: size('.taiwan-close-report>p'),
      analysisTitle: size('.taiwan-close-report-analysis h4'),
      technicalValue: size('.taiwan-close-report-tech-grid strong'),
      sector: size('.taiwan-close-report-sector-grid li'),
      source: size('.taiwan-close-report-sources')
    };
  });
  expect(reportFontSizes).toEqual({ title: '14px', summary: '13px', analysisTitle: '13px', technicalValue: '14px', sector: '12px', source: '11px' });
  const mobileDimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(mobileDimensions.scrollWidth).toBeLessThanOrEqual(mobileDimensions.clientWidth);
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopFontSizes = await closeReport.evaluate(el => ({
    title: getComputedStyle(el.querySelector('.taiwan-close-report-head')).fontSize,
    summary: getComputedStyle(el.querySelector('.taiwan-close-report>p')).fontSize,
    analysisTitle: getComputedStyle(el.querySelector('.taiwan-close-report-analysis h4')).fontSize
  }));
  expect(desktopFontSizes).toEqual({ title: '14px', summary: '13px', analysisTitle: '13px' });
  expect(actions).toContain('warRoomTaiwanCloseReport');
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('Taiwan close report keeps its last successful day and displays a pending official-data retry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'warRoomTaiwanCloseReport' ? {
      report: {
        status: 'published', marketDate: '2026-11-20',
        index: { name: '加權指數', close: 36033.29, changePoints: -2393.6, changePercent: -6.23 },
        headline: '保留最近一次成功報告', summary: '只顯示已核實資料，不補造今日行情。',
        generatedAt: '2026-11-20T08:20:00.000Z',
        sources: [{ title: 'TWSE 官方收盤行情', url: 'https://www.twse.com.tw/exchangeReport/MI_INDEX?date=20261120&response=html&type=IND' }]
      },
      status: 'published', stale: true,
      attempt: { status: 'insufficient_data', message: 'TWSE 官方收盤資料尚未就緒，稍後會再確認。' }
    } : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  const closeReport = page.locator('.taiwan-close-report');
  await expect(closeReport).toContainText('保留最近一次成功報告');
  await expect(closeReport).toContainText('等待更新 · 顯示上次報告');
  await expect(closeReport).toContainText('TWSE 官方收盤資料尚未就緒，稍後會再確認。');
  await expect(closeReport).toContainText('36,033.29');
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('Imperial Morning Brief labels incomplete close data and does not invent index values', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'warRoomTaiwanCloseReport' ? {
      report: null,
      status: 'insufficient_data',
      stale: true,
      attempt: { status: 'insufficient_data', message: 'TWSE 官方當日收盤資料尚未發布。' }
    } : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  const closeReport = page.locator('.taiwan-close-report');
  await expect(closeReport).toContainText('資料不足');
  await expect(closeReport).toContainText('TWSE 官方當日收盤資料尚未發布。');
  await expect(closeReport.locator('.taiwan-close-report-index')).toHaveCount(0);
  const dimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('Standalone War Room shows sourced NASDAQ-100 valuations and dates on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'nasdaq100Valuation'
      ? { trailingPE: 30.52, trailingDataDate: '2026-10-22', forwardPE: 19.61, forwardDataDate: '2026-10-21', stale: false }
      : action === 'warRoomTaiwanValuation'
        ? { trailingPE: 22.48, pb: 2.61, historicalPEMedian: { tenYear: 18.32 }, historicalPBMedian: { tenYear: 1.74 }, dataDate: '2026-10-22', source: 'MoneyDJ PE/PB河流圖反算；TWSE同日收盤指數核對通過', status: '已更新' }
      : action === 'advisorWorldBriefSnapshotRefresh'
        ? { snapshot: { market: { summary: {}, rows: [] }, macro: { judgment: {}, indicators: [] }, capturedAt: '2026-10-23T00:00:00Z' } }
        : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  const card = page.locator('.nasdaq-valuation-card:not(.taiex-valuation-card)');
  await expect(card).toBeVisible();
  await expect(card.locator('.nasdaq-valuation-values > div').nth(0)).toContainText('30.52×');
  await expect(card.locator('.nasdaq-valuation-values > div').nth(0)).toContainText('2026-10-22');
  await expect(card.locator('.nasdaq-valuation-values > div').nth(1)).toContainText('19.61×');
  await expect(card.locator('.nasdaq-valuation-values > div').nth(1)).toContainText('2026-10-21');
  await card.locator('details > summary').click();
  await expect(card.locator('a')).toHaveAttribute('href', 'https://historyofmarket.com/nasdaq/ndx-forward-pe/');
  const afterHours = page.locator('.twse-after-hours-card');
  const taiwanValuation = afterHours.locator('.twse-valuation');
  await expect(taiwanValuation).toBeVisible();
  await expect(taiwanValuation.locator('.twse-valuation-head')).toHaveText('📊 台股估值');
  await expect(taiwanValuation).toContainText('近四季 Trailing P/E');
  await expect(taiwanValuation).toContainText('22.48×');
  await expect(taiwanValuation).toContainText('10 年中位數 P/E');
  await expect(taiwanValuation).toContainText('18.32×');
  await expect(taiwanValuation).toContainText('2026-10-22');
  const matchingTaiwanTypography = await afterHours.evaluate(card => {
    const styles = selector => getComputedStyle(card.querySelector(selector));
    return {
      headings: [styles('.twse-after-hours-head strong').fontSize, styles('.twse-valuation-head').fontSize],
      labels: [styles('.twse-after-hours-grid small').fontSize, styles('.twse-valuation .nasdaq-valuation-values small').fontSize],
      values: [styles('.twse-after-hours-grid strong').fontSize, styles('.twse-valuation .nasdaq-valuation-values strong').fontSize],
      columns: [styles('.twse-after-hours-grid').gridTemplateColumns.split(' ').length, styles('.twse-valuation .nasdaq-valuation-values').gridTemplateColumns.split(' ').length]
    };
  });
  expect(matchingTaiwanTypography).toEqual({ headings: ['15px', '15px'], labels: ['11px', '11px'], values: ['20px', '20px'], columns: [1, 1] });
  const mobileDimensions = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(mobileDimensions.scrollWidth).toBeLessThanOrEqual(mobileDimensions.clientWidth);
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopTaiwanTypography = await afterHours.evaluate(card => {
    const styles = selector => getComputedStyle(card.querySelector(selector));
    return {
      headings: [styles('.twse-after-hours-head strong').fontSize, styles('.twse-valuation-head').fontSize],
      labels: [styles('.twse-after-hours-grid small').fontSize, styles('.twse-valuation .nasdaq-valuation-values small').fontSize],
      values: [styles('.twse-after-hours-grid strong').fontSize, styles('.twse-valuation .nasdaq-valuation-values strong').fontSize],
      columns: [styles('.twse-after-hours-grid').gridTemplateColumns.split(' ').length, styles('.twse-valuation .nasdaq-valuation-values').gridTemplateColumns.split(' ').length]
    };
  });
  expect(desktopTaiwanTypography).toEqual({ headings: ['15px', '15px'], labels: ['11px', '11px'], values: ['22px', '22px'], columns: [2, 2] });
  await expect(taiwanValuation.locator('.twse-valuation details p')).toBeHidden();
  await taiwanValuation.locator('details > summary').click();
  await expect(taiwanValuation).toContainText('MoneyDJ PE/PB河流圖反算');
  await expect(taiwanValuation).not.toContainText('2.61×');
  await expect(taiwanValuation).not.toContainText('1.74×');
  await expect(taiwanValuation).not.toContainText('已更新');
  const standaloneFonts = await taiwanValuation.evaluate(el => Array.from(new Set([el, ...el.querySelectorAll('*')].map(node => getComputedStyle(node).fontFamily))));
  expect(standaloneFonts).toHaveLength(1);
  await expect(page.locator('.taiex-valuation-card')).toHaveCount(0);
  await expect(page.locator('h2.section-title', { hasText: '台股估值' })).toHaveCount(0);
  await expect(taiwanValuation.getByRole('link', { name: 'MoneyDJ P/E' })).toHaveAttribute('href', 'https://www.moneydj.com/Z/ZB/ZBL/ZBLB/ZBLB.djhtm');
  const taiwanDimensions = await afterHours.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(taiwanDimensions.scrollWidth).toBeLessThanOrEqual(taiwanDimensions.clientWidth);
  const dimensions = await card.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('Imperial Morning Brief keeps Nasdaq valuation drawdown while removing all core market rows on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
    localStorage.setItem('wealth_war_room_ytd_drawdown_v1', JSON.stringify({ savedAt: Date.now(), data: {
      year: '2026', indices: {
        nasdaq100: { year: '2026', maxDrawdownPct: -12.34, peakDate: '2026-01-15', troughDate: '2026-03-02', dataDate: '2026-11-03', sourceName: 'FRED（來源：Nasdaq）', sourceUrl: 'https://fred.stlouisfed.org/data/NASDAQ100' },
        sp500: { year: '2026', maxDrawdownPct: -13.34, peakDate: '2026-02-01', troughDate: '2026-03-03', dataDate: '2026-11-03', sourceName: 'FRED（來源：S&P Dow Jones Indices）', sourceUrl: 'https://fred.stlouisfed.org/data/SP500' },
        taiex: { year: '2026', maxDrawdownPct: -14.34, peakDate: '2026-04-01', troughDate: '2026-05-03', dataDate: '2026-11-04', sourceName: '臺灣證券交易所（TWSE）', sourceUrl: 'https://www.twse.com.tw/en/indices/taiex/mi-5min-hist.html' }
      }
    } }));
  });
  await page.route('https://example.test/**', async route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    if (action === 'warRoomYtdDrawdown') {
      await new Promise(resolve => setTimeout(resolve, 350));
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data: {
        year: '2026', stale: false, indices: {
          nasdaq100: { year: '2026', maxDrawdownPct: -10.25, peakDate: '2026-01-15', troughDate: '2026-03-02', dataDate: '2026-11-04', sourceName: 'FRED（來源：Nasdaq）', sourceUrl: 'https://fred.stlouisfed.org/data/NASDAQ100' },
          sp500: { year: '2026', maxDrawdownPct: -8.25, peakDate: '2026-02-01', troughDate: '2026-03-03', dataDate: '2026-11-04', sourceName: 'FRED（來源：S&P Dow Jones Indices）', sourceUrl: 'https://fred.stlouisfed.org/data/SP500' },
          taiex: { year: '2026', maxDrawdownPct: -7.25, peakDate: '2026-04-01', troughDate: '2026-05-03', dataDate: '2026-11-04', sourceName: '臺灣證券交易所（TWSE）', sourceUrl: 'https://www.twse.com.tw/en/indices/taiex/mi-5min-hist.html' }
        }
      } }) });
    }
    const data = action === 'nasdaq100Valuation'
      ? { trailingPE: 30.52, trailingDataDate: '2026-11-04', forwardPE: 19.61, forwardDataDate: '2026-11-04', stale: false }
      : action === 'advisorWorldBriefSnapshotRefresh'
        ? { snapshot: { market: { summary: {}, rows: [
          { code: 'NYSEARCA:SPY', name: '標普500 ETF', price: 6000, changePct: 0.2 },
          { code: '^TWII', name: '🇹🇼 台灣加權指數', price: 27000, changePct: -0.1 }
        ] }, macro: { judgment: {}, indicators: [] }, capturedAt: '2026-11-04T12:00:00Z' } }
        : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('.brief-macro-grid')).toBeHidden();
  await expect(page.locator('h2.section-title', { hasText: '核心市場' })).toHaveCount(0);
  await expect(page.locator('.brief-market-row')).toHaveCount(0);
  await expect(page.locator('#nasdaq-ytd-drawdown')).toContainText('2026-11-04');
  await expect(page.locator('#nasdaq-ytd-drawdown a')).toHaveAttribute('href', 'https://fred.stlouisfed.org/data/NASDAQ100');
  await expect(page.locator('#nasdaq-ytd-drawdown')).toContainText('-10.25%');
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('legacy battle report link does not fetch battle or TWSE foreign YTD data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install({ time: new Date('2026-10-13T05:00:00.000Z') });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  const externalRequests = [];
  page.on('request', request => externalRequests.push(request.url()));
  await page.route('https://example.test/**', route => {
    actions.push(new URL(route.request().url()).searchParams.get('action'));
    return route.fulfill({
    status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true, data: { summary: {}, holdings: [], funds: [], market: [] } })
    });
  });
  await page.goto(`${standaloneUrl}?tab=war-battle-brief`);
  await expect(page).toHaveURL(/tab=war-briefing$/);
  await expect(page.locator('.tabs button')).toHaveText(['帝國晨報', '部隊陣容']);
  await expect(page.locator('#content')).not.toContainText('戰情總匯報');
  await expect(page.locator('#content')).not.toContainText('外資及陸資今年累計買賣超');
  expect(actions).not.toContain('battleBrief');
  expect(externalRequests.some(url => url.includes('twse.com.tw/rwd/zh/fund/BFI82U'))).toBe(false);
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('standalone route renews an expired shared session before loading its selected tab', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now() - 8 * 86400000));
    sessionStorage.removeItem('wealth_web_session_token');
  });
  const actions = [];
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    actions.push(action);
    const data = { sessionToken: 'renewed-session' };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  await page.goto(`${standaloneUrl}?tab=war-taiwan-macro`);
  await expect(page).toHaveURL(/tab=war-briefing$/);
  await expect(page.locator('.tabs button')).toHaveText(['帝國晨報', '部隊陣容']);
  expect(actions).not.toContain('taiwanMacroOverview');
  expect(actions).not.toContain('taiwanMacroHistory');
  expect(actions).not.toContain('taiwanMacroUpdate');
  expect(await page.evaluate(() => sessionStorage.getItem('wealth_web_session_token'))).toBe('renewed-session');
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('Troop Roster calendar lists XQQI on the fourth day of every month', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'heroes' || action === 'holdingsOverview' ? [] : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-roster`);
  await expect(page.locator('.roster-stats')).toBeVisible();
  for (let month = 0; month < 12; month += 1) {
    await expect(page.locator('[data-day="4"]')).toHaveAttribute('aria-label', /XQQI/);
    if (month < 11) await page.locator('[data-month="1"]').click();
  }
  const width = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth);
});

test('standalone tabs remain switchable among the active War Room areas', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    let data = {};
    if (action === 'macroOverview') data = { judgment: { summary: '市場資料已更新，維持觀察。', date: '2026-10-03' }, indicators: [] };
    if (action === 'advisorWorldBriefSnapshotRefresh') data = { snapshot: { market: { summary: { stance: '觀望', upCount: 2, downCount: 1 }, rows: [] }, macro: { judgment: { summary: '市場資料已更新，維持觀察。', date: '2026-10-03' }, indicators: [], valuations: {} }, capturedAt: '2026-10-03T12:00:00Z' } };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('.brief-hero h2')).toContainText('帝國晨報');
  await page.getByRole('button', { name: '部隊陣容' }).click();
  await expect(page.locator('.tabs button.active')).toHaveText('部隊陣容');
  await page.getByRole('button', { name: '帝國晨報' }).click();
  await expect(page.locator('.tabs button.active')).toHaveText('帝國晨報');
  await expect(page.locator('.brief-insight')).toContainText('市場資料已更新');
});

test('a late Imperial Morning Brief response cannot replace the selected Troop Roster tab', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  let releaseBrief;
  let briefStarted;
  const briefGate = new Promise(resolve => { releaseBrief = resolve; });
  const started = new Promise(resolve => { briefStarted = resolve; });
  await page.route('https://example.test/**', async route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    let data = {};
    if (action === 'advisorWorldBriefSnapshotRefresh') {
      briefStarted();
      await briefGate;
      data = { snapshot: { market: { rows: [] }, macro: { judgment: { summary: '遲到的帝國晨報' }, indicators: [] }, capturedAt: '2026-11-11T00:00:00Z' } };
    } else if (action === 'holdingsOverview' || action === 'heroes') data = [];
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await started;
  await page.getByRole('button', { name: '部隊陣容' }).click();
  await expect(page).toHaveURL(/tab=war-roster$/);
  await expect(page.locator('.roster-stats')).toBeVisible();
  releaseBrief();
  await expect(page.getByText('遲到的帝國晨報')).toHaveCount(0);
  await expect(page.locator('.roster-stats')).toBeVisible();
  await expect(page.locator('#page-title')).toHaveText('部隊陣容');
  const width = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth);
});

test('Imperial Morning Brief bypasses an empty macro snapshot and reads valid indicators directly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    actions.push(action);
    let data = {};
    if (action === 'macroOverview') data = { hasData: true, sourceDate: '2026/11/10', indicators: [{ code: 'cpi', name: 'CPI', value: 3.2, displayValue: '3.2%', status: '觀察' }] };
    if (action === 'marketDashboard') data = { summary: {}, rows: [] };
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [{ capturedAt: new Date().toISOString(), metadata: { marketDashboard: { summary: {}, rows: [] }, macroOverview: { hasData: true, sourceDate: '2026/11/12', values: { cpi: 99 }, indicators: [{ code: 'cpi', value: null, displayValue: '--', status: '無資料' }, { code: 'twseMarginBalance', value: 999, displayValue: '999', status: '有資料' }] } } }] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('.brief-macro-grid')).toBeHidden();
  await page.locator('.brief-compact-details').filter({ hasText: '完整總經指標' }).locator('summary').click();
  await expect(page.locator('.brief-macro-grid')).toContainText('3.2%');
  await expect(page.locator('#content')).toContainText('指標資料日 2026/11/10');
  expect(actions).toContain('macroOverview');
  expect(actions).not.toContain('advisorWorldBriefSnapshotRefresh');
  const width = await page.locator('html').evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth);
});

test('Imperial Morning Brief reports a partial macro API failure instead of silently calling empty cache updated', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    if (action === 'macroOverview') return route.fulfill({ status: 403, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: false, error: 'read denied' }) });
    const data = action === 'marketDashboard' ? { summary: {}, rows: [] } : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.route('https://api.ark-os26.cc/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ records: [] }) }));

  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('#content')).toContainText('總經燈號尚未取得有效指標：HTTP 403');
});

test('standalone pauses sector rotation and redirects its old link without requesting sector data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  await page.route('https://example.test/**', route => {
    actions.push(new URL(route.request().url()).searchParams.get('action'));
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data: {} }) });
  });
  await page.goto(`${standaloneUrl}?tab=war-sector-rotation`);
  await expect(page).toHaveURL(/tab=war-briefing/);
  await expect(page.locator('.tabs button')).toHaveText(['帝國晨報', '部隊陣容']);
  await expect(page.locator('#content')).not.toContainText('產業輪動');
  expect(actions).not.toContain('marketSectorRotation');
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('Imperial Morning Brief shows Taiwan close and listed financing values with source dates on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  await page.route('https://example.test/**', route => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const data = action === 'warRoomTwseAfterHoursOverview' ? {
      source: 'TWSE 臺灣證券交易所', checkedAt: '2026-11-20T22:00:00+08:00',
      index: { close: 23999.12, changePoints: -123.45, changePct: -0.51, sourceDate: '2026-11-20' },
      margin: { previousBalanceTWD: 561230000000, balanceTWD: 560000000000, changeTWD: -1230000000, sourceDate: '2026-11-20' }
    } : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('.twse-after-hours-card')).toContainText('23,999.12');
  await expect(page.locator('.twse-after-hours-card')).toContainText('-123.45 點（-0.51%）');
  await expect(page.locator('.twse-after-hours-card')).toContainText('-12.3 億');
  await expect(page.locator('.twse-after-hours-card')).toContainText('5,600 億元');
  await expect(page.locator('.twse-after-hours-card')).toContainText('2026/11/20');
  const width = await page.locator('html').evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('War Room close report includes a US tab that loads the OpenAI-backed sourced report on demand', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec'); localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok'); localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_web_session_token', 'same-tab-session');
  });
  const actions = [];
  await page.route('https://example.test/**', async route => {
    const request = route.request();
    const action = request.method() === 'POST'
      ? JSON.parse(request.postData() || '{}').action
      : new URL(request.url()).searchParams.get('action');
    actions.push(action);
    const report = {
      status: 'published', marketDate: '2026-11-23', generatedAt: '2026-11-24T01:00:00Z',
      headline: '大型指數收盤分歧', summary: 'NASDAQ-100 與 S&P 500 收盤表現分歧；中短期技術指標僅描述歷史日收盤變化。',
      observations: ['NASDAQ-100 近 5 日上漲，20 日與 60 日狀態請依卡片觀察。'],
      mainRisk: '本報整理歷史資料，不是價格預測或投資建議。',
      indices: [
        { key: 'nasdaq100', name: 'NASDAQ-100', close: 25123.45, change: 125.67, changePercent: 0.5, dataDate: '2026-11-23', technical: { fiveSessionReturn: 1.25, twentySessionReturn: 2.5, sixtySessionReturn: 4.2, closeVsMovingAveragePercent: { twenty: 1.1, sixty: 2.3 }, rsi14: 54.2 } },
        { key: 'sp500', name: 'S&P 500', close: 6754.32, change: -12.34, changePercent: -0.18, dataDate: '2026-11-23', technical: { fiveSessionReturn: 0.2, twentySessionReturn: 1.3, sixtySessionReturn: 3.4, closeVsMovingAveragePercent: { twenty: -0.3, sixty: -1.4 }, rsi14: 42.7 } }
      ],
      sources: [
        { title: 'FRED（來源：Nasdaq）', url: 'https://fred.stlouisfed.org/data/NASDAQ100' },
        { title: 'FRED（來源：S&P Dow Jones Indices）', url: 'https://fred.stlouisfed.org/data/SP500' }
      ]
    };
    const data = action === 'warRoomUsCloseReportGenerate' ? { report, status: 'published', stale: false, updated: true } : {};
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, data }) });
  });
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  const reportTabs = page.getByRole('tab');
  await expect(reportTabs).toHaveText(['🇹🇼 台股盤後報告', '🇺🇸 美股盤後報告']);
  await expect(page.locator('.taiwan-close-report')).toBeVisible();
  expect(actions).not.toContain('warRoomUsCloseReportGenerate');
  await reportTabs.nth(1).click();
  const usReport = page.locator('.us-close-report');
  await expect(usReport).toContainText('NASDAQ-100');
  await expect(usReport).toContainText('S&P 500');
  await expect(usReport).toContainText('2026-11-23');
  await expect(usReport.locator('.us-close-report-section-title')).toHaveText('主要觀察');
  await expect(usReport).toContainText('RSI 14 日');
  await expect(usReport.locator('.us-close-report-tech-grid > div')).toHaveCount(8);
  await expect(usReport.locator('a')).toHaveCount(2);
  expect(actions).toContain('warRoomUsCloseReportGenerate');
  const layout = await usReport.evaluate(el => ({
    gridColumns: getComputedStyle(el.querySelector('.us-close-report-index')).gridTemplateColumns.split(' ').length,
    technicalColumns: getComputedStyle(el.querySelector('.us-close-report-tech-grid')).gridTemplateColumns.split(' ').length,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth
  }));
  expect(layout.gridColumns).toBe(1);
  expect(layout.technicalColumns).toBe(2);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopLayout = await usReport.evaluate(el => ({
    gridColumns: getComputedStyle(el.querySelector('.us-close-report-index')).gridTemplateColumns.split(' ').length,
    technicalColumns: getComputedStyle(el.querySelector('.us-close-report-tech-grid')).gridTemplateColumns.split(' ').length,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth
  }));
  expect(desktopLayout.gridColumns).toBe(2);
  expect(desktopLayout.technicalColumns).toBe(4);
  expect(desktopLayout.scrollWidth).toBeLessThanOrEqual(desktopLayout.clientWidth);
  await reportTabs.nth(0).click();
  await expect(page.locator('.taiwan-close-report')).toBeVisible();
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
  page.on('request', request => { try { if (request.serviceWorker()) return; requests.push({ url: request.url(), type: request.resourceType(), frame: request.frame().url() }); } catch (error) { /* Ignore service worker precache fetches; this test checks page initiated requests. */ } });
  await page.goto(`${standaloneUrl}?tab=war-briefing`);
  await expect(page.locator('h1')).toHaveText('諸葛軍師・戰情室');
  await page.waitForTimeout(300);
  const pageRequests = requests.map(request => request.url);
  expect(pageRequests.some(request => /(?:^|\/)index\.html(?:\?|$)/.test(request))).toBe(false);
  expect(pageRequests.some(request => /(?:^|\/)war-room-app\.js(?:\?|$)/.test(request))).toBe(true);
  expect(pageRequests.some(request => /(?:^|\/)war-room\.css(?:\?|$)/.test(request))).toBe(true);
  expect(pageRequests.some(request => /api\.open-meteo\.com|characterAnimations\.js|AnimatedCharacter\.js|junshifu-map|mobileBG/.test(request)), JSON.stringify(pageRequests)).toBe(false);
  expect(pageRequests.some(request => /[?&]action=(?:config|dividendCenter|holdingsOverview|assetSnapshot)(?:&|$)/.test(request))).toBe(false);
});
