const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('Pangtong income shortcuts map to fixed Stock account', async ({ page }) => {
  await page.goto(dashboardUrl);
  const commands = await page.evaluate(() => ['工作','兼職','房租','買賣','爸媽','退稅'].map(keyword => advisorAICommand(keyword + ' 5000')));
  expect(commands).toEqual([
    { intent: 'income', source: '👷工作所得', account: '💵國泰Stock', amount: 5000, note: '龐統口令：工作' },
    { intent: 'income', source: '🪙副業兼職', account: '💵國泰Stock', amount: 5000, note: '龐統口令：兼職' },
    { intent: 'income', source: '🪙副業兼職', account: '💵國泰Stock', amount: 5000, note: '龐統口令：房租' },
    { intent: 'income', source: '💲交易所得', account: '💵國泰Stock', amount: 5000, note: '龐統口令：買賣' },
    { intent: 'income', source: '🤶爸媽收入', account: '💵國泰Stock', amount: 5000, note: '龐統口令：爸媽' },
    { intent: 'income', source: '🪙機構退稅', account: '💵國泰Stock', amount: 5000, note: '龐統口令：退稅' }
  ]);
});

test('Pangtong financial commands show a confirmation card before writing', async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => {
    const panel = document.getElementById('advisor-shortcut-panel');
    panel.innerHTML = '';
    advisorAIShowWriteConfirmation({
      intent: 'income',
      source: '🪙副業兼職',
      account: '💵國泰Stock',
      amount: 5000,
      note: '龐統口令：兼職'
    });
  });
  await expect(page.locator('#advisor-shortcut-panel')).toContainText('請確認財務操作');
  await expect(page.locator('#advisor-shortcut-panel')).toContainText('收入來源：🪙副業兼職');
  await expect(page.locator('#advisor-shortcut-panel').getByRole('button', { name: '取消' })).toBeVisible();
  await expect(page.locator('#advisor-shortcut-panel').getByRole('button', { name: '確認記錄' })).toBeVisible();
});

test('Pangtong quick transfer entry and transfer commands are removed', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => ({
    quickCommands: advisorAIQuickCommands().map(item => item.label),
    transferCommand: advisorAICommand('國泰轉玉山 1000')
  }));
  expect(result.quickCommands).not.toContain('快速轉帳');
  expect(result.transferCommand.intent).toBe('unknown');
});

test('dividend calculator is the second holdings center tab and Pangtong routes there', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const content = document.createElement('div');
    content.id = 'dividend-center-content';
    document.body.appendChild(content);
    dividendCenterCache = { pending: [], holdingTradePending: [] };
    dividendCenterView = 'pending';
    content.innerHTML = renderDividendCenter(dividendCenterCache, true);
    const pendingView = {
      tabs: Array.from(content.querySelectorAll('.dividend-center-tab')).map(button => button.textContent.trim()),
      hasHoldingEntry: !!content.querySelector('form[onsubmit="submitHoldingTradeEntry(event)"]'),
      hasCalculator: !!content.querySelector('#advisor-div-calc-investment')
    };
    content.querySelector('.dividend-center-tab:nth-child(2)').click();
    const calculatorView = {
      hasCalculator: !!content.querySelector('#advisor-div-calc-investment'),
      hasHoldingEntry: !!content.querySelector('form[onsubmit="submitHoldingTradeEntry(event)"]'),
      title: content.querySelector('.advisor-shortcut-title')?.textContent.trim()
    };
    let route;
    const originalOpenEmpireCardShortcut = openEmpireCardShortcut;
    openEmpireCardShortcut = (...args) => { route = args; };
    advisorAIOpenDividendCalculator();
    openEmpireCardShortcut = originalOpenEmpireCardShortcut;
    return { pendingView, calculatorView, route };
  });
  expect(result.pendingView).toEqual({
    tabs: ['待入帳持股記錄', '🧮 配息試算'],
    hasHoldingEntry: true,
    hasCalculator: false
  });
  expect(result.calculatorView).toEqual({
    hasCalculator: true,
    hasHoldingEntry: false,
    title: '🧮 配息試算'
  });
  expect(result.route).toEqual([null, 'finance', 'dividend-center']);
});

