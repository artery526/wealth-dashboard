const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('military dividend calendar follows the supplied weekly and monthly dates', async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => ensureMilitaryModule());
  const result = await page.evaluate(() => {
    let apiCalls = 0;
    const originalApiGet = apiGet;
    apiGet = (...args) => { apiCalls++; return originalApiGet(...args); };
    const october = councilDividendEventsForMonth(2026, 9);
    const oct16 = october.find(item => item.day === 16).symbols;
    const oct19 = october.find(item => item.day === 19).symbols;
    const february = councilDividendEventsForMonth(2026, 1);
    const feb28 = february.find(item => item.day === 28).symbols;
    const februaryHas29 = february.some(item => item.day === 29);
    apiGet = originalApiGet;
    return { oct16, oct19, feb28, februaryHas29, apiCalls };
  });
  expect(result.oct16).toEqual(['AIPI', 'CHPY', '國泰高股息B', '00997A', '00998A']);
  expect(result.oct19).toEqual(['MLPI', 'QQQI']);
  expect(result.feb28).toContain('00985B');
  expect(result.februaryHas29).toBe(false);
  expect(result.apiCalls).toBe(0);
});

test('military dividend calendar supports date filtering and fits a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(dashboardUrl);
  await page.evaluate(() => ensureMilitaryModule());
  const result = await page.evaluate(() => {
    councilDividendCalendarMonth = new Date(2026, 9, 1);
    const host = document.createElement('div');
    host.id = 'council-dividend-calendar';
    document.body.appendChild(host);
    renderCouncilDividendCalendarIntoHost();
    host.querySelector('.council-dividend-day[aria-label^="2026/10/16"]').click();
    const selectedText = host.querySelector('.council-dividend-list').textContent;
    const bounds = host.getBoundingClientRect();
    return {
      selectedText,
      width: bounds.width,
      right: bounds.right,
      viewport: window.innerWidth,
      days: host.querySelectorAll('.council-dividend-day:not(.is-empty)').length
    };
  });
  expect(result.selectedText).toContain('00997A');
  expect(result.selectedText).toContain('00998A');
  expect(result.selectedText).not.toContain('MLPI');
  expect(result.right).toBeLessThanOrEqual(result.viewport + 1);
  expect(result.days).toBe(31);
});

test('military roster includes the dividend calendar without loading dividend data', async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => ensureMilitaryModule());
  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    renderCouncilRoster([], host, null, null);
    return {
      hasCalendar: !!host.querySelector('#council-dividend-calendar'),
      title: host.querySelector('.council-dividend-title')?.textContent,
      apiUrl: typeof API_URL === 'string' ? API_URL : ''
    };
  });
  expect(result.hasCalendar).toBe(true);
  expect(result.title).toBe('配息月曆');
});

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

test('Pangtong holding settlement writes the display symbol for monthly holdings matching', async ({ page }) => {
  await page.goto(dashboardUrl);
  const payload = await page.evaluate(async () => {
    let request;
    advisorAIRequireWrite = () => true;
    apiPost = async body => { request = body; return { message: 'ok' }; };
    advisorHoldingTradeRecordPending = {
      row: { symbol: '施羅德收益成長A2', displaySymbol: '🌳施羅德收益成長A2', rowId: '17' },
      amount: 90000,
      shares: 22.38,
      direction: '買入'
    };
    await advisorAIConfirmHoldingTrade(null);
    return request;
  });
  expect(payload).toMatchObject({
    from: '💵國泰Stock',
    to: '🌳施羅德收益成長A2',
    label: '🌳施羅德收益成長A2',
    stockSymbol: '施羅德收益成長A2',
    stockAmount: 90000,
    stockShares: 22.38,
    holdingTradeRowId: '17'
  });
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
    '收入來源', '📦持股入帳', '💰投資理財', '👷工作所得', '🪙副業兼職', '💲交易所得', '🤶爸媽收入', '🪙機構退稅'
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

test('dividend calculator fills shares from investment and price', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const content = document.createElement('div');
    content.innerHTML = renderDividendCalculatorPanel();
    document.body.appendChild(content);
    document.getElementById('advisor-div-calc-investment').value = '400000';
    document.getElementById('advisor-div-calc-price').value = '56.02';
    document.getElementById('advisor-div-calc-rate').value = '0.48';
    advisorDividendCalcUpdate();
    return {
      inputShares: document.getElementById('advisor-div-calc-shares').value,
      resultShares: document.getElementById('advisor-div-calc-shares-result').textContent
    };
  });
  expect(result.inputShares).toBe('7140');
  expect(result.resultShares).toBe('7,140 股');
});

