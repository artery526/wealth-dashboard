// ============================================================
//  糧草大本營 — Web App API  (WebApp.gs)
//  部署為 Apps Script Web App 後供前端呼叫
//  ⚠️ 執行身分：「我」  存取權：「所有人」
// ============================================================

// ── ★ 記帳密鑰設定（請改成自己的密碼）★ ────────────────────
// 只有帶正確 token 的請求才能寫入資料
// 讀取報表不需要 token
var WRITE_TOKEN = '';
var EXTERNAL_DB_SPREADSHEET_ID = '1BPnjwZKlBmxMkHmLDk6MSV28kfcAtQhGuZdufv5T7FY';
var ZIWEI_SPREADSHEET_ID = '1Z8cW96qqk5J7LL0mGg12GxmdZc_5elwDe4rEcGq-P-M';
var ZIWEI_SHEET_NAME = '紫微星盤';
var ZIWEI_HEADERS = ['啟用', '名稱', '出生年月日', '出生時辰', '性別', '雲端硬碟檔案ID', '圖片連結', '備註', '更新時間'];
var EVENT_CHRONICLE_SHEET_NAME = '事件編年史';
var TRAVEL_MEMO_SPREADSHEET_ID = '1hGTWtPniX9J6DX6I3WX0mQwkOcVNRXwMyf7Q17MQUP0';

// ── 月度戰情室座標（核心區已由 E18:O41 搬到 A1:K24）──
var MOON_ACCOUNT_START_ROW = 3;  // A3:D11
var MOON_ACCOUNT_END_ROW   = 11;
var MOON_ACCOUNT_NAME_COL  = 1;  // A
var MOON_ACCOUNT_BAL_COL   = 2;  // B
var MOON_ACCOUNT_STOCK_COL = 3;  // C
var MOON_ACCOUNT_NOTE_COL  = 4;  // D
var MOON_TOTAL_ROW         = 2;  // G2:J2
var MOON_TOTAL_NAME_COL    = 7;  // G
var MOON_TOTAL_BAL_COL     = 8;  // H
var MOON_TOTAL_STOCK_COL   = 9;  // I
var MOON_TOTAL_NOTE_COL    = 10; // J
var MOON_BILLS_START_ROW   = 5;  // E5:F8
var MOON_BILLS_AMOUNT_COL  = 5;  // E
var MOON_BILLS_PCT_COL     = 6;  // F
var MOON_HOLDING_START_ROW = 12; // A12:K71
var MOON_HOLDING_ROWS      = 60;
var MOON_HOLDING_COL       = 1;  // A
var MOON_HOLDING_COLS      = 14; // A:N
var ACCOUNT_CHANGE_SHEET_NAME = '帳戶變化紀錄';
var ACCOUNT_CHANGE_HEADERS = [
  '交易時間', '日期', '年月', '類型',
  '主帳戶', '主帳戶交易前', '主帳戶變動', '主帳戶交易後',
  '第二帳戶', '第二帳戶交易前', '第二帳戶變動', '第二帳戶交易後',
  '標籤', '備註'
];
var DAILY_ASSET_SNAPSHOT_SHEET = '每日資產快照';
var DAILY_ASSET_SNAPSHOT_HEADERS = ['日期', '投資市值', '總投資成本', '含息報酬', '月總配息', '備註'];
var DAILY_ASSET_SNAPSHOT_MARKET_CELL = 'I2';
var MACRO_DATA_HEADERS = ['日期', 'yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'vix', 'dxy', 'creditSpread', 'consumerSentiment', '資料來源', '更新時間', 'joltsOpenings'];
var MACRO_JOLTS_OPENINGS_COL = MACRO_DATA_HEADERS.indexOf('joltsOpenings') + 1;
// ── token 驗證 ────────────────────────────────────────────────
function verifyWriteToken(body) {
  var token = normalizeToken_(body.token);
  var expected = getWriteToken_();
  if (!expected) {
    throw new Error('驗證失敗：後端尚未設定 WRITE_TOKEN，無法寫入');
  }
  if (!token) {
    throw new Error('驗證失敗：請提供 WRITE_TOKEN，無法寫入');
  }
  if (token !== expected) {
    throw new Error('驗證失敗：密鑰不正確，無法寫入');
  }
}

function getWriteToken_() {
  var propToken = PropertiesService.getScriptProperties().getProperty('WRITE_TOKEN');
  return normalizeToken_(propToken || WRITE_TOKEN);
}

function normalizeToken_(value) {
  return String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function getExternalDbSpreadsheet_() {
  return SpreadsheetApp.openById(EXTERNAL_DB_SPREADSHEET_ID);
}

function getZiweiSpreadsheet_() {
  return SpreadsheetApp.openById(ZIWEI_SPREADSHEET_ID);
}

// ── JSON 回應包裝 ─────────────────────────────────────────────
// Apps Script Web App 部署「存取權：所有人」時 CORS 由 Google 平台自動處理
// TextOutput 不支援 addHeader，不需要也不能手動設定

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function err(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET 路由（讀取 + 寫入全部走 GET，避免 CORS preflight 問題）──
// 讀取：?action=config / monthly / yearly / history / accounts / holdingsOverview / councilPantry / topStatusBar / tradeOptions / marketDashboard / macroOverview / transactions / accountChanges / dividendCenter
// 寫入：?action=expense|income|transfer&token=xxx&date=...（其餘參數同下）
function doGet(e) {
  try {
    var p      = e.parameter;
    var action = (p.action || '').trim();
    var ss     = SpreadsheetApp.getActiveSpreadsheet();

    // ── 讀取路由（不需要 token）──
    if (action === 'config')       return ok(getConfig(ss));
    if (action === 'monthly')      return ok(getMonthly(ss, p.ym));
    if (action === 'yearly')       return ok(getYearly(ss, p.year));
    if (action === 'history')      return ok(getHistory(ss));
    if (action === 'accounts')     return ok(getAccounts(ss));
    if (action === 'holdingsOverview') return ok(getHoldingsOverview(ss));
    if (action === 'councilPantry') return ok(getCouncilPantry(ss));
    if (action === 'topStatusBar') return ok(getTopStatusBar(ss));
    if (action === 'financeStatus') return ok(getFinanceStatus(ss));
    if (action === 'taskSheetOptions') return ok(getTaskSheetOptions(ss));
    if (action === 'tradeOptions') return ok(getTradeOptions(ss));
    if (action === 'marketDashboard') return ok(getMarketDashboard(getExternalDbSpreadsheet_()));
    if (action === 'macroOverview') return ok(getMacroOverview(getExternalDbSpreadsheet_()));
    if (action === 'pledgeLoans')  return ok(getPledgeLoans(getExternalDbSpreadsheet_()));
    if (action === 'assetSnapshot') return ok(getDailyAssetSnapshot(getExternalDbSpreadsheet_()));
    if (action === 'transactions') return ok(getTransactions(ss, p.ym));
    if (action === 'accountChanges') return ok(getAccountChanges(ss, p.ym));
    if (action === 'stockTrades') return ok(getStockTrades(ss, p.ym));
    if (action === 'dividendCenter') return ok(getDividendCenter(ss));
    if (action === 'bills')        return ok(getBills(ss));
    if (action === 'todayCalendar') return ok(getTodayCalendar());
    if (action === 'ziweiCharts') return ok(getZiweiCharts());
    if (action === 'eventChronicle') return ok(getEventChronicle(ss));
    if (action === 'advisorDraft') return ok(createAdvisorDraft(p));
    if (action === 'advisorTask') return ok(writeAdvisorTask(ss, p));
    // ── 寫入路由（需要 token）──
    if (action === 'expense' || action === 'income' || action === 'transfer' || action === 'transactionUndo' || action === 'stockTradeVoid' || action === 'divCalc' || action === 'dividendEntry' || action === 'dividendDelete' || action === 'holdingTradeEntry' || action === 'holdingTradeDelete' || action === 'macroWebhook' || action === 'travelMemoHide' || action === 'travelMemoAdd' || action === 'verifyWriteToken') {
      verifyWriteToken(p);
      if (action === 'verifyWriteToken') return ok({ message: 'WRITE_TOKEN 驗證成功' });
      if (action === 'expense')  return ok(writeExpense(ss, p));
      if (action === 'income')   return ok(writeIncome(ss, p));
      if (action === 'transfer') return ok(writeTransfer(ss, p));
      if (action === 'transactionUndo') return ok(undoTransaction(ss, p));
      if (action === 'stockTradeVoid') return ok(voidStockTrade(ss, p));
      if (action === 'divCalc')  return ok(writeDivCalc(ss, p));
      if (action === 'dividendEntry') return ok(writeDividendEntry(ss, p));
      if (action === 'dividendDelete') return ok(deleteDividendEntry(ss, p));
      if (action === 'holdingTradeEntry') return ok(writeHoldingTradeEntry(ss, p));
      if (action === 'holdingTradeDelete') return ok(deleteHoldingTradeEntry(ss, p));
      if (action === 'macroWebhook') return ok(writeMacroWebhook(getExternalDbSpreadsheet_(), p));
      if (action === 'travelMemoHide') return ok(writeTravelMemoVisibility(p));
      if (action === 'travelMemoAdd') return ok(writeTravelMemoCard(p));
    }

    return err('未知的 action: ' + action);
  } catch(ex) {
    return err(ex.message);
  }
}

// ── POST 路由（保留相容，同樣支援 token 驗證）────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = (body.action || '').trim();

    if (action === 'advisorDraft') return ok(createAdvisorDraft(body));
    if (action === 'advisorTask') return ok(writeAdvisorTask(SpreadsheetApp.getActiveSpreadsheet(), body));

    // ★ 所有寫入請求均需通過 token 驗證
    verifyWriteToken(body);

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'expense')  return ok(writeExpense(ss, body));
    if (action === 'income')   return ok(writeIncome(ss, body));
    if (action === 'transfer') return ok(writeTransfer(ss, body));
    if (action === 'transactionUndo') return ok(undoTransaction(ss, body));
    if (action === 'stockTradeVoid') return ok(voidStockTrade(ss, body));
    if (action === 'verifyWriteToken') return ok({ message: 'WRITE_TOKEN 驗證成功' });
    if (action === 'divCalc')  return ok(writeDivCalc(ss, body));
    if (action === 'dividendEntry') return ok(writeDividendEntry(ss, body));
    if (action === 'dividendDelete') return ok(deleteDividendEntry(ss, body));
    if (action === 'holdingTradeEntry') return ok(writeHoldingTradeEntry(ss, body));
    if (action === 'holdingTradeDelete') return ok(deleteHoldingTradeEntry(ss, body));
    if (action === 'macroWebhook') return ok(writeMacroWebhook(getExternalDbSpreadsheet_(), body));
    if (action === 'travelMemoHide') return ok(writeTravelMemoVisibility(body));
    if (action === 'travelMemoAdd') return ok(writeTravelMemoCard(body));

    return err('未知的 action: ' + action);
  } catch(ex) {
    return err(ex.message);
  }
}

function writeTravelMemoVisibility(body) {
  var rowId = parseInt(body.rowId || body.row || '', 10);
  if (!rowId || rowId < 2) throw new Error('旅途卡片列號不正確');
  var ss = SpreadsheetApp.openById(TRAVEL_MEMO_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Plan') || ss.getSheets()[0];
  if (rowId > sheet.getLastRow()) throw new Error('旅途卡片列號超出範圍');
  sheet.getRange(rowId, 1).setValue('N');
  SpreadsheetApp.flush();
  return {
    message: '旅途卡片已關閉',
    rowId: rowId,
    active: 'N'
  };
}

function writeTravelMemoCard(body) {
  var date = String(body.date || '').trim();
  var title = String(body.title || '').trim();
  var start = String(body.start || '').trim();
  var end = String(body.end || '').trim();
  var from = String(body.from || '').trim();
  var to = String(body.to || '').trim();
  var shift = String(body.shift || '').trim();
  var info = String(body.info || '').trim();
  var note = String(body.note || '').trim();
  if (!date) throw new Error('日期必填');
  if (!title) throw new Error('注意事項必填');
  if (!start) throw new Error('開始時間必填');
  if (!end) throw new Error('結束時間必填');
  if (!from) throw new Error('第一個站名/地點必填');
  if (!to) throw new Error('第二個站名/地點必填');
  if (!shift) throw new Error('班次/住宿鄰近交通必填');
  var ss = SpreadsheetApp.openById(TRAVEL_MEMO_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Plan') || ss.getSheets()[0];
  var lastRow = sheet.getLastRow();
  var nextCardNo = 1;
  if (lastRow >= 2) {
    var values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    values.forEach(function(row) {
      var n = parseInt(row[0], 10);
      if (n >= nextCardNo) nextCardNo = n + 1;
    });
  }
  var targetRow = lastRow + 1;
  sheet.getRange(targetRow, 1, 1, 11).setValues([[
    'Y', nextCardNo, date, title, start, end, shift, from, to, info, note
  ]]);
  sheet.getRange(targetRow, 1, 1, 11).setNumberFormat('@');
  SpreadsheetApp.flush();
  return {
    message: '旅途卡片已加入',
    rowId: targetRow,
    cardNo: nextCardNo,
    active: 'Y'
  };
}

// ── 取得設定（類別/來源/帳戶） ────────────────────────────────
function getConfig(ss) {
  var setting = ss.getSheetByName('設定');
  var moon    = ss.getSheetByName('月度戰情室');

  // 支出主類別 (A欄, 從 row 2)
  var cats = [];
  for (var r = 2; r <= 60; r++) {
    var v = String(setting.getRange(r, 1).getValue() || '').trim();
    if (!v) break;
    cats.push(v);
  }

  // 收入來源 (C欄, 從 row 2)
  var sources = [];
  for (var r = 2; r <= 20; r++) {
    var v = String(setting.getRange(r, 3).getValue() || '').trim();
    if (!v) break;
    sources.push(v);
  }

  return {
    categories: cats,
    sources: sources,
    accounts: getMoonAccountNames_(moon),
    holdings: getTradeHoldingSymbols_(ss)
  };
}

function getTradeOptions(ss) {
  var setting = ss.getSheetByName('設定');
  var moon = ss.getSheetByName('月度戰情室');
  var sources = [];

  if (setting) {
    for (var r = 2; r <= 20; r++) {
      var source = String(setting.getRange(r, 3).getValue() || '').trim();
      if (!source) break;
      sources.push(source);
    }
  }

  return {
    accounts: getMoonAccountNames_(moon),
    holdings: getTradeHoldingSymbols_(ss),
    dividendSymbols: getTradeHoldingSymbols_(ss),
    sources: sources
  };
}

function isTotalLabel_(value) {
  var s = String(value || '').trim();
  return s === '總資產' || s === '總資產/總計';
}

function isNumberLike_(value) {
  return typeof value === 'number' && !isNaN(value);
}

function getMoonHoldingStartRow_(moon) {
  if (!moon) return MOON_HOLDING_START_ROW;
  var lastRow = Math.min(Math.max(moon.getLastRow(), MOON_HOLDING_START_ROW), 200);
  var values = moon.getRange(MOON_ACCOUNT_START_ROW, 1, lastRow - MOON_ACCOUNT_START_ROW + 1, MOON_HOLDING_COLS).getValues();

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var name = String(row[0] || '').trim();
    if (!name || isTotalLabel_(name)) continue;

    // 持股列的 D 欄（月軍餉）與 E/F 欄（股數/股價）會是數字；
    // 帳戶列的 D 欄多半是文字備註，右側即使有帳單欄位也不應被誤判成持股。
    if (isNumberLike_(row[3]) && (isNumberLike_(row[4]) || isNumberLike_(row[5]))) {
      return MOON_ACCOUNT_START_ROW + i;
    }
  }

  return MOON_HOLDING_START_ROW;
}

function getMoonAccountNames_(moon) {
  if (!moon) return [];
  var holdingStart = getMoonHoldingStartRow_(moon);
  var endRow = Math.max(MOON_ACCOUNT_START_ROW, holdingStart - 1);
  var values = moon.getRange(MOON_ACCOUNT_START_ROW, MOON_ACCOUNT_NAME_COL, endRow - MOON_ACCOUNT_START_ROW + 1, 1).getValues();

  return values.map(function(row) {
    return String(row[0] || '').trim();
  }).filter(function(name) {
    return name && !isTotalLabel_(name);
  });
}

// ── 月度摘要 ──────────────────────────────────────────────────
// ── 固定帳單水庫水位（月度戰情室 E6:F9）────────────────────
// E欄：月繳金額  F欄：年繳水庫水位%（已繳/年度總額）
function getBills(ss) {
  var s = ss.getSheetByName('月度戰情室');
  if (!s) return { error: '找不到月度戰情室' };

  // 讀取 E6:F9
  var range = s.getRange(MOON_BILLS_START_ROW, MOON_BILLS_AMOUNT_COL, 4, 2);
  var vals  = range.getValues();

  var labels = [
    { key: 'credit_chunghwa', name: '信貸＋中華電信', icon: '🔖' },
    { key: 'labor_health',    name: '勞健保',         icon: '🟡' },
    { key: 'ubear_utility',   name: '水電費＋YT訂閱', icon: '🏔️' },
    { key: 'fareastone',      name: '遠傳4G電信費',   icon: '🟥' }
  ];

  var bills = labels.map(function(l, i) {
    var monthlyAmt = parseFloat(vals[i][0]) || 0;
    var rawPct     = vals[i][1];
    // J欄永遠是 0~N 的小數（0.8827=88.27%，1.5301=153.01%）
    var pct;
    if (typeof rawPct === 'number') {
      pct = Math.round(rawPct * 100);
    } else {
      // 字串帶%號的情況
      pct = Math.round(parseFloat(String(rawPct).replace('%','')) || 0);
    }
    return {
      key:    l.key,
      name:   l.name,
      icon:   l.icon,
      monthly: Math.round(monthlyAmt),
      pct:    Math.min(pct, 100)
    };
  });

  return { bills: bills };
}

function getMonthly(ss, ym) {
  if (!ym) return { error: 'ym 必填' };
  var db = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  var cashAsset = moon ? (parseFloat(moon.getRange(MOON_ACCOUNT_START_ROW, MOON_ACCOUNT_STOCK_COL).getValue()) || 0) : 0;
  var lastRow = db.getLastRow();
  if (lastRow < 2) return { ym: ym, income: 0, expense: 0, net: 0, savingRate: '0%', cashAsset: Math.round(cashAsset) };

  var data = db.getRange(2, 1, lastRow - 1, 16).getValues();
  var income = 0, expense = 0;
  var todayIncome = 0, todayExpense = 0;
  var catMap = {};
  var tz = ss.getSpreadsheetTimeZone ? ss.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var todayText = Utilities.formatDate(new Date(), tz || 'Asia/Taipei', 'yyyy/MM/dd');

  data.forEach(function(row) {
    var rowYM = ledgerYm_(row);
    var type = ledgerType_(row);
    var rowDate = formatSheetDate_(row[0], tz);
    if (rowDate === todayText) {
      if (type === '支出') todayExpense += ledgerExpenseAmount_(row);
      else if (type === '收入') todayIncome += ledgerIncomeAmount_(row);
    }
    if (rowYM !== ym) return;
    if (type === '支出') {
      var amt = ledgerExpenseAmount_(row);
      expense += amt;
      var cat = String(row[3] || '').trim();
      if (cat) catMap[cat] = (catMap[cat] || 0) + amt;
    } else if (type === '收入') {
      income += ledgerIncomeAmount_(row);
    }
  });

  var net = income - expense;
  var savingRate = income > 0 ? (net / income * 100).toFixed(1) + '%' : '0%';

  // 轉成陣列並排序
  var cats = Object.keys(catMap).map(function(k) {
    return { name: k, amount: Math.round(catMap[k]) };
  }).sort(function(a, b) { return b.amount - a.amount; });

  return {
    ym: ym,
    income: Math.round(income),
    expense: Math.round(expense),
    net: Math.round(net),
    savingRate: savingRate,
    cashAsset: Math.round(cashAsset),
    todayIncome: Math.round(todayIncome),
    todayExpense: Math.round(todayExpense),
    categories: cats
  };
}

function getTopStatusBar(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) {
    return { money: 0, grain: 0, debt: 0, iau: 0 };
  }
  function cell(row) {
    return Math.round(parseFloat(moon.getRange(row, 3).getValue()) || 0);
  }
  var c3 = cell(3);
  var c5 = cell(5);
  return {
    money: c3,
    grain: c3 + c5,
    debt: cell(17),
    iau: cell(12)
  };
}

