/* 尚書臺 v1: read-only summaries of existing finance, holdings and agenda sources. */
(function () {
  'use strict';
  var state = null;
  function freshState() {
    return { month: currentYM(), date: today(), scope: API_URL + '|' + WRITE_TOKEN,
      data: {}, saved: {}, errors: {}, pending: {}, expanded: {}, masked: false };
  }
  function authorized() { return hasMainApiCredentials() && webVerifyIsAuthorized(); }
  function ensureState() {
    if (!state || state.month !== currentYM() || state.date !== today() || state.scope !== API_URL + '|' + WRITE_TOKEN) state = freshState();
    return state;
  }
  function number(value) {
    if (value == null || typeof value === 'boolean' || String(value).trim() === '') return null;
    var n = Number(value); return Number.isFinite(n) ? n : null;
  }
  function money(value) { return state.masked ? '••••' : number(value) === null ? '—' : esc(fmtFull(Number(value))); }
  function pct(value) { return state.masked ? '••••' : number(value) === null ? '—' : (value > 0 ? '+' : '') + Number(value).toFixed(1) + '%'; }
  function sum(rows, key) {
    if (!rows || rows.some(function (row) { return number(row[key]) === null; })) return null;
    return rows.reduce(function (total, row) { return total + Number(row[key]); }, 0);
  }
  function model() {
    var finance = state.data.finance, monthly = finance && finance.monthly;
    var status = finance && finance.sourceStatus;
    // A partial treasury response must never masquerade as zero income or expenditure.
    var validMonth = monthly && (!monthly.ym || monthly.ym === state.month) && (!status || status.monthly === 'fulfilled');
    var income = validMonth ? number(monthly.income) : null;
    var expense = validMonth ? number(monthly.expense) : null;
    var net = income !== null && expense !== null ? income - expense : null;
    var snapshot = finance && finance.assetSnapshot, latest = snapshot && snapshot.latest;
    var assets = number(snapshot && snapshot.latestTotalAssetValue);
    if (assets === null) assets = number(latest && latest.totalAssetValue);
    var assetDate = latest && latest.date || '';
    if (assets === null && finance) {
      var total = (finance.accs || []).find(function (row) { return row.name === '總資產/總計' || row.name === '總資產'; });
      assets = number(total && total.value); assetDate = '帳戶合計';
    }
    var holdings = state.data.holdings;
    var cost = holdings ? sum(holdings, 'cost') : null;
    var returns = holdings ? sum(holdings, 'totalReturn') : null;
    return { income: income, expense: expense, net: net, assets: assets, assetDate: assetDate,
      savings: income > 0 && net !== null ? net / income * 100 : null,
      market: holdings ? sum(holdings, 'marketValue') : null,
      roi: cost > 0 && returns !== null ? returns / cost * 100 : null, holdings: holdings };
  }
  function statusHtml(key) {
    var text = state.saved[key] ? '取得 ' + new Date(state.saved[key]).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '尚未取得';
    if (state.pending[key]) text += state.data[key] ? ' · 更新中，先顯示上次資料' : ' · 讀取中';
    if (state.errors[key]) text += ' · 更新失敗' + (state.data[key] ? '，保留上次資料' : '');
    return '<div class="xy-status" role="status">' + esc(text) + (state.errors[key] ? ' <button type="button" data-xy-retry="' + key + '">重試</button><span class="xy-error">' + esc(state.errors[key]) + '</span>' : '') + '</div>';
  }
  function tile(label, value, note, destination) {
    return '<button type="button" class="xy-kpi" data-xy-go="' + destination + '"><span>' + label + '</span><strong>' + value + '</strong><small>' + esc(note) + '</small></button>';
  }
  function holdingHtml(m) {
    var rows = m.holdings;
    if (!rows) return '<p class="xy-empty">部隊資料尚未取得</p>';
    if (!rows.length) return '<p class="xy-empty">目前沒有持股</p>';
    var ordered = rows.slice().sort(function (a,b) { return (number(b.marketValue) || 0) - (number(a.marketValue) || 0); });
    return '<table class="xy-table"><thead><tr><th>標的</th><th>含息 ROI</th><th>市值占比</th></tr></thead><tbody>' + ordered.slice(0,5).map(function (row) {
      var cost = number(row.cost), ret = number(row.totalReturn), value = number(row.marketValue);
      var weight = m.market > 0 && value !== null ? value / m.market * 100 : null;
      return '<tr><th scope="row">' + esc(row.symbol || row.name || '未命名') + '</th><td>' + pct(cost > 0 && ret !== null ? ret / cost * 100 : null) + '</td><td>' + (state.masked ? '••••' : weight === null ? '—' : weight.toFixed(1) + '%') + '</td></tr>';
    }).join('') + '</tbody></table><p class="xy-note">市值前五檔／共 ' + rows.length + ' 檔 · 含息 ROI 為累計報酬率</p>';
  }
  function agendaHtml(key) {
    var payload = state.data[key];
    if (!payload) return '<p class="xy-empty">' + (key === 'calendar' ? '今日行程' : '待辦事項') + '尚未取得</p>';
    var items = key === 'calendar' ? payload.events || [] : (payload.tasks || []).filter(function (task) { return task.status !== 'completed' && !task.completed; });
    var shown = state.expanded[key] ? items : items.slice(0,3);
    return '<div class="xy-count">' + (key === 'calendar' ? '今日行程 ' : '未完成待辦 ') + items.length + ' 項</div>' + (items.length ? '<ul class="xy-list">' + shown.map(function (item) {
      var when = key === 'calendar' ? item.timeText || item.startText || (item.allDay ? '全天' : '') : item.dueText ? '期限 ' + item.dueText : '';
      return '<li><span>' + esc(item.title || item.summary || '未命名') + '</span>' + (when ? '<small>' + esc(when) + '</small>' : '') + '</li>';
    }).join('') + '</ul>' : '<p class="xy-empty">' + (key === 'calendar' ? '今日沒有行程' : '目前沒有未完成待辦') + '</p>') + (items.length > 3 ? '<button class="xy-link" type="button" data-xy-expand="' + key + '" aria-expanded="' + !!state.expanded[key] + '">' + (state.expanded[key] ? '收合' : '查看全部 ' + items.length + ' 項') + '</button>' : '');
  }
  function paint() {
    var root = document.getElementById('xunyu-dashboard');
    if (!root || !state || !authorized()) return;
    var m = model(), loading = Object.keys(state.pending).length > 0;
    root.innerHTML = '<div class="xy-intro"><div><span class="xy-eyebrow">荀彧 · 內政總覽</span><p>' + esc(state.month) + ' 本月收支 · 資產與持股採最新可用資料</p></div><div class="xy-actions"><button type="button" data-xy-mask aria-pressed="' + state.masked + '">' + (state.masked ? '顯示數字' : '隱藏數字') + '</button><button type="button" data-xy-refresh' + (loading ? ' disabled' : '') + '>' + (loading ? '更新中…' : '更新總覽') + '</button></div></div>' +
      '<div class="xy-kpis">' + tile('國庫總資產', money(m.assets), m.assetDate || '資產資料尚未取得', 'finance') + tile('本月結餘', money(m.net), '本月收入 − 本月支出', 'finance') + tile('投資市值', money(m.market), '本表持股市值合計', 'holdings') + tile('投資組合含息 ROI', pct(m.roi), '累計含息報酬 ÷ 成本', 'holdings') + '</div>' +
      '<div class="xy-grid"><section class="xy-card"><header><h3>本月內政</h3><button class="xy-link" data-xy-go="finance">國庫明細 →</button></header>' + statusHtml('finance') +
      '<dl class="xy-month"><div><dt>收入</dt><dd>' + money(m.income) + '</dd></div><div><dt>支出</dt><dd>' + money(m.expense) + '</dd></div><div><dt>儲蓄率</dt><dd>' + pct(m.savings) + '</dd></div></dl>' +
      (state.data.finance && state.data.finance.sourceStatus && Object.values(state.data.finance.sourceStatus).some(function (value) { return value !== 'fulfilled'; }) ? '<p class="xy-error">部分國庫來源未完成，缺少的指標暫不顯示。<button data-xy-retry="finance">重試國庫</button></p>' : '') +
      '</section><section class="xy-card"><header><h3>部隊簡報</h3><button class="xy-link" data-xy-go="holdings">全部部隊 →</button></header>' + statusHtml('holdings') + holdingHtml(m) +
      '</section><section class="xy-card"><header><h3>今日行程</h3><span>' + esc(state.date) + '</span></header>' + statusHtml('calendar') + agendaHtml('calendar') +
      '</section><section class="xy-card"><header><h3>近期要務</h3></header>' + statusHtml('tasks') + agendaHtml('tasks') + '</section></div>' +
      '<details class="xy-definitions"><summary>指標口徑與資料來源</summary><p>國庫總資產沿用財政的資產快照；無快照時使用帳戶總資產。本月收支沿用月度資料與流水校正，轉帳不算收入支出。儲蓄率＝結餘 ÷ 收入，無收入時不計算。</p><p>投資市值、市值占比與含息 ROI 使用同一批持股資料。整體 ROI 以含息報酬合計除以成本合計，不平均各檔 ROI，也不是本月投資報酬。來源未提供交易日期時，以取得時間標示。</p><p>今日行程與未完成待辦來自既有 Google 行事曆及 Tasks 介面；此處為唯讀總覽。</p></details>';
  }
  function loadFinance() {
    if (financeTreasuryPromise) return financeTreasuryPromise.then(function (data) { if (!data) throw new Error('國庫讀取失敗'); return data; });
    financeTreasuryPromise = fetchFinanceTreasuryData().then(function (data) {
      writeTimedFinanceCache(FINANCE_TREASURY_CACHE_KEY, data); return data;
    }).finally(function () { financeTreasuryPromise = null; });
    return financeTreasuryPromise;
  }
  function load(key) {
    if (!authorized()) return Promise.resolve();
    var active = ensureState();
    if (active.pending[key]) return active.pending[key];
    delete active.errors[key];
    active.pending[key] = Promise.resolve().then(function () {
      if (key === 'finance') return loadFinance();
      if (key === 'holdings') {
        if (councilDashboardPromise) return councilDashboardPromise.then(function (data) { if (!data.holdingsLoaded) throw new Error('持股讀取失敗'); return data.holdings; });
        return apiGet({ action: 'holdingsOverview' });
      }
      return apiGet(key === 'calendar' ? { action: 'todayCalendar', date: active.date } : { action: 'todayTasks' }, 30000);
    }).then(function (data) {
      if (!data || (key === 'holdings' && !Array.isArray(data)) ||
        (key === 'calendar' && !Array.isArray(data.events)) ||
        (key === 'tasks' && !Array.isArray(data.tasks))) throw new Error('資料格式不完整');
      active.data[key] = data; active.saved[key] = Date.now();
    }).catch(function (error) { active.errors[key] = error.message || '請稍後再試'; }).finally(function () {
      delete active.pending[key]; if (state === active) paint();
    });
    paint(); return active.pending[key];
  }
  window.refreshXunyuPanel = function (key) {
    ensureState(); return key ? load(key) : Promise.all(['finance','holdings','calendar','tasks'].map(load));
  };
  window.openXunyuPanel = function () { openPanel('xunyu'); };
  window.renderXunyuPanel = function () {
    ensureState(); currentTab = 'xunyu-overview';
    setPanelHead('📜', 'Shangshu · Overview', '尚書臺');
    setTabs([]);
    document.getElementById('p-tabs').classList.add('panel-tabs-hidden');
    document.getElementById('p-body').innerHTML = '<div id="xunyu-dashboard"></div>';
    if (!authorized()) { document.getElementById('xunyu-dashboard').innerHTML = setupNotice(); return; }
    var entry = readFinanceCacheEntry(FINANCE_TREASURY_CACHE_KEY, true);
    if (!state.data.finance && entry && entry.data.monthly && entry.data.monthly.ym === state.month) { state.data.finance = entry.data; state.saved.finance = entry.savedAt; }
    var cached = councilDashboardCache || readCouncilRosterStorageCache();
    if (!state.data.holdings && cached && cached.holdingsLoaded !== false && Array.isArray(cached.holdings)) { state.data.holdings = cached.holdings; state.saved.holdings = councilDashboardFetchedAt || cached.cachedAt; }
    paint(); refreshXunyuPanel();
  };
  document.addEventListener('click', function (event) {
    var button = event.target.closest('#xunyu-dashboard button'); if (!button) return;
    if (button.hasAttribute('data-xy-refresh')) refreshXunyuPanel();
    else if (button.dataset.xyRetry) refreshXunyuPanel(button.dataset.xyRetry);
    else if (button.hasAttribute('data-xy-mask')) { state.masked = !state.masked; paint(); }
    else if (button.dataset.xyExpand) { state.expanded[button.dataset.xyExpand] = !state.expanded[button.dataset.xyExpand]; paint(); }
    else if (button.dataset.xyGo === 'finance') openPanel('finance','finance-accs');
    else if (button.dataset.xyGo === 'holdings') { councilReviewMode = 'compare'; openPanel('council','council-roster'); }
  });
})();
