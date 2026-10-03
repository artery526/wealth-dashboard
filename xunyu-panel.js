/* 尚書臺：只顯示月曆、今日行程與待辦事項。 */
(function () {
  'use strict';
  var state = null;

  function freshState() {
    return { month: currentYM(), date: today(), scope: API_URL + '|' + WRITE_TOKEN,
      data: {}, errors: {}, pending: {}, expanded: {} };
  }
  function authorized() { return hasMainApiCredentials() && webVerifyIsAuthorized(); }
  function ensureState() {
    if (!state || state.month !== currentYM() || state.date !== today() || state.scope !== API_URL + '|' + WRITE_TOKEN) state = freshState();
    return state;
  }
  function statusHtml(key) {
    var text = state.pending[key] ? '讀取中…' : state.errors[key] ? '讀取失敗：' + state.errors[key] : state.data[key] ? '已更新' : '尚未載入';
    return '<div class="xy-status" role="status">' + esc(text) + (state.errors[key] ? ' <button type="button" data-xy-retry="' + key + '">重試</button>' : '') + '</div>';
  }
  function agendaHtml(key) {
    var payload = state.data[key];
    if (!payload) return '<p class="xy-empty">' + (key === 'calendar' ? '今日行程' : '待辦事項') + '尚未載入</p><button class="xy-link" type="button" data-xy-load="' + key + '">載入' + (key === 'calendar' ? '今日行程' : '待辦事項') + '</button>';
    var items = key === 'calendar' ? payload.events || [] : (payload.tasks || []).filter(function (task) { return task.status !== 'completed' && !task.completed; });
    var shown = state.expanded[key] ? items : items.slice(0, 3);
    return '<div class="xy-count">' + (key === 'calendar' ? '今日行程 ' : '未完成待辦 ') + items.length + ' 項</div>' + (items.length ? '<ul class="xy-list">' + shown.map(function (item) {
      var when = key === 'calendar' ? item.timeText || item.startText || (item.allDay ? '全天' : '') : item.dueText ? '期限 ' + item.dueText : '';
      return '<li><span>' + esc(item.title || item.summary || '未命名') + '</span>' + (when ? '<small>' + esc(when) + '</small>' : '') + '</li>';
    }).join('') + '</ul>' : '<p class="xy-empty">' + (key === 'calendar' ? '今日沒有行程' : '目前沒有未完成待辦') + '</p>') + (items.length > 3 ? '<button class="xy-link" type="button" data-xy-expand="' + key + '" aria-expanded="' + !!state.expanded[key] + '">' + (state.expanded[key] ? '收合' : '查看全部 ' + items.length + ' 項') + '</button>' : '');
  }
  function monthCalendarHtml() {
    var match = String(state.month || '').match(/^(\d{4})[-/](\d{2})$/);
    if (!match) return '<p class="xy-empty">月份資料尚未取得</p>';
    var year = Number(match[1]), month = Number(match[2]) - 1;
    var lunar = '', dateMatch = String(state.date || '').match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (dateMatch && typeof lunarDateLabel === 'function') lunar = String(lunarDateLabel(new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3])))).replace(/^農曆/, '');
    var first = new Date(year, month, 1), days = new Date(year, month + 1, 0).getDate();
    var cells = ['日','一','二','三','四','五','六'].map(function (label) { return '<div class="xy-calendar-weekday" role="columnheader">' + label + '</div>'; });
    for (var index = 0; index < 42; index++) {
      var day = index - first.getDay() + 1;
      if (day < 1 || day > days) { cells.push('<div class="xy-calendar-day muted" aria-hidden="true"></div>'); continue; }
      var date = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var todayClass = date === state.date ? ' today' : '';
      cells.push('<div class="xy-calendar-day' + todayClass + '" role="gridcell"' + (todayClass ? ' aria-current="date"' : '') + '>' + day + '</div>');
    }
    return '<div class="xy-calendar-title"><strong>' + year + ' 年 ' + (month + 1) + ' 月</strong><span>' + esc(lunar || '農曆未提供') + '</span></div><div class="xy-calendar-grid" role="grid" aria-label="' + year + ' 年 ' + (month + 1) + ' 月月曆">' + cells.join('') + '</div>';
  }
  function paint() {
    var root = document.getElementById('xunyu-dashboard');
    if (!root || !state || !authorized()) return;
    var loading = !!(state.pending.calendar || state.pending.tasks);
    root.innerHTML = '<div class="xy-intro"><div><span class="xy-eyebrow">荀彧 · 今日政務</span><p>' + esc(state.date) + ' 行事曆與待辦事項</p></div><button type="button" data-xy-refresh' + (loading ? ' disabled' : '') + '>' + (loading ? '更新中…' : '重新整理') + '</button></div>' +
      '<div class="xy-agenda-grid"><section class="xy-card xy-calendar-card"><header><h3>月曆</h3><span>尚書臺</span></header>' + monthCalendarHtml() +
      '</section><section class="xy-card"><header><h3>今日行程</h3><span>' + esc(state.date) + '</span></header>' + statusHtml('calendar') + agendaHtml('calendar') +
      '</section><section class="xy-card"><header><h3>待辦事項</h3></header>' + statusHtml('tasks') + agendaHtml('tasks') + '</section></div>';
  }
  function load(key) {
    if (!authorized()) return Promise.resolve();
    var active = ensureState();
    if (active.pending[key]) return active.pending[key];
    delete active.errors[key];
    active.pending[key] = Promise.resolve().then(function () {
      return apiGet(key === 'calendar' ? { action: 'todayCalendar', date: active.date } : { action: 'todayTasks' }, 30000);
    }).then(function (data) {
      if (!data || (key === 'calendar' && !Array.isArray(data.events)) || (key === 'tasks' && !Array.isArray(data.tasks))) throw new Error('資料格式不完整');
      active.data[key] = data;
    }).catch(function (error) { active.errors[key] = error.message || '請稍後再試'; }).finally(function () {
      delete active.pending[key]; if (state === active) paint();
    });
    paint(); return active.pending[key];
  }
  window.refreshXunyuPanel = function (key) {
    ensureState();
    return Promise.all((key ? [key] : ['calendar', 'tasks']).map(load));
  };
  window.openXunyuPanel = function () { openPanel('xunyu'); };
  window.renderXunyuPanel = function () {
    ensureState(); currentTab = 'xunyu-overview';
    setPanelHead('📜', 'Shangshu · Overview', '尚書臺');
    setTabs([]);
    document.getElementById('p-tabs').classList.add('panel-tabs-hidden');
    document.getElementById('p-body').innerHTML = '<div id="xunyu-dashboard"></div>';
    if (!authorized()) { document.getElementById('xunyu-dashboard').innerHTML = setupNotice(); return; }
    paint();
  };
  document.addEventListener('click', function (event) {
    var button = event.target.closest('#xunyu-dashboard button'); if (!button) return;
    if (button.hasAttribute('data-xy-refresh')) refreshXunyuPanel();
    else if (button.dataset.xyLoad) refreshXunyuPanel(button.dataset.xyLoad);
    else if (button.dataset.xyRetry) refreshXunyuPanel(button.dataset.xyRetry);
    else if (button.dataset.xyExpand) { state.expanded[button.dataset.xyExpand] = !state.expanded[button.dataset.xyExpand]; paint(); }
  });
})();