function getFinanceStatus(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  var setting = ss.getSheetByName('設定');
  var metrics = [];

  if (moon) {
    var values = moon.getRange('G7:H9').getValues();
    var displays = moon.getRange('G7:H9').getDisplayValues();
    metrics = values.map(function(row, index) {
      var label = String(row[0] || '').trim();
      var display = String((displays[index] || [])[1] || '').trim();
      var raw = row[1];
      if (!label) return null;
      return {
        label: label,
        value: normalizePercentValue_(raw, display),
        displayValue: display || formatPercentDisplay_(normalizePercentValue_(raw, display))
      };
    }).filter(function(row) { return row !== null; });
  }

  var annualMetric = metrics.filter(function(row) {
    return String(row.label || '').indexOf('年化') >= 0;
  })[0] || null;
  var statusRules = [];
  if (setting) {
    var rows = setting.getRange('I2:J20').getDisplayValues();
    statusRules = rows.map(function(row) {
      var rule = String(row[0] || '').trim();
      var text = String(row[1] || '').trim();
      return rule && text ? { rule: rule, text: text } : null;
    }).filter(function(row) { return row !== null; });
  }

  return {
    metrics: metrics,
    wealthStatus: resolveWealthStatus_(annualMetric ? annualMetric.value : 0, statusRules)
  };
}

function normalizePercentValue_(raw, display) {
  if (typeof raw === 'number' && !isNaN(raw)) {
    return Math.abs(raw) <= 1 ? raw * 100 : raw;
  }
  var text = String(display || raw || '').replace('%', '').trim();
  var value = parseFloat(text);
  return isNaN(value) ? 0 : value;
}

function formatPercentDisplay_(value) {
  return (Math.round((parseFloat(value) || 0) * 100) / 100).toFixed(2) + '%';
}

function resolveWealthStatus_(annualReturn, rules) {
  var value = parseFloat(annualReturn) || 0;
  for (var i = 0; i < rules.length; i++) {
    if (matchesWealthRule_(value, rules[i].rule)) {
      return rules[i];
    }
  }
  return rules.length ? rules[rules.length - 1] : { rule: '', text: '尚未設定' };
}

function matchesWealthRule_(value, rule) {
  var text = String(rule || '').replace(/％/g, '%').replace(/\s/g, '');
  var m;
  if ((m = text.match(/^>(=)?(-?\d+(?:\.\d+)?)%?$/))) {
    return value >= parseFloat(m[2]);
  }
  if ((m = text.match(/^<(-?\d+(?:\.\d+)?)%?$/))) {
    return value < parseFloat(m[1]);
  }
  if ((m = text.match(/^(-?\d+(?:\.\d+)?)~(-?\d+(?:\.\d+)?)%?$/))) {
    return value >= parseFloat(m[1]) && value < parseFloat(m[2]);
  }
  return false;
}

// ── 年度摘要（12 個月） ───────────────────────────────────────
function getYearly(ss, year) {
  if (!year) return { error: 'year 必填' };
  var db = ss.getSheetByName('資料庫');
  var detail = getYearlyDetail_(ss, year);
  var months = getYearlyMonthsFromDb_(db, year);
  var hasDbMonths = months.some(function(m) { return m.income || m.expense; });
  if (!hasDbMonths) months = getYearlyMonthsFromArchive_(ss, year);

  months.forEach(function(m) {
    m.income  = Math.round(m.income);
    m.expense = Math.round(m.expense);
    m.net     = m.income - m.expense;
    m.savingRate = m.income > 0 ? (m.net / m.income * 100).toFixed(1) + '%' : '—';
  });

  var totIncome  = months.reduce(function(s, m) { return s + m.income; }, 0);
  var totExpense = months.reduce(function(s, m) { return s + m.expense; }, 0);
  var totNet     = totIncome - totExpense;
  if (totIncome === 0 && totExpense === 0 && detail) {
    totIncome = detail.total.income;
    totExpense = detail.total.expense;
    totNet = detail.total.net;
  }

  return {
    year: year,
    months: months,
    detail: detail,
    total: {
      income: totIncome,
      expense: totExpense,
      net: totNet,
      savingRate: totIncome > 0 ? (totNet / totIncome * 100).toFixed(1) + '%' : '0%'
    }
  };
}

function getBlankYearlyMonths_(year) {
  var months = [];
  for (var m = 1; m <= 12; m++) {
    months.push({ ym: year + '/' + String(m).padStart(2, '0'), income: 0, expense: 0 });
  }
  return months;
}

function getYearlyMonthsFromDb_(db, year) {
  var months = getBlankYearlyMonths_(year);
  if (!db || db.getLastRow() < 2) return months;

  var data = db.getRange(2, 1, db.getLastRow() - 1, 16).getValues();
  data.forEach(function(row) {
    var rowYM = ledgerYm_(row);
    if (!rowYM.startsWith(year + '/')) return;
    var type = ledgerType_(row);
    var mo = parseInt(rowYM.split('/')[1], 10) - 1;
    if (mo < 0 || mo > 11) return;
    if (type === '支出') months[mo].expense += ledgerExpenseAmount_(row);
    else if (type === '收入') months[mo].income += ledgerIncomeAmount_(row);
  });
  return months;
}

function getYearlyMonthsFromArchive_(ss, year) {
  var months = getBlankYearlyMonths_(year);
  var sheet = getYearlySheet_(ss);
  if (!sheet || sheet.getLastRow() < 2) return months;

  var target = String(parseInt(year, 10));
  var values = sheet.getRange(1, 8, sheet.getLastRow(), 5).getValues(); // H:L, archived monthly summaries.
  var start = -1;

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === '年度月份彙總' &&
        normalizeYear_(values[i][1]) === target) {
      start = i + 2; // skip title and column header rows
      break;
    }
  }

  if (start < 0) return months;

  for (var r = start; r < values.length; r++) {
    var row = values[r] || [];
    var ym = String(row[0] || '').trim();
    if (!ym) break;
    if (!ym.startsWith(target + '/')) break;
    var mo = parseInt(ym.split('/')[1], 10) - 1;
    if (mo < 0 || mo > 11) continue;
    months[mo].income = parseAmount_(row[1]);
    months[mo].expense = parseAmount_(row[2]);
  }

  return months;
}

function getYearlyDetail_(ss, year) {
  var sheet = getYearlySheet_(ss);
  var target = String(parseInt(year, 10));

  if (sheet && sheet.getLastRow() >= 2) {
    var lastRow = sheet.getLastRow();
    var values = sheet.getRange(1, 1, lastRow, 6).getValues();
    var blockStart = -1;

    // 年度細項區塊格式：A="年度"、B=年份；不能只找第一個「支出類別」。
    for (var i = 0; i < values.length; i++) {
      var a = String(values[i][0] || '').trim();
      var bYear = normalizeYear_(values[i][1]);
      if (a === '年度' && bYear === target) {
        blockStart = i;
        break;
      }
    }

    if (blockStart >= 0) {
      var totalRow = values[blockStart + 2] || [];
      var expense = parseAmount_(totalRow[1]); // B：年度總支出
      var income  = parseAmount_(totalRow[3]); // D：年度總收入
      var net     = parseAmount_(totalRow[5]); // F：年度結餘
      var expenses = [];
      var incomes  = [];
      var headerRow = -1;

      for (var h = blockStart; h < values.length; h++) {
        if (h > blockStart && String(values[h][0] || '').trim() === '年度') break;
        if (String(values[h][0] || '').trim() === '支出類別' &&
            String(values[h][3] || '').trim() === '收入來源') {
          headerRow = h;
          break;
        }
      }

      if (headerRow >= 0) {
        for (var r = headerRow + 1; r < values.length; r++) {
          var row = values[r] || [];
          var expName = String(row[0] || '').trim();
          var incName = String(row[3] || '').trim();

          if (expName === '年度') break;
          if (!expName && !incName) break;

          if (expName && expName !== '支出細項年度總額' && expName !== '支出類別') {
            var expAmount = parseAmount_(row[1]);
            expenses.push({
              name: expName,
              amount: Math.round(expAmount),
              pct: detailPct_(row[2], expAmount, expense)
            });
          }

          if (incName && incName !== '收入細項年度總額' && incName !== '收入來源') {
            var incAmount = parseAmount_(row[4]);
            incomes.push({
              name: incName,
              amount: Math.round(incAmount),
              pct: detailPct_(row[5], incAmount, income)
            });
          }
        }
      }

      if (expense === 0 && expenses.length > 0) {
        expense = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
      }
      if (income === 0 && incomes.length > 0) {
        income = incomes.reduce(function(s, i) { return s + i.amount; }, 0);
      }
      if (net === 0 && (income || expense)) net = income - expense;

      return {
        year: target,
        total: {
          income:     Math.round(income),
          expense:    Math.round(expense),
          net:        Math.round(net),
          savingRate: income > 0 ? (net / income * 100).toFixed(1) + '%' : '0%'
        },
        expenses: expenses,
        incomes:  incomes
      };
    }
  }

  return getYearlyDetailFromDb_(ss, target);
}

function normalizeYear_(value) {
  var n = parseInt(parseFloat(value), 10);
  return isNaN(n) ? '' : String(n);
}

function detailPct_(rawPct, amount, total) {
  if (rawPct !== null && rawPct !== undefined && rawPct !== '') return rawPct;
  return amount > 0 && total > 0 ? amount / total : '';
}

function getYearlyDetailFromDb_(ss, target) {
  var db = ss.getSheetByName('資料庫');
  if (!db || db.getLastRow() < 2) return null;

  var rows = db.getRange(2, 1, db.getLastRow() - 1, 16).getValues();
  var expenseMap = {};
  var incomeMap = {};
  var expense = 0;
  var income = 0;

  rows.forEach(function(row) {
    var ym = ledgerYm_(row);
    if (!ym.startsWith(target + '/')) return;

    var type = ledgerType_(row);
    if (type === '支出') {
      var expName = String(row[3] || '').trim();
      var expAmount = ledgerExpenseAmount_(row);
      if (!expName || expAmount <= 0) return;
      expenseMap[expName] = (expenseMap[expName] || 0) + expAmount;
      expense += expAmount;
    } else if (type === '收入') {
      var incName = String(row[7] || '').trim();
      var incAmount = ledgerIncomeAmount_(row);
      if (!incName || incAmount <= 0) return;
      incomeMap[incName] = (incomeMap[incName] || 0) + incAmount;
      income += incAmount;
    }
  });

  var expenses = Object.keys(expenseMap).map(function(name) {
    return {
      name: name,
      amount: Math.round(expenseMap[name]),
      pct: expense > 0 ? expenseMap[name] / expense : ''
    };
  }).sort(function(a, b) { return b.amount - a.amount; });

  var incomes = Object.keys(incomeMap).map(function(name) {
    return {
      name: name,
      amount: Math.round(incomeMap[name]),
      pct: income > 0 ? incomeMap[name] / income : ''
    };
  }).sort(function(a, b) { return b.amount - a.amount; });

  if (expenses.length === 0 && incomes.length === 0) return null;

  var net = income - expense;
  return {
    year: target,
    total: {
      income:     Math.round(income),
      expense:    Math.round(expense),
      net:        Math.round(net),
      savingRate: income > 0 ? (net / income * 100).toFixed(1) + '%' : '0%'
    },
    expenses: expenses,
    incomes:  incomes
  };
}

function getYearlySheet_(ss) {
  return ss.getSheetByName('年度財報') || ss.getSheetByName('年度戰情室');
}

// ── 歷年紀錄 ─────────────────────────────────────────────────
function getHistory(ss) {
  var yearly = getYearlySheet_(ss);
  if (yearly) {
    var yearlyRows = yearly.getRange(1, 1, yearly.getLastRow(), 5).getValues();
    var headerRow = -1;

    for (var i = 0; i < yearlyRows.length; i++) {
      if (String(yearlyRows[i][0] || '').trim() === '年度' &&
          String(yearlyRows[i][4] || '').trim() === '資產紀錄') {
        headerRow = i;
        break;
      }
    }

    if (headerRow >= 0) {
      var yearlyHistory = [];
      for (var r = headerRow + 1; r < yearlyRows.length; r++) {
        var yr = String(yearlyRows[r][0] || '').trim();
        if (!yr) break;

        var inc = parseAmount_(yearlyRows[r][1]);
        var exp = parseAmount_(yearlyRows[r][2]);
        var net = parseAmount_(yearlyRows[r][3]);
        var asset = parseAmount_(yearlyRows[r][4]);

        yearlyHistory.push({
          year: yr,
          income: Math.round(inc),
          expense: Math.round(exp),
          net: Math.round(net),
          asset: Math.round(asset),
          savingRate: inc > 0 ? (net / inc * 100).toFixed(1) + '%' : '0%'
        });
      }

      if (yearlyHistory.length > 0) return yearlyHistory;
    }
  }

  var db = ss.getSheetByName('資料庫');
  var lastRow = db.getLastRow();
  var yearMap = {};

  if (lastRow >= 2) {
    var data = db.getRange(2, 1, lastRow - 1, 16).getValues();
    data.forEach(function(row) {
      var rowYM = ledgerYm_(row);
      if (!rowYM || rowYM.length < 4) return;
      var yr = rowYM.substring(0, 4);
      if (!yearMap[yr]) yearMap[yr] = { income: 0, expense: 0 };
      var type = ledgerType_(row);
      if (type === '支出') yearMap[yr].expense += ledgerExpenseAmount_(row);
      else if (type === '收入') yearMap[yr].income += ledgerIncomeAmount_(row);
    });
  }

  var result = Object.keys(yearMap).sort().map(function(yr) {
    var d = yearMap[yr];
    var inc  = Math.round(d.income);
    var exp  = Math.round(d.expense);
    var net  = inc - exp;
    return {
      year: yr,
      income: inc,
      expense: exp,
      net: net,
      asset: null,
      savingRate: inc > 0 ? (net / inc * 100).toFixed(1) + '%' : '0%'
    };
  });

  return result;
}

function parseAmount_(value) {
  if (typeof value === 'number') return value;
  return parseFloat(String(value || '').replace(/[$,\s]/g, '')) || 0;
}

function ledgerType_(row) {
  return String((row || [])[1] || '').trim();
}

function isStockLedgerType_(type) {
  return type === '買入股票' || type === '賣出股票' || type === '配息收入';
}

function ledgerYm_(row) {
  return formatTxnYM((row || [])[9] || (row || [])[0]);
}

function ledgerExpenseAmount_(row) {
  return Math.abs(parseAmount_((row || [])[2]));
}

function ledgerIncomeAmount_(row) {
  return parseAmount_((row || [])[6]);
}

function ledgerTransferAmount_(row) {
  return parseAmount_((row || [])[14]) || Math.abs(parseAmount_((row || [])[2]));
}

function ledgerExpenseAccount_(row) {
  return String((row || [])[4] || (row || [])[12] || '').trim();
}

function ledgerIncomeAccount_(row) {
  return String((row || [])[8] || (row || [])[12] || '').trim();
}

function ledgerTransferTo_(row) {
  return String((row || [])[13] || (row || [])[4] || '').trim();
}

function ledgerTransferFrom_(row) {
  return String((row || [])[12] || (row || [])[3] || '').trim();
}

function ledgerStockSymbol_(row) {
  return normalizeInvestmentSymbol_((row || [])[7]) || String((row || [])[7] || '').trim();
}

function ledgerStockShares_(row) {
  return parseAmount_((row || [])[15]);
}

function readAccountChangesForYm_(ss, ym) {
  var sheet = ss.getSheetByName(ACCOUNT_CHANGE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, ACCOUNT_CHANGE_HEADERS.length).getValues();
  var changes = [];
  rows.forEach(function(row, i) {
    var rowYm = String(row[2] || '').trim();
    if (ym && rowYm !== ym) return;
    changes.push({
      rowId: i + 2,
      date: formatTxnDate(row[1]),
      ym: rowYm,
      type: String(row[3] || '').trim(),
      primaryAccount: String(row[4] || '').trim(),
      primaryBefore: parseAccountBalance_(row[5]),
      primaryDelta: parseAccountBalance_(row[6]),
      primaryAfter: parseAccountBalance_(row[7]),
      secondaryAccount: String(row[8] || '').trim(),
      secondaryBefore: parseAccountBalance_(row[9]),
      secondaryDelta: parseAccountBalance_(row[10]),
      secondaryAfter: parseAccountBalance_(row[11]),
      label: String(row[12] || '').trim(),
      note: String(row[13] || '').trim()
    });
  });
  return changes.reverse();
}

function accountChangeTypeMatches_(changeType, txnType) {
  if (changeType === txnType) return true;
  return txnType === '轉帳' && changeType === '股票交易';
}

function amountSame_(a, b) {
  return Math.round(Math.abs(parseAccountBalance_(a))) === Math.round(Math.abs(parseAccountBalance_(b)));
}

function accountChangeMatches_(change, criteria) {
  if (!change || !criteria) return false;
  if (criteria.date && change.date !== criteria.date) return false;
  if (criteria.type && !accountChangeTypeMatches_(change.type, criteria.type)) return false;
  if (criteria.primaryAccount && change.primaryAccount !== criteria.primaryAccount) return false;
  if (criteria.secondaryAccount && change.secondaryAccount !== criteria.secondaryAccount) return false;
  if (criteria.anyAccount) {
    if (change.primaryAccount !== criteria.anyAccount && change.secondaryAccount !== criteria.anyAccount) return false;
  }
  if (criteria.primaryDelta !== undefined && !amountSame_(change.primaryDelta, criteria.primaryDelta)) return false;
  if (criteria.secondaryDelta !== undefined && !amountSame_(change.secondaryDelta, criteria.secondaryDelta)) return false;
  if (criteria.anyDelta !== undefined) {
    if (!amountSame_(change.primaryDelta, criteria.anyDelta) && !amountSame_(change.secondaryDelta, criteria.anyDelta)) return false;
  }
  if (criteria.label && change.label && change.label !== criteria.label) return false;
  if (criteria.note && change.note && change.note !== criteria.note) return false;
  return true;
}

function findAccountChange_(changes, used, criteria) {
  for (var i = 0; i < changes.length; i++) {
    var change = changes[i];
    if (used[change.rowId]) continue;
    if (!accountChangeMatches_(change, criteria)) continue;
    used[change.rowId] = true;
    return change;
  }
  return null;
}

function attachAccountChange_(txn, changes, used, criteria) {
  var change = findAccountChange_(changes, used, criteria);
  if (!change) return txn;
  txn.accountChange = {
    primaryAccount: change.primaryAccount,
    primaryDelta: Math.round(change.primaryDelta),
    primaryAfter: Math.round(change.primaryAfter),
    secondaryAccount: change.secondaryAccount,
    secondaryDelta: change.secondaryAccount ? Math.round(change.secondaryDelta) : '',
    secondaryAfter: change.secondaryAccount ? Math.round(change.secondaryAfter) : ''
  };
  return txn;
}

// Google Sheets custom function for 玉山基金淨值 cells such as 月度戰情室!J32:J33.
function ESUN_NAV_SAFE(url) {
  try {
    var value = fetchEsunFundNav_(url);
    cacheEsunFundNav_(url, value);
    return value;
  } catch (err) {
    var cached = getCachedEsunFundNav_(url);
    if (cached !== '') return cached;
    return '讀取失敗：' + err.message;
  }
}