test('mobile dividend picker stays inside the viewport and scrolls internally', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    const panel = document.createElement('div');
    panel.className = 'booking-dividend-panel is-floating';
    panel.innerHTML = '<div class="booking-dividend-head"><div>待入帳配息</div><button>×</button></div>' + '<div style="height:1200px">內容</div>';
    document.body.appendChild(panel);
    const style = getComputedStyle(panel);
    const rect = panel.getBoundingClientRect();
    return {
      position: style.position,
      left: rect.left,
      right: window.innerWidth - rect.right,
      top: rect.top,
      bottom: window.innerHeight - rect.bottom,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      maxHeight: style.maxHeight
    };
  });
  expect(result.position).toBe('fixed');
  expect(result.left).toBeGreaterThanOrEqual(12);
  expect(result.right).toBeGreaterThanOrEqual(12);
  expect(result.top).toBeGreaterThanOrEqual(12);
  expect(result.bottom).toBeGreaterThanOrEqual(12);
  expect(result.overflowX).toBe('hidden');
  expect(result.overflowY).toBe('auto');
  expect(result.maxHeight).toBe('none');
});

test('treasury renders fresh cache immediately and revalidates in the background', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    window.API_URL = 'https://example.test/web-app';
    window.financeTreasuryPromise = null;
    window.financeTreasuryLastFetchAt = 0;
    localStorage.setItem(FINANCE_TREASURY_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      data: { accs: [{ name: '💵國泰Stock', value: 1234 }, { name: '總資產', value: 1234 }], monthly: { ym: currentYM(), income: 45390, expense: 26950, net: 18440, savingRate: '40.6%' }, assetSnapshot: null, bills: [] }
    }));
    const calls = [];
    const oldApiGet = apiGet;
    apiGet = params => {
      calls.push(params.action);
      if (params.action === 'accounts') return Promise.resolve([{ name: '💵國泰Stock', value: 5678 }, { name: '總資產', value: 5678 }]);
      if (params.action === 'monthly') return Promise.resolve({ ym: currentYM(), income: 114860, expense: 62906, net: 51954, savingRate: '45.2%' });
      if (params.action === 'assetSnapshot') return Promise.resolve(null);
      return Promise.resolve([]);
    };
    const freshness = document.createElement('div');
    freshness.id = 'finance-treasury-freshness';
    document.body.appendChild(freshness);
    const content = document.createElement('div');
    content.id = 'acc-content';
    document.body.appendChild(content);
    const request = loadAccounts();
    const cacheVisibleBeforeRefresh = content.textContent.includes('1,234');
    await request;
    apiGet = oldApiGet;
    return { cacheVisibleBeforeRefresh, freshVisibleAfterRefresh: content.textContent.includes('5,678'), fullMonthVisible: content.textContent.includes('114,860'), calls };
  });
  expect(result.cacheVisibleBeforeRefresh).toBe(true);
  expect(result.freshVisibleAfterRefresh).toBe(true);
  expect(result.fullMonthVisible).toBe(true);
  expect(result.calls.sort()).toEqual(['accounts', 'assetSnapshot', 'bills', 'monthly']);
});

test('treasury keeps the last valid monthly totals when monthly API refresh fails', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    const oldApiGet = apiGet;
    apiGet = params => {
      if (params.action === 'accounts') return Promise.resolve([]);
      if (params.action === 'monthly') return Promise.reject(new Error('temporary API failure'));
      if (params.action === 'transactions') return Promise.resolve([]);
      if (params.action === 'assetSnapshot') return Promise.resolve(null);
      return Promise.resolve([]);
    };
    const data = await fetchFinanceTreasuryData({
      monthly: { ym: currentYM(), income: 73337, expense: 48297, net: 25040, savingRate: '34.1%' }
    });
    apiGet = oldApiGet;
    return data.monthly;
  });
  expect(result).toEqual({ ym: expect.any(String), income: 73337, expense: 48297, net: 25040, savingRate: '34.1%' });
});

