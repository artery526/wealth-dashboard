/* 尚書臺 v1: read-only summaries of existing finance, holdings and agenda sources. */
(function () {
  'use strict';
  var state = null;
  var groups = { medical: '醫館', store: '太倉', wall: '王府／城牆', intelligence: '總經／外部情報' };
  var sources = { medical: ['medical'], store: ['store','chronicle'], wall: ['wall'], intelligence: ['macro','intelligence'] };
  var selected = {};
  try { selected = JSON.parse(localStorage.getItem('xunyu-summary-selection') || '{}') || {}; } catch (e) {}
  function freshState() {
    return { month: currentYM(), date: today(), scope: API_URL + '|' + WRITE_TOKEN,
      data: {}, saved: {}, errors: {}, pending: {}, expanded: {}, masked: false, tab: 'overview' };
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
    return '<table class="xy-table"><caption class="sr-only">全部部隊持股簡報</caption><thead><tr><th>標的</th><th>含息 ROI</th><th>市值占比</th></tr></thead><tbody>' + ordered.map(function (row) {
      var cost = number(row.cost), ret = number(row.totalReturn), value = number(row.marketValue);
      var weight = m.market > 0 && value !== null ? value / m.market * 100 : null;
      return '<tr><th scope="row">' + esc(row.symbol || row.name || '未命名') + '</th><td>' + pct(cost > 0 && ret !== null ? ret / cost * 100 : null) + '</td><td>' + (state.masked ? '••••' : weight === null ? '—' : weight.toFixed(1) + '%') + '</td></tr>';
    }).join('') + '</tbody></table><p class="xy-note">完整列出 ' + rows.length + ' 檔 · 依市值由高至低 · 含息 ROI 為累計報酬率</p>';
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
  function monthCalendarHtml() {
    var match = String(state.month || '').match(/^(\d{4})[-\/](\d{2})$/);
    if (!match) return '<p class="xy-empty">月份資料尚未取得</p>';
    var year = Number(match[1]), month = Number(match[2]) - 1;
    var first = new Date(year, month, 1), days = new Date(year, month + 1, 0).getDate();
    var cells = ['日','一','二','三','四','五','六'].map(function (label) {
      return '<div class="xy-calendar-weekday" role="columnheader">' + label + '</div>';
    });
    for (var index = 0; index < 42; index++) {
      var day = index - first.getDay() + 1;
      if (day < 1 || day > days) {
        cells.push('<div class="xy-calendar-day muted" aria-hidden="true"></div>');
        continue;
      }
      var date = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var todayClass = date === state.date ? ' today' : '';
      cells.push('<div class="xy-calendar-day' + todayClass + '" role="gridcell"' + (todayClass ? ' aria-current="date"' : '') + '>' + day + '</div>');
    }
    return '<div class="xy-calendar-title"><strong>' + year + ' 年 ' + (month + 1) + ' 月</strong><span>今日 ' + esc(state.date) + '</span></div><div class="xy-calendar-grid" role="grid" aria-label="' + year + ' 年 ' + (month + 1) + ' 月月曆">' + cells.join('') + '</div>';
  }
  function paint() {
    var root = document.getElementById('xunyu-dashboard');
    if (!root || !state || !authorized()) return;
    if (state.tab === 'briefs') { root.innerHTML = tabsHtml() + briefsHtml(); return; }
    var m = model(), loading = Object.keys(state.pending).length > 0;
    root.innerHTML = tabsHtml() + '<div class="xy-intro"><div><span class="xy-eyebrow">荀彧 · 內政總覽</span><p>' + esc(state.month) + ' 本月收支 · 資產與持股採最新可用資料</p></div><div class="xy-actions"><button type="button" data-xy-mask aria-pressed="' + state.masked + '">' + (state.masked ? '顯示數字' : '隱藏數字') + '</button><button type="button" data-xy-refresh' + (loading ? ' disabled' : '') + '>' + (loading ? '更新中…' : '更新總覽') + '</button></div></div>' +
      '<div class="xy-kpis">' + tile('國庫總資產', money(m.assets), m.assetDate || '資產資料尚未取得', 'finance') + tile('本月結餘', money(m.net), '本月收入 − 本月支出', 'finance') + tile('投資市值', money(m.market), '本表持股市值合計', 'holdings') + tile('投資組合含息 ROI', pct(m.roi), '累計含息報酬 ÷ 成本', 'holdings') + '</div>' +
      '<div class="xy-grid"><section class="xy-card"><header><h3>本月內政</h3><button class="xy-link" data-xy-go="finance">國庫明細 →</button></header>' + statusHtml('finance') +
      '<dl class="xy-month"><div><dt>收入</dt><dd>' + money(m.income) + '</dd></div><div><dt>支出</dt><dd>' + money(m.expense) + '</dd></div><div><dt>儲蓄率</dt><dd>' + pct(m.savings) + '</dd></div></dl>' +
      (state.data.finance && state.data.finance.sourceStatus && Object.values(state.data.finance.sourceStatus).some(function (value) { return value !== 'fulfilled'; }) ? '<p class="xy-error">部分國庫來源未完成，缺少的指標暫不顯示。<button data-xy-retry="finance">重試國庫</button></p>' : '') +
      '</section><section class="xy-card"><header><h3>部隊簡報</h3><button class="xy-link" data-xy-go="holdings">全部部隊 →</button></header>' + statusHtml('holdings') + holdingHtml(m) +
      '</section></div><div class="xy-agenda-grid"><section class="xy-card xy-calendar-card"><header><h3>月曆</h3><span>尚書臺</span></header>' + monthCalendarHtml() +
      '</section><section class="xy-card"><header><h3>今日行程</h3><span>' + esc(state.date) + '</span></header>' + statusHtml('calendar') + agendaHtml('calendar') +
      '</section><section class="xy-card"><header><h3>近期要務</h3></header>' + statusHtml('tasks') + agendaHtml('tasks') + '</section></div>' +
      '<details class="xy-definitions"><summary>指標口徑與資料來源</summary><p>國庫總資產沿用財政的資產快照；無快照時使用帳戶總資產。本月收支沿用月度資料與流水校正，轉帳不算收入支出。儲蓄率＝結餘 ÷ 收入，無收入時不計算。</p><p>投資市值、市值占比與含息 ROI 使用同一批持股資料。整體 ROI 以含息報酬合計除以成本合計，不平均各檔 ROI，也不是本月投資報酬。來源未提供交易日期時，以取得時間標示。</p><p>今日行程與未完成待辦來自既有 Google 行事曆及 Tasks 介面；此處為唯讀總覽。</p></details>';
  }
  function tabsHtml() {
    return '<nav class="xy-tabs" aria-label="尚書臺分頁">' + [['overview','內政總覽'],['briefs','各署摘要']].map(function (tab) {
      return '<button type="button" data-xy-tab="' + tab[0] + '" aria-pressed="' + (state.tab === tab[0]) + '">' + tab[1] + '</button>';
    }).join('') + '</nav>';
  }
  function activeSources() {
    return Object.keys(groups).filter(function (key) { return selected[key] !== false; }).reduce(function (all,key) { return all.concat(sources[key]); },[]);
  }
  function stamp(value) { var n = Date.parse(String(value || '').replace(/\//g,'-')); return Number.isFinite(n) ? n : 0; }
  function latestRows(rows, dateKey, count, titleKey) {
    if (!rows) return '<p class="xy-empty">資料尚未取得</p>';
    if (!rows.length) return '<p class="xy-empty">目前沒有記錄</p>';
    return '<ul class="xy-list">' + rows.slice().sort(function (a,b) { return stamp(dateKey(b)) - stamp(dateKey(a)); }).slice(0,count).map(function (row) {
      return '<li>' + esc(row[titleKey] || '未命名') + '<small>資料日期 ' + esc(dateKey(row) || '未提供') + '</small></li>';
    }).join('') + '</ul>';
  }
  function briefBody(key) {
    var data = state.data[key];
    if (key === 'medical') {
      if (!data) return '<p class="xy-empty">醫館資料尚未取得</p>';
      var rows = data.records.map(mpmNormalizeRecord);
      var days = new Set(rows.map(function (r) { return String(r.date || '').replace(/\//g,'-'); }).filter(function (date) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && date.slice(0,7) === state.month.replace(/\//g,'-'); }));
      var recent = rows.slice().sort(function (a,b) { return stamp(b.recordTime) - stamp(a.recordTime); })[0];
      return '<p class="xy-count">本月記錄 ' + days.size + ' 天</p><p class="xy-note">最近一次記錄：' + esc(recent && recent.recordTime || '尚無記錄') + '</p><p class="xy-note">同一天多筆僅計一天；統計醫館日誌。</p>';
    }
    if (key === 'store') return latestRows(data && data.records,function (r) { return r.recordDate; },1,'itemName');
    if (key === 'chronicle') return latestRows(data && data.rows,function (r) { return r.createdAt || r.date; },1,'name');
    if (key === 'wall') return latestRows(data && data.entries,function (r) { return r.updatedAt || r.createdAt || r.date; },2,'title');
    if (!data) return '<p class="xy-empty">資料尚未取得</p>';
    if (key === 'macro') {
      var judgment = data.judgment || {};
      return '<p class="xy-brief-text">' + esc(data.hasData === false ? '尚無總經資料' : judgment.summary || judgment.scenario || '尚無總經判斷') + '</p><p class="xy-note">資料日期 ' + esc(data.sourceDate || judgment.date || '未提供') + '</p>';
    }
    var status = data.status || {}, labels = { completed: '最近採集完成', 'completed-with-errors': '最近採集完成，部分來源失敗', running: '採集中' };
    return '<p class="xy-brief-text">' + esc(labels[status.state] || '尚未執行採集') + '</p>' + latestRows(data.items,function (r) { return r.publishedAt; },1,'title');
  }
  function briefsHtml() {
    var labels = { medical:'醫館記錄', store:'最新物品', chronicle:'最新事件', wall:'最近更新', macro:'美股總經', intelligence:'外部情報' };
    return '<div class="xy-intro"><div><span class="xy-eyebrow">各署摘要</span><p>勾選想看的摘要；資料日期與取得時間分別標示。</p></div><button type="button" data-xy-refresh>更新摘要</button></div>' +
      '<fieldset class="xy-options"><legend>顯示區塊</legend>' + Object.keys(groups).map(function (key) { return '<label><input type="checkbox" data-xy-option="' + key + '"' + (selected[key] !== false ? ' checked' : '') + '> ' + groups[key] + '</label>'; }).join('') + '</fieldset><div class="xy-brief-grid">' +
      Object.keys(groups).filter(function (key) { return selected[key] !== false; }).map(function (group) {
        return '<section class="xy-card"><header><h3>' + groups[group] + '</h3></header>' + sources[group].map(function (key) {
          return '<div class="xy-brief-source" data-xy-source="' + key + '"><header><h4>' + labels[key] + '</h4><button type="button" class="xy-link" data-xy-detail="' + key + '">查看全文 →</button></header>' + statusHtml(key) + briefBody(key) + '</div>';
        }).join('') + '</section>';
      }).join('') + '</div>' + (!activeSources().length ? '<p class="xy-empty">尚未選擇摘要，請勾選上方區塊。</p>' : '') + '<p class="xy-note">太倉按記錄日期排列，未提供新增時間時不推定新增順序；王府優先採更新時間，缺少時採建立時間或記錄日期。此頁只讀取既有情報，不觸發採集。</p>';
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
      if (key === 'medical') return medicalPost({_action:'getRecords'});
      if (key === 'store') return apiGet({action:'storeRecords'});
      if (key === 'chronicle') return eventChronicleApiRequest('GET','/api/event-chronicle',undefined,30000);
      if (key === 'wall') return arkWallFetch('/api/expeditions');
      if (key === 'macro') return apiGet({action:'macroOverview'});
      if (key === 'intelligence') return arkWallFetch('/api/intelligence?limit=50');
      if (key === 'holdings') {
        if (councilDashboardPromise) return councilDashboardPromise.then(function (data) { if (!data.holdingsLoaded) throw new Error('持股讀取失敗'); return data.holdings; });
        return apiGet({ action: 'holdingsOverview' });
      }
      return apiGet(key === 'calendar' ? { action: 'todayCalendar', date: active.date } : { action: 'todayTasks' }, 30000);
    }).then(function (data) {
      var arrayKey = {medical:'records',store:'records',chronicle:'rows',wall:'entries',intelligence:'items'}[key];
      if (arrayKey && (!data || !Array.isArray(data[arrayKey]))) throw new Error('資料格式不完整');
      if (key === 'macro' && (!data || (typeof data.hasData !== 'boolean' && !data.judgment))) throw new Error('資料格式不完整');
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
    ensureState(); return key ? load(key) : Promise.all((state.tab === 'briefs' ? activeSources() : ['finance','holdings','calendar','tasks']).map(load));
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
    if (button.dataset.xyTab) { state.tab = button.dataset.xyTab; currentTab = 'xunyu-' + state.tab; paint(); if (state.tab === 'briefs') activeSources().filter(function (key) { return !state.saved[key]; }).forEach(load); }
    else if (button.dataset.xyDetail) {
      var key = button.dataset.xyDetail;
      if (key === 'wall') { closePanel(); openArkWall(); }
      else if (key === 'medical') {
        openPanel('medical');
        var medicalTab = document.querySelector('.panel-menu-item[data-panel-tab="medical-painmap"]');
        if (medicalTab) switchTab(medicalTab,'medical-painmap');
      }
      else if (key === 'store' || key === 'chronicle') openEmpireCardShortcut(null,'store',key === 'store' ? 'store-list' : 'store-chronicle');
      else openPanel('council',key === 'macro' ? 'macro-overview' : 'external-intelligence');
    }
    else if (button.hasAttribute('data-xy-refresh')) refreshXunyuPanel();
    else if (button.dataset.xyRetry) refreshXunyuPanel(button.dataset.xyRetry);
    else if (button.hasAttribute('data-xy-mask')) { state.masked = !state.masked; paint(); }
    else if (button.dataset.xyExpand) { state.expanded[button.dataset.xyExpand] = !state.expanded[button.dataset.xyExpand]; paint(); }
    else if (button.dataset.xyGo === 'finance') openPanel('finance','finance-accs');
    else if (button.dataset.xyGo === 'holdings') { councilReviewMode = 'compare'; openPanel('council','council-roster'); }
  });
  document.addEventListener('change', function (event) {
    var input = event.target.closest('#xunyu-dashboard [data-xy-option]'); if (!input) return;
    selected[input.dataset.xyOption] = input.checked;
    try { localStorage.setItem('xunyu-summary-selection',JSON.stringify(selected)); } catch (e) {}
    paint(); if (input.checked) sources[input.dataset.xyOption].forEach(load);
  });
})();