function fetchEsunFundNav_(url) {
  var lastError = null;

  for (var i = 0; i < 3; i++) {
    try {
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
        }
      });
      var code = response.getResponseCode();
      if (code < 200 || code >= 300) {
        throw new Error('玉山基金頁面讀取失敗：HTTP ' + code);
      }

      var html = getEsunHtmlText_(response);
      var value = parseEsunFundNav_(html, url);
      if (isNaN(value)) throw new Error('基金淨值格式錯誤');
      return value;
    } catch (err) {
      lastError = err;
      Utilities.sleep(600 * (i + 1));
    }
  }

  throw lastError || new Error('找不到基金淨值：' + url);
}

function getEsunHtmlText_(response) {
  var html = '';
  try {
    html = response.getContentText('Big5');
  } catch (err) {
    html = '';
  }

  if (html && html.indexOf('stockPanel') !== -1) return html;

  html = response.getContentText();
  if (html) return html;

  throw new Error('玉山基金頁面內容為空白');
}

function parseEsunFundNav_(html, url) {
  var patterns = [
    /<ul[^>]*class=["'][^"']*stockPanel[^"']*["'][\s\S]*?<strong>\s*([0-9,.]+)\s*<\/strong>/i,
    /最新淨值[\s\S]{0,200}?<strong>\s*([0-9,.]+)\s*<\/strong>/i,
    /<td[^>]*>\s*(?:\d{4}\/\d{2}\/\d{2}|\d{2}\/\d{2})\s*<\/td>\s*<td[^>]*>\s*([0-9,.]+)\s*<\/td>/i
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = html.match(patterns[i]);
    if (match && match[1]) {
      var value = parseFloat(String(match[1]).replace(/,/g, ''));
      if (!isNaN(value)) return value;
    }
  }

  throw new Error('找不到基金淨值：' + url);
}

function cacheEsunFundNav_(url, value) {
  if (typeof value !== 'number' || isNaN(value)) return;
  CacheService.getScriptCache().put('ESUN_NAV_CACHE_' + url, String(value), 21600);
}

function getCachedEsunFundNav_(url) {
  var raw = CacheService.getScriptCache().get('ESUN_NAV_CACHE_' + url);
  if (!raw) return '';

  var value = parseFloat(String(raw).replace(/,/g, ''));
  return isNaN(value) ? '' : value;
}

// ── 帳戶餘額 ─────────────────────────────────────────────────
function getAccounts(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  var accounts = [];
  if (!moon) return accounts;

  var holdingStart = getMoonHoldingStartRow_(moon);
  var accountEnd = Math.max(MOON_ACCOUNT_START_ROW, holdingStart - 1);
  for (var r = MOON_ACCOUNT_START_ROW; r <= accountEnd; r++) {
    var name = String(moon.getRange(r, MOON_ACCOUNT_NAME_COL).getValue() || '').trim();
    if (!name || isTotalLabel_(name)) continue;
    var val    = parseFloat(moon.getRange(r, MOON_ACCOUNT_BAL_COL).getValue()) || 0;
    var stock  = moon.getRange(r, MOON_ACCOUNT_STOCK_COL).getValue();
    var note   = String(moon.getRange(r, MOON_ACCOUNT_NOTE_COL).getValue() || '').trim();
    accounts.push({
      name: name,
      value: Math.round(val),
      stockValue: stock ? Math.round(parseFloat(stock)) : null,
      note: note
    });
  }
  var totalName = String(moon.getRange(MOON_TOTAL_ROW, MOON_TOTAL_NAME_COL).getValue() || '').trim();
  if (totalName) {
    accounts.push({
      name: totalName,
      value: Math.round(parseFloat(moon.getRange(MOON_TOTAL_ROW, MOON_TOTAL_BAL_COL).getValue()) || 0),
      stockValue: Math.round(parseFloat(moon.getRange(MOON_TOTAL_ROW, MOON_TOTAL_STOCK_COL).getValue()) || 0),
      note: String(moon.getRange(MOON_TOTAL_ROW, MOON_TOTAL_NOTE_COL).getValue() || '').trim()
    });
  }
  return accounts;
}

function getHoldingsOverview(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return [];

  var holdingStart = getMoonHoldingStartRow_(moon);
  var maxRows = Math.max(0, Math.min(moon.getLastRow() - holdingStart + 1, MOON_HOLDING_ROWS));
  if (maxRows <= 0) return [];

  var range = moon.getRange(holdingStart, MOON_HOLDING_COL, maxRows, MOON_HOLDING_COLS); // A:N
  var rows = range.getValues();
  var displayRows = range.getDisplayValues();
  var setting = ss.getSheetByName('設定');
  var armyRows = setting ? setting.getRange(11, 8, MOON_HOLDING_ROWS, 4).getDisplayValues() : []; // H:K

  return rows.map(function(row, index) {
    var symbol = String(row[0] || '').trim();
    if (!symbol || symbol === '總資產/總計') return null;
    var displayRow = displayRows[index] || [];
    var army = armyRows[index] || [];
    var formationDate = String(displayRow[11] || army[1] || '').trim();
    var elapsedDays = String(displayRow[12] || army[2] || '').trim();
    var yuanPerDay = String(displayRow[13] || army[3] || '').trim();

    return {
      symbol: symbol,
      name: symbol,
      cost: Math.round(parseFloat(row[1]) || 0),
      marketValue: Math.round(parseFloat(row[2]) || 0),
      monthlyDiv: Math.round(parseFloat(row[3]) || 0),
      shares: parseFloat(row[4]) || 0,
      price: parseFloat(row[5]) || 0,
      totalDiv: Math.round(parseFloat(row[6]) || 0),
      unrealized: Math.round(parseFloat(row[7]) || 0),
      totalReturn: Math.round(parseFloat(row[8]) || 0),
      avgCost: parseFloat(row[9]) || 0,
      roi: (function(value) {
        var num = parseFloat(value);
        if (isNaN(num)) return 0;
        return Math.abs(num) <= 1 ? num * 100 : num;
      })(row[10]),
      formationDate: formationDate,
      elapsedDays: elapsedDays,
      yuanPerDay: yuanPerDay
    };
  }).filter(function(row) {
    return row !== null;
  });
}

function getTradeHoldingSymbols_(ss) {
  return getHoldingsOverview(ss).map(function(row) {
    return String(row.symbol || row.name || '').trim();
  }).filter(function(symbol) {
    return symbol && !isTotalLabel_(symbol);
  });
}

function getCouncilPantry(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return [];

  var values = moon.getRange('G3:H6').getValues();
  var displays = moon.getRange('G3:H6').getDisplayValues();
  return values.map(function(row, index) {
    var label = String(row[0] || '').trim();
    var rawValue = row[1];
    var displayRow = displays[index] || [];
    var displayValue = String(displayRow[1] || '').trim();
    if (!label || displayValue === '') return null;

    var numericValue = parseFloat(rawValue);
    var type = /比例|率|%/.test(label) ? 'percent' : 'currency';
    if (isNaN(numericValue)) {
      numericValue = 0;
      type = 'text';
    }

    return {
      label: label,
      value: numericValue,
      displayValue: displayValue,
      type: type
    };
  }).filter(function(row) {
    return row !== null;
  });
}

function ensureDailyAssetSnapshotSheet_(ss) {
  var sheet = ss.getSheetByName(DAILY_ASSET_SNAPSHOT_SHEET);
  if (!sheet) sheet = ss.insertSheet(DAILY_ASSET_SNAPSHOT_SHEET);
  ensureSheetHeaders_(sheet, DAILY_ASSET_SNAPSHOT_HEADERS);
  sheet.setFrozenRows(1);
  if (sheet.getMaxColumns() < DAILY_ASSET_SNAPSHOT_HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), DAILY_ASSET_SNAPSHOT_HEADERS.length - sheet.getMaxColumns());
  }
  sheet.getRange(2, 1, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('yyyy/mm/dd');
  sheet.getRange(2, 2, Math.max(1, sheet.getMaxRows() - 1), 4).setNumberFormat('#,##0');
  sheet.setColumnWidth(1, 115);
  [2, 3, 4, 5].forEach(function(col) { sheet.setColumnWidth(col, 130); });
  sheet.setColumnWidth(6, 220);
  return sheet;
}

function dailyAssetSnapshotRow_(row, rowNumber, tz) {
  var investmentMarketValue = parseSheetNumber_(row[1]);
  return {
    rowNumber: rowNumber,
    date: formatSheetDate_(row[0], tz),
    dateValue: dateSortValue_(row[0]) || rowNumber,
    investmentMarketValue: Math.round(investmentMarketValue),
    marketValue: Math.round(investmentMarketValue),
    totalCost: Math.round(parseSheetNumber_(row[2])),
    totalReturn: Math.round(parseSheetNumber_(row[3])),
    monthlyDiv: Math.round(parseSheetNumber_(row[4])),
    note: String(row[5] || '').trim()
  };
}

function getDailyAssetSnapshotSummary_(commandSs) {
  var moon = commandSs.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var marketValue = parseSheetNumber_(moon.getRange(DAILY_ASSET_SNAPSHOT_MARKET_CELL).getValue());
  var holdingStart = getMoonHoldingStartRow_(moon);
  var maxRows = Math.max(0, Math.min(moon.getLastRow() - holdingStart + 1, MOON_HOLDING_ROWS));
  var totalCost = 0;
  var totalReturn = 0;
  var monthlyDiv = 0;

  if (maxRows > 0) {
    var rows = moon.getRange(holdingStart, MOON_HOLDING_COL, maxRows, MOON_HOLDING_COLS).getValues();
    rows.forEach(function(row) {
      var symbol = String(row[0] || '').trim();
      if (!symbol || isTotalLabel_(symbol)) return;
      totalCost += parseSheetNumber_(row[1]);
      monthlyDiv += parseSheetNumber_(row[3]);
      totalReturn += parseSheetNumber_(row[8]);
    });
  }

  return {
    marketValue: Math.round(marketValue),
    totalCost: Math.round(totalCost),
    totalReturn: Math.round(totalReturn),
    monthlyDiv: Math.round(monthlyDiv)
  };
}

function findDailyAssetSnapshotDateRow_(sheet, dateText, tz) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (formatSheetDate_(values[i][0], tz) === dateText) return i + 2;
  }
  return 0;
}

function recordDailyAssetSnapshot() {
  var commandSs = SpreadsheetApp.getActiveSpreadsheet();
  var db = getExternalDbSpreadsheet_();
  var sheet = ensureDailyAssetSnapshotSheet_(db);
  var tz = db.getSpreadsheetTimeZone ? db.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var now = new Date();
  var dateText = Utilities.formatDate(now, tz || 'Asia/Taipei', 'yyyy/MM/dd');
  var summary = getDailyAssetSnapshotSummary_(commandSs);
  var targetRow = findDailyAssetSnapshotDateRow_(sheet, dateText, tz) || sheet.getLastRow() + 1;
  var note = '每日 09:10 自動快照；投資市值來源：帝國指揮所!月度戰情室!' + DAILY_ASSET_SNAPSHOT_MARKET_CELL;

  sheet.getRange(targetRow, 1, 1, DAILY_ASSET_SNAPSHOT_HEADERS.length).setValues([[
    dateText,
    summary.marketValue,
    summary.totalCost,
    summary.totalReturn,
    summary.monthlyDiv,
    note
  ]]);
  sheet.getRange(targetRow, 1, 1, 1).setNumberFormat('yyyy/mm/dd');
  sheet.getRange(targetRow, 2, 1, 4).setNumberFormat('#,##0');
  SpreadsheetApp.flush();

  return {
    sheetName: DAILY_ASSET_SNAPSHOT_SHEET,
    row: targetRow,
    date: dateText,
    marketValue: summary.marketValue,
    totalCost: summary.totalCost,
    totalReturn: summary.totalReturn,
    monthlyDiv: summary.monthlyDiv
  };
}

function getDailyAssetSnapshot(ss) {
  var sheet = ensureDailyAssetSnapshotSheet_(ss);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      sheetName: DAILY_ASSET_SNAPSHOT_SHEET,
      latest: null,
      previous: null,
      latestMarketValue: null,
      previousMarketValue: null,
      dailyChangeAmount: null,
      dailyChangePct: null
    };
  }

  var tz = ss.getSpreadsheetTimeZone ? ss.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var values = sheet.getRange(2, 1, lastRow - 1, DAILY_ASSET_SNAPSHOT_HEADERS.length).getValues();
  var rows = [];
  values.forEach(function(row, index) {
    var hasDate = String(row[0] || '').trim() !== '' || row[0] instanceof Date;
    var hasMarketValue = row[1] !== '' && row[1] !== null && row[1] !== undefined;
    if (!hasDate && !hasMarketValue) return;
    if (!hasMarketValue) return;
    rows.push(dailyAssetSnapshotRow_(row, index + 2, tz));
  });
  rows.sort(function(a, b) {
    if (a.dateValue !== b.dateValue) return a.dateValue - b.dateValue;
    return a.rowNumber - b.rowNumber;
  });

  var latest = rows.length ? rows[rows.length - 1] : null;
  var previous = rows.length > 1 ? rows[rows.length - 2] : null;
  var dailyChangeAmount = null;
  var dailyChangePct = null;
  if (latest && previous) {
    dailyChangeAmount = latest.investmentMarketValue - previous.investmentMarketValue;
    if (previous.investmentMarketValue) {
      dailyChangePct = dailyChangeAmount / previous.investmentMarketValue * 100;
    }
  }

  return {
    sheetName: DAILY_ASSET_SNAPSHOT_SHEET,
    latest: latest,
    previous: previous,
    latestMarketValue: latest ? latest.investmentMarketValue : null,
    previousMarketValue: previous ? previous.investmentMarketValue : null,
    dailyChangeAmount: dailyChangeAmount,
    dailyChangePct: dailyChangePct
  };
}

function getTaskSheetOptions(ss) {
  return ss.getSheets().map(function(sheet) {
    return sheet.getName();
  }).filter(function(name) {
    return name !== '軍師工單';
  });
}

function getEventChronicle(ss) {
  var sheet = ss.getSheetByName(EVENT_CHRONICLE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      sheetName: EVENT_CHRONICLE_SHEET_NAME,
      rows: []
    };
  }

  var width = Math.max(6, sheet.getLastColumn());
  var values = sheet.getRange(1, 1, sheet.getLastRow(), width).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var idx = {
    name: headerCol_(headers, ['項目名稱', '項目', '名稱'], 0),
    days: headerCol_(headers, ['經歷多少日', '經歷日數', '日數'], 2),
    months: headerCol_(headers, ['經歷多少月', '經歷月數', '月數'], 3),
    dailyCost: headerCol_(headers, ['換算每日花費', '每日花費'], 5)
  };

  var rows = [];
  values.slice(1).forEach(function(row, i) {
    var name = chronicleCell_(row, idx.name);
    if (!name) return;
    rows.push({
      rowNumber: i + 2,
      name: name,
      days: chronicleCell_(row, idx.days),
      months: chronicleCell_(row, idx.months),
      dailyCost: chronicleCell_(row, idx.dailyCost)
    });
  });

  return {
    sheetName: EVENT_CHRONICLE_SHEET_NAME,
    rows: rows
  };
}

function chronicleCell_(row, index) {
  if (index < 0 || index >= row.length) return '';
  return String(row[index] || '').trim();
}

function ensureZiweiSheet_() {
  var ss = getZiweiSpreadsheet_();
  var sheet = ss.getSheetByName(ZIWEI_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(ZIWEI_SHEET_NAME);
  ensureSheetHeaders_(sheet, ZIWEI_HEADERS);
  sheet.setFrozenRows(1);
  return sheet;
}

function getZiweiCharts() {
  var sheet = ensureZiweiSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      sheetName: ZIWEI_SHEET_NAME,
      spreadsheetId: ZIWEI_SPREADSHEET_ID,
      rows: []
    };
  }

  var width = Math.max(ZIWEI_HEADERS.length, sheet.getLastColumn());
  var values = sheet.getRange(1, 1, lastRow, width).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var idx = {
    enabled: headerCol_(headers, ['啟用'], 0),
    name: headerCol_(headers, ['名稱', '姓名'], 1),
    birthDate: headerCol_(headers, ['出生年月日', '生日', '出生日期'], 2),
    birthTime: headerCol_(headers, ['出生時辰', '時辰', '出生時間'], 3),
    gender: headerCol_(headers, ['性別'], 4),
    fileId: headerCol_(headers, ['雲端硬碟檔案ID', 'Drive檔案ID', '檔案ID'], 5),
    imageUrl: headerCol_(headers, ['圖片連結', '命盤連結', '雲端硬碟的圖案連結'], 6),
    note: headerCol_(headers, ['備註'], 7),
    updatedAt: headerCol_(headers, ['更新時間'], 8)
  };

  var rows = [];
  values.slice(1).forEach(function(row, i) {
    var name = ziweiCell_(row, idx.name);
    var imageUrl = ziweiCell_(row, idx.imageUrl);
    var fileId = ziweiCell_(row, idx.fileId) || extractDriveFileId_(imageUrl);
    if (!name && !fileId && !imageUrl) return;

    var enabled = ziweiCell_(row, idx.enabled) || '是';
    if (/^(\u5426|no|false|0)$/i.test(enabled)) return;

    rows.push({
      rowNumber: i + 2,
      id: 'ziwei-' + (i + 2),
      name: name || '未命名',
      birthDate: ziweiCell_(row, idx.birthDate),
      birthTime: ziweiCell_(row, idx.birthTime),
      gender: ziweiCell_(row, idx.gender),
      fileId: fileId,
      imageUrl: imageUrl,
      note: ziweiCell_(row, idx.note),
      updatedAt: ziweiCell_(row, idx.updatedAt)
    });
  });

  return {
    sheetName: ZIWEI_SHEET_NAME,
    spreadsheetId: ZIWEI_SPREADSHEET_ID,
    rows: rows
  };
}

function ziweiCell_(row, index) {
  if (index < 0 || index >= row.length) return '';
  return String(row[index] || '').trim();
}

function extractDriveFileId_(value) {
  var s = String(value || '').trim();
  if (!s) return '';
  if (/^[A-Za-z0-9_-]{20,}$/.test(s) && s.indexOf('/') < 0) return s;
  var m = s.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (m && m[1]) return m[1];
  m = s.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m && m[1]) return m[1];
  return '';
}

function getTodayCalendar() {
  var tz = Session.getScriptTimeZone();
  var today = new Date();
  var start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var calendars = CalendarApp.getAllCalendars();
  var events = [];

  calendars.forEach(function(calendar) {
    calendar.getEvents(start, end).forEach(function(event) {
      events.push({
        title: event.getTitle(),
        timeText: formatCalendarTime_(event, tz),
        location: event.getLocation() || '',
        description: plainCalendarDescription_(event.getDescription()),
        calendarName: calendar.getName(),
        startMs: event.getStartTime().getTime()
      });
    });
  });

  events.sort(function(a, b) {
    return a.startMs - b.startMs || String(a.title).localeCompare(String(b.title));
  });

  return {
    date: Utilities.formatDate(today, tz, 'yyyy/MM/dd'),
    events: events.map(function(event) {
      return {
        title: event.title,
        timeText: event.timeText,
        location: event.location,
        description: event.description,
        calendarName: event.calendarName
      };
    })
  };
}

function formatCalendarTime_(event, tz) {
  if (event.isAllDayEvent()) return '整日';
  return Utilities.formatDate(event.getStartTime(), tz, 'HH:mm') + ' - ' +
    Utilities.formatDate(event.getEndTime(), tz, 'HH:mm');
}