test('treasury does not show zero totals when monthly summary is unavailable', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    const oldApiGet = apiGet;
    apiGet = params => params.action === 'accounts'
      ? Promise.resolve([{ name: '💵國泰Stock', value: 1234 }, { name: '總資產', value: 1234 }])
      : Promise.reject(new Error('monthly unavailable'));
    const data = await fetchFinanceTreasuryData(null);
    const content = document.createElement('div');
    renderAccounts(data.accs, data.monthly, content, null, [], false);
    apiGet = oldApiGet;
    return {
      unavailable: data.monthly.unavailable,
      income: content.querySelector('.treasury-monthly-income').textContent,
      expense: content.querySelector('.treasury-monthly-expense').textContent,
      savingRate: content.querySelector('.treasury-saving-rate strong').textContent,
      classEquivalent: content.querySelector('.treasury-class-equivalent')
    };
  });
  expect(result.unavailable).toBe(true);
  expect(result.income).toBe('—');
  expect(result.expense).toBe('—');
  expect(result.savingRate).toBe('—');
  expect(result.classEquivalent).toBeNull();
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

test('ledger write falls back to GET when legacy POST returns unknown action', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    window.API_URL = 'https://example.test/web-app';
    window.WRITE_TOKEN = 'test-token';
    const calls = [];
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      calls.push({ url: String(url), method: options && options.method || 'GET' });
      const isPost = options && options.method === 'POST';
      return { ok: true, status: 200, text: async () => JSON.stringify(isPost
        ? { ok: false, error: '未知的 action: expense' }
        : { ok: true, data: { row: 42 } }) };
    };
    const result = await apiPostJson({ action: 'expense', date: '2026/09/20', cat: '🍽️外食餐飲', account: '🏔️玉山銀行', amount: 1019 }, 5000);
    window.fetch = originalFetch;
    return { result, calls };
  });
  expect(result.result).toEqual({ row: 42 });
  expect(result.calls.map(call => call.method)).toEqual(['POST', 'GET']);
  expect(result.calls[1].url).toContain('action=expense');
});

test('stock transactions use distinct queue fingerprints and recorded guard', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    bookingWriteQueue.length = 0;
    const body = {
      action: 'transfer', date: '2026/09/14', cat: '股票買入', account: '💵國泰Stock → 🪙00998A · 40000股',
      amount: 711483, from: '💵國泰Stock', to: '🪙00998A', stockMode: '1', stockType: 'buy',
      stockSymbol: '🪙00998A', stockShares: 40000, stockAmount: 711483
    };
    const id = bookingQueueAdd(body);
    bookingQueueUpdate(id, 'success', '');
    const other = Object.assign({}, body, { stockShares: 40001 });
    return { recorded: bookingQueueHasRecorded(body), otherRecorded: bookingQueueHasRecorded(other) };
  });
  expect(result).toEqual({ recorded: true, otherRecorded: false });
});

test('recent booking timeout does not mark an authorized finance panel as verification failure', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    const recent = document.createElement('div');
    recent.id = 'recent-content';
    document.body.appendChild(recent);
    window.API_URL = 'https://example.test/web-app';
    window.WRITE_TOKEN = 'test-token';
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_write_token', 'test-token');
    let status = null;
    window.setEmpireCardStatus = (key, state, message) => { status = { key, state, message }; };
    window.apiGet = () => Promise.reject(new Error('連線逾時，請再按一次更新'));
    await loadRecentBooking();
    return status;
  });
  expect(result).toEqual({ key: 'domestic', state: 'ok', message: '財政主連線正常，最近記錄暫時無法更新' });
});