test('Pangtong income dropdown builds a fixed Stock income command', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const panel = document.getElementById('advisor-shortcut-panel');
    openAdvisorAI(panel);
    const select = document.getElementById('advisor-ai-income-select');
    return {
      optionLabels: Array.from(select.options).map(option => option.textContent),
      command: advisorAIQuickIncomeCommand('👷工作所得', '5000')
    };
  });
  expect(result.optionLabels).toEqual([
    '收入來源', '💰投資理財', '👷工作所得', '🪙副業兼職', '💲交易所得', '🤶爸媽收入', '🪙機構退稅'
  ]);
  expect(result.command).toEqual({
    intent: 'income', source: '👷工作所得', account: '💵國泰Stock', amount: 5000, note: '龐統下拉收入：👷工作所得'
  });
});

test('00998A is available in finance stock booking options', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => ({
    stockDefault: STOCK_SYMBOLS.some(item => normalizeKey(item.value) === '00998A'),
    dividendDefault: DIVIDEND_SYMBOLS.some(item => normalizeKey(item.value) === '00998A'),
    apiList: normalizeBookingSymbolList([{ value: '00998A', label: '00998A' }])
  }));
  expect(result.stockDefault).toBe(true);
  expect(result.dividendDefault).toBe(true);
  expect(result.apiList).toEqual([{ value: '🪙00998A', label: '🪙00998A' }]);
});

test('a new ledger entry is allowed after a different previous entry was confirmed', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    window.API_URL = 'https://example.test/web-app';
    window.ledgerPendingBusy = {};
    const key = 'ledger-pending-v1:' + window.API_URL + ':expense';
    localStorage.setItem(key, JSON.stringify({ requestId: 'old-request', fingerprint: 'old-entry' }));
    window.apiGet = () => Promise.resolve({ requestId: 'old-request', recorded: true, row: {} });
    let posted = null;
    window.apiPostJson = body => { posted = body; return Promise.resolve({ ok: true }); };
    await submitLedgerPending({
      action: 'expense', date: '2026/09/09', cat: '🍽️外食餐飲', account: '🏔️玉山銀行', amount: 1019,
      note: '龐統快速支出', requestId: 'new-request'
    });
    return posted;
  });
  expect(result.requestId).toBe('new-request');
  expect(result.cat).toBe('🍽️外食餐飲');
  expect(result.amount).toBe(1019);
});