function plainCalendarDescription_(description) {
  return String(description || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
    .slice(0, 160);
}

// ── 台灣加權指數即時拉取（Yahoo Finance）────────────────────────
function fetchTWSERow_() {
  try {
    var url = 'https://query2.finance.yahoo.com/v8/finance/chart/%5ETWII?interval=1d&range=1mo';
    var options = { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } };
    var res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() !== 200) return null;

    var json = JSON.parse(res.getContentText());
    var result = json.chart.result[0];
    var meta   = result.meta;
    var closes = (result.indicators.quote[0].close || []).filter(function(v){ return v != null; });

    var price     = meta.regularMarketPrice || closes[closes.length - 1] || 0;
    // Yahoo chartPreviousClose is the close before the requested range, not yesterday's close.
    var prevClose = closes.length >= 2 ? closes[closes.length - 2] : (meta.previousClose || meta.chartPreviousClose || price);
    var change    = price - prevClose;
    var changePct = prevClose ? (change / prevClose * 100) : 0;

    // 計算 20MA（取最近 20 個有效收盤）
    var slice20 = closes.slice(-20);
    var ma20    = slice20.length
      ? slice20.reduce(function(s, v){ return s + v; }, 0) / slice20.length
      : price;
    var maGapPct    = ma20 > 0 ? ((price - ma20) / ma20 * 100) : 0;
    var maDirection = maGapPct >= 0 ? '均線之上' : '均線之下';

    // 訊號判斷
    var signal;
    if      (changePct >  2)   signal = '強力進攻';
    else if (changePct >  0.5) signal = '進攻';
    else if (changePct > -0.5) signal = '觀望';
    else if (changePct > -2)   signal = '防守';
    else                       signal = '警戒';

    var tz = 'Asia/Taipei';
    var updatedAt = Utilities.formatDate(new Date(), tz, 'HH:mm');

    return {
      code:        '^TWII',
      name:        '🇹🇼 台灣加權指數',
      price:       price,
      previous:    prevClose,
      change:      change,
      changePct:   changePct,
      ma20:        ma20,
      ma20Prev:    0,
      maDirection: maDirection,
      status:      '台灣股市加權指數 TAIEX',
      signal:      signal,
      updatedAt:   updatedAt,
      note:        'Yahoo Finance 即時',
      maGapPct:    maGapPct,
      isTWSE:      true   // 前端可用此旗標特別標示
    };
  } catch(e) {
    Logger.log('fetchTWSERow_ error: ' + e.message);
    return null;
  }
}

function attachMarketMargin_(row, info) {
  if (!row || !info) return row;
  row.marginBalance = info.value;
  row.marginBalanceText = info.display;
  row.marginBalanceUpdatedAt = info.updatedAt;
  row.marginBalanceSource = info.source || '';
  row.marginMaintenanceRatio = info.maintenanceRatio || 0;
  row.marginMaintenanceText = info.maintenanceText || '';
  return row;
}

function formatMarketNumber_(value, digits) {
  var fixed = Number(value || 0).toFixed(digits == null ? 2 : digits);
  var parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function fetchTWSEMarginBalance_() {
  try {
    var url = 'https://www.twse.com.tw/exchangeReport/MI_MARGN?response=json&selectType=ALL';
    var options = { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } };
    var res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() !== 200) return null;
    var json = JSON.parse(res.getContentText());
    if (json.stat !== 'OK') return null;

    var tables = json.tables || [];
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t] || {};
      var fields = table.fields || [];
      var data = table.data || [];
      var todayIdx = fields.indexOf('今日餘額');
      if (todayIdx < 0) todayIdx = 5;

      for (var r = 0; r < data.length; r++) {
        var row = data[r] || [];
        if (String(row[0] || '').indexOf('融資金額') < 0) continue;
        var thousand = parseSheetNumber_(row[todayIdx]);
        if (!thousand) return null;
        var amount = thousand * 1000;
        var dateText = String(json.date || '').replace(/^(\d{4})(\d{2})(\d{2})$/, '$1/$2/$3');
        var maintenance = fetchTWSEMarginMaintenance_(json, amount);
        return {
          display: formatMarketNumber_(amount / 100000000, 2) + ' 億',
          value: amount,
          updatedAt: dateText,
          source: 'TWSE',
          maintenanceRatio: maintenance.ratio,
          maintenanceText: maintenance.text
        };
      }
    }
  } catch(e) {
    Logger.log('fetchTWSEMarginBalance_ error: ' + e.message);
  }
  return null;
}

function fetchTWSEMarginMaintenance_(marginJson, marginAmount) {
  try {
    if (!marginJson || !marginJson.date || !marginAmount) return { ratio: 0, text: '' };
    var priceUrl = 'https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&type=ALLBUT0999&date=' + encodeURIComponent(marginJson.date);
    var options = { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } };
    var priceRes = UrlFetchApp.fetch(priceUrl, options);
    if (priceRes.getResponseCode() !== 200) return { ratio: 0, text: '' };
    var priceJson = JSON.parse(priceRes.getContentText());
    if (priceJson.stat !== 'OK') return { ratio: 0, text: '' };

    var priceMap = {};
    (priceJson.tables || []).forEach(function(table) {
      var fields = table.fields || [];
      var codeIdx = fields.indexOf('證券代號');
      var closeIdx = fields.indexOf('收盤價');
      if (codeIdx < 0 || closeIdx < 0) return;
      (table.data || []).forEach(function(row) {
        var code = String(row[codeIdx] || '').trim();
        var close = parseSheetNumber_(row[closeIdx]);
        if (code && close) priceMap[code] = close;
      });
    });

    var marketValue = 0;
    (marginJson.tables || []).forEach(function(table) {
      var fields = table.fields || [];
      var codeIdx = fields.indexOf('代號');
      var balanceIdx = fields.indexOf('今日餘額');
      if (codeIdx < 0 || balanceIdx < 0) return;
      (table.data || []).forEach(function(row) {
        var code = String(row[codeIdx] || '').trim();
        var units = parseSheetNumber_(row[balanceIdx]);
        var price = priceMap[code] || 0;
        if (code && units && price) marketValue += units * price * 1000;
      });
    });

    var ratio = marginAmount ? (marketValue / marginAmount * 100) : 0;
    return {
      ratio: ratio,
      text: ratio ? ratio.toFixed(2) + '%' : ''
    };
  } catch(e) {
    Logger.log('fetchTWSEMarginMaintenance_ error: ' + e.message);
    return { ratio: 0, text: '' };
  }
}

function getMarketMarginBalance_(sheet) {
  if (!sheet || sheet.getLastRow() < 1) return null;
  var lastRow = sheet.getLastRow();
  var lastCol = Math.max(sheet.getLastColumn(), 12);
  var width = Math.min(lastCol, 12);
  var values = sheet.getRange(1, 1, lastRow, width).getDisplayValues();
  if (!values.length) return null;

  var headers = values[0].map(function(v){ return String(v || '').trim(); });
  var marginCol = -1;
  headers.forEach(function(h, idx) {
    if (marginCol < 0 && /台股融資|融資.*餘額/.test(h)) marginCol = idx;
  });

  function buildInfo_(value, row) {
    var display = String(value || '').trim();
    if (!display) return null;
    return {
      display: display,
      value: parseSheetNumber_(display),
      updatedAt: row && row[9] ? String(row[9] || '').trim() : ''
    };
  }

  if (marginCol >= 0) {
    var latest = null;
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var code = String(row[0] || '').trim();
      var name = String(row[1] || '').trim();
      var info = buildInfo_(row[marginCol], row);
      if (!info) continue;
      latest = info;
      if (code === '^TWII' || /台股|台灣加權|加權指數/.test(name)) return info;
    }
    if (latest) return latest;
  }

  for (var i = 1; i < values.length; i++) {
    var rrow = values[i];
    var key = String((rrow[0] || '') + ' ' + (rrow[1] || '')).trim();
    if (!/台股融資|融資.*餘額/.test(key)) continue;
    for (var c = 2; c < rrow.length; c++) {
      var fallback = buildInfo_(rrow[c], rrow);
      if (fallback) return fallback;
    }
  }
  return null;
}

function getMarketDashboard(ss) {
  var sheet = ss.getSheetByName('市場儀表板');
  var marginInfo = fetchTWSEMarginBalance_() || (sheet ? getMarketMarginBalance_(sheet) : null);
  if (!sheet || sheet.getLastRow() < 2) {
    // 即使沒有試算表資料，仍回傳台股即時資料
    var twseOnly = fetchTWSERow_();
    attachMarketMargin_(twseOnly, marginInfo);
    var onlyRows = twseOnly ? [twseOnly] : [];
    var onlyCounts = twseOnly ? {} : {};
    if (twseOnly) onlyCounts[twseOnly.signal] = 1;
    return {
      rows: onlyRows,
      summary: {
        stance: twseOnly ? twseOnly.signal : '無資料',
        updatedAt: twseOnly ? twseOnly.updatedAt : '',
        counts: onlyCounts
      }
    };
  }

  var values = sheet.getRange(2, 1, Math.max(0, sheet.getLastRow() - 1), 12).getDisplayValues();
  var rows = [];
  var signalCounts = {};
  var updatedAt = '';

  values.forEach(function(row) {
    var code = String(row[0] || '').trim();
    var name = String(row[1] || '').trim();
    if (!code || !name) return;
    // 支援含冒號格式（如 INDEXSP:.INX）以及 ^TWII 格式
    if (code.indexOf(':') < 0 && code.indexOf('^') < 0) return;

    var price      = parseSheetNumber_(row[2]);
    var previous   = parseSheetNumber_(row[3]);
    var ma20       = parseSheetNumber_(row[4]);
    var ma20Prev   = parseSheetNumber_(row[5]);
    var signal     = String(row[8] || '').trim() || '觀望';
    var change     = previous ? (price - previous) : 0;
    var changePct  = previous ? (change / previous * 100) : 0;
    var maGapPct   = ma20 ? ((price - ma20) / ma20 * 100) : 0;
    updatedAt = updatedAt || String(row[9] || '').trim();

    signalCounts[signal] = (signalCounts[signal] || 0) + 1;
    rows.push({
      code:        code,
      name:        name,
      price:       price,
      previous:    previous,
      change:      change,
      changePct:   changePct,
      ma20:        ma20,
      ma20Prev:    ma20Prev,
      maDirection: String(row[6] || '').trim(),
      status:      String(row[7] || '').trim(),
      signal:      signal,
      updatedAt:   String(row[9] || '').trim(),
      note:        String(row[10] || '').trim(),
      marginBalance: parseSheetNumber_(row[11]),
      marginBalanceText: String(row[11] || '').trim(),
      maGapPct:    maGapPct
    });
  });

  // ── 插入台股即時資料（放在 QQQ 上方，即所有 rows 最前面）──
  var twseRow = fetchTWSERow_();
  if (twseRow) {
    attachMarketMargin_(twseRow, marginInfo);
    rows.unshift(twseRow);
    // 台股訊號也納入整體 stance 計算
    signalCounts[twseRow.signal] = (signalCounts[twseRow.signal] || 0) + 1;
    if (!updatedAt) updatedAt = twseRow.updatedAt;
  }

  var stance = '觀望';
  if      ((signalCounts['警戒'] || 0) > 0)                                                stance = '警戒';
  else if ((signalCounts['防守'] || 0) > 0)                                                stance = '防守';
  else if ((signalCounts['進攻'] || 0) + (signalCounts['強力進攻'] || 0) >= Math.max(2, Math.ceil(rows.length / 2))) stance = '進攻';
  else if ((signalCounts['正常'] || 0) > 0)                                                stance = '正常';

  return {
    rows: rows,
    summary: {
      stance: stance,
      updatedAt: updatedAt,
      counts: signalCounts
    }
  };
}

function getMacroOverview(ss) {
  var judgment = getLatestMacroJudgment_(ss);
  var dataRow = getLatestMacroData_(ss);
  var settings = getMacroSettings_(ss);
  var indicators = buildMacroIndicators_(dataRow, settings);

  return {
    hasData: !!(judgment || dataRow),
    judgment: judgment || {
      date: '',
      scenario: '尚未判斷',
      signal: '無資料',
      score: '',
      summary: '尚未建立「總經戰情判斷」資料。',
      mainRisk: '尚未設定',
      suggestion: '請先建立總經分頁並寫入每日資料。',
      updatedAt: ''
    },
    indicators: indicators,
    sourceDate: dataRow ? dataRow.date : '',
    settingsCount: settings.length
  };
}

function getLatestMacroJudgment_(ss) {
  var sheet = ss.getSheetByName('總經戰情判斷');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(1, sheet.getLastColumn())).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var rows = values.slice(1).map(function(row) {
    return macroObjectFromRow_(headers, row);
  }).filter(function(obj) {
    return String(obj['日期'] || '').trim();
  });
  if (!rows.length) return null;

  rows.sort(function(a, b) {
    return String(b['日期'] || '').localeCompare(String(a['日期'] || '')) ||
      String(b['更新時間'] || '').localeCompare(String(a['更新時間'] || ''));
  });

  var latest = rows[0];
  return {
    date: latest['日期'] || '',
    scenario: latest['劇本'] || latest['scenario'] || '尚未判斷',
    signal: latest['燈號'] || latest['signal'] || '無資料',
    score: latest['分數'] || latest['score'] || '',
    summary: latest['摘要'] || latest['summary'] || '',
    mainRisk: latest['主要風險'] || latest['mainRisk'] || '',
    suggestion: latest['建議動作'] || latest['suggestion'] || '',
    updatedAt: latest['更新時間'] || ''
  };
}

function getLatestMacroData_(ss) {
  var sheet = ss.getSheetByName('總經資料庫');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(1, sheet.getLastColumn())).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var rows = values.slice(1).map(function(row) {
    return macroObjectFromRow_(headers, row);
  }).filter(function(obj) {
    return String(obj['日期'] || '').trim();
  });
  if (!rows.length) return null;

  rows.sort(function(a, b) {
    return String(b['日期'] || '').localeCompare(String(a['日期'] || '')) ||
      String(b['更新時間'] || '').localeCompare(String(a['更新時間'] || ''));
  });

  var latest = rows[0];
  var values = normalizeMacroDataValues_(latest);
  return {
    date: latest['日期'] || '',
    updatedAt: latest['更新時間'] || '',
    values: values
  };
}

function getMacroSettings_(ss) {
  var defaults = macroDefaultSettings_();

  var sheet = ss.getSheetByName('總經設定');
  if (!sheet || sheet.getLastRow() < 2) return defaults;
  ensureMacroDefaultSettings_(sheet, ['指標代碼', '指標名稱', '啟用', '黃燈條件', '紅燈條件', '備註']);

  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(6, sheet.getLastColumn())).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var rows = values.slice(1).map(function(row) {
    var obj = macroObjectFromRow_(headers, row);
    var code = String(obj['指標代碼'] || '').trim();
    if (!code) return null;
    var enabledText = String(obj['啟用'] || 'TRUE').trim().toUpperCase();
    return {
      code: code,
      name: String(obj['指標名稱'] || code).trim(),
      enabled: enabledText !== 'FALSE' && enabledText !== '否' && enabledText !== '0',
      yellow: String(obj['黃燈條件'] || '').trim(),
      red: String(obj['紅燈條件'] || '').trim(),
      note: String(obj['備註'] || '').trim()
    };
  }).filter(function(row) {
    return row && row.enabled;
  });

  return rows.length ? rows : defaults;
}

function writeMacroWebhook(ss, body) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  body = body || buildMacroWebhookTestPayload_();
  var sheets = ensureMacroSheets_(ss);
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var todayText = Utilities.formatDate(now, tz, 'yyyy/MM/dd');
  var timeText = Utilities.formatDate(now, tz, 'HH:mm');
  var dateText = String(body.date || todayText).trim();

  var macroData = {
    date: dateText,
    yield10y: macroNumber_(body.yield10y),
    oil: macroNumber_(body.oil),
    cpi: macroNumber_(body.cpi),
    ppi: macroNumber_(body.ppi),
    unemployment: macroNumber_(body.unemployment),
    joltsOpenings: macroNumber_(body.joltsOpenings),
    vix: macroNumber_(body.vix),
    dxy: macroNumber_(body.dxy),
    creditSpread: macroNumber_(body.creditSpread),
    consumerSentiment: macroNumber_(body.consumerSentiment),
    source: String(body.source || 'macroWebhook').trim(),
    updatedAt: String(body.updatedAt || timeText).trim()
  };

  var required = ['yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'joltsOpenings', 'vix', 'dxy', 'creditSpread', 'consumerSentiment'];
  var missing = required.filter(function(key) {
    return macroData[key] == null || isNaN(macroData[key]);
  });
  if (missing.length) throw new Error('總經 webhook 缺少數值：' + missing.join(', '));

  var judgment = normalizeMacroJudgment_(body, macroData);
  if (!judgment.scenario || !judgment.signal || !judgment.summary) {
    judgment = askDeepSeekMacro_(macroData);
  }

  judgment.date = String(judgment.date || dateText).trim();
  judgment.scenario = String(judgment.scenario || '尚未判斷').trim();
  judgment.signal = String(judgment.signal || '黃燈').trim();
  judgment.score = judgment.score == null || judgment.score === '' ? '' : Number(judgment.score);
  judgment.summary = String(judgment.summary || '').trim();
  judgment.mainRisk = String(judgment.mainRisk || '').trim();
  judgment.suggestion = String(judgment.suggestion || '').trim();
  judgment.updatedAt = String(judgment.updatedAt || timeText).trim();

  var dataRow = upsertMacroRow_(sheets.data, 1, dateText, macroDataRowValues_(macroData));
  formatMacroDataSheet_(sheets.data);

  var judgmentRow = upsertMacroRow_(sheets.judgment, 1, dateText, [
    judgment.date,
    judgment.scenario,
    judgment.signal,
    judgment.score,
    judgment.summary,
    judgment.mainRisk,
    judgment.suggestion,
    judgment.updatedAt
  ]);

  return {
    message: '總經資料已寫入',
    dataRow: dataRow,
    judgmentRow: judgmentRow,
    judgment: judgment
  };
}

function dailyMacroBriefing() {
  var ss = getExternalDbSpreadsheet_();
  var payload = fetchDailyMacroPayload_(ss);
  return writeMacroWebhook(ss, payload);
}

function fetchDailyMacroPayload_(ss) {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var dateText = Utilities.formatDate(now, tz, 'yyyy/MM/dd');
  var timeText = Utilities.formatDate(now, tz, 'HH:mm');
  var cpiYoY = safeMacroFetch_(function() {
    var cpi = fetchFredSeriesValues_('CPIAUCSL', 18);
    var latestCpi = latestSeriesPoint_(cpi);
    var cpi12 = cpi.length >= 13 ? cpi[cpi.length - 13] : null;
    return latestCpi && cpi12 && cpi12.value ? (latestCpi.value / cpi12.value - 1) * 100 : null;
  });
  var ppiYoY = safeMacroFetch_(function() {
    var ppi = fetchFredSeriesValues_('PPIFID', 18);
    var latestPpi = latestSeriesPoint_(ppi);
    var ppi12 = ppi.length >= 13 ? ppi[ppi.length - 13] : null;
    return latestPpi && ppi12 && ppi12.value ? (latestPpi.value / ppi12.value - 1) * 100 : null;
  });

  var payload = {
    date: dateText,
    yield10y: safeMacroFetch_(function() { return normalizeYield10y_(fetchYahooLastPrice_('%5ETNX')); }),
    oil: safeMacroFetch_(function() { return fetchYahooLastPrice_('CL%3DF'); }),
    cpi: cpiYoY,
    ppi: ppiYoY,
    unemployment: safeMacroFetch_(function() { return latestSeriesValue_(fetchFredSeriesValues_('UNRATE', 6)); }),
    joltsOpenings: safeMacroFetch_(function() { return latestSeriesValue_(fetchFredSeriesValues_('JTSJOL', 6)); }),
    vix: safeMacroFetch_(function() { return fetchYahooLastPrice_('%5EVIX'); }),
    dxy: safeMacroFetch_(function() { return fetchYahooLastPrice_('DX-Y.NYB'); }),
    creditSpread: safeMacroFetch_(function() { return latestSeriesValue_(fetchFredSeriesValues_('BAMLH0A0HYM2', 12)); }),
    consumerSentiment: safeMacroFetch_(function() { return latestSeriesValue_(fetchFredSeriesValues_('UMCSENT', 6)); }),
    source: 'Yahoo Finance / FRED',
    updatedAt: timeText
  };
  return fillMissingMacroPayload_(ss, payload);
}