test('stock sell mode explains positive share input and reverses account direction', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', `<div id="merged-stock-fields"></div>
      <span id="a-from-label"></span><span id="a-to-label"></span>
      <label id="t-stock-shares-label"></label><input id="t-stock-shares">
      <input id="t-stock-type"><select id="a-from"><option value="💵國泰Stock">💵國泰Stock</option><option value="📡QQQI">📡QQQI</option></select>
      <select id="a-to"><option value="💵國泰Stock">💵國泰Stock</option><option value="📡QQQI">📡QQQI</option></select>`);
    cfg = { accounts: ['💵Cash', '💵國泰Stock'] };
    setMergedStockType('sell');
    return {
      fromLabel: document.getElementById('a-from-label').textContent,
      toLabel: document.getElementById('a-to-label').textContent,
      sharesLabel: document.getElementById('t-stock-shares-label').textContent,
      placeholder: document.getElementById('t-stock-shares').placeholder,
      from: document.getElementById('a-from').value,
      to: document.getElementById('a-to').value
    };
  });
  expect(result).toEqual({
    fromLabel: '賣出標的', toLabel: '入帳帳戶', sharesLabel: '交易股數（填正數，系統自動記為賣出）',
    placeholder: '例如 25000（不用輸入負號）', from: '📡QQQI', to: '💵國泰Stock'
  });
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

test('legacy advisor video cards are removed while scene NPC controls remain and hover does not preload all frames', async ({ page }) => {
  await page.goto(dashboardUrl);

  await expect(page.locator('.advisor-duo-role')).toHaveCount(0);
  const pangtong = page.getByRole('button', { name: '龐統，開啟角色面板' });
  const zhuge = page.getByRole('button', { name: '諸葛亮，開啟角色面板' });
  const liubei = page.getByRole('button', { name: '劉備，開啟角色面板' });
  const manchong = page.getByRole('button', { name: '滿寵，開啟角色面板' });
  await expect(pangtong).toBeVisible();
  await expect(zhuge).toBeVisible();
  await expect(liubei).toBeVisible();
  await expect(manchong).toBeVisible();
  await expect(page.getByRole('button', { name: '荀彧，開啟角色面板' })).toHaveCount(0);
  await expect(page.locator('#daily-briefing-overlay')).toHaveCount(0);
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
  await expect(liubei.locator('img')).toHaveCount(1);
  await liubei.hover();
  await expect(liubei.locator('img')).toHaveCount(1);
  expect(await page.evaluate(() => Object.keys(window.liubeiAnimations.frames).length)).toBe(17);
  expect(await page.evaluate(() => window.liubeiAnimations.frames['17'])).toBe('./劉備/王府前站立17.webp?v=20260920-liubei-webp1');
  expect(await page.evaluate(() => window.liubeiAnimations.frameScale['12'])).toBe(1.65);
  expect(await page.evaluate(() => window.liubeiAnimations.frameScale['17'])).toBe(1.2);
  expect(await page.evaluate(() => window.liubeiAnimations.events.specialAction.sequence.map(step => step.frame))).toEqual(['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '01']);
  expect(await page.evaluate(() => Object.keys(window.chenqunAnimations.frames).length)).toBe(17);
  expect(await page.evaluate(() => window.chenqunAnimations.frames['17'])).toBe('./陳群/chenqun_idle_17.webp');
  await expect(manchong.locator('img')).toHaveCount(1);
  await manchong.hover();
  await expect(manchong.locator('img')).toHaveCount(1);
  expect(await page.evaluate(() => Object.keys(window.manchongAnimations.frames).length)).toBe(9);
  expect(await page.evaluate(() => window.manchongAnimations.idleFrame)).toBe('05');
  expect(await page.evaluate(() => Object.values(window.manchongAnimations.frames).every(src => src.includes('?v=20260907-manchong-weapons1')))).toBeTruthy();
  expect(await page.evaluate(() => JSON.stringify(window.manchongAnimations).includes('工人回家10.png'))).toBeFalsy();
  expect(await page.evaluate(() => window.characterPositions.liubei.top)).toBe('calc(30% + 40px)');
  expect(await page.evaluate(() => window.xunyuAnimations)).toBeUndefined();
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
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now() - (6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000)));
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
    await ensureMilitaryModule();
    const cache = {
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110, shares: 1 }],
      holdingsLoaded: true,
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
    let refreshCalls = 0;
    loadCouncilDashboardData = () => { refreshCalls++; return new Promise(resolve => setTimeout(() => resolve({
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
    }), 120)); };
    const refreshPromise = window.loadCouncilDashboard();
    await new Promise(resolve => setTimeout(resolve, 20));
    const oldValue = roster.querySelector('.council-stat-v')?.textContent || '';
    const hasSkeleton = !!roster.querySelector('.skel');
    await refreshPromise;
    const newValue = roster.querySelector('.council-stat-v')?.textContent || '';
    return { oldValue, newValue, hasSkeleton, refreshCalls };
  });

  expect(result).toEqual({ oldValue: '1 檔', newValue: '2 檔', hasSkeleton: false, refreshCalls: 1 });
});

test('council roster keeps cached cards visible when background refresh fails', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    await ensureMilitaryModule();
    localStorage.setItem('wealth_council_roster_v1', JSON.stringify({
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110, shares: 1 }],
      holdingsLoaded: true,
      cachedAt: Date.now()
    }));
    councilDashboardCache = null;
    API_URL = 'https://example.test/exec';
    WRITE_TOKEN = 'remembered-token';
    setWebVerifyStatus('ok', '網頁驗證成功');
    const roster = document.createElement('div');
    roster.id = 'council-content';
    document.body.appendChild(roster);
    loadCouncilDashboardData = async () => { throw new Error('暫時無法連線'); };
    await window.loadCouncilDashboard();
    return {
      hasCachedCard: !!roster.querySelector('.hero-card'),
      hasRetry: !!roster.querySelector('.council-refresh-note button'),
      hasFailureNotice: roster.textContent.includes('更新暫時失敗')
    };
  });

  expect(result).toEqual({ hasCachedCard: true, hasRetry: true, hasFailureNotice: true });
});

test('council roster uses the latest Google Sheet holdings before NAS', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    await ensureMilitaryModule();
    const originalNasLoader = loadCouncilRosterFromNas_;
    const originalHeroLoader = loadHeroSheet;
    const originalHoldingsLoader = loadCouncilHoldingsOverview;
    let nasCalls = 0;
    loadCouncilRosterFromNas_ = async () => { nasCalls++; return null; };
    loadHeroSheet = async () => [{ symbol: '00998A', heroName: '台股武將' }];
    loadCouncilHoldingsOverview = async () => [{ symbol: '00998A', totalDiv: 16950, shares: 40000 }];
    councilDashboardPromise = null;
    try {
      const data = await loadCouncilDashboardData();
      return { source: data.source, totalDiv: data.holdings[0].totalDiv, nasCalls };
    } finally {
      loadCouncilRosterFromNas_ = originalNasLoader;
      loadHeroSheet = originalHeroLoader;
      loadCouncilHoldingsOverview = originalHoldingsLoader;
      councilDashboardPromise = null;
    }
  });

  expect(result).toEqual({ source: 'Google Sheets', totalDiv: 16950, nasCalls: 0 });
});

test('council roster falls back to NAS when Google Sheet holdings cannot be read', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(async () => {
    await ensureMilitaryModule();
    const originalNasLoader = loadCouncilRosterFromNas_;
    const originalHeroLoader = loadHeroSheet;
    const originalHoldingsLoader = loadCouncilHoldingsOverview;
    loadCouncilRosterFromNas_ = async () => ({
      heroes: [{ symbol: 'QQQI', assetName: 'QQQI', heroName: 'QQQI', enabled: true, sortOrder: 1 }],
      holdings: [{ symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 110, shares: 1 }],
      holdingsLoaded: true,
      source: 'NAS'
    });
    loadHeroSheet = async () => { throw new Error('Google Sheet unavailable'); };
    loadCouncilHoldingsOverview = async () => { throw new Error('Google Sheet unavailable'); };
    councilDashboardPromise = null;
    try {
      const data = await loadCouncilDashboardData();
      return { source: data.source, holdingsLoaded: data.holdingsLoaded, symbol: data.holdings[0].symbol };
    } finally {
      loadCouncilRosterFromNas_ = originalNasLoader;
      loadHeroSheet = originalHeroLoader;
      loadCouncilHoldingsOverview = originalHoldingsLoader;
      councilDashboardPromise = null;
    }
  });

  expect(result).toEqual({ source: 'NAS', holdingsLoaded: true, symbol: 'QQQI' });
});

test('council holding avatars render static first and lazy-load video on click', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const row = {
      symbol: 'MLPI',
      heroName: 'MLPI',
      holding: { symbol: 'MLPI', name: 'MLPI', cost: 100, marketValue: 110, price: 10, avgCost: 9, totalReturn: 10 }
    };
    host.innerHTML = renderHeroCard(row, 100);
    const visual = host.querySelector('.hero-visual');
    const before = { image: !!visual.querySelector('img'), video: !!visual.querySelector('video'), loop: visual.querySelector('video')?.loop || false, videoSrc: visual.querySelector('video')?.getAttribute('src') || '', source: visual.querySelector('img')?.getAttribute('src') || '' };
    visual.click();
    const after = { image: !!visual.querySelector('img'), video: !!visual.querySelector('video'), videoSrc: visual.querySelector('video')?.getAttribute('src') || '', active: visual.classList.contains('video-active') };
    return { before, after };
  });

  expect(result.before.image).toBeTruthy();
  expect(result.before.video).toBeTruthy();
  expect(result.before.loop).toBeFalsy();
  expect(result.before.videoSrc).toBe('');
  expect(result.before.source).toContain('武將資料/MLPI.webp?v=20260919-roster-webp1');
  expect(result.after.video).toBeTruthy();
  expect(result.after.videoSrc).toContain('部隊陣容/MLPI.mp4?v=20260920-roster-video1');
  expect(result.after.active).toBeTruthy();
});

test('home scene characters begin looping actions without being clicked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(dashboardUrl);

  const animatedCount = await page.waitForFunction(() => {
    const characters = [...document.querySelectorAll('.npc-web-scene .animated-character')];
    if (characters.length !== 7) return false;
    const moving = characters.filter(character => character.querySelectorAll('.character-art img').length > 1);
    return moving.length === 7 ? moving.length : false;
  }, null, { timeout: 15000 }).then(handle => handle.jsonValue());

  expect(animatedCount).toBe(7);
});

test('council holding static portraits follow the filenames in 武將資料', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const rows = ['QQQI', '國泰高股息B', '00997A'].map(symbol => ({
      symbol,
      heroName: symbol,
      holding: { symbol, name: symbol, cost: 100, marketValue: 110, price: 10, avgCost: 9, totalReturn: 10 }
    }));
    host.innerHTML = rows.map(row => renderHeroCard(row, 300)).join('');
    return [...host.querySelectorAll('.hero-visual')].map(el => ({
      hasStatic: !!el.querySelector('img'),
      staticSource: el.querySelector('img')?.getAttribute('src') || '',
      videoSource: el.querySelector('video')?.dataset.src || ''
    }));
  });

  expect(result).toEqual([
    { hasStatic: true, staticSource: './武將資料/QQQI.webp?v=20260919-roster-webp1', videoSource: './部隊陣容/QQQI.mp4?v=20260920-roster-video1' },
    { hasStatic: true, staticSource: './武將資料/%E5%9C%8B%E6%B3%B0%E9%AB%98%E8%82%A1%E6%81%AFB.webp?v=20260919-roster-webp1', videoSource: './部隊陣容/%E5%9C%8B%E6%B3%B0%E9%AB%98%E8%82%A1%E6%81%AFB.mp4?v=20260920-roster-video1' },
    { hasStatic: true, staticSource: './武將資料/00997A.webp?v=20260919-roster-webp1', videoSource: './部隊陣容/997A.mp4?v=20260920-roster-video1' }
  ]);
});

test('council cards move market value and cost into the former skill area', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    host.innerHTML = renderHeroCard({
      symbol: '00997A',
      heroName: '00997A',
      holding: { symbol: '00997A', name: '00997A', cost: 100, marketValue: 120, price: 12, avgCost: 10, totalReturn: 20 }
    }, 100);
    const card = host.querySelector('.hero-card');
    const formerSkillArea = card.querySelector('.hero-effect');
    const metrics = card.querySelector('.hero-metrics-panel');
    return {
      hasSkillText: card.textContent.includes('武將技能') || card.textContent.includes('尚未設定 UI 特效'),
      capitalArea: formerSkillArea?.textContent || '',
      lowerMetrics: metrics?.textContent || ''
    };
  });

  expect(result.hasSkillText).toBeFalsy();
  expect(result.capitalArea).toContain('市值');
  expect(result.capitalArea).toContain('成本');
  expect(result.lowerMetrics).not.toContain('市值');
  expect(result.lowerMetrics).not.toContain('成本');
});

test('council card keeps symbol, yield and return on the first line without duplicate unassigned name', async ({ page }) => {
  await page.goto(dashboardUrl);

  const result = await page.evaluate(() => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    host.innerHTML = renderHeroCard({
      symbol: 'QQQI',
      heroName: 'QQQI',
      holding: { symbol: 'QQQI', name: 'QQQI', cost: 100, marketValue: 120, price: 12, avgCost: 10, totalReturn: 20, monthlyDiv: 1 }
    }, 100);
    const card = host.querySelector('.hero-card');
    return {
      symbolLine: card.querySelector('.hero-symbol')?.textContent || '',
      hasDuplicateNameLine: !!card.querySelector('.hero-name'),
      hasUnassignedText: card.textContent.includes('未編制')
    };
  });

  expect(result.symbolLine).toContain('QQQI');
  expect(result.symbolLine).toContain('🟡');
  expect(result.symbolLine).toContain('+$20');
  expect(result.hasDuplicateNameLine).toBeFalsy();
  expect(result.hasUnassignedText).toBeFalsy();
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