test('Pangtong quick expense shares the finance booking queue', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const panel = document.getElementById('advisor-shortcut-panel');
    bookingWriteQueue.length = 0;
    openAdvisorAI(panel);
    const queue = panel.querySelector('[data-booking-queue-content]');
    const id = bookingQueueAdd({ action: 'expense', date: '2026/09/12', cat: '🍽️外食餐飲', account: '🏔️玉山銀行', amount: 1019 });
    const pending = queue.textContent;
    bookingQueueUpdate(id, 'success', '');
    return { pending, recorded: queue.textContent };
  });
  expect(result.pending).toContain('待同步');
  expect(result.pending).toContain('🍽️外食餐飲');
  expect(result.recorded).toContain('已記錄');
});

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
  const pangtong = page.getByRole('button', { name: '龐統，開啟角色面板' });
  const zhuge = page.getByRole('button', { name: '諸葛亮，開啟角色面板' });
  const liubei = page.getByRole('button', { name: '劉備，開啟角色面板' });
  const manchong = page.getByRole('button', { name: '滿寵，開啟角色面板' });
  const xunyu = page.getByRole('button', { name: '荀彧，開啟角色面板' });
  await expect(pangtong).toBeVisible();
  await expect(zhuge).toBeVisible();
  await expect(liubei).toBeVisible();
  await expect(manchong).toBeVisible();
  await expect(xunyu).toBeVisible();
  await expect(page.locator('.npc-web-scene-map')).toHaveAttribute('src', './junshifu-map.png?v=20260910-bg4');
  expect(await page.evaluate(() => window.characterPositions.pangtong.left)).toBe('39%');
  expect(await page.evaluate(() => window.characterPositions.zhuge.left)).toBe('52%');
  expect(await page.evaluate(() => window.characterPositions.chenqun.left)).toBe('20%');
  await expect(pangtong).toHaveCSS('--mobile-top', 'calc(27.5% - 24px)');
  await expect(pangtong).toHaveCSS('--mobile-left', '19.5%');
  await expect(pangtong).toHaveCSS('--mobile-width', '13%');
  await expect(zhuge).toHaveCSS('--mobile-top', 'calc(27.5% - 24px)');
  await expect(zhuge).toHaveCSS('--mobile-left', '68.5%');
  await expect(zhuge).toHaveCSS('--mobile-width', '13%');
  await expect(liubei).toHaveCSS('--mobile-top', 'calc(23.5% - 36px)');
  await expect(liubei).toHaveCSS('--mobile-left', '43%');
  await expect(liubei).toHaveCSS('--mobile-width', '14%');
  await expect(liubei.locator('img')).toHaveCount(17);
  expect(await page.evaluate(() => Object.keys(window.liubeiAnimations.frames).length)).toBe(17);
  expect(await page.evaluate(() => window.liubeiAnimations.frames['17'])).toBe('./劉備/王府前站立17.png?v=20260908-liubei-battle1');
  expect(await page.evaluate(() => window.liubeiAnimations.frameScale['12'])).toBe(1.65);
  expect(await page.evaluate(() => window.liubeiAnimations.frameScale['17'])).toBe(1.2);
  expect(await page.evaluate(() => window.liubeiAnimations.events.specialAction.sequence.map(step => step.frame))).toEqual(['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '01']);
  expect(await page.evaluate(() => Object.keys(window.chenqunAnimations.frames).length)).toBe(17);
  expect(await page.evaluate(() => window.chenqunAnimations.frames['17'])).toBe('./陳群/chenqun_idle_17.png');
  await expect(manchong.locator('img')).toHaveCount(9);
  expect(await page.evaluate(() => Object.keys(window.manchongAnimations.frames).length)).toBe(9);
  expect(await page.evaluate(() => window.manchongAnimations.idleFrame)).toBe('05');
  expect(await page.evaluate(() => Object.values(window.manchongAnimations.frames).every(src => src.includes('?v=20260907-manchong-weapons1')))).toBeTruthy();
  expect(await page.evaluate(() => JSON.stringify(window.manchongAnimations).includes('工人回家10.png'))).toBeFalsy();
  expect(await page.evaluate(() => window.characterPositions.liubei.top)).toBe('calc(30% + 40px)');
  await expect(xunyu.locator('img')).toHaveCount(12);
  expect(await page.evaluate(() => Object.keys(window.xunyuAnimations.frames).length)).toBe(12);
  expect(await page.evaluate(() => window.xunyuAnimations.frames['12'])).toBe('./荀彧/文雅報告完畢12.png?v=20260908-xunyu-shangshutai1');
  expect(await page.evaluate(() => window.xunyuAnimations.events.specialAction.sequence.map(step => step.frame))).toEqual(['07', '08', '09', '10', '11', '12', '01']);
});

test('standalone calendar interfaces are removed and agenda data is not prefetched', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const calendarCalls = [];
  page.on('request', request => {
    if (request.url().includes('action=todayCalendar')) calendarCalls.push(request.url());
  });
  await page.goto(dashboardUrl);
  await expect(page.locator('#today-agenda')).toHaveCount(0);
  await expect(page.locator('#mobile-calendar-slot')).toHaveCount(0);
  await expect(page.locator('#scene-agenda-slot')).toHaveCount(0);
  await expect(page.locator('#home-agenda-calendar')).toBeHidden();
  await expect(page.locator('.home-agenda-wrap')).toBeHidden();
  await expect(page.locator('#xunyu-dashboard')).toHaveCount(0);
  expect(calendarCalls).toHaveLength(0);
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