function buildMacroWebhookTestPayload_() {
  var tz = Session.getScriptTimeZone();
  return {
    date: Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd'),
    yield10y: 4.62,
    oil: 86.3,
    cpi: 3.4,
    ppi: 6.0,
    unemployment: 4.1,
    joltsOpenings: 6866,
    vix: 19.8,
    dxy: 105.2,
    creditSpread: 1.7,
    consumerSentiment: 49.8,
    source: 'Apps Script 手動測試',
    scenario: '軟著陸',
    signal: '黃燈',
    score: 42,
    summary: '利率與美元仍偏高，但就業與信用風險尚未明顯惡化，整體仍偏向軟著陸觀察格局。',
    mainRisk: '利率與美元仍偏高',
    suggestion: '維持核心配置，避免過度槓桿，等待通膨與利率壓力進一步降溫。'
  };
}

function ensureMacroSheets_(ss) {
  var settings = ss.getSheetByName('總經設定');
  if (!settings) settings = ss.insertSheet('總經設定');
  var settingHeaders = ['指標代碼', '指標名稱', '啟用', '黃燈條件', '紅燈條件', '備註'];
  ensureSheetHeaders_(settings, settingHeaders);
  ensureMacroDefaultSettings_(settings, settingHeaders);

  var data = ss.getSheetByName('總經資料庫');
  if (!data) data = ss.insertSheet('總經資料庫');
  ensureSheetHeaders_(data, MACRO_DATA_HEADERS);
  formatMacroDataSheet_(data);
  repairShiftedMacroDataRows_(data);

  var judgment = ss.getSheetByName('總經戰情判斷');
  if (!judgment) judgment = ss.insertSheet('總經戰情判斷');
  ensureSheetHeaders_(judgment, ['日期', '劇本', '燈號', '分數', '摘要', '主要風險', '建議動作', '更新時間']);

  return { settings: settings, data: data, judgment: judgment };
}

function ensureSheetHeaders_(sheet, headers) {
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsHeader = headers.some(function(header, index) {
    return String(current[index] || '').trim() !== header;
  });
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function formatMacroDataSheet_(sheet) {
  if (!sheet || !MACRO_JOLTS_OPENINGS_COL) return;
  sheet.getRange(2, MACRO_JOLTS_OPENINGS_COL, Math.max(1, sheet.getMaxRows() - 1), 1)
    .setNumberFormat('#,##0');
}

function macroDataRowValues_(macroData) {
  var valuesByHeader = {
    '日期': macroData.date,
    yield10y: macroData.yield10y,
    oil: macroData.oil,
    cpi: macroData.cpi,
    ppi: macroData.ppi,
    unemployment: macroData.unemployment,
    vix: macroData.vix,
    dxy: macroData.dxy,
    creditSpread: macroData.creditSpread,
    consumerSentiment: macroData.consumerSentiment,
    '資料來源': macroData.source,
    '更新時間': macroData.updatedAt,
    joltsOpenings: macroData.joltsOpenings
  };
  return MACRO_DATA_HEADERS.map(function(header) {
    return valuesByHeader[header];
  });
}

function normalizeMacroDataValues_(row) {
  var values = {
    yield10y: macroNumber_(row['yield10y']),
    oil: macroNumber_(row['oil']),
    cpi: macroNumber_(row['cpi']),
    ppi: macroNumber_(row['ppi']),
    unemployment: macroNumber_(row['unemployment']),
    joltsOpenings: macroNumber_(row['joltsOpenings']),
    vix: macroNumber_(row['vix']),
    dxy: macroNumber_(row['dxy']),
    creditSpread: macroNumber_(row['creditSpread']),
    consumerSentiment: macroNumber_(row['consumerSentiment'])
  };
  if (!(values.joltsOpenings > 1000) && values.vix > 1000) {
    values.joltsOpenings = values.vix;
    values.vix = macroNumber_(row['dxy']);
    values.dxy = macroNumber_(row['creditSpread']);
    values.creditSpread = macroNumber_(row['consumerSentiment']);
    values.consumerSentiment = macroNumber_(row['資料來源']);
  }
  return values;
}

function repairShiftedMacroDataRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var lastRow = sheet.getLastRow();
  var width = MACRO_DATA_HEADERS.length;
  var range = sheet.getRange(2, 1, lastRow - 1, width);
  var values = range.getValues();
  var changed = false;
  var fixed = 0;
  values.forEach(function(row) {
    var jolts = macroNumber_(row[12]);
    var vix = macroNumber_(row[6]);
    if (!(jolts > 1000) && vix > 1000) {
      var oldUpdatedAt = row[12];
      row[12] = row[6];
      row[6] = row[7];
      row[7] = row[8];
      row[8] = row[9];
      row[9] = row[10];
      row[10] = row[11];
      row[11] = oldUpdatedAt;
      changed = true;
      fixed++;
    }
  });
  if (changed) range.setValues(values);
  return fixed;
}

function ensureMacroDefaultSettings_(sheet, headers) {
  var existing = {};
  if (sheet.getLastRow() >= 2) {
    var codes = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
    codes.forEach(function(row) {
      var code = String(row[0] || '').trim();
      if (code) existing[code] = true;
    });
  }
  var missing = macroDefaultSettings_().filter(function(row) {
    return !existing[row.code];
  });
  if (!missing.length) return;
  var startRow = Math.max(2, sheet.getLastRow() + 1);
  sheet.getRange(startRow, 1, missing.length, headers.length).setValues(missing.map(function(row) {
    return [row.code, row.name, row.enabled ? 'TRUE' : 'FALSE', row.yellow, row.red, row.note];
  }));
}

function upsertMacroRow_(sheet, dateCol, dateText, values) {
  var targetRow = sheet.getLastRow() + 1;
  if (sheet.getLastRow() >= 2) {
    var dates = sheet.getRange(2, dateCol, sheet.getLastRow() - 1, 1).getDisplayValues();
    for (var i = 0; i < dates.length; i++) {
      if (String(dates[i][0] || '').trim() === dateText) {
        targetRow = i + 2;
        break;
      }
    }
  }
  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  sheet.getRange(targetRow, dateCol).setNumberFormat('@');
  return targetRow;
}

function normalizeMacroJudgment_(body, macroData) {
  return {
    date: body.date || macroData.date,
    scenario: body.scenario || body['劇本'] || '',
    signal: body.signal || body['燈號'] || '',
    score: body.score != null && body.score !== '' ? body.score : (body['分數'] != null ? body['分數'] : ''),
    summary: body.summary || body['摘要'] || '',
    mainRisk: body.mainRisk || body['主要風險'] || '',
    suggestion: body.suggestion || body['建議動作'] || '',
    updatedAt: body.updatedAt || body['更新時間'] || ''
  };
}

function askDeepSeekMacro_(macroData) {
  var key = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');
  if (!key) throw new Error('尚未設定 DEEPSEEK_API_KEY，無法請 DeepSeek 判斷總經劇本');

  var payload = {
    date: macroData.date,
    yield10y: macroData.yield10y,
    oil: macroData.oil,
    cpi: macroData.cpi,
    ppi: macroData.ppi,
    unemployment: macroData.unemployment,
    joltsOpenings: macroData.joltsOpenings,
    vix: macroData.vix,
    dxy: macroData.dxy,
    creditSpread: macroData.creditSpread,
    consumerSentiment: macroData.consumerSentiment
  };

  var response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + key
    },
    payload: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: '你是總經市場分析助手。請使用繁體中文，只能輸出 JSON，不要輸出 Markdown。劇本只能是：軟著陸、滯脹、衰退、金融壓力。燈號只能是：綠燈、黃燈、紅燈、黑燈。請輸出欄位：date, scenario, signal, score, summary, mainRisk, suggestion。score 是 0 到 100 的總經壓力分數。ppi 是 PPI final demand 年增率，代表上游通膨壓力；consumerSentiment 是密歇根消費者信心指數，數值越低代表消費信心越弱，請納入消費景氣與衰退風險判斷。'
        },
        {
          role: 'user',
          content: JSON.stringify(payload)
        }
      ],
      thinking: { type: 'enabled' },
      reasoning_effort: 'medium',
      stream: false
    }),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var data = JSON.parse(text);
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : 'DeepSeek 總經判斷失敗');
  }
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('DeepSeek 總經回應格式異常');
  }
  return parseDeepSeekJson_(data.choices[0].message.content || '');
}

function parseDeepSeekJson_(text) {
  var raw = String(text || '').trim();
  raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  var start = raw.indexOf('{');
  var end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  var obj = JSON.parse(raw);
  return {
    date: obj.date || '',
    scenario: obj.scenario || '',
    signal: obj.signal || '',
    score: obj.score,
    summary: obj.summary || '',
    mainRisk: obj.mainRisk || '',
    suggestion: obj.suggestion || '',
    updatedAt: obj.updatedAt || ''
  };
}

function fetchYahooLastPrice_(symbol) {
  var url = 'https://query2.finance.yahoo.com/v8/finance/chart/' + symbol + '?interval=1d&range=5d';
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Yahoo Finance 讀取失敗：' + decodeURIComponent(symbol));
  }
  var json = JSON.parse(res.getContentText());
  var result = json.chart && json.chart.result && json.chart.result[0];
  if (!result) throw new Error('Yahoo Finance 回應格式異常：' + decodeURIComponent(symbol));
  var meta = result.meta || {};
  var closes = (((result.indicators || {}).quote || [])[0] || {}).close || [];
  var validCloses = closes.filter(function(v) { return v != null && !isNaN(v); });
  var price = meta.regularMarketPrice || validCloses[validCloses.length - 1];
  if (price == null || isNaN(price)) throw new Error('Yahoo Finance 無有效價格：' + decodeURIComponent(symbol));
  return Number(price);
}

function safeMacroFetch_(fn) {
  try {
    var value = fn();
    return value == null || isNaN(value) ? null : Number(value);
  } catch (e) {
    Logger.log('safeMacroFetch_ error: ' + e.message);
    return null;
  }
}

function fillMissingMacroPayload_(ss, payload) {
  var previous = getLatestMacroData_(ss);
  var prevValues = previous && previous.values ? previous.values : {};
  var keys = ['yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'joltsOpenings', 'vix', 'dxy', 'creditSpread'];
  var optionalKeys = [];
  var fallbackKeys = [];
  keys.concat(optionalKeys).forEach(function(key) {
    if (payload[key] == null || isNaN(payload[key])) {
      if (prevValues[key] != null && !isNaN(prevValues[key])) {
        payload[key] = prevValues[key];
        fallbackKeys.push(key);
      }
    }
  });
  var missing = keys.filter(function(key) {
    return payload[key] == null || isNaN(payload[key]);
  });
  if (missing.length) {
    throw new Error('每日總經資料抓取失敗，且無上一筆可沿用：' + missing.join(', '));
  }
  if (fallbackKeys.length) {
    payload.source += '；沿用上一筆：' + fallbackKeys.join(', ');
  }
  return payload;
}

function fetchFredSeriesValues_(seriesId, limit) {
  var startDate = fredStartDate_(24);
  var url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + encodeURIComponent(seriesId) + '&cosd=' + encodeURIComponent(startDate);
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('FRED 讀取失敗：' + seriesId);
  }
  var lines = res.getContentText().split(/\r?\n/);
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var line = String(lines[i] || '').trim();
    if (!line) continue;
    var parts = line.split(',');
    if (parts.length < 2 || parts[1] === '.') continue;
    var value = parseFloat(parts[1]);
    if (isNaN(value)) continue;
    rows.push({ date: parts[0], value: value });
  }
  if (!rows.length) throw new Error('FRED 無有效資料：' + seriesId);
  return limit ? rows.slice(-limit) : rows;
}

function fredStartDate_(monthsBack) {
  var d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  return Utilities.formatDate(d, 'GMT', 'yyyy-MM-dd');
}

function latestSeriesPoint_(rows) {
  return rows && rows.length ? rows[rows.length - 1] : null;
}

function latestSeriesValue_(rows) {
  var point = latestSeriesPoint_(rows);
  return point ? point.value : null;
}

function normalizeYield10y_(value) {
  value = Number(value);
  if (isNaN(value)) return null;
  return value > 20 ? value / 10 : value;
}

function macroDefaultSettings_() {
  return [
    { code: 'yield10y', name: '美國10年債殖利率', enabled: true, yellow: '>=4.5', red: '>=5.0', note: '利率壓力' },
    { code: 'oil', name: '原油價格', enabled: true, yellow: '>=85', red: '>=100', note: '通膨壓力' },
    { code: 'cpi', name: 'CPI年增率', enabled: true, yellow: '>=3.0', red: '>=4.0', note: '通膨' },
    { code: 'ppi', name: 'PPI年增率', enabled: true, yellow: '>=3.0', red: '>=5.0', note: '上游通膨' },
    { code: 'unemployment', name: '失業率', enabled: true, yellow: '>=4.3', red: '>=5.0', note: '就業惡化' },
    { code: 'joltsOpenings', name: '職位空缺與勞動力流動調查 (JOLTS)', enabled: true, yellow: '<=7000', red: '<=6500', note: '職缺降溫，單位：千人' },
    { code: 'vix', name: 'VIX恐慌指數', enabled: true, yellow: '>=20', red: '>=30', note: '市場恐慌' },
    { code: 'dxy', name: '美元指數', enabled: true, yellow: '>=105', red: '>=110', note: '美元壓力' },
    { code: 'creditSpread', name: '信用利差', enabled: true, yellow: '>=1.8', red: '>=2.5', note: '信用風險' },
    { code: 'consumerSentiment', name: '密歇根消費者信心', enabled: true, yellow: '<=70', red: '<=60', note: '消費信心轉弱' }
  ];
}

function buildMacroIndicators_(dataRow, settings) {
  var values = dataRow ? dataRow.values : {};
  return settings.map(function(setting) {
    var value = values && values[setting.code] != null ? values[setting.code] : null;
    var status = macroIndicatorStatus_(value, setting);
    return {
      code: setting.code,
      name: setting.name,
      value: value,
      displayValue: value == null ? '--' : macroFormatIndicator_(setting.code, value),
      status: status.status,
      tone: status.tone,
      yellow: setting.yellow,
      red: setting.red,
      note: setting.note
    };
  });
}

function macroIndicatorStatus_(value, setting) {
  if (value == null || isNaN(value)) return { status: '無資料', tone: 'watch' };
  if (macroMatchesCondition_(value, setting.red)) return { status: '紅燈', tone: 'defense' };
  if (macroMatchesCondition_(value, setting.yellow)) return { status: '黃燈', tone: 'watch' };
  return { status: '綠燈', tone: 'attack' };
}

function macroMatchesCondition_(value, condition) {
  var text = String(condition || '').replace(/\s/g, '');
  if (!text) return false;
  var m = text.match(/^(>=|<=|>|<|=)?(-?\d+(?:\.\d+)?)/);
  if (!m) return false;
  var op = m[1] || '>=';
  var target = parseFloat(m[2]);
  if (op === '>=') return value >= target;
  if (op === '<=') return value <= target;
  if (op === '>') return value > target;
  if (op === '<') return value < target;
  return value === target;
}

function macroFormatIndicator_(code, value) {
  if (code === 'yield10y' || code === 'cpi' || code === 'ppi' || code === 'unemployment' || code === 'creditSpread') {
    return value.toFixed(2) + '%';
  }
  if (code === 'consumerSentiment') return value.toFixed(1);
  if (code === 'joltsOpenings') return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' 千人';
  if (code === 'oil' || code === 'vix' || code === 'dxy') return value.toFixed(2);
  return String(value);
}

function macroObjectFromRow_(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) {
    if (h) obj[h] = row[i] || '';
  });
  return obj;
}

function macroNumber_(value) {
  var text = String(value || '').replace(/[$,\s]/g, '').replace('%', '');
  if (!text) return null;
  var n = parseFloat(text);
  return isNaN(n) ? null : n;
}

function writeAdvisorTask(ss, body) {
  var sheet = ss.getSheetByName('軍師工單');
  if (!sheet) sheet = ss.insertSheet('軍師工單');

  var headers = ['建立時間', '任務類型', '優先度', '需求內容', '相關區域', '狀態', '處理備註', '修改目標', '指定試算表'];
  var currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsHeader = headers.some(function(header, index) {
    return String(currentHeaders[index] || '').trim() !== header;
  });
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  var taskType = String(body.taskType || '網頁修改').trim();
  var priority = String(body.priority || '一般').trim();
  var detail = String(body.detail || '').trim();
  var area = String(body.area || '').trim();
  var draft = String(body.draft || '').trim();
  var targetType = String(body.targetType || '網頁端').trim();
  var targetSheet = String(body.targetSheet || '').trim();
  if (!detail) throw new Error('請輸入工單需求內容');
  if (detail.length > 1500) throw new Error('工單內容請控制在 1500 字以內');

  sheet.appendRow([
    new Date(),
    taskType,
    priority,
    detail,
    area,
    '待處理',
    draft,
    targetType,
    targetSheet
  ]);

  return {
    message: '軍師工單已送出',
    row: sheet.getLastRow(),
    status: '待處理',
    taskType: taskType,
    priority: priority
  };
}

function createAdvisorDraft(body) {
  var taskType = String(body.taskType || '網頁修改').trim();
  var priority = String(body.priority || '一般').trim();
  var area = String(body.area || '').trim();
  var detail = String(body.detail || '').trim();
  var targetType = String(body.targetType || '網頁端').trim();
  var targetSheet = String(body.targetSheet || '').trim();
  if (!detail) throw new Error('請輸入需求內容後再請副軍師草擬');
  if (detail.length > 1500) throw new Error('需求內容請控制在 1500 字以內');

  return {
    draft: askDeepSeekDraft_(buildAdvisorTaskPrompt_(taskType, priority, area, detail, targetType, targetSheet))
  };
}

function buildAdvisorTaskPrompt_(taskType, priority, area, detail, targetType, targetSheet) {
  return [
    '任務類型：' + taskType,
    '優先度：' + priority,
    '修改目標：' + targetType,
    '指定試算表：' + (targetSheet || '未指定'),
    '相關區域：' + (area || '未指定'),
    '需求內容：',
    detail,
    '',
    '請整理成：',
    '1. 一句話任務摘要',
    '2. 可能需要修改或檢查的檔案/試算表區域',
    '3. 建議執行步驟',
    '4. 驗證清單',
    '5. 需要主公補充的問題（若沒有就寫無）'
  ].join('\n');
}

function askDeepSeekDraft_(prompt) {
  var key = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');
  if (!key) throw new Error('尚未設定 DEEPSEEK_API_KEY');

  var response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + key
    },
    payload: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: '你是帝國指揮所的副軍師。請使用繁體中文，協助把需求整理成可執行工單草稿。你只能草擬與檢查，不要聲稱已經修改檔案、部署、寫入試算表或完成任務。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      thinking: { type: 'enabled' },
      reasoning_effort: 'medium',
      stream: false
    }),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var data = JSON.parse(text);
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : 'DeepSeek 回應失敗');
  }
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('DeepSeek 回應格式異常');
  }
  return data.choices[0].message.content || '';
}

// ── 當月明細（最新 50 筆） ────────────────────────────────────
function sheetDateText_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  }
  return String(value || '').trim();
}

function parseSheetNumber_(value) {
  if (typeof value === 'number') return value;
  var s = String(value || '').replace(/[$,\s]/g, '').replace('%', '');
  return parseFloat(s) || 0;
}

function headerCol_(headers, names, fallback) {
  for (var i = 0; i < names.length; i++) {
    var idx = headers.indexOf(names[i]);
    if (idx >= 0) return idx;
  }
  return fallback;
}

function getPledgeLoans(ss) {
  var pledges = [];
  var loans   = [];

  // ── 優先讀「市場儀表板」分頁固定區域 ──────────────────────
  var dashSheet = ss.getSheetByName('市場儀表板');
  if (dashSheet) {
    // 質押區：第12列起（0-indexed row 11），標題在第12列，資料從第13列
    var pledgeHeader = dashSheet.getRange('A12:J12').getValues()[0].map(function(h){ return String(h).trim(); });
    var lastRow = dashSheet.getLastRow();
    // 掃第13~15列（最多3筆質押）
    for (var r = 13; r <= Math.min(15, lastRow); r++) {
      var row = dashSheet.getRange('A'+r+':J'+r).getValues()[0];
      if (!row[0] || String(row[0]).trim() === '') continue;
      // 欄位順序：質押標的,質押利率,質押張數,質押時間,經過時間,利息計算,借款金額,標的現價,維持率,警戒166%
      var loanAmt   = parseFloat(String(row[6]).replace(/[^0-9.\-]/g,'')) || 0;
      var price     = parseFloat(String(row[7]).replace(/[^0-9.\-]/g,'')) || 0;
      var lots      = parseFloat(String(row[2]).replace(/[^0-9.\-]/g,'')) || 0;
      // 利率：可能是小數(0.0268)或百分比字串(2.68%)
      var rawPRate  = row[1];
      var rate;
      if (typeof rawPRate === 'number') {
        rate = rawPRate < 1 ? rawPRate * 100 : rawPRate;
      } else {
        var ps = String(rawPRate).replace(/[^0-9.\-]/g,'');
        rate = parseFloat(ps) || 0;
        if (String(rawPRate).indexOf('%') === -1 && rate < 1) rate = rate * 100;
      }
      rate = Math.round(rate * 100) / 100;
      var maint     = parseFloat(String(row[8]).replace(/[^0-9.%\-]/g,'').replace('%','')) || 0;
      var interest  = parseFloat(String(row[5]).replace(/[^0-9.\-]/g,'')) || 0;
      var elapsed   = parseFloat(String(row[4]).replace(/[^0-9.\-]/g,'')) || 0;
      pledges.push({
        target:              String(row[0]).trim(),
        rate:                rate,
        lots:                lots,
        pledgeDate:          String(row[3]).trim(),
        elapsedDays:         elapsed,
        accruedInterest:     Math.round(interest),
        loanAmount:          Math.round(loanAmt),
        currentPrice:        price,
        latestMaintenance:   maint,
        monthlyPayment:      0,
        remainingAmount:     Math.round(loanAmt)
      });
    }

    // 信貸區：第16列標題，第17列起資料
    var loanHeader = dashSheet.getRange('A16:I16').getValues()[0].map(function(h){ return String(h).trim(); });
    for (var lr = 17; lr <= Math.min(20, lastRow); lr++) {
      var lrow = dashSheet.getRange('A'+lr+':I'+lr).getValues()[0];
      if (!lrow[0] || String(lrow[0]).trim() === '') continue;
      // 欄位順序：信貸借款(A),信貸利率(B),總期數(C),借款時間(D),經過時間(E),每期繳款(F),借款金額(G),已付利息(H),累積本金(I)
      var bank          = String(lrow[0]).trim();
      // B17 利率：試算表可能存為小數(0.0494)或百分比字串(4.94%)，統一轉成百分比數字
      var rawRate       = lrow[1];
      var loanRate;
      if (typeof rawRate === 'number') {
        // 純數字：若 < 1 則是小數形式，乘 100
        loanRate = rawRate < 1 ? rawRate * 100 : rawRate;
      } else {
        var s = String(rawRate).replace(/[^0-9.\-]/g,'');
        loanRate = parseFloat(s) || 0;
        // 若原始字串不含 % 且值 < 1，視為小數形式
        if (String(rawRate).indexOf('%') === -1 && loanRate < 1) loanRate = loanRate * 100;
      }
      loanRate = Math.round(loanRate * 100) / 100;  // 四捨五入到小數兩位
      var termMonths    = parseFloat(String(lrow[2]).replace(/[^0-9.\-]/g,'')) || 0;
      var loanDate      = String(lrow[3]).trim();
      var elapsedM      = parseFloat(String(lrow[4]).replace(/[^0-9.\-]/g,'')) || 0;
      var monthly       = parseFloat(String(lrow[5]).replace(/[^0-9.\-]/g,'')) || 0;
      var loanTotal     = parseFloat(String(lrow[6]).replace(/[^0-9.\-]/g,'')) || 0;
      var paidInterest  = parseFloat(String(lrow[7]).replace(/[^0-9.\-]/g,'')) || 0;  // H17
      var principalPaid = parseFloat(String(lrow[8]).replace(/[^0-9.\-]/g,'')) || 0;  // I17
      loans.push({
        bank:           bank,
        loanAmount:     Math.round(loanTotal),
        rate:           loanRate,
        loanDate:       loanDate,
        termMonths:     termMonths,
        monthlyPayment: Math.round(monthly),
        elapsedMonths:  elapsedM,
        repaidTotal:    Math.round(monthly * elapsedM),
        remainingAmount:Math.round(loanTotal - principalPaid),
        interestPaid:   Math.round(paidInterest),   // 前端用 l.interestPaid
        paidInterest:   Math.round(paidInterest),   // 相容舊欄位
        principalPaid:  Math.round(principalPaid)
      });
    }
  }

  // ── 若找不到市場儀表板，嘗試獨立分頁（向下相容）──────────
  if (pledges.length === 0 && loans.length === 0) {
    var pledgeSheet = ss.getSheetByName('質押記錄') || ss.getSheetByName('質押紀錄');
    var loanSheet   = ss.getSheetByName('信貸記錄') || ss.getSheetByName('信貸紀錄');

    if (pledgeSheet && pledgeSheet.getLastRow() > 1) {
      var pledgeData    = pledgeSheet.getDataRange().getValues();
      var pledgeHeaders = pledgeData[0].map(function(h) { return String(h).trim(); });
      var targetIdx     = headerCol_(pledgeHeaders, ['質押標的'], 0);
      var currentIdx    = headerCol_(pledgeHeaders, ['質押標的現價', '現價'], 1);
      var rateIdx       = headerCol_(pledgeHeaders, ['利率'], 2);
      var pledgeDateIdx = headerCol_(pledgeHeaders, ['質押日期'], 3);
      var lotsIdx       = headerCol_(pledgeHeaders, ['質押張數'], 6);
      var loanIdx       = headerCol_(pledgeHeaders, ['借款金額'], 7);
      var lastMaintIdx  = headerCol_(pledgeHeaders, ['最新維持率'], 9);
      var interestIdx   = headerCol_(pledgeHeaders, ['利息累積', '累積利息'], 11);
      pledgeData.slice(1).forEach(function(row) {
        if (!row[targetIdx]) return;
        pledges.push({
          target:            String(row[targetIdx] || '').trim(),
          currentPrice:      parseSheetNumber_(row[currentIdx]),
          rate:              parseSheetNumber_(row[rateIdx]),
          pledgeDate:        sheetDateText_(row[pledgeDateIdx]),
          lots:              parseSheetNumber_(row[lotsIdx]),
          loanAmount:        Math.round(parseSheetNumber_(row[loanIdx])),
          latestMaintenance: parseSheetNumber_(row[lastMaintIdx]),
          accruedInterest:   Math.round(parseSheetNumber_(row[interestIdx]))
        });
      });
    }

    if (loanSheet && loanSheet.getLastRow() > 1) {
      var loanData    = loanSheet.getDataRange().getValues();
      var loanHeaders = loanData[0].map(function(h) { return String(h).trim(); });
      var bankIdx     = headerCol_(loanHeaders, ['信貸銀行', '銀行'], 0);
      var amountIdx   = headerCol_(loanHeaders, ['借款金額'], 1);
      var loanRateIdx = headerCol_(loanHeaders, ['利率'], 2);
      var dateIdx     = headerCol_(loanHeaders, ['借款日期'], 3);
      var termIdx     = headerCol_(loanHeaders, ['借款期數'], 5);
      var paymentIdx  = headerCol_(loanHeaders, ['每期還款', '每月還款'], 6);
      var loanMonthsIdx = headerCol_(loanHeaders, ['經過月數'], 7);
      var loanInterestIdx = headerCol_(loanHeaders, ['已付利息'], 11);
      loanData.slice(1).forEach(function(row) {
        if (!row[bankIdx]) return;
        loans.push({
          bank:           String(row[bankIdx] || '').trim(),
          loanAmount:     Math.round(parseSheetNumber_(row[amountIdx])),
          rate:           parseSheetNumber_(row[loanRateIdx]),
          loanDate:       sheetDateText_(row[dateIdx]),
          termMonths:     parseSheetNumber_(row[termIdx]),
          monthlyPayment: Math.round(parseSheetNumber_(row[paymentIdx])),
          elapsedMonths:  parseSheetNumber_(row[loanMonthsIdx]),
          paidInterest:   Math.round(parseSheetNumber_(row[loanInterestIdx]))
        });
      });
    }
  }

  return { pledges: pledges, loans: loans };
}


function pad2(n) {
  return ('0' + n).slice(-2);
}

function formatTxnDate(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, 'Asia/Taipei', 'MM/dd');
  }
  var s = String(v || '').trim();
  var m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (m) return pad2(m[2]) + '/' + pad2(m[3]);
  m = s.match(/^(\d{1,2})[\/-](\d{1,2})/);
  if (m) return pad2(m[1]) + '/' + pad2(m[2]);
  return s.substring(0, 5);
}

function formatTxnYM(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, 'Asia/Taipei', 'yyyy/MM');
  }
  var s = String(v || '').trim();
  var m = s.match(/^(\d{4})[\/-](\d{1,2})/);
  if (m) return m[1] + '/' + pad2(m[2]);
  return s.substring(0, 7);
}

function getTransactions(ss, ym) {
  if (!ym) return [];
  var db = ss.getSheetByName('資料庫');
  var txns = [];
  var accountChanges = readAccountChangesForYm_(ss, ym);
  var usedAccountChanges = {};

  if (db && db.getLastRow() >= 2) {
    var data = db.getRange(2, 1, db.getLastRow() - 1, 16).getValues();
    data.forEach(function(row, i) {
      var rowYM = ledgerYm_(row);
      if (rowYM !== ym) return;
      var type = ledgerType_(row);
      if (type === '支出') {
        var expenseTxn = {
          date: formatTxnDate(row[0]),
          type: '支出',
          cat: String(row[3] || '').trim(),
          amount: Math.round(ledgerExpenseAmount_(row)),
          note: String(row[5] || '').trim(),
          source: 'ledger',
          rowId: i + 2,
          undoable: true,
          _sortKey: formatTxnYM(row[0]) + '/' + formatTxnDate(row[0]),
          _order: i
        };
        txns.push(attachAccountChange_(expenseTxn, accountChanges, usedAccountChanges, {
          date: expenseTxn.date,
          type: '支出',
          primaryAccount: ledgerExpenseAccount_(row),
          primaryDelta: -ledgerExpenseAmount_(row),
          label: expenseTxn.cat,
          note: expenseTxn.note
        }));
      } else if (type === '收入') {
        var incomeTxn = {
          date: formatTxnDate(row[0]),
          type: '收入',
          cat: String(row[7] || '').trim(),
          amount: Math.round(ledgerIncomeAmount_(row)),
          note: String(row[5] || '').trim(),
          source: 'ledger',
          rowId: i + 2,
          undoable: true,
          _sortKey: formatTxnYM(row[0]) + '/' + formatTxnDate(row[0]),
          _order: i
        };
        txns.push(attachAccountChange_(incomeTxn, accountChanges, usedAccountChanges, {
          date: incomeTxn.date,
          type: '收入',
          primaryAccount: ledgerIncomeAccount_(row),
          primaryDelta: ledgerIncomeAmount_(row),
          label: incomeTxn.cat,
          note: incomeTxn.note
        }));
      } else if (type === '轉帳') {
        var from = ledgerTransferFrom_(row);
        var to = ledgerTransferTo_(row);
        var label = String(row[7] || '').trim();
        var transferTxn = {
          date: formatTxnDate(row[0]),
          type: '轉帳',
          cat: label || (from + ' → ' + to),
          amount: Math.round(ledgerTransferAmount_(row)),
          note: String(row[5] || '').trim(),
          source: 'ledger',
          rowId: i + 2,
          undoable: true,
          _sortKey: formatTxnYM(row[0]) + '/' + formatTxnDate(row[0]),
          _order: i
        };
        var transferAmount = ledgerTransferAmount_(row);
        var transferChange = findAccountChange_(accountChanges, usedAccountChanges, {
          date: transferTxn.date,
          type: '轉帳',
          primaryAccount: from,
          secondaryAccount: to,
          primaryDelta: -transferAmount,
          secondaryDelta: transferAmount,
          label: label || (from + ' → ' + to),
          note: transferTxn.note
        }) || findAccountChange_(accountChanges, usedAccountChanges, {
          date: transferTxn.date,
          type: '轉帳',
          anyDelta: transferAmount,
          note: transferTxn.note
        });
        if (transferChange) {
          transferTxn.accountChange = {
            primaryAccount: transferChange.primaryAccount,
            primaryDelta: Math.round(transferChange.primaryDelta),
            primaryAfter: Math.round(transferChange.primaryAfter),
            secondaryAccount: transferChange.secondaryAccount,
            secondaryDelta: transferChange.secondaryAccount ? Math.round(transferChange.secondaryDelta) : '',
            secondaryAfter: transferChange.secondaryAccount ? Math.round(transferChange.secondaryAfter) : ''
          };
        }
        txns.push(transferTxn);
      } else if (isStockLedgerType_(type)) {
        var stockFrom = ledgerTransferFrom_(row);
        var stockTo = ledgerTransferTo_(row);
        var symbol = ledgerStockSymbol_(row);
        var stockTxn = {
          date: formatTxnDate(row[0]),
          type: type,
          cat: (getDividendDisplayLabel_(symbol) || symbol || String(row[7] || '').trim()) + (stockFrom || stockTo ? '｜' + stockFrom + ' → ' + stockTo : ''),
          amount: Math.round(ledgerTransferAmount_(row)),
          note: String(row[5] || '').trim(),
          source: 'ledger',
          rowId: i + 2,
          undoable: true,
          _sortKey: formatTxnYM(row[0]) + '/' + formatTxnDate(row[0]),
          _order: i
        };
        txns.push(attachAccountChange_(stockTxn, accountChanges, usedAccountChanges, {
          date: stockTxn.date,
          type: '股票交易',
          anyDelta: ledgerTransferAmount_(row),
          note: stockTxn.note
        }));
      }
    });
  }

  txns.sort(function(a, b) {
    if (a._sortKey !== b._sortKey) return a._sortKey < b._sortKey ? 1 : -1;
    return b._order - a._order;
  });

  return txns.slice(0, 50).map(function(t) {
    delete t._sortKey;
    delete t._order;
    return t;
  });
}

function getStockTrades(ss, ym) {
  if (!ym) return [];
  var ledgerDb = ss.getSheetByName('資料庫');
  var trades = [];

  if (ledgerDb && ledgerDb.getLastRow() >= 2) {
    var ledgerRows = ledgerDb.getRange(2, 1, ledgerDb.getLastRow() - 1, 16).getValues();
    ledgerRows.forEach(function(row, i) {
      var type = ledgerType_(row);
      if (!isStockLedgerType_(type)) return;
      var rowYM = ledgerYm_(row);
      if (rowYM !== ym) return;
      var symbol = ledgerStockSymbol_(row);
      if (!symbol) return;
      trades.push({
        rowId: i + 2,
        source: 'ledger',
        date: formatTxnDate(row[0]),
        from: ledgerTransferFrom_(row),
        to: ledgerTransferTo_(row),
        cashAmount: Math.round(ledgerTransferAmount_(row)),
        symbol: symbol,
        displaySymbol: getDividendDisplayLabel_(symbol) || symbol,
        type: type === '買入股票' ? '買入' : (type === '賣出股票' ? '賣出' : type),
        shares: ledgerStockShares_(row),
        stockAmount: Math.round(ledgerTransferAmount_(row)),
        note: String(row[5] || '').trim(),
        _sortKey: formatTxnYM(row[0]) + '/' + formatTxnDate(row[0]),
        _order: i
      });
    });
  }

  trades.sort(function(a, b) {
    if (a._sortKey !== b._sortKey) return a._sortKey < b._sortKey ? 1 : -1;
    return b._order - a._order;
  });

  return trades.slice(0, 50).map(function(trade) {
    delete trade._sortKey;
    delete trade._order;
    return trade;
  });
}

function voidStockTrade(ss, body) {
  var source = String(body.source || '').trim();
  var ledgerDb = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var rowId = parseInt(body.rowId, 10) || 0;
  if (!rowId) throw new Error('找不到要沖銷的股票交易');

  var db = null;
  var row = null;
  var ds = '';
  var from = '';
  var amount = 0;
  var to = '';
  var note = '';
  var ym = '';
  var symbol = '';
  var tradeType = '';
  var shares = 0;

  if (source === 'ledger' || !source) {
    if (ledgerDb && rowId >= 2 && rowId <= ledgerDb.getLastRow()) {
      var ledgerRow = ledgerDb.getRange(rowId, 1, 1, 16).getValues()[0];
      var ledgerType = ledgerType_(ledgerRow);
      if (isStockLedgerType_(ledgerType)) {
        db = ledgerDb;
        row = ledgerRow;
        ds = String(row[0] || '').trim();
        from = ledgerTransferFrom_(row);
        amount = ledgerTransferAmount_(row);
        to = ledgerTransferTo_(row);
        note = String(row[5] || '').trim();
        ym = ledgerYm_(row);
        symbol = ledgerStockSymbol_(row);
        tradeType = ledgerType;
        shares = ledgerStockShares_(row);
        source = 'ledger';
      }
    }
  }

  if (!symbol || !tradeType || shares === 0 || amount <= 0) throw new Error('這列不是有效的股票交易');

  var stockFromLeg = isTransferStockLeg_(from, symbol);
  var stockToLeg = isTransferStockLeg_(to, symbol);
  if (stockFromLeg && stockToLeg) throw new Error('股票交易資料異常：兩側都是持股標的');
  if (!stockFromLeg && !stockToLeg) throw new Error('股票交易資料異常：找不到持股標的帳戶');

  var change = null;
  var cashAccount = '';
  if (stockFromLeg) {
    cashAccount = to;
    change = adjustBalanceAPI(moon, to, accountBalanceDelta_(to, -amount));
  } else {
    cashAccount = from;
    change = adjustBalanceAPI(moon, from, accountBalanceDelta_(from, +amount));
  }

  db.deleteRow(rowId);
  recordAccountChange_(ss, {
    date: ds,
    ym: ym,
    type: '股票交易沖銷',
    primary: change,
    label: '沖銷 ' + (getDividendDisplayLabel_(symbol) || symbol),
    note: note || (from + ' → ' + to)
  });

  return {
    message: '股票交易已沖銷',
    rowId: rowId,
    symbol: symbol,
    account: cashAccount,
    amount: amount
  };
}

function undoTransaction(ss, body) {
  var source = String(body.source || '').trim();
  if (source !== 'ledger') throw new Error('目前只支援撤銷資料庫分頁的最近紀錄');

  var db = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!db || !moon) throw new Error('找不到資料庫或月度戰情室');

  var rowId = parseInt(body.rowId, 10) || 0;
  if (!rowId || rowId < 2 || rowId > db.getLastRow()) throw new Error('找不到要撤銷的最近紀錄');

  var row = db.getRange(rowId, 1, 1, 16).getValues()[0];
  var type = String(row[1] || '').trim();
  if (type !== '支出' && type !== '收入' && type !== '轉帳' && !isStockLedgerType_(type)) {
    throw new Error('這列不是可撤銷的收入、支出或轉帳紀錄');
  }

  var requestedType = String(body.type || '').trim();
  if (requestedType && requestedType !== type) throw new Error('最近紀錄已變更，請重新整理後再撤銷');

  var changes = [];
  if (type === '支出') {
    var expenseAccount = String(row[4] || row[12] || '').trim();
    var expenseAmount = Math.abs(parseFloat(row[2]) || 0);
    if (expenseAccount && expenseAmount) {
      changes.push(adjustBalanceAPI(moon, expenseAccount, accountBalanceDelta_(expenseAccount, +expenseAmount)));
    }
  } else if (type === '收入') {
    var incomeAccount = String(row[8] || row[12] || '').trim();
    var incomeAmount = parseFloat(row[6]) || 0;
    if (incomeAccount && incomeAmount) {
      changes.push(adjustBalanceAPI(moon, incomeAccount, accountBalanceDelta_(incomeAccount, -incomeAmount)));
    }
  } else if (type === '轉帳') {
    var to = ledgerTransferTo_(row);
    var from = ledgerTransferFrom_(row);
    var transferAmount = parseFloat(row[14]) || parseFloat(row[2]) || 0;
    if (from && transferAmount) changes.push(adjustBalanceAPI(moon, from, accountBalanceDelta_(from, +transferAmount)));
    if (to && transferAmount) changes.push(adjustBalanceAPI(moon, to, accountBalanceDelta_(to, -transferAmount)));
  } else if (isStockLedgerType_(type)) {
    var stockTo = ledgerTransferTo_(row);
    var stockFrom = ledgerTransferFrom_(row);
    var stockAmount = ledgerTransferAmount_(row);
    var stockSymbol = ledgerStockSymbol_(row);
    if (stockFrom && stockAmount && !isTransferStockLeg_(stockFrom, stockSymbol)) {
      changes.push(adjustBalanceAPI(moon, stockFrom, accountBalanceDelta_(stockFrom, +stockAmount)));
    }
    if (stockTo && stockAmount && !isTransferStockLeg_(stockTo, stockSymbol)) {
      changes.push(adjustBalanceAPI(moon, stockTo, accountBalanceDelta_(stockTo, -stockAmount)));
    }
  }

  db.deleteRow(rowId);
  SpreadsheetApp.flush();

  return {
    message: '最近紀錄已撤銷',
    rowId: rowId,
    type: type,
    changes: changes.filter(function(change) { return !!change; })
  };
}

function getAccountChanges(ss, ym) {
  var sheet = ss.getSheetByName(ACCOUNT_CHANGE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var lastRow = sheet.getLastRow();
  var width = Math.max(ACCOUNT_CHANGE_HEADERS.length, sheet.getLastColumn());
  var rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var items = [];

  rows.forEach(function(row, i) {
    var rowYM = String(row[2] || '').trim();
    if (ym && rowYM !== ym) return;
    items.push({
      timestamp: formatTxnDateTime_(row[0]),
      date: formatTxnDate(row[1]),
      ym: rowYM,
      type: String(row[3] || '').trim(),
      primaryAccount: String(row[4] || '').trim(),
      primaryBefore: roundAccountAmount_(row[5]),
      primaryDelta: roundAccountAmount_(row[6]),
      primaryAfter: roundAccountAmount_(row[7]),
      secondaryAccount: String(row[8] || '').trim(),
      secondaryBefore: row[9] === '' ? null : roundAccountAmount_(row[9]),
      secondaryDelta: row[10] === '' ? null : roundAccountAmount_(row[10]),
      secondaryAfter: row[11] === '' ? null : roundAccountAmount_(row[11]),
      label: String(row[12] || '').trim(),
      note: String(row[13] || '').trim(),
      _order: i
    });
  });

  items.sort(function(a, b) {
    var at = new Date(a.timestamp || a.date).getTime() || 0;
    var bt = new Date(b.timestamp || b.date).getTime() || 0;
    if (at !== bt) return bt - at;
    return b._order - a._order;
  });

  return items.slice(0, 50).map(function(item) {
    delete item._order;
    return item;
  });
}

function formatTxnDateTime_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');
  }
  return String(value || '').trim();
}

function roundAccountAmount_(value) {
  return Math.round(parseFloat(value) || 0);
}

// ── 寫入支出 ─────────────────────────────────────────────────
function writeExpense(ss, body) {
  var db   = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!db || !moon) throw new Error('找不到分頁');

  var ds     = String(body.date   || '').trim();
  var cat    = String(body.cat    || '').trim();
  var account= String(body.account|| '').trim();
  var amount = parseFloat(body.amount) || 0;
  var note   = String(body.note   || '').trim();

  if (!ds)      throw new Error('日期必填');
  if (!cat)     throw new Error('類別必填');
  if (!account) throw new Error('帳戶必填');
  if (amount <= 0) throw new Error('金額必須大於 0');

  var ym = ds.substring(0, 7);
  var nr = db.getLastRow() + 1;
  db.getRange(nr, 1, 1, 16).setValues([[
    ds, '支出', -amount, cat, account, note, '', '', '', ym, '', '', '', '', '', ''
  ]]);
  db.getRange(nr, 10, 1, 1).setNumberFormat('@');
  db.getRange(nr, 3, 1, 1).setNumberFormat('#,##0');
  db.getRange(nr, 5, 1, 1).setNumberFormat('@');

  var change = adjustBalanceAPI(moon, account, accountBalanceDelta_(account, -amount));
  recordAccountChange_(ss, {
    date: ds,
    ym: ym,
    type: '支出',
    primary: change,
    label: cat,
    note: note
  });

  return { message: '支出已記錄', date: ds, cat: cat, amount: amount, account: account };
}

// ── 寫入收入 ─────────────────────────────────────────────────
function writeIncome(ss, body) {
  var db   = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!db || !moon) throw new Error('找不到分頁');

  var ds     = String(body.date   || '').trim();
  var source = String(body.source || '').trim();
  var account= String(body.account|| '').trim();
  var amount = parseFloat(body.amount) || 0;
  var note   = String(body.note   || '').trim();
  var divRate = parseFloat(body.divRate) || '';
  var divSymbol = String(body.divSymbol || '').trim();
  var dividendRowId = parseInt(body.dividendRowId, 10) || 0;
  var isDividendIncome = String(body.dividendIncome || '').trim() === '1' || dividendRowId > 0;
  var incomeStockSymbol = normalizeInvestmentSymbol_(divSymbol || note || account);
  var ledgerAccount = normalizeIncomeLedgerAccount_(account, incomeStockSymbol);

  if (!ds)      throw new Error('日期必填');
  if (!source)  throw new Error('收入來源必填');
  if (!account) throw new Error('帳戶必填');
  if (amount <= 0) throw new Error('金額必須大於 0');

  note = divSymbol ? incomeStockSymbol : formatIncomeStockNote_(note, incomeStockSymbol);

  var ym = ds.substring(0, 7);
  var nr = db.getLastRow() + 1;
  db.getRange(nr, 1, 1, 16).setValues([[
    ds, '收入', '', '', '', note, amount, source, ledgerAccount, ym, divRate, '', '', '', '', ''
  ]]);
  db.getRange(nr, 10, 1, 1).setNumberFormat('@');
  db.getRange(nr, 7, 1, 1).setNumberFormat('#,##0');
  db.getRange(nr, 11, 1, 1).setNumberFormat('0.000');
  db.getRange(nr, 9, 1, 1).setNumberFormat('@');

  var change = adjustBalanceAPI(moon, ledgerAccount, accountBalanceDelta_(ledgerAccount, +amount));
  recordAccountChange_(ss, {
    date: ds,
    ym: ym,
    type: '收入',
    primary: change,
    label: source,
    note: note
  });

  if (isDividendIncome) {
    markDividendPaid_(ss, {
      rowId: dividendRowId,
      symbol: divSymbol || account,
      actualAmount: amount
    });
  }

  return { message: '收入已記錄', date: ds, source: source, amount: amount, account: ledgerAccount };
}

function normalizeIncomeLedgerAccount_(account, stockSymbol) {
  var clean = String(account || '').trim();
  if (!stockSymbol) return clean;
  if (clean === '💵國泰Stock') return clean;
  return '💵國泰Stock';
}

function formatIncomeStockNote_(note, symbol) {
  var clean = stripIncomeStockNotePrefix_(note);
  if (!symbol) return clean;
  var display = getDividendDisplayLabel_(symbol);
  if (!clean || clean === symbol || clean === display) clean = '配息';
  return '股票:' + symbol + '｜' + clean;
}

function stripIncomeStockNotePrefix_(note) {
  var s = String(note || '').trim();
  s = s.replace(/^股票[:：]\s*[^｜|]+[｜|]\s*/, '').trim();
  s = s.replace(/^股票[:：]\s*[^｜|]+\s*$/, '').trim();
  var symbol = normalizeInvestmentSymbol_(s);
  if (!symbol) return s;
  var display = getDividendDisplayLabel_(symbol);
  if (s === symbol || s === display) return '';
  if (s.indexOf(symbol + ' ') === 0) return s.substring(symbol.length).trim();
  if (s.indexOf(display + ' ') === 0) return s.substring(display.length).trim();
  return s;
}

function normalizeInvestmentSymbol_(value) {
  var s = String(value || '').toUpperCase();
  if (s.indexOf('00988A') >= 0) return 'GDXW';
  var symbols = ['AIPI', 'CHPY', 'PLTY', 'QQQI', 'SPYI', 'MLPI', 'IAU', 'GDXW', 'GLDW', '00985B'];
  for (var i = 0; i < symbols.length; i++) {
    if (s.indexOf(symbols[i]) >= 0) return symbols[i];
  }
  if (s.indexOf('路博邁') >= 0 || s.indexOf('5G') >= 0) return '路博邁台灣5G';
  if (s.indexOf('施羅德') >= 0) return '施羅德收益成長A2';
  return '';
}

function getDividendDisplayLabel_(symbol) {
  var displayMap = {
    '00985B': '🎟️00985B',
    'MLPI': '🛢️MLPI',
    '施羅德收益成長A2': '🌳施羅德收益成長A2',
    '路博邁台灣5G': '🪐路博邁台灣5G',
    'SPYI': '💎SPYI',
    'QQQI': '📡QQQI',
    'AIPI': '🤖AIPI',
    'PLTY': '🪖PLTY',
    'CHPY': '🐦‍🔥CHPY',
    'IAU': '👑IAU',
    'GDXW': '⚒️GDXW',
    'GLDW': '💛GLDW'
  };
  return displayMap[symbol] || symbol || '';
}

function writeTransfer(ss, body) {
  var ledgerDb = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var ds    = String(body.date  || '').trim();
  var from  = String(body.from  || '').trim();
  var to    = String(body.to    || '').trim();
  var amount= parseFloat(body.amount) || 0;
  var label = String(body.label || '').trim();
  var note  = String(body.note  || '').trim();
  var stockMode   = String(body.stockMode || '').trim() === '1';
  var stockType   = String(body.stockType || 'buy').trim();
  var stockSymbol = normalizeInvestmentSymbol_(body.stockSymbol) || String(body.stockSymbol || '').trim();
  var stockSharesInput = parseFloat(body.stockShares) || 0;
  var stockShares = Math.abs(stockSharesInput);
  var stockAmount = parseFloat(body.stockAmount) || amount; // 交易金額，預設同轉帳金額
  var dividendRowId = parseInt(body.dividendRowId, 10) || 0;
  var holdingTradeRowId = parseInt(body.holdingTradeRowId, 10) || 0;

  if (!ds)     throw new Error('日期必填');
  if (!from)   throw new Error('轉出帳戶必填');
  if (!to)     throw new Error('轉入帳戶必填');
  if (amount <= 0) throw new Error('金額必須大於 0');
  if (stockMode && (!stockSymbol || stockShares <= 0)) {
    throw new Error('股票交易需填寫股票標籤與股數');
  }
  var stockFromLeg = stockMode && isTransferStockLeg_(from, stockSymbol);
  var stockToLeg = stockMode && isTransferStockLeg_(to, stockSymbol);
  if (stockMode) {
    if (stockFromLeg && stockToLeg) throw new Error('股票交易需有一側為資金帳戶');
    if (!stockFromLeg && !stockToLeg) throw new Error('股票交易需在轉出或轉入帳戶選擇持股標的');
    if (stockType === 'sell' && !stockFromLeg) throw new Error('賣出時轉出帳戶需選擇持股標的');
    if (stockType !== 'sell' && !stockToLeg) throw new Error('買入時轉入帳戶需選擇持股標的');
  }

  var ym = ds.substring(0, 7);
  var db = ledgerDb;
  if (!db) throw new Error('找不到資料庫');
  var nr = db.getLastRow() + 1;
  if (stockMode) {
    var isSell = stockType === 'sell';
    var signedShares = isSell ? -stockShares : stockShares;
    db.getRange(nr, 1, 1, 16).setValues([[
      ds,
      '轉帳',
      '',
      '',
      '',
      note,
      '',
      '',
      '',
      ym,
      '',
      '',
      from,
      to,
      stockAmount || amount,
      signedShares
    ]]);
    db.getRange(nr, 10, 1, 1).setNumberFormat('@');
    db.getRange(nr, 13, 1, 2).setNumberFormat('@');
    db.getRange(nr, 15, 1, 1).setNumberFormat('#,##0');
    db.getRange(nr, 16, 1, 1).setNumberFormat('#,##0.##');
  } else {
    db.getRange(nr, 1, 1, 16).setValues([[
      ds, '轉帳', '', '', '', note, '', label, '', ym, '', '', from, to, amount, ''
    ]]);
    db.getRange(nr, 10, 1, 1).setNumberFormat('@');
    db.getRange(nr, 13, 1, 2).setNumberFormat('@');
    db.getRange(nr, 15, 1, 1).setNumberFormat('#,##0');
  }

  var skipFromBalance = stockFromLeg;
  var skipToBalance = stockToLeg;
  var fromChange = skipFromBalance ? null : adjustBalanceAPI(moon, from, accountBalanceDelta_(from, -amount));
  var toChange = skipToBalance ? null : adjustBalanceAPI(moon, to, accountBalanceDelta_(to, +amount));
  var primaryChange = fromChange || toChange;
  var secondaryChange = fromChange ? toChange : null;
  recordAccountChange_(ss, {
    date: ds,
    ym: ym,
    type: stockMode ? '股票交易' : '轉帳',
    primary: primaryChange,
    secondary: secondaryChange,
    label: label || (from + ' → ' + to),
    note: note
  });

  if (stockMode && stockType === 'dividend') {
    markDividendPaid_(ss, {
      rowId: dividendRowId,
      symbol: stockSymbol || to,
      actualAmount: stockAmount || amount
    });
  }
  if (stockMode && holdingTradeRowId) {
    markHoldingTradePaid_(ss, {
      rowId: holdingTradeRowId,
      actualAmount: stockAmount || amount
    });
  }

  return { message: stockMode ? '股票交易已記錄' : '轉帳已記錄', date: ds, from: from, to: to, amount: amount };
}

function isTransferStockLeg_(accountName, stockSymbol) {
  var accountSymbol = normalizeInvestmentSymbol_(accountName);
  var tradeSymbol = normalizeInvestmentSymbol_(stockSymbol);
  return !!(accountSymbol && tradeSymbol && accountSymbol === tradeSymbol);
}

// ── 持股備忘錄 ──────────────────────────────────────────────
var DIVIDEND_DB_SHEET = 'Dividend_DB';
var DIVIDEND_DB_HEADERS = [
  'ETF代號', '每股配息USD', '公布日', '預估入帳日', '匯率',
  '持股數', '預估台幣', '是否已入帳', '備註', '實際入帳台幣'
];
var HOLDING_TRADE_DB_SHEET = 'Holding_Trade_DB';
var HOLDING_TRADE_DB_HEADERS = [
  'ETF代號', '購買日期', '匯率', '購買(賣出)股數', '股價USD',
  '手續費USD', '預估台幣', '是否已記帳', '實際記帳台幣', '匯率加入計算'
];

function ensureDividendDbSheet_(ss) {
  var sheet = ss.getSheetByName(DIVIDEND_DB_SHEET);
  if (!sheet) sheet = ss.insertSheet(DIVIDEND_DB_SHEET);

  var headerRange = sheet.getRange(1, 1, 1, DIVIDEND_DB_HEADERS.length);
  var current = headerRange.getValues()[0].map(function(v) { return String(v || '').trim(); });
  var needsHeader = false;
  for (var i = 0; i < DIVIDEND_DB_HEADERS.length; i++) {
    if (current[i] !== DIVIDEND_DB_HEADERS[i]) {
      needsHeader = true;
      break;
    }
  }

  if (needsHeader) {
    headerRange.setValues([DIVIDEND_DB_HEADERS]);
    sheet.getRange(1, 1, 1, DIVIDEND_DB_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#11100a')
      .setFontColor('#e8c050');
    sheet.setFrozenRows(1);
    [1, 3, 4, 8, 9].forEach(function(c) { sheet.setColumnWidth(c, c === 9 ? 160 : 105); });
    [2, 5, 6, 7, 10].forEach(function(c) { sheet.setColumnWidth(c, 105); });
  }

  if (sheet.getMaxColumns() < DIVIDEND_DB_HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), DIVIDEND_DB_HEADERS.length - sheet.getMaxColumns());
  }

  return sheet;
}

function getDividendCenter(ss) {
  var sheet = ensureDividendDbSheet_(getExternalDbSpreadsheet_());
  var settingFx = getDividendSettingFx_(ss);
  var dividendHoldings = getDividendHoldingOptions_(ss);
  var tz = ss.getSpreadsheetTimeZone ? ss.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var holdingTradeRows = getHoldingTradeRows_(ss, tz);
  var holdingTradePending = holdingTradeRows.filter(function(row) { return !row.paid; });
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      rows: [],
      pending: [],
      holdingTrades: holdingTradeRows,
      holdingTradePending: holdingTradePending,
      monthlyTotal: 0,
      settingFx: settingFx,
      dividendHoldings: dividendHoldings
    };
  }

  var values = sheet.getRange(2, 1, lastRow - 1, DIVIDEND_DB_HEADERS.length).getValues();
  var now = new Date();
  var ym = Utilities.formatDate(now, tz || 'Asia/Taipei', 'yyyy/MM');
  var rows = [];
  values.forEach(function(row, idx) {
    var symbol = normalizeInvestmentSymbol_(row[0]) || String(row[0] || '').trim();
    if (!symbol) return;
    var announceDate = formatSheetDate_(row[2], tz);
    var payDate = formatSheetDate_(row[3], tz);
    var estimatedTwd = parseSheetNumber_(row[6]);
    var paid = String(row[7] || '').trim() === '是';
    rows.push({
      rowId: idx + 2,
      symbol: symbol,
      displaySymbol: getDividendDisplayLabel_(symbol) || symbol,
      dividendUsd: parseSheetNumber_(row[1]),
      announceDate: announceDate,
      estimatedPayDate: payDate,
      fx: parseSheetNumber_(row[4]),
      shares: parseSheetNumber_(row[5]),
      estimatedTwd: estimatedTwd,
      paid: paid,
      paidText: paid ? '是' : '否',
      note: String(row[8] || '').trim(),
      actualTwd: parseSheetNumber_(row[9])
    });
  });

  rows.sort(function(a, b) {
    return dateSortValue_(b.announceDate || b.estimatedPayDate) - dateSortValue_(a.announceDate || a.estimatedPayDate);
  });

  var pending = rows.filter(function(row) { return !row.paid; }).sort(function(a, b) {
    return dateSortValue_(a.estimatedPayDate) - dateSortValue_(b.estimatedPayDate);
  });
  var latestMap = {};
  rows.forEach(function(row) {
    if (!latestMap[row.symbol]) latestMap[row.symbol] = row;
  });
  var monthlyTotal = pending.reduce(function(sum, row) {
    return String(row.estimatedPayDate || '').indexOf(ym) === 0 ? sum + row.estimatedTwd : sum;
  }, 0);

  return {
    rows: rows,
    pending: pending,
    holdingTrades: holdingTradeRows,
    holdingTradePending: holdingTradePending,
    monthlyTotal: monthlyTotal,
    settingFx: settingFx,
    dividendHoldings: dividendHoldings
  };
}

function getDividendSettingFx_(ss) {
  var setting = ss.getSheetByName('設定');
  if (!setting) return 32.5;
  var fx = parseFloat(setting.getRange('L2').getValue()) || 0;
  return fx > 0 ? Math.round(fx * 100) / 100 : 32.5;
}

function getDividendHoldingOptions_(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return [];
  var values = moon.getRange('A13:N23').getValues();
  return values.map(function(row) {
    var display = String(row[0] || '').trim();
    var symbol = normalizeInvestmentSymbol_(display) || display;
    if (!display || isTotalLabel_(display)) return null;
    return {
      displaySymbol: display,
      symbol: symbol,
      shares: parseFloat(row[4]) || 0,
      price: parseFloat(row[5]) || 0
    };
  }).filter(function(row) {
    return row && row.symbol;
  });
}

function shouldApplyDividendTaxFactor_(symbol) {
  var s = String(symbol || '').toUpperCase();
  if (s.indexOf('00985B') >= 0 || s.indexOf('985B') >= 0) return false;
  if (s.indexOf('路博邁') >= 0 || s.indexOf('5G') >= 0) return false;
  if (s.indexOf('施羅德') >= 0) return false;
  return true;
}

function markDividendPaid_(ss, options) {
  var sheet = ensureDividendDbSheet_(getExternalDbSpreadsheet_());
  var rowId = parseInt(options.rowId, 10) || 0;
  var symbol = normalizeInvestmentSymbol_(options.symbol);
  var actualAmount = parseFloat(options.actualAmount) || 0;

  if (!rowId && symbol) {
    rowId = findLatestUnpaidDividendRow_(sheet, symbol);
  }
  if (!rowId || rowId < 2 || rowId > sheet.getLastRow()) return null;

  sheet.getRange(rowId, 8).setValue('是');
  sheet.getRange(rowId, 10).setValue(actualAmount).setNumberFormat('#,##0');
  return { rowId: rowId, actualAmount: actualAmount };
}

function deleteDividendEntry(ss, body) {
  var result = markDividendPaid_(ss, {
    rowId: body.rowId,
    symbol: body.symbol,
    actualAmount: 0
  });
  if (!result) throw new Error('找不到待刪除的配息資料');
  return { message: '配息待入帳已刪除', rowId: result.rowId };
}

function writeDividendEntry(ss, body) {
  var sheet = ensureDividendDbSheet_(getExternalDbSpreadsheet_());
  var symbol = normalizeInvestmentSymbol_(body.symbol) || String(body.symbol || '').trim().toUpperCase();
  var dividendUsd = parseFloat(body.dividendUsd) || 0;
  var announceDate = String(body.announceDate || '').trim().replace(/-/g, '/');
  var estimatedPayDate = String(body.estimatedPayDate || '').trim().replace(/-/g, '/');
  var fx = parseFloat(body.fx) || 0;
  var shares = parseFloat(body.shares) || 0;
  var estimatedTwd = parseFloat(body.estimatedTwd) || 0;
  var note = String(body.note || '').trim();

  if (!symbol) throw new Error('ETF代號必填');
  if (dividendUsd <= 0) throw new Error('每股配息USD必須大於 0');
  if (!announceDate) throw new Error('公布日必填');
  if (!estimatedPayDate) throw new Error('預估入帳日必填');
  if (fx <= 0) throw new Error('匯率必須大於 0');
  if (shares <= 0) throw new Error('持股數必須大於 0');
  if (estimatedTwd <= 0) {
    estimatedTwd = dividendUsd * shares * fx;
    if (shouldApplyDividendTaxFactor_(symbol)) estimatedTwd *= 0.7;
    estimatedTwd = Math.round(estimatedTwd);
  }

  var nr = sheet.getLastRow() + 1;
  sheet.getRange(nr, 1, 1, DIVIDEND_DB_HEADERS.length).setValues([[
    symbol,
    dividendUsd,
    announceDate,
    estimatedPayDate,
    fx,
    shares,
    Math.round(estimatedTwd),
    '否',
    note,
    ''
  ]]);
  sheet.getRange(nr, 2, 1, 1).setNumberFormat('0.0000');
  sheet.getRange(nr, 3, 1, 2).setNumberFormat('yyyy/mm/dd');
  sheet.getRange(nr, 5, 1, 1).setNumberFormat('0.000');
  sheet.getRange(nr, 6, 1, 1).setNumberFormat('#,##0.##');
  sheet.getRange(nr, 7, 1, 1).setNumberFormat('#,##0');
  sheet.getRange(nr, 10, 1, 1).setNumberFormat('#,##0');

  return {
    message: '配息資料已寫入',
    rowId: nr,
    symbol: symbol,
    estimatedTwd: Math.round(estimatedTwd)
  };
}

function ensureHoldingTradeDbSheet_(ss) {
  var sheet = ss.getSheetByName(HOLDING_TRADE_DB_SHEET);
  if (!sheet) sheet = ss.insertSheet(HOLDING_TRADE_DB_SHEET);

  var headerRange = sheet.getRange(1, 1, 1, HOLDING_TRADE_DB_HEADERS.length);
  var current = headerRange.getValues()[0].map(function(v) { return String(v || '').trim(); });
  var needsHeader = false;
  for (var i = 0; i < HOLDING_TRADE_DB_HEADERS.length; i++) {
    if (current[i] !== HOLDING_TRADE_DB_HEADERS[i]) {
      needsHeader = true;
      break;
    }
  }
  if (needsHeader) {
    headerRange.setValues([HOLDING_TRADE_DB_HEADERS]);
    headerRange.setFontWeight('bold').setBackground('#11100a').setFontColor('#e8c050');
    sheet.setFrozenRows(1);
    [1, 2, 8, 10].forEach(function(c) { sheet.setColumnWidth(c, 115); });
    [3, 4, 5, 6, 7, 9].forEach(function(c) { sheet.setColumnWidth(c, 105); });
  }
  if (sheet.getMaxColumns() < HOLDING_TRADE_DB_HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HOLDING_TRADE_DB_HEADERS.length - sheet.getMaxColumns());
  }
  return sheet;
}

function writeHoldingTradeEntry(ss, body) {
  var sheet = ensureHoldingTradeDbSheet_(getExternalDbSpreadsheet_());
  var symbol = normalizeInvestmentSymbol_(body.symbol) || String(body.symbol || '').trim().toUpperCase();
  var tradeDate = String(body.tradeDate || '').trim().replace(/-/g, '/');
  var fx = parseFloat(body.fx) || 0;
  var shares = parseFloat(body.shares) || 0;
  var priceUsd = parseFloat(body.priceUsd) || 0;
  var feeUsd = parseFloat(body.feeUsd);
  if (isNaN(feeUsd)) feeUsd = 3;
  var fxIncluded = String(body.fxIncluded || '').trim() !== '0';
  var estimatedTwd = parseFloat(body.estimatedTwd) || 0;

  if (!symbol) throw new Error('ETF代號必填');
  if (!tradeDate) throw new Error('購買日期必填');
  if (fxIncluded && fx <= 0) throw new Error('匯率必須大於 0');
  if (shares === 0) throw new Error('購買(賣出)股數不可為 0');
  if (priceUsd <= 0) throw new Error('股價必須大於 0');
  if (estimatedTwd <= 0) {
    var base = Math.abs(priceUsd * shares) + feeUsd;
    estimatedTwd = Math.round(fxIncluded ? base * fx : base);
  }

  var nr = sheet.getLastRow() + 1;
  sheet.getRange(nr, 1, 1, HOLDING_TRADE_DB_HEADERS.length).setValues([[
    symbol,
    tradeDate,
    fx,
    shares,
    priceUsd,
    feeUsd,
    Math.round(estimatedTwd),
    '否',
    '',
    fxIncluded ? '是' : '否'
  ]]);
  sheet.getRange(nr, 2, 1, 1).setNumberFormat('yyyy/mm/dd');
  sheet.getRange(nr, 3, 1, 1).setNumberFormat('0.000');
  sheet.getRange(nr, 4, 1, 1).setNumberFormat('#,##0.##');
  sheet.getRange(nr, 5, 1, 2).setNumberFormat('0.0000');
  sheet.getRange(nr, 7, 1, 1).setNumberFormat('#,##0');
  sheet.getRange(nr, 9, 1, 1).setNumberFormat('#,##0');

  return {
    message: '待入帳持股記錄已寫入',
    rowId: nr,
    symbol: symbol,
    estimatedTwd: Math.round(estimatedTwd)
  };
}

function deleteHoldingTradeEntry(ss, body) {
  var rowId = parseInt(body.rowId, 10) || 0;
  markHoldingTradePaid_(ss, { rowId: rowId, actualAmount: 0 });
  return { message: '待入帳持股記錄已刪除', rowId: rowId };
}

function markHoldingTradePaid_(ss, options) {
  var sheet = ensureHoldingTradeDbSheet_(getExternalDbSpreadsheet_());
  options = options || {};
  var rowId = parseInt(options.rowId, 10) || 0;
  var actualAmount = parseFloat(options.actualAmount) || 0;
  if (!rowId || rowId < 2 || rowId > sheet.getLastRow()) {
    throw new Error('找不到待入帳持股記錄');
  }
  sheet.getRange(rowId, 8).setValue('是');
  sheet.getRange(rowId, 9).setValue(actualAmount).setNumberFormat('#,##0');
  return { rowId: rowId, actualAmount: actualAmount };
}

function getHoldingTradeRows_(ss, tz) {
  var sheet = ensureHoldingTradeDbSheet_(getExternalDbSpreadsheet_());
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, HOLDING_TRADE_DB_HEADERS.length).getValues();
  var rows = [];
  values.forEach(function(row, idx) {
    var symbol = normalizeInvestmentSymbol_(row[0]) || String(row[0] || '').trim();
    if (!symbol) return;
    var paid = String(row[7] || '').trim() === '是';
    rows.push({
      rowId: idx + 2,
      symbol: symbol,
      displaySymbol: getDividendDisplayLabel_(symbol) || symbol,
      tradeDate: formatSheetDate_(row[1], tz),
      fx: parseSheetNumber_(row[2]),
      shares: parseSheetNumber_(row[3]),
      priceUsd: parseSheetNumber_(row[4]),
      feeUsd: parseSheetNumber_(row[5]),
      estimatedTwd: parseSheetNumber_(row[6]),
      paid: paid,
      paidText: paid ? '是' : '否',
      actualTwd: parseSheetNumber_(row[8]),
      fxIncluded: String(row[9] || '').trim() !== '否'
    });
  });
  rows.sort(function(a, b) {
    return dateSortValue_(b.tradeDate) - dateSortValue_(a.tradeDate);
  });
  return rows;
}

function findLatestUnpaidDividendRow_(sheet, symbol) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var values = sheet.getRange(2, 1, lastRow - 1, DIVIDEND_DB_HEADERS.length).getValues();
  var matches = [];
  values.forEach(function(row, idx) {
    var rowSymbol = normalizeInvestmentSymbol_(row[0]);
    var legacyRow = String(row[7] || '').trim() === '是' || String(row[7] || '').trim() === '否';
    var paid = String(legacyRow ? row[7] : row[6] || '').trim() === '是';
    if (rowSymbol === symbol && !paid) {
      matches.push({ rowId: idx + 2, payDate: legacyRow ? row[3] : row[1], announceDate: legacyRow ? row[2] : row[1] });
    }
  });
  matches.sort(function(a, b) {
    return dateSortValue_(b.payDate || b.announceDate) - dateSortValue_(a.payDate || a.announceDate);
  });
  return matches.length ? matches[0].rowId : 0;
}

function formatSheetDate_(value, tz) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, tz || 'Asia/Taipei', 'yyyy/MM/dd');
  }
  return String(value || '').trim().replace(/-/g, '/');
}

function dateSortValue_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return value.getTime();
  }
  var s = String(value || '').trim().replace(/-/g, '/');
  if (!s) return 0;
  var parts = s.split('/');
  if (parts.length >= 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  }
  var t = new Date(s).getTime();
  return isNaN(t) ? 0 : t;
}

// ── 寫入配息試算 ──────────────────────────────────────────────
function writeDivCalc(ss, body) {
  // 取得或建立「配息試算」分頁
  var db = getExternalDbSpreadsheet_();
  var sheet = db.getSheetByName('配息試算');
  if (!sheet) {
    sheet = db.insertSheet('配息試算');
    // 建立標題列
    var headers = [
      '記錄時間', '股票名稱', '市場', '配息頻率',
      '股價', '購買股數', '每股配息', 'USD匯率',
      '所需本金(TWD)', '單次配息(TWD)', '月配息(TWD)', '年配息(TWD)', '年殖利率%'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange('A1:M1')
      .setFontWeight('bold')
      .setBackground('#2a1c08')
      .setFontColor('#e8c050');
    sheet.setFrozenRows(1);
    // 欄寬
    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 120);
    [3,4].forEach(function(c){ sheet.setColumnWidth(c, 70); });
    [5,6,7,8].forEach(function(c){ sheet.setColumnWidth(c, 90); });
    [9,10,11,12,13].forEach(function(c){ sheet.setColumnWidth(c, 110); });
    // 數字格式（後續寫入時套用）
  }

  var tz = db.getSpreadsheetTimeZone ? db.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var now = Utilities.formatDate(new Date(), tz || 'Asia/Taipei', 'yyyy/MM/dd HH:mm');

  var name      = String(body.name    || '').trim();
  var market    = String(body.market  || '台股').trim();
  var freq      = String(body.freq    || '月配').trim();
  var price     = parseFloat(body.price)           || 0;
  var shares    = parseFloat(body.shares)          || 0;
  var divAmt    = parseFloat(body.divAmt)          || 0;
  var fx        = parseFloat(body.fx)              || 1;
  var capital   = parseFloat(body.requiredCapital) || 0;
  var onceDiv   = parseFloat(body.onceDiv)         || 0;
  var monthly   = parseFloat(body.monthlyDiv)      || 0;
  var annual    = parseFloat(body.annualDiv)        || 0;
  var yieldPct  = parseFloat(body.annualYield)     || 0;

  if (!name)   throw new Error('股票名稱必填');
  if (shares <= 0) throw new Error('股數必須大於 0');
  if (price  <= 0) throw new Error('股價必須大於 0');
  if (divAmt <= 0) throw new Error('每股配息必須大於 0');

  var nr = sheet.getLastRow() + 1;
  var row = [now, name, market, freq, price, shares, divAmt, fx,
             capital, onceDiv, monthly, annual, yieldPct];
  sheet.getRange(nr, 1, 1, row.length).setValues([row]);

  // 格式：時間文字、數字千分位、百分比
  sheet.getRange(nr, 1).setNumberFormat('@');
  [5, 7, 8].forEach(function(c){
    sheet.getRange(nr, c).setNumberFormat('#,##0.00');
  });
  sheet.getRange(nr, 6).setNumberFormat('#,##0');
  [9, 10, 11, 12].forEach(function(c){
    sheet.getRange(nr, c).setNumberFormat('#,##0');
  });
  sheet.getRange(nr, 13).setNumberFormat('0.00"%"');

  SpreadsheetApp.flush();

  return {
    message: '配息試算已記錄',
    name: name,
    monthlyDiv: Math.round(monthly),
    row: nr
  };
}

// ── 帳戶餘額調整（供 API 使用）───────────────────────────────
function accountBalanceDelta_(accountName, delta) {
  return delta;
}

function isCreditCardAccount_(accountName) {
  return String(accountName || '').toLowerCase().indexOf('cube') >= 0;
}

function parseAccountBalance_(value) {
  if (typeof value === 'number') return value;
  var text = String(value || '').trim();
  var isParenNegative = /^\(.*\)$/.test(text);
  text = text
    .replace(/[,$\s]/g, '')
    .replace(/[−－]/g, '-')
    .replace(/[()]/g, '');
  var amount = parseFloat(text) || 0;
  return isParenNegative ? -Math.abs(amount) : amount;
}

function readAccountBalance_(cell, accountName) {
  if (isCreditCardAccount_(accountName) && cell.getDisplayValue) {
    var display = String(cell.getDisplayValue() || '').trim();
    if (display) return parseAccountBalance_(display);
  }
  return parseAccountBalance_(cell.getValue());
}

function adjustBalanceAPI(moon, accountName, delta) {
  if (!accountName) return null;
  var found = findMoonAccountBalanceCell_(moon, accountName);
  if (!found) throw new Error('找不到帳戶：' + accountName);
  var cur = readAccountBalance_(found.cell, found.name);
  if (found.cell.getFormula()) {
    SpreadsheetApp.flush();
    var formulaAfter = readAccountBalance_(found.cell, found.name);
    return {
      account: found.name,
      before: formulaAfter - delta,
      delta: delta,
      after: formulaAfter,
      changed: true,
      formula: true
    };
  }
  var next = cur + delta;
  found.cell.setValue(next).setFontColor(next < 0 ? '#D85A30' : '#0F6E56');
  return { account: found.name, before: cur, delta: delta, after: next, changed: true };
}

function findMoonAccountBalanceCell_(moon, accountName) {
  var holdingStart = getMoonHoldingStartRow_(moon);
  var accountEnd = Math.max(MOON_ACCOUNT_START_ROW, holdingStart - 1);
  for (var r = MOON_ACCOUNT_START_ROW; r <= accountEnd; r++) {
    var name = String(moon.getRange(r, MOON_ACCOUNT_NAME_COL).getValue() || '').trim();
    if (!name || isTotalLabel_(name)) continue;
    if (name === accountName.trim()) {
      return { row: r, name: name, cell: moon.getRange(r, MOON_ACCOUNT_BAL_COL) };
    }
  }
  return null;
}

function getAccountChangeSheet_(ss) {
  var sheet = ss.getSheetByName(ACCOUNT_CHANGE_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(ACCOUNT_CHANGE_SHEET_NAME);

  var width = ACCOUNT_CHANGE_HEADERS.length;
  var current = sheet.getRange(1, 1, 1, width).getValues()[0];
  var needsHeader = current.join('') === '';
  if (!needsHeader) {
    for (var i = 0; i < width; i++) {
      if (String(current[i] || '').trim() !== ACCOUNT_CHANGE_HEADERS[i]) {
        needsHeader = true;
        break;
      }
    }
  }
  if (needsHeader) {
    sheet.getRange(1, 1, 1, width).setValues([ACCOUNT_CHANGE_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function recordAccountChange_(ss, entry) {
  var primary = entry.primary || {};
  if (!primary.account) return;

  var secondary = entry.secondary || {};
  var sheet = getAccountChangeSheet_(ss);
  var nr = sheet.getLastRow() + 1;
  sheet.getRange(nr, 1, 1, ACCOUNT_CHANGE_HEADERS.length).setValues([[
    new Date(),
    entry.date || '',
    entry.ym || '',
    entry.type || '',
    primary.account || '',
    primary.before,
    primary.delta,
    primary.after,
    secondary.account || '',
    secondary.account ? secondary.before : '',
    secondary.account ? secondary.delta : '',
    secondary.account ? secondary.after : '',
    entry.label || '',
    entry.note || ''
  ]]);

  sheet.getRange(nr, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss');
  sheet.getRange(nr, 2, 1, 2).setNumberFormat('@');
  sheet.getRange(nr, 6, 1, 3).setNumberFormat('#,##0');
  sheet.getRange(nr, 10, 1, 3).setNumberFormat('#,##0');
}
