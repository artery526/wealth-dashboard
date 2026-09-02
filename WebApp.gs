// ============================================================
//  糧草大本營 — Web App API  (WebApp.gs)
//  部署為 Apps Script Web App 後供前端呼叫
//  ⚠️ 執行身分：「我」  存取權：「所有人」
// ============================================================

// ── ★ 記帳密鑰設定（請改成自己的密碼）★ ────────────────────
// 只有帶正確 token 的請求才能寫入資料
// 讀取報表不需要 token
var WRITE_TOKEN = 'a730526';
var COMMAND_SPREADSHEET_ID = '1MTPLhPA9j4kb2pllDDL1z7xaCD1UmIZutT0eVOHZd30';
var EXTERNAL_DB_SPREADSHEET_ID = '1BPnjwZKlBmxMkHmLDk6MSV28kfcAtQhGuZdufv5T7FY';
var LEGACY_FINANCE_SPREADSHEET_ID = '1xtqOgRRTR6y-KWLjLHk7TFT7EKZpNLU2HSYTr-HhWcc';
var LEGACY_FINANCE_LEDGER_SHEET = '交易流水_標準化';
var ETF_TAX_SPREADSHEET_ID = '1LQ2ZiWftOOXhv58t06E5qNEXRb20o-Zu8hXQ3zff-Hk';
var ZIWEI_SPREADSHEET_ID = '1Z8cW96qqk5J7LL0mGg12GxmdZc_5elwDe4rEcGq-P-M';
var MEDICAL_SPREADSHEET_ID = '1Z8cW96qqk5J7LL0mGg12GxmdZc_5elwDe4rEcGq-P-M';
var EMILY_CARD_SPREADSHEET_ID = '1GQBYT2jcNa9D6G39tntT5UfetXpgwfKYZ2h5fSy3bV8';
var ZIWEI_SHEET_NAME = '紫微星盤';
var ZIWEI_HEADERS = ['啟用', '名稱', '出生年月日', '出生時辰', '性別', '雲端硬碟檔案ID', '圖片連結', '備註', '更新時間'];
var EVENT_CHRONICLE_SHEET_NAME = '事件編年史';

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
var DAILY_ASSET_SNAPSHOT_HEADERS = ['日期', '投資市值', '總投資成本', '含息報酬', '月總配息', '備註', '市場曝險', '負債／淨資產比', '總資產'];
var DAILY_ASSET_SNAPSHOT_MARKET_CELL = 'I2';
var DAILY_ASSET_SNAPSHOT_TOTAL_ASSET_CELL = 'H2';
var DAILY_ASSET_SNAPSHOT_EXPOSURE_CELL = 'H2';
var DAILY_ASSET_SNAPSHOT_CASH_CELL = 'H5';
var DAILY_ADVISOR_REMINDER_SHEET = '每日軍師提醒';
var DAILY_ADVISOR_REMINDER_HEADERS = ['日期', '提醒內容', '字數', '產生方式', '建立時間'];
// Keep cpiMoM in its legacy column so existing rows do not shift.
var MACRO_DATA_HEADERS = ['日期', 'yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'vix', 'dxy', 'creditSpread', 'consumerSentiment', '資料來源', '更新時間', 'joltsOpenings', 'adpEmploymentChange', 'nfpPayrollChange', 'cpiMoM', 'yield2y', 'fedBalance', 'rrp', 'm2', 'liquidityScore', 'sofrIorbSpread', 'bankReserves', 'bankReservesChange', '台股融資資料日', '台股融資餘額', '台股融資餘額增減', '台股維持率', '台股維持率增減'];
var MACRO_JOLTS_OPENINGS_COL = MACRO_DATA_HEADERS.indexOf('joltsOpenings') + 1;
var MACRO_INTEGER_INDICATORS = ['joltsOpenings', 'adpEmploymentChange', 'nfpPayrollChange', 'liquidityScore', '台股融資餘額', '台股融資餘額增減'];
var MACRO_DECIMAL_INDICATORS = ['yield10y', 'yield2y', 'oil', 'cpi', 'cpiMoM', 'ppi', 'unemployment', 'vix', 'dxy', 'creditSpread', 'consumerSentiment', 'fedBalance', 'rrp', 'm2', 'sofrIorbSpread', 'bankReserves', 'bankReservesChange', '台股維持率', '台股維持率增減'];
var MARKET_DASHBOARD_SHEET = '市場儀表板';
var BATTLE_BRIEF_SHEET = '戰情總匯報';
var BATTLE_BRIEF_HEADERS = ['日期', '類別', '代號', '名稱', '今日值', '昨日值', '增減', '增減%', '資料時間', '資料來源', '備註', '建立時間'];
var BATTLE_BRIEF_FUND_SYMBOLS = ['路博邁台灣5G', '國泰高股息B', '施羅德收益成長A2'];
var MARKET_DASHBOARD_INSTRUMENTS = [
  { row: 2, code: 'NASDAQ:QQQ', symbol: 'QQQ', name: '納斯達克100 ETF', note: '核心科技風向；20MA向上且站上均線偏多' },
  { row: 3, code: 'NYSEARCA:SPY', symbol: 'SPY', name: '標普500 ETF', note: '大盤廣度參考；用來確認 QQQ 訊號' },
  { row: 4, code: 'NYSEARCA:GLD', symbol: 'GLD', name: '黃金指數代理 ETF', note: '黃金風向參考；GLD 追蹤黃金現貨價格，適合作為市場避險情緒觀察' },
  { row: 5, code: 'CURRENCY:BTCUSD', symbol: 'BTC-USD', name: '比特幣指數', note: 'BTC/USD 風險胃納參考；站上20MA且20MA向上偏多，跌破20MA偏防守' },
  { row: 6, code: 'NASDAQ:PLTR', symbol: 'PLTR', name: 'Palantir Technologies', note: '高波動成長股觀察；搭配 QQQ/SOXX 判斷科技風險胃納' },
  { row: 7, code: 'NASDAQ:SOXX', symbol: 'SOXX', name: '半導體 ETF', note: '半導體景氣風向；用來觀察 AI/晶片族群強弱' },
  { row: 11, code: '^TWII', symbol: '^TWII', name: '🇹🇼 台灣加權指數', note: 'Yahoo Finance 台股加權指數；融資餘額與維持率由 TWSE 補充' }
];
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

function getCommandSpreadsheet_() {
  return SpreadsheetApp.openById(COMMAND_SPREADSHEET_ID);
}

function getZiweiSpreadsheet_() {
  return SpreadsheetApp.openById(ZIWEI_SPREADSHEET_ID);
}

function getMedicalSpreadsheet_() {
  return SpreadsheetApp.openById(MEDICAL_SPREADSHEET_ID);
}

function getEmilyCardSpreadsheet_() {
  return SpreadsheetApp.openById(EMILY_CARD_SPREADSHEET_ID);
}

function getEtfTaxSpreadsheet_() {
  return SpreadsheetApp.openById(ETF_TAX_SPREADSHEET_ID);
}

// ── JSON 回應包裝 ─────────────────────────────────────────────
// Apps Script Web App 部署「存取權：所有人」時 CORS 由 Google 平台自動處理
// TextOutput 不支援 addHeader，不需要也不能手動設定

function jsonOutput_(payload, callback) {
  var text = JSON.stringify(payload);
  if (callback) {
    var safeCallback = String(callback || '').replace(/[^\w.$]/g, '');
    if (safeCallback) text = safeCallback + '(' + text + ');';
  }
  return ContentService
    .createTextOutput(text)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function ok(data, callback) {
  return jsonOutput_({ ok: true, data: data }, callback);
}

function err(msg, callback) {
  return jsonOutput_({ ok: false, error: msg }, callback);
}

// ── GET 路由（讀取 + 寫入全部走 GET，避免 CORS preflight 問題）──
// 讀取：?action=config / monthly / yearly / legacyMonthDetails / history / accounts / holdingsOverview / councilPantry / topStatusBar / tradeOptions / marketDashboard / macroOverview / battleBrief / transactions / accountChanges / dividendCenter
// 寫入：?action=expense|income|transfer&token=xxx&date=...（其餘參數同下）
function doGet(e) {
  try {
    var p      = e.parameter;
    var action = (p.action || '').trim();
    var ss     = SpreadsheetApp.getActiveSpreadsheet();

    // ── 讀取路由（不需要 token）──
    var readResult = handleReadAction_(ss, action, p);
    if (readResult) return readResult;
    if (isGetWriteAction_(action)) {
      verifyWriteToken(p);
      return handleAuthorizedAction_(ss, action, p, p.callback);
    }

    return err('未知的 action: ' + action, p.callback);
  } catch(ex) {
    return err(ex.message, e && e.parameter && e.parameter.callback);
  }
}

function handleReadAction_(ss, action, p) {
  var handler = READ_ACTION_HANDLERS_[action];
  return handler ? ok(handler(ss, p)) : null;
}

var READ_ACTION_HANDLERS_ = {
  config: function(ss) { return getConfig(ss); },
  foodhouseDashboard: function(ss, p) { return getFoodhouseDashboard(ss, p.ym); },
  monthly: function(ss, p) { return getMonthly(ss, p.ym); },
  yearly: function(ss, p) { return getYearly(ss, p.year); },
  legacyMonthDetails: function(ss, p) { return getLegacyMonthDetails(p.ym); },
  history: function(ss) { return getHistory(ss); },
  accounts: function(ss) { return getAccounts(ss); },
  holdingsOverview: function(ss) { return getHoldingsOverview(ss); },
  councilPantry: function(ss) { return getCouncilPantry(ss); },
  topStatusBar: function(ss) { return getTopStatusBar(ss); },
  financeStatus: function(ss) { return getFinanceStatus(ss); },
  tradeOptions: function(ss) { return getTradeOptions(ss); },
  marketDashboard: function() { return getMarketDashboard(getExternalDbSpreadsheet_()); },
  macroOverview: function() { return getMacroOverview(getExternalDbSpreadsheet_()); },
  battleBrief: function(ss) { return getBattleBrief(ss); },
  pledgeLoans: function() { return getPledgeLoans(getExternalDbSpreadsheet_()); },
  assetSnapshot: function() { return getDailyAssetSnapshot(getExternalDbSpreadsheet_()); },
  transactions: function(ss, p) { return getTransactions(ss, p.ym); },
  accountChanges: function(ss, p) { return getAccountChanges(ss, p.ym); },
  stockTrades: function(ss, p) { return getStockTrades(ss, p.ym); },
  dividendCenter: function(ss) { return getDividendCenter(ss); },
  databasePosition: function(ss) { return getDatabasePosition(ss); },
  etfTaxLookup: function(ss, p) { return getEtfTaxLookup(p); },
  bills: function(ss) { return getBills(ss); },
  todayCalendar: function(ss, p) { return getTodayCalendar(p); },
  todayTasks: function() { return getTodayTasks(); },
  ziweiCharts: function() { return getZiweiCharts(); },
  eventChronicle: function(ss) { return getEventChronicle(ss); },
  todayAdvisorReminder: function() { return getTodayAdvisorReminder(getExternalDbSpreadsheet_()); }
};

// ── POST 路由（保留相容，同樣支援 token 驗證）────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = (body.action || '').trim();

    // ★ 所有寫入請求均需通過 token 驗證
    verifyWriteToken(body);

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var result = handleAuthorizedAction_(ss, action, body);
    if (result) return result;

    return err('未知的 action: ' + action);
  } catch(ex) {
    return err(ex.message);
  }
}

function isGetWriteAction_(action) {
  return !!GET_WRITE_ACTIONS_[action];
}

function handleAuthorizedAction_(ss, action, p, callback) {
  var handler = AUTHORIZED_ACTION_HANDLERS_[action];
  return handler ? ok(handler(ss, p), callback) : null;
}

var GET_WRITE_ACTIONS_ = {
  expense: true,
  income: true,
  transfer: true,
  transactionUndo: true,
  stockTradeVoid: true,
  divCalc: true,
  dividendEntry: true,
  dividendDelete: true,
  holdingTradeEntry: true,
  holdingTradeDelete: true,
  emilyBodyRecords: true,
  emilyBodyLockStatus: true,
  emilyBodyLockSet: true,
  emilyBodyLockUnlock: true,
  emilyBodyRecordWrite: true,
  emilyBodyRecordDelete: true,
  emilyJournalPasswordSave: true,
  macroWebhook: true,
  marketDashboardRefresh: true,
  marketDashboardTriggerInstall: true,
  marketDashboardTriggerStatus: true,
  twseMarginSnapshotRecord: true,
  twseMarginSnapshotTriggerInstall: true,
  twseMarginSnapshotTriggerStatus: true,
  assetSnapshotTriggerStatus: true,
  assetSnapshotTriggerInstall: true,
  assetSnapshotRecord: true,
  verifyWriteToken: true
};

var AUTHORIZED_ACTION_HANDLERS_ = {
  verifyWriteToken: function() {
    return { message: 'WRITE_TOKEN 驗證成功' };
  },
  assetSnapshotTriggerStatus: function() {
    return getDailyAssetSnapshotTriggerStatus();
  },
  assetSnapshotTriggerInstall: function() {
    return {
      message: installDailyAssetSnapshotTrigger(),
      status: getDailyAssetSnapshotTriggerStatus()
    };
  },
  assetSnapshotRecord: function() {
    return recordDailyAssetSnapshot();
  },
  marketDashboardRefresh: function() {
    return refreshMarketDashboard();
  },
  marketDashboardTriggerInstall: function() {
    return installMarketDashboardCloseRefreshTrigger();
  },
  marketDashboardTriggerStatus: function() {
    return getMarketDashboardCloseRefreshTriggerStatus();
  },
  twseMarginSnapshotRecord: function() {
    return twseMarginDailySnapshot();
  },
  twseMarginSnapshotTriggerInstall: function() {
    return installTWSEMarginDailySnapshotTrigger();
  },
  twseMarginSnapshotTriggerStatus: function() {
    return getTWSEMarginDailySnapshotTriggerStatus();
  },
  expense: function(ss, p) {
    return writeExpense(ss, p);
  },
  income: function(ss, p) {
    return writeIncome(ss, p);
  },
  transfer: function(ss, p) {
    return writeTransfer(ss, p);
  },
  transactionUndo: function(ss, p) {
    return undoTransaction(ss, p);
  },
  stockTradeVoid: function(ss, p) {
    return voidStockTrade(ss, p);
  },
  advisorAiParse: function(ss, p) {
    return parseAdvisorAICommandWithDeepSeek_(p.raw);
  },
  advisorDividendMemo: function(ss, p) {
    return writeAdvisorDividendMemo(ss, p);
  },
  divCalc: function(ss, p) {
    return writeDivCalc(ss, p);
  },
  dividendEntry: function(ss, p) {
    return writeDividendEntry(ss, p);
  },
  dividendDelete: function(ss, p) {
    return deleteDividendEntry(ss, p);
  },
  holdingTradeEntry: function(ss, p) {
    return writeHoldingTradeEntry(ss, p);
  },
  holdingTradeDelete: function(ss, p) {
    return deleteHoldingTradeEntry(ss, p);
  },
  macroWebhook: function(ss, p) {
    return writeMacroWebhook(getExternalDbSpreadsheet_(), p);
  },
  medicalOptions: function() {
    return getMedicalOptions_();
  },
  medicalRecords: function() {
    return getMedicalRecords_();
  },
  medicalCardStats: function() {
    return getMedicalCardStats_();
  },
  medicalQuickRecord: function(ss, p) {
    return writeMedicalQuickRecord_(p);
  },
  medicalTarotRecord: function(ss, p) {
    return writeMedicalTarotRecord_(p);
  },
  emilyCardDecks: function(ss, p) {
    return getEmilyCardDecks_();
  },
  emilyCardRecord: function(ss, p) {
    return writeEmilyCardRecord_(p);
  },
  emilyBodyRecords: function(ss, p) {
    return getEmilyBodyRecords_(p);
  },
  emilyBodyLockStatus: function(ss, p) {
    return getEmilyBodyLockStatus_();
  },
  emilyBodyLockSet: function(ss, p) {
    return setEmilyBodyLockPassword_(p);
  },
  emilyBodyLockUnlock: function(ss, p) {
    return unlockEmilyBodyRecords_(p);
  },
  emilyBodyRecordWrite: function(ss, p) {
    return writeEmilyBodyRecord_(p);
  },
  emilyBodyRecordDelete: function(ss, p) {
    return deleteEmilyBodyRecord_(p);
  },
  emilyJournalPasswordSave: function(ss, p) {
    return saveEmilyJournalPassword_(p);
  }
};

// ── 取得設定（類別/來源/帳戶） ────────────────────────────────
function getConfig(ss) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'BOOKING_CONFIG_V2';
  var cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (ignore) {}
  }

  var setting = ss.getSheetByName('設定');
  var moon    = ss.getSheetByName('月度戰情室');
  if (!setting) throw new Error('找不到設定工作表');

  // 一次批次讀取 A2:C60，避免逐格呼叫 Sheets 造成快速記帳等待。
  var settingRows = setting.getRange(2, 1, 59, 3).getValues();

  // 支出主類別 (A欄, 從 row 2)
  var cats = settingRows.map(function(row) {
    return String(row[0] || '').trim();
  }).filter(function(value) { return value !== ''; });

  // 收入來源 (C欄, 從 row 2)
  var sources = settingRows.slice(0, 19).map(function(row) {
    return String(row[2] || '').trim();
  }).filter(function(value) { return value !== ''; });

  var config = {
    categories: cats,
    sources: sources,
    accounts: getMoonAccountNames_(moon),
    holdings: getTradeHoldingSymbols_(ss)
  };
  cache.put(cacheKey, JSON.stringify(config), 300);
  return config;
}

function getFoodhouseDashboard(ss, ym) {
  var now = new Date();
  var tz = ss.getSpreadsheetTimeZone ? ss.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var targetYm = String(ym || Utilities.formatDate(now, tz || 'Asia/Taipei', 'yyyy/MM')).trim();
  return {
    ym: targetYm,
    pantry: getCouncilPantry(ss),
    monthly: getMonthly(ss, targetYm),
    bills: getBills(ss),
    holdings: getHoldingsOverview(ss)
  };
}

function getDatabasePosition(ss) {
  var sheet = ss.getSheetByName('資料庫');
  if (!sheet) throw new Error('找不到資料庫');
  var lastRow = Math.max(1, sheet.getLastRow());
  return {
    sheetName: '資料庫',
    gid: 482251636,
    lastRow: lastRow,
    range: 'A' + lastRow
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

  var names = values.map(function(row) {
    return String(row[0] || '').trim();
  }).filter(function(name) {
    return name && !isTotalLabel_(name);
  });
  if (names.length) return names;

  return moon.getRange(MOON_ACCOUNT_START_ROW, MOON_ACCOUNT_NAME_COL, MOON_ACCOUNT_END_ROW - MOON_ACCOUNT_START_ROW + 1, 1).getValues().map(function(row) {
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

  var data = getMonthlyLedgerRows_(db, ym, lastRow);
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

function getMonthlyLedgerRows_(db, ym, lastRow) {
  if (lastRow < 2) return [];
  var monthText = String(ym || '').trim();
  if (!monthText) return [];

  var finder = db.getRange(2, 10, lastRow - 1, 1)
    .createTextFinder(monthText)
    .matchEntireCell(true);
  var matches = finder.findAll() || [];
  var rowNums = matches.map(function(cell) {
    return cell.getRow();
  }).sort(function(a, b) {
    return a - b;
  });
  if (!rowNums.length) return [];

  var rows = [];
  groupContiguousRows_(rowNums).forEach(function(group) {
    rows = rows.concat(db.getRange(group.start, 1, group.count, 10).getValues()); // A:J
  });
  return rows;
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
  var target = normalizeYear_(year);
  if (!target) return { error: 'year 必填' };
  var isCurrentYear = isCurrentFinanceYear_(target);

  var cache = CacheService.getScriptCache();
  var cacheKey = 'yearly:v3:' + target;
  if (!isCurrentYear) {
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  var db = ss.getSheetByName('資料庫');
  var detail = isCurrentYear ? getYearlyDetailFromDb_(ss, target) : getYearlyDetail_(ss, target);
  var months = isCurrentYear ? getYearlyMonthsFromDb_(db, target) : getYearlyMonthsFromArchive_(ss, target);
  if (!isCurrentYear) {
    var hasArchiveMonths = months.some(function(m) { return m.income || m.expense; });
    if (!hasArchiveMonths) months = getYearlyMonthsFromDb_(db, target);
  }

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

  var result = {
    year: target,
    months: months,
    detail: detail,
    total: {
      income: totIncome,
      expense: totExpense,
      net: totNet,
      savingRate: totIncome > 0 ? (totNet / totIncome * 100).toFixed(1) + '%' : '0%'
    }
  };
  if (!isCurrentYear) cache.put(cacheKey, JSON.stringify(result), 21600);
  return result;
}

function isCurrentFinanceYear_(year) {
  return String(year) === String(new Date().getFullYear());
}

function getLegacyMonthDetails(ym) {
  var targetYm = normalizeLegacyMonthKey_(ym);
  if (!targetYm) return { ym: '', rows: [], total: { income: 0, expense: 0, transfer: 0, investmentTrade: 0 } };

  var cache = CacheService.getScriptCache();
  var cacheKey = 'legacyMonthDetails:' + targetYm;
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var ss = SpreadsheetApp.openById(LEGACY_FINANCE_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(LEGACY_FINANCE_LEDGER_SHEET);
  if (!sheet) throw new Error('找不到舊資料標準化分頁：' + LEGACY_FINANCE_LEDGER_SHEET);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ym: targetYm, rows: [], total: { income: 0, expense: 0, transfer: 0, investmentTrade: 0 } };

  var finder = sheet.getRange(2, 3, lastRow - 1, 1)
    .createTextFinder(targetYm)
    .matchEntireCell(true);
  var matches = finder.findAll() || [];
  var rowNums = matches.map(function(cell) { return cell.getRow(); }).sort(function(a, b) { return a - b; });
  if (!rowNums.length) {
    var empty = { ym: targetYm, rows: [], total: { income: 0, expense: 0, transfer: 0, investmentTrade: 0 } };
    cache.put(cacheKey, JSON.stringify(empty), 900);
    return empty;
  }

  var ranges = groupContiguousRows_(rowNums);
  var rawRows = [];
  ranges.forEach(function(group) {
    rawRows = rawRows.concat(sheet.getRange(group.start, 1, group.count, 16).getDisplayValues());
  });

  var totals = { income: 0, expense: 0, transfer: 0, investmentTrade: 0 };
  var rows = rawRows.map(function(row) {
    var type = String(row[3] || '').trim();
    var amount = parseAmount_(row[5]);
    if (type === 'income') totals.income += amount;
    else if (type === 'expense') totals.expense += amount;
    else if (type === 'transfer') totals.transfer += amount;
    else if (type === 'investment_trade') totals.investmentTrade += amount;

    return {
      id: String(row[0] || '').trim(),
      date: normalizeLegacyDateText_(row[1]),
      ym: targetYm,
      type: type,
      direction: String(row[4] || '').trim(),
      amount: Math.round(amount),
      category: String(row[6] || '').trim(),
      subcategory: String(row[7] || '').trim(),
      account: String(row[8] || '').trim(),
      counterAccount: String(row[9] || '').trim(),
      note: String(row[10] || '').trim(),
      stock: String(row[11] || '').trim(),
      shares: String(row[12] || '').trim(),
      sourceSheet: String(row[13] || '').trim(),
      sourceRow: String(row[14] || '').trim()
    };
  }).sort(function(a, b) {
    var dateDiff = dateSortValue_(b.date) - dateSortValue_(a.date);
    if (dateDiff) return dateDiff;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  var result = {
    ym: targetYm,
    displayYm: targetYm.replace('-', '/'),
    rows: rows,
    total: {
      income: Math.round(totals.income),
      expense: Math.round(totals.expense),
      transfer: Math.round(totals.transfer),
      investmentTrade: Math.round(totals.investmentTrade)
    }
  };
  cache.put(cacheKey, JSON.stringify(result), 900);
  return result;
}

function groupContiguousRows_(rowNums) {
  var groups = [];
  rowNums.forEach(function(row) {
    var last = groups[groups.length - 1];
    if (last && last.start + last.count === row) {
      last.count += 1;
    } else {
      groups.push({ start: row, count: 1 });
    }
  });
  return groups;
}

function normalizeLegacyMonthKey_(ym) {
  var text = String(ym || '').trim().replace(/\//g, '-');
  var m = text.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return '';
  return m[1] + '-' + String(m[2]).padStart(2, '0');
}

function normalizeLegacyDateText_(value) {
  return String(value || '').trim().replace(/\//g, '-');
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
  var account = String((row || [])[8] || (row || [])[12] || '').trim();
  var stockSymbol = normalizeInvestmentSymbol_(account) || normalizeInvestmentSymbol_((row || [])[5]);
  return normalizeIncomeLedgerAccount_(account, stockSymbol);
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

// Google Sheets custom function for fund NAV cells such as 月度戰情室!J32:J33.
function ESUN_NAV_SAFE(url) {
  return FUND_NAV_SAFE(url);
}

function FUND_NAV_SAFE(url) {
  try {
    var value = fetchFundNav_(url);
    cacheFundNav_(url, value);
    return value;
  } catch (err) {
    var cached = getCachedFundNav_(url);
    if (cached !== '') return cached;
    return '讀取失敗：' + err.message;
  }
}

function fetchFundNav_(url) {
  if (/fundrich\.com\.tw/i.test(String(url))) {
    return fetchFundRichFundNav_(url);
  }

  return fetchEsunFundNav_(url);
}

function fetchFundRichFundNav_(url) {
  var fundId = parseFundRichFundId_(url);
  var endpoint = 'https://apis.fundrich.com.tw/FRSDataCenter/GetFundDetail';
  var payload = JSON.stringify({ data: { fundId: fundId } });
  var lastError = null;

  for (var i = 0; i < 3; i++) {
    try {
      var response = UrlFetchApp.fetch(endpoint, {
        method: 'post',
        muteHttpExceptions: true,
        followRedirects: true,
        contentType: 'application/json',
        payload: payload,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://www.fundrich.com.tw',
          'Referer': url
        }
      });
      var code = response.getResponseCode();
      if (code < 200 || code >= 300) {
        throw new Error('基富通基金資料讀取失敗：HTTP ' + code);
      }

      var value = parseFundRichFundNav_(response.getContentText(), url);
      if (isNaN(value)) throw new Error('基金淨值格式錯誤');
      return value;
    } catch (err) {
      lastError = err;
      Utilities.sleep(600 * (i + 1));
    }
  }

  throw lastError || new Error('找不到基金淨值：' + url);
}

function parseFundRichFundId_(url) {
  var text = String(url || '');
  var match = text.match(/fundContent\/([A-Za-z0-9_-]+)/i);
  if (match && match[1]) return match[1];

  match = text.match(/(?:\?|&)fundId=([A-Za-z0-9_-]+)/i);
  if (match && match[1]) return match[1];

  throw new Error('找不到基富通基金代號：' + url);
}

function parseFundRichFundNav_(text, url) {
  var json = JSON.parse(text || '{}');
  if (json.status !== 0) {
    throw new Error(json.msg || ('基富通基金資料回應異常：' + url));
  }

  var raw = json.data && json.data.newPrice;
  var value = parseFloat(String(raw || '').replace(/,/g, ''));
  if (!isNaN(value)) return value;

  throw new Error('找不到基金淨值：' + url);
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

function cacheFundNav_(url, value) {
  if (typeof value !== 'number' || isNaN(value)) return;
  CacheService.getScriptCache().put('FUND_NAV_CACHE_' + url, String(value), 21600);
}

function getCachedFundNav_(url) {
  var cache = CacheService.getScriptCache();
  var raw = cache.get('FUND_NAV_CACHE_' + url) || cache.get('ESUN_NAV_CACHE_' + url);
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

  return rows.map(function(row, index) {
    var symbol = String(row[0] || '').trim();
    if (!symbol || symbol === '總資產/總計') return null;
    var displayRow = displayRows[index] || [];
    var formationDate = String(displayRow[11] || '').trim();
    var elapsedDays = String(displayRow[12] || '').trim();
    var monthlyDivDisplay = String(displayRow[3] || '').trim();
    var yuanPerDay = monthlyDivDisplay || String(displayRow[13] || '').trim();

    return {
      symbol: symbol,
      name: symbol,
      cost: Math.round(parseFloat(row[1]) || 0),
      marketValue: Math.round(parseFloat(row[2]) || 0),
      monthlyDiv: Math.round(parseFloat(row[3]) || 0),
      monthlyDivDisplay: monthlyDivDisplay,
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

function ensureBattleBriefSheet_(ss) {
  var sheet = ss.getSheetByName(BATTLE_BRIEF_SHEET);
  if (!sheet) sheet = ss.insertSheet(BATTLE_BRIEF_SHEET);
  var headerRange = sheet.getRange(1, 1, 1, BATTLE_BRIEF_HEADERS.length);
  var current = headerRange.getValues()[0].map(function(value) { return String(value || '').trim(); });
  var needsHeader = BATTLE_BRIEF_HEADERS.some(function(header, index) { return current[index] !== header; });
  if (needsHeader) {
    headerRange.setValues([BATTLE_BRIEF_HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function battleBriefDateText_(date) {
  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  return Utilities.formatDate(date || new Date(), tz, 'yyyy/MM/dd');
}

function battleBriefNowText_() {
  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  return Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd HH:mm');
}

function battleBriefKey_(category, name) {
  return String(category || '').trim() + '|' + String(name || '').trim();
}

function readBattleBriefPreviousMap_(sheet, todayText) {
  var map = {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return map;
  var values = sheet.getRange(2, 1, lastRow - 1, BATTLE_BRIEF_HEADERS.length).getValues();
  values.forEach(function(row) {
    var dateText = battleBriefSheetDateText_(row[0]);
    if (!dateText || dateText >= todayText) return;
    var key = battleBriefKey_(row[1], row[3]);
    if (!key || (map[key] && map[key].dateText >= dateText)) return;
    map[key] = {
      dateText: dateText,
      value: parseSheetNumber_(row[4])
    };
  });
  return map;
}

function battleBriefSheetDateText_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return battleBriefDateText_(value);
  }
  var text = String(value || '').trim();
  var match = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (!match) return text;
  return match[1] + '/' + ('0' + match[2]).slice(-2) + '/' + ('0' + match[3]).slice(-2);
}

function battleBriefPreviousValue_(previousMap, category, name, fallback) {
  var item = previousMap[battleBriefKey_(category, name)];
  if (item && item.value !== '' && item.value != null && !isNaN(Number(item.value))) return Number(item.value);
  if (fallback === '' || fallback == null || isNaN(Number(fallback))) return '';
  return Number(fallback);
}

function battleBriefDelta_(current, previous) {
  if (current === '' || current == null || previous === '' || previous == null) return { change: '', changePct: '' };
  var cur = Number(current);
  var prev = Number(previous);
  if (isNaN(cur) || isNaN(prev) || prev === 0) return { change: '', changePct: '' };
  var change = cur - prev;
  return {
    change: Math.round(change * 10000) / 10000,
    changePct: Math.round((change / prev * 100) * 10000) / 10000
  };
}

function isBattleBriefFund_(symbol) {
  var normalized = normalizeInvestmentSymbol_(symbol) || String(symbol || '').trim();
  return BATTLE_BRIEF_FUND_SYMBOLS.indexOf(normalized) >= 0;
}

function battleBriefYahooSymbol_(symbol) {
  var normalized = normalizeInvestmentSymbol_(symbol) || String(symbol || '').trim();
  var key = String(normalized || '').toUpperCase();
  if (!key || isBattleBriefFund_(normalized)) return '';
  if (/^\d{4}[A-Z]?$/.test(key)) return key + '.TW';
  if (/^[A-Z]{1,6}$/.test(key)) return key;
  return '';
}

function fetchBattleBriefPreviousClose_(symbol) {
  var yahoo = battleBriefYahooSymbol_(symbol);
  if (!yahoo) return '';
  var candidates = [yahoo];
  if (/\.TW$/.test(yahoo)) candidates.push(yahoo.replace(/\.TW$/, '.TWO'));
  for (var i = 0; i < candidates.length; i++) {
    try {
      var closes = fetchYahooRecentCloses_(encodeURIComponent(candidates[i]), 2);
      if (closes.length >= 2) return closes[closes.length - 2];
    } catch (e) {
      Logger.log('battleBrief previous close failed: ' + candidates[i] + ' ' + e.message);
    }
  }
  return '';
}

function buildBattleBriefRows_(ss, previousMap) {
  var nowText = battleBriefNowText_();
  var holdings = getHoldingsOverview(ss);
  var fundRows = [];
  var stockRows = [];

  holdings.forEach(function(row) {
    var symbol = normalizeInvestmentSymbol_(row.symbol) || row.symbol;
    var name = symbol || row.name;
    var current = Number(row.price || 0);
    if (!name || !current) return;
    var category = isBattleBriefFund_(symbol) ? '基金淨值' : '持股股價';
    var yahooPrevious = category === '持股股價' ? fetchBattleBriefPreviousClose_(symbol) : '';
    var previous = battleBriefPreviousValue_(previousMap, category, name, yahooPrevious);
    var delta = battleBriefDelta_(current, previous);
    var item = {
      category: category,
      code: symbol,
      name: name,
      current: current,
      previous: previous,
      change: delta.change,
      changePct: delta.changePct,
      updatedAt: nowText,
      source: category === '持股股價' && yahooPrevious !== '' ? '月度戰情室 / Yahoo Finance' : '月度戰情室',
      note: row.shares ? ('持股 ' + row.shares) : ''
    };
    if (category === '基金淨值') fundRows.push(item);
    else stockRows.push(item);
  });

  BATTLE_BRIEF_FUND_SYMBOLS.forEach(function(symbol) {
    var exists = fundRows.some(function(row) { return row.name === symbol; });
    if (!exists) {
      fundRows.push({
        category: '基金淨值',
        code: symbol,
        name: symbol,
        current: '',
        previous: battleBriefPreviousValue_(previousMap, '基金淨值', symbol, ''),
        change: '',
        changePct: '',
        updatedAt: nowText,
        source: '月度戰情室',
        note: '未在持股列找到價格'
      });
    }
  });

  return {
    funds: fundRows,
    holdings: stockRows,
    rows: fundRows.concat(stockRows)
  };
}

function buildBattleBriefMarketRows_(marketDashboard, previousMap) {
  var rows = (marketDashboard && marketDashboard.rows) || [];
  var twse = rows.filter(function(row) { return row && (row.isTWSE || row.code === '^TWII'); })[0] || {};
  var updatedAt = twse.marginBalanceUpdatedAt || twse.updatedAt || battleBriefNowText_();
  var marketRows = [];

  function pushMetric(category, code, name, current, explicitChange, source, note) {
    var previousFallback = explicitChange == null || explicitChange === '' || isNaN(Number(explicitChange))
      ? ''
      : Number(current) - Number(explicitChange);
    var previous = battleBriefPreviousValue_(previousMap, category, name, previousFallback);
    var delta = battleBriefDelta_(current, previous);
    marketRows.push({
      category: category,
      code: code,
      name: name,
      current: current,
      previous: previous,
      change: delta.change,
      changePct: delta.changePct,
      updatedAt: updatedAt,
      source: source,
      note: note || ''
    });
  }

  if (twse.marginBalance) {
    pushMetric('台股融資', '^TWII', '台股融資餘額', twse.marginBalance, twse.marginBalanceChange, twse.marginBalanceSource || 'TWSE', twse.marginBalanceText || '');
  }
  if (twse.marginMaintenanceRatio) {
    pushMetric('台股維持率', '^TWII', '台股維持率', twse.marginMaintenanceRatio, twse.marginMaintenanceChange, twse.marginBalanceSource || 'TWSE', twse.marginMaintenanceText || '');
  }
  return marketRows;
}

function upsertBattleBriefSnapshot_(sheet, todayText, items) {
  if (!items.length) return;
  var lastRow = sheet.getLastRow();
  var rowByKey = {};
  if (lastRow >= 2) {
    var existing = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    existing.forEach(function(row, index) {
      var dateText = battleBriefSheetDateText_(row[0]);
      if (dateText !== todayText) return;
      rowByKey[battleBriefKey_(row[1], row[3])] = index + 2;
    });
  }

  var nowText = battleBriefNowText_();
  var appends = [];
  items.forEach(function(item) {
    var values = [[
      todayText,
      item.category,
      item.code,
      item.name,
      item.current === '' ? '' : Number(item.current),
      item.previous === '' ? '' : Number(item.previous),
      item.change === '' ? '' : Number(item.change),
      item.changePct === '' ? '' : Number(item.changePct),
      item.updatedAt || nowText,
      item.source || '',
      item.note || '',
      nowText
    ]];
    var rowIndex = rowByKey[battleBriefKey_(item.category, item.name)];
    if (rowIndex) sheet.getRange(rowIndex, 1, 1, BATTLE_BRIEF_HEADERS.length).setValues(values);
    else appends.push(values[0]);
  });
  if (appends.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, BATTLE_BRIEF_HEADERS.length).setValues(appends);
  }
  sheet.getRange(2, 5, Math.max(1, sheet.getMaxRows() - 1), 3).setNumberFormat('#,##0.####');
  sheet.getRange(2, 8, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('0.00');
}

function getBattleBrief(ss) {
  var sheet = ensureBattleBriefSheet_(ss);
  var todayText = battleBriefDateText_(new Date());
  var previousMap = readBattleBriefPreviousMap_(sheet, todayText);
  var marketDashboard = getMarketDashboard(getExternalDbSpreadsheet_());
  var grouped = buildBattleBriefRows_(ss, previousMap);
  var marketRows = buildBattleBriefMarketRows_(marketDashboard, previousMap);
  var allRows = grouped.rows.concat(marketRows);
  upsertBattleBriefSnapshot_(sheet, todayText, allRows);

  return {
    date: todayText,
    updatedAt: battleBriefNowText_(),
    funds: grouped.funds,
    holdings: grouped.holdings,
    market: marketRows,
    summary: {
      totalItems: allRows.length,
      upCount: allRows.filter(function(row) { return Number(row.change) > 0; }).length,
      downCount: allRows.filter(function(row) { return Number(row.change) < 0; }).length,
      flatCount: allRows.filter(function(row) { return row.change === 0; }).length,
      sheetName: BATTLE_BRIEF_SHEET,
      marketStance: marketDashboard && marketDashboard.summary ? marketDashboard.summary.stance : ''
    }
  };
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
  sheet.getRange(2, 7, Math.max(1, sheet.getMaxRows() - 1), 2).setNumberFormat('0.0%');
  sheet.getRange(2, 9, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('#,##0');
  sheet.setColumnWidth(1, 115);
  [2, 3, 4, 5].forEach(function(col) { sheet.setColumnWidth(col, 130); });
  sheet.setColumnWidth(6, 220);
  [7, 8, 9].forEach(function(col) { sheet.setColumnWidth(col, 130); });
  return sheet;
}

function parseDailyAssetSnapshotRatio_(value) {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value === 'number' && !isNaN(value)) return value;
  var text = String(value || '').trim();
  if (!text) return null;
  var n = parseSheetNumber_(text);
  if (!n) return n === 0 ? 0 : null;
  return text.indexOf('%') >= 0 ? n / 100 : n;
}

function dailyAssetSnapshotRow_(row, rowNumber, tz) {
  var investmentMarketValue = parseSheetNumber_(row[1]);
  var marketExposure = parseDailyAssetSnapshotRatio_(row[6]);
  var debtToNetAsset = parseDailyAssetSnapshotRatio_(row[7]);
  var totalAssetValue = parseSheetNumber_(row[8]);
  return {
    rowNumber: rowNumber,
    date: formatSheetDate_(row[0], tz),
    dateValue: dateSortValue_(row[0]) || rowNumber,
    investmentMarketValue: Math.round(investmentMarketValue),
    marketValue: Math.round(investmentMarketValue),
    totalCost: Math.round(parseSheetNumber_(row[2])),
    totalReturn: Math.round(parseSheetNumber_(row[3])),
    monthlyDiv: Math.round(parseSheetNumber_(row[4])),
    marketExposure: marketExposure,
    marketExposurePct: marketExposure === null ? null : marketExposure * 100,
    debtToNetAsset: debtToNetAsset,
    debtToNetAssetPct: debtToNetAsset === null ? null : debtToNetAsset * 100,
    totalAssetValue: totalAssetValue ? Math.round(totalAssetValue) : null,
    note: String(row[5] || '').trim()
  };
}

function dailyAssetSnapshotBorrowings_(debt) {
  debt = debt || {};
  var pledges = debt.pledges || [];
  var loans = debt.loans || [];
  var pledgeTotal = pledges.reduce(function(sum, item) {
    return sum + parseSheetNumber_(item && (item.remainingAmount || item.loanAmount));
  }, 0);
  var loanRemain = loans.reduce(function(sum, item) {
    var remain = parseSheetNumber_(item && item.remainingAmount);
    return sum + (remain || parseSheetNumber_(item && item.loanAmount));
  }, 0);
  return pledgeTotal + loanRemain;
}

function getDailyAssetSnapshotRisk_(commandSs, externalSs, marketValue) {
  var moon = commandSs.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var exposureAsset = parseSheetNumber_(moon.getRange(DAILY_ASSET_SNAPSHOT_EXPOSURE_CELL).getValue()) || marketValue;
  var cashValue = parseSheetNumber_(moon.getRange(DAILY_ASSET_SNAPSHOT_CASH_CELL).getValue());
  var debt = externalSs ? getPledgeLoans(externalSs) : { pledges: [], loans: [] };
  var borrowings = dailyAssetSnapshotBorrowings_(debt);
  var netAsset = marketValue + cashValue - borrowings;
  return {
    exposureAsset: Math.round(exposureAsset),
    cashValue: Math.round(cashValue),
    borrowings: Math.round(borrowings),
    netAsset: Math.round(netAsset),
    marketExposure: exposureAsset > 0 && netAsset > 0 ? exposureAsset / netAsset : null,
    debtToNetAsset: borrowings > 0 && netAsset > 0 ? borrowings / netAsset : null
  };
}

function getDailyAssetSnapshotSummary_(commandSs, externalSs) {
  var moon = commandSs.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var marketValue = parseSheetNumber_(moon.getRange(DAILY_ASSET_SNAPSHOT_MARKET_CELL).getValue());
  var totalAssetValue = parseSheetNumber_(moon.getRange(DAILY_ASSET_SNAPSHOT_TOTAL_ASSET_CELL).getValue());
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

  var risk = getDailyAssetSnapshotRisk_(commandSs, externalSs, marketValue);
  return {
    marketValue: Math.round(marketValue),
    totalAssetValue: Math.round(totalAssetValue),
    totalCost: Math.round(totalCost),
    totalReturn: Math.round(totalReturn),
    monthlyDiv: Math.round(monthlyDiv),
    marketExposure: risk.marketExposure,
    debtToNetAsset: risk.debtToNetAsset,
    exposureAsset: risk.exposureAsset,
    cashValue: risk.cashValue,
    borrowings: risk.borrowings,
    netAsset: risk.netAsset
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
  var commandSs = getCommandSpreadsheet_();
  var db = getExternalDbSpreadsheet_();
  var sheet = ensureDailyAssetSnapshotSheet_(db);
  var tz = db.getSpreadsheetTimeZone ? db.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var now = new Date();
  var dateText = Utilities.formatDate(now, tz || 'Asia/Taipei', 'yyyy/MM/dd');
  var summary = getDailyAssetSnapshotSummary_(commandSs, db);
  var targetRow = findDailyAssetSnapshotDateRow_(sheet, dateText, tz) || sheet.getLastRow() + 1;
  var note = '09:10：市值' + DAILY_ASSET_SNAPSHOT_MARKET_CELL + '，資產' + DAILY_ASSET_SNAPSHOT_TOTAL_ASSET_CELL + '，曝險' + DAILY_ASSET_SNAPSHOT_EXPOSURE_CELL + '，現金' + DAILY_ASSET_SNAPSHOT_CASH_CELL;

  sheet.getRange(targetRow, 1, 1, DAILY_ASSET_SNAPSHOT_HEADERS.length).setValues([[
    dateText,
    summary.marketValue,
    summary.totalCost,
    summary.totalReturn,
    summary.monthlyDiv,
    note,
    summary.marketExposure,
    summary.debtToNetAsset,
    summary.totalAssetValue
  ]]);
  sheet.getRange(targetRow, 1, 1, 1).setNumberFormat('yyyy/mm/dd');
  sheet.getRange(targetRow, 2, 1, 4).setNumberFormat('#,##0');
  sheet.getRange(targetRow, 7, 1, 2).setNumberFormat('0.0%');
  sheet.getRange(targetRow, 9, 1, 1).setNumberFormat('#,##0');
  SpreadsheetApp.flush();

  return {
    sheetName: DAILY_ASSET_SNAPSHOT_SHEET,
    row: targetRow,
    date: dateText,
    marketValue: summary.marketValue,
    totalAssetValue: summary.totalAssetValue,
    totalCost: summary.totalCost,
    totalReturn: summary.totalReturn,
    monthlyDiv: summary.monthlyDiv,
    marketExposure: summary.marketExposure,
    marketExposurePct: summary.marketExposure === null ? null : summary.marketExposure * 100,
    debtToNetAsset: summary.debtToNetAsset,
    debtToNetAssetPct: summary.debtToNetAsset === null ? null : summary.debtToNetAsset * 100,
    exposureAsset: summary.exposureAsset,
    cashValue: summary.cashValue,
    borrowings: summary.borrowings,
    netAsset: summary.netAsset
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
  var totalAssetChangeAmount = null;
  var totalAssetChangePct = null;
  if (latest && previous) {
    dailyChangeAmount = latest.investmentMarketValue - previous.investmentMarketValue;
    if (previous.investmentMarketValue) {
      dailyChangePct = dailyChangeAmount / previous.investmentMarketValue * 100;
    }
    if (latest.totalAssetValue !== null && previous.totalAssetValue !== null) {
      totalAssetChangeAmount = latest.totalAssetValue - previous.totalAssetValue;
      if (previous.totalAssetValue) {
        totalAssetChangePct = totalAssetChangeAmount / previous.totalAssetValue * 100;
      }
    }
  }

  return {
    sheetName: DAILY_ASSET_SNAPSHOT_SHEET,
    latest: latest,
    previous: previous,
    latestMarketValue: latest ? latest.investmentMarketValue : null,
    previousMarketValue: previous ? previous.investmentMarketValue : null,
    dailyChangeAmount: dailyChangeAmount,
    dailyChangePct: dailyChangePct,
    latestTotalAssetValue: latest ? latest.totalAssetValue : null,
    previousTotalAssetValue: previous ? previous.totalAssetValue : null,
    totalAssetChangeAmount: totalAssetChangeAmount,
    totalAssetChangePct: totalAssetChangePct
  };
}

function getEventChronicle(ss) {
  var sheet = ss.getSheetByName(EVENT_CHRONICLE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      sheetName: EVENT_CHRONICLE_SHEET_NAME,
      fields: ['name', 'date', 'days', 'months', 'dailyCost', 'mode', 'durationDays', 'note'],
      rows: []
    };
  }

  var width = 8;
  var range = sheet.getRange(1, 1, sheet.getLastRow(), width);
  var values = range.getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var idx = {
    name: headerCol_(headers, ['項目名稱', '項目', '名稱'], 0),
    date: headerCol_(headers, ['日期記錄', '日期紀錄', '日期', '記錄日期', '發生日期'], 1),
    days: headerCol_(headers, ['經歷多少日', '經歷日數', '日數'], 2),
    months: headerCol_(headers, ['經歷多少月', '經歷月數', '月數'], 3),
    dailyCost: headerCol_(headers, ['換算每日花費', '每日花費'], 5),
    mode: headerCol_(headers, ['事件模式', '模式', '事件類型', '類型'], 6),
    note: headerCol_(headers, ['備註', '說明'], 7)
  };

  var rows = [];
  values.slice(1).forEach(function(row, i) {
    var name = chronicleCell_(row, idx.name);
    if (!name) return;
    rows.push({
      rowNumber: i + 2,
      name: name,
      date: chronicleCell_(row, idx.date),
      days: chronicleCell_(row, idx.days),
      months: chronicleCell_(row, idx.months),
      dailyCost: chronicleCell_(row, idx.dailyCost),
      mode: chronicleCell_(row, idx.mode),
      durationDays: chronicleCell_(row, idx.days),
      note: chronicleCell_(row, idx.note)
    });
  });

  var result = {
    sheetName: EVENT_CHRONICLE_SHEET_NAME,
    fields: ['name', 'date', 'days', 'months', 'dailyCost', 'mode', 'durationDays', 'note'],
    rows: rows
  };
  return result;
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

function getTodayCalendar(options) {
  options = options || {};
  var tz = Session.getScriptTimeZone();
  var today = new Date();
  var mode = String(options.mode || options.range || '').trim().toLowerCase();
  if (mode !== 'tomorrow' && mode !== 'week') mode = 'today';
  var dayOffset = mode === 'today' ? 0 : 1;
  var dayCount = mode === 'week' ? 7 : 1;
  var start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
  var end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset + dayCount);
  var calendars = CalendarApp.getAllCalendars();
  var events = [];

  calendars.forEach(function(calendar) {
    calendar.getEvents(start, end).forEach(function(event) {
      var eventStart = event.getStartTime();
      var displayStart = eventStart.getTime() < start.getTime() ? start : eventStart;
      events.push({
        title: event.getTitle(),
        timeText: formatCalendarTime_(event, tz),
        location: event.getLocation() || '',
        description: plainCalendarDescription_(event.getDescription()),
        calendarName: calendar.getName(),
        dateKey: Utilities.formatDate(displayStart, tz, 'yyyy-MM-dd'),
        dateText: Utilities.formatDate(displayStart, tz, 'yyyy/MM/dd'),
        dateLabel: formatCalendarDateLabel_(displayStart, tz),
        startMs: Math.max(eventStart.getTime(), start.getTime())
      });
    });
  });

  events.sort(function(a, b) {
    return a.startMs - b.startMs || String(a.title).localeCompare(String(b.title));
  });

  return {
    mode: mode,
    date: Utilities.formatDate(start, tz, 'yyyy/MM/dd'),
    startDate: Utilities.formatDate(start, tz, 'yyyy/MM/dd'),
    endDate: Utilities.formatDate(new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1), tz, 'yyyy/MM/dd'),
    events: events.map(function(event) {
      return {
        title: event.title,
        timeText: event.timeText,
        location: event.location,
        description: event.description,
        calendarName: event.calendarName,
        dateKey: event.dateKey,
        dateText: event.dateText,
        dateLabel: event.dateLabel
      };
    })
  };
}

function formatCalendarDateLabel_(date, tz) {
  var weeks = ['日', '一', '二', '三', '四', '五', '六'];
  return Utilities.formatDate(date, tz, 'M/d') + '（' + weeks[Number(Utilities.formatDate(date, tz, 'u')) % 7] + '）';
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

function getTodayTasks() {
  if (typeof Tasks === 'undefined') {
    throw new Error('Google Tasks API 尚未啟用或尚未重新授權');
  }
  var taskLists = Tasks.Tasklists.list({ maxResults: 20 }).items || [];
  var tasks = [];

  taskLists.forEach(function(taskList) {
    var pageToken = null;
    do {
      var res = Tasks.Tasks.list(taskList.id, {
        maxResults: 50,
        pageToken: pageToken,
        showCompleted: false,
        showDeleted: false,
        showHidden: false
      });
      (res.items || []).forEach(function(task) {
        if (String(task.status || '') === 'completed') return;
        tasks.push({
          id: task.id,
          title: task.title || '未命名待辦',
          notes: String(task.notes || '').trim().slice(0, 140),
          due: task.due || '',
          taskListId: taskList.id,
          taskListName: taskList.title || 'Google Tasks',
          updated: task.updated || ''
        });
      });
      pageToken = res.nextPageToken || null;
    } while (pageToken && tasks.length < 100);
  });

  tasks.sort(function(a, b) {
    var ad = a.due || '9999-12-31T00:00:00.000Z';
    var bd = b.due || '9999-12-31T00:00:00.000Z';
    return ad.localeCompare(bd) ||
      String(a.taskListName).localeCompare(String(b.taskListName)) ||
      String(a.title).localeCompare(String(b.title));
  });

  return {
    tasks: tasks.slice(0, 50).map(function(task) {
      return {
        title: task.title,
        notes: task.notes,
        dueText: formatTaskDue_(task.due),
        taskListName: task.taskListName
      };
    })
  };
}

function formatTaskDue_(due) {
  if (!due) return '';
  var date = new Date(due);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM/dd');
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
  row.marginBalanceChange = info.balanceChange == null ? null : info.balanceChange;
  row.marginBalanceChangeText = info.balanceChangeText || '';
  row.marginMaintenanceChange = info.maintenanceChange == null ? null : info.maintenanceChange;
  row.marginMaintenanceChangeText = info.maintenanceChangeText || '';
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

function twseMarginDailySnapshot() {
  var marketResult = null;
  var marketError = '';
  try {
    marketResult = refreshMarketDashboard();
  } catch (ex) {
    marketError = ex && ex.message ? ex.message : String(ex);
  }

  var snapshot = recordDailyTWSEMarginSnapshot();
  snapshot.marketDashboard = marketResult;
  if (marketError) snapshot.marketDashboardError = marketError;
  return snapshot;
}

function recordDailyTWSEMarginSnapshot() {
  var ss = getExternalDbSpreadsheet_();
  var sheets = ensureMacroSheets_(ss);
  var sheet = sheets.data;
  var info = fetchTWSEMarginBalance_();
  if (!info || !info.value) throw new Error('TWSE 融資餘額讀取失敗');

  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  var now = new Date();
  var dateText = Utilities.formatDate(now, tz, 'yyyy/MM/dd');
  var timeText = Utilities.formatDate(now, tz, 'HH:mm');
  var previous = getPreviousTWSEMarginRecord_(sheet, dateText);
  var balanceChange = previous && previous.balance != null ? info.value - previous.balance : '';
  var maintenanceChange = previous && previous.maintenanceRatio != null && info.maintenanceRatio
    ? info.maintenanceRatio - previous.maintenanceRatio
    : '';
  var targetRow = upsertTWSEMarginRecord_(sheet, dateText, {
    updatedAt: timeText,
    dataDate: info.updatedAt || dateText,
    balance: info.value,
    balanceChange: balanceChange,
    maintenanceRatio: info.maintenanceRatio || '',
    maintenanceChange: maintenanceChange
  });
  formatMacroDataSheet_(sheet);
  SpreadsheetApp.flush();

  return buildTWSEMarginSnapshotResult_(info, {
    row: targetRow,
    snapshotDate: dateText,
    updatedAt: timeText,
    previous: previous,
    balanceChange: balanceChange,
    maintenanceChange: maintenanceChange
  });
}

function installTWSEMarginDailySnapshotTrigger() {
  var deleted = deleteTWSEMarginDailySnapshotTriggers_();
  ScriptApp.newTrigger('twseMarginDailySnapshot')
    .timeBased()
    .everyDays(1)
    .atHour(21)
    .nearMinute(10)
    .create();
  return {
    message: '已建立 twseMarginDailySnapshot 每日 21:10 左右觸發器',
    deleted: deleted,
    status: getTWSEMarginDailySnapshotTriggerStatus()
  };
}

function getTWSEMarginDailySnapshotTriggerStatus() {
  var triggers = ScriptApp.getProjectTriggers()
    .filter(function(trigger) {
      return trigger.getHandlerFunction() === 'twseMarginDailySnapshot';
    })
    .map(function(trigger) {
      return {
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType()),
        source: String(trigger.getTriggerSource()),
        uid: trigger.getUniqueId ? trigger.getUniqueId() : ''
      };
    });

  return {
    handler: 'twseMarginDailySnapshot',
    count: triggers.length,
    installed: triggers.length > 0,
    schedule: 'every day near 21:10 Asia/Taipei',
    note: 'Apps Script time triggers are approximate and may run within the platform scheduling window.',
    triggers: triggers
  };
}

function deleteTWSEMarginDailySnapshotTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'twseMarginDailySnapshot') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
}

function upsertTWSEMarginRecord_(sheet, dateText, data) {
  ensureSheetHeaders_(sheet, MACRO_DATA_HEADERS);
  var headers = sheet.getRange(1, 1, 1, MACRO_DATA_HEADERS.length).getDisplayValues()[0]
    .map(function(header) { return String(header || '').trim(); });
  var colByHeader = {};
  headers.forEach(function(header, index) {
    if (header) colByHeader[header] = index + 1;
  });
  var targetRow = sheet.getLastRow() + 1;
  if (sheet.getLastRow() >= 2) {
    var dates = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
    for (var i = 0; i < dates.length; i++) {
      if (String(dates[i][0] || '').trim() === dateText) {
        targetRow = i + 2;
        break;
      }
    }
  }
  if (targetRow > sheet.getLastRow()) sheet.getRange(targetRow, 1).setValue(dateText).setNumberFormat('@');
  var writes = {
    '日期': dateText,
    '更新時間': data.updatedAt,
    '台股融資資料日': data.dataDate,
    '台股融資餘額': data.balance,
    '台股融資餘額增減': data.balanceChange,
    '台股維持率': data.maintenanceRatio,
    '台股維持率增減': data.maintenanceChange
  };
  Object.keys(writes).forEach(function(header) {
    var col = colByHeader[header];
    if (col) sheet.getRange(targetRow, col).setValue(writes[header]);
  });
  return targetRow;
}

function getLatestTWSEMarginSnapshot_(ss) {
  var sheet = ss && ss.getSheetByName('總經資料庫');
  if (!sheet || sheet.getLastRow() < 2) return null;
  ensureSheetHeaders_(sheet, MACRO_DATA_HEADERS);
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), MACRO_DATA_HEADERS.length)).getDisplayValues()[0]
    .map(function(header) { return String(header || '').trim(); });
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
  var records = twseMarginRecordsFromRows_(headers, values);
  if (!records.length) return null;
  records.sort(function(a, b) {
    return String(b.date || '').localeCompare(String(a.date || '')) ||
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
  var latest = records[0];
  return buildTWSEMarginSnapshotResult_({
    display: formatMarketNumber_(latest.balance / 100000000, 2) + ' 億',
    value: latest.balance,
    updatedAt: latest.dataDate || latest.date,
    source: '總經資料庫',
    maintenanceRatio: latest.maintenanceRatio || 0,
    maintenanceText: latest.maintenanceRatio ? latest.maintenanceRatio.toFixed(2) + '%' : ''
  }, {
    row: latest.row,
    snapshotDate: latest.date,
    updatedAt: latest.updatedAt,
    balanceChange: latest.balanceChange,
    maintenanceChange: latest.maintenanceChange
  });
}

function getPreviousTWSEMarginRecord_(sheet, dateText) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), MACRO_DATA_HEADERS.length)).getDisplayValues()[0]
    .map(function(header) { return String(header || '').trim(); });
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
  var records = twseMarginRecordsFromRows_(headers, values).filter(function(record) {
    return String(record.date || '') < String(dateText || '');
  });
  if (!records.length) return null;
  records.sort(function(a, b) {
    return String(b.date || '').localeCompare(String(a.date || '')) ||
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
  return records[0];
}

function getTWSEMarginRecordForDate_(sheet, dateText) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), MACRO_DATA_HEADERS.length)).getDisplayValues()[0]
    .map(function(header) { return String(header || '').trim(); });
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
  var records = twseMarginRecordsFromRows_(headers, values).filter(function(record) {
    return String(record.date || '') === String(dateText || '');
  });
  if (!records.length) return null;
  records.sort(function(a, b) {
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
  return records[0];
}

function twseMarginRecordsFromRows_(headers, rows) {
  var indexByHeader = {};
  headers.forEach(function(header, index) {
    if (header) indexByHeader[header] = index;
  });
  return (rows || []).map(function(row, index) {
    var balance = parseSheetNumber_(row[indexByHeader['台股融資餘額']]);
    if (!balance) return null;
    var maintenance = parseSheetNumber_(row[indexByHeader['台股維持率']]);
    var balanceChangeRaw = String(row[indexByHeader['台股融資餘額增減']] || '').trim();
    var maintenanceChangeRaw = String(row[indexByHeader['台股維持率增減']] || '').trim();
    return {
      row: index + 2,
      date: String(row[indexByHeader['日期']] || '').trim(),
      updatedAt: String(row[indexByHeader['更新時間']] || '').trim(),
      dataDate: String(row[indexByHeader['台股融資資料日']] || '').trim(),
      balance: balance,
      balanceChange: balanceChangeRaw ? parseSheetNumber_(balanceChangeRaw) : null,
      maintenanceRatio: maintenance || 0,
      maintenanceChange: maintenanceChangeRaw ? parseSheetNumber_(maintenanceChangeRaw) : null
    };
  }).filter(function(record) {
    return record && record.date;
  });
}

function buildTWSEMarginSnapshotResult_(info, meta) {
  meta = meta || {};
  var balanceChange = meta.balanceChange === '' || meta.balanceChange == null ? null : Number(meta.balanceChange);
  var maintenanceChange = meta.maintenanceChange === '' || meta.maintenanceChange == null ? null : Number(meta.maintenanceChange);
  return {
    row: meta.row || '',
    snapshotDate: meta.snapshotDate || '',
    display: info.display,
    value: info.value,
    updatedAt: info.updatedAt,
    source: info.source || '',
    maintenanceRatio: info.maintenanceRatio || 0,
    maintenanceText: info.maintenanceText || '',
    balanceChange: balanceChange,
    balanceChangeText: balanceChange == null ? '' : formatSignedMarketAmount_(balanceChange),
    maintenanceChange: maintenanceChange,
    maintenanceChangeText: maintenanceChange == null ? '' : formatSignedMarketPct_(maintenanceChange),
    previousDate: meta.previous ? meta.previous.date : ''
  };
}

function formatSignedMarketAmount_(value) {
  var n = Number(value || 0);
  var sign = n > 0 ? '+' : (n < 0 ? '-' : '');
  return sign + formatMarketNumber_(Math.abs(n) / 100000000, 2) + ' 億';
}

function formatSignedMarketPct_(value) {
  var n = Number(value || 0);
  var sign = n > 0 ? '+' : (n < 0 ? '-' : '');
  return sign + Math.abs(n).toFixed(2) + 'pt';
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

function marketAverage_(values) {
  if (!values.length) return 0;
  return values.reduce(function(sum, value) { return sum + value; }, 0) / values.length;
}

function roundMarketValue_(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function marketUpdatedDate_(value) {
  var match = String(value || '').match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
}

function refreshMarketDashboard() {
  var ss = getExternalDbSpreadsheet_();
  var sheet = ss.getSheetByName(MARKET_DASHBOARD_SHEET);
  if (!sheet) throw new Error('找不到「' + MARKET_DASHBOARD_SHEET + '」分頁');

  var requests = MARKET_DASHBOARD_INSTRUMENTS.map(function(item) {
    return {
      url: 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(item.symbol) + '?interval=1d&range=3mo',
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
  });
  var responses = UrlFetchApp.fetchAll(requests);
  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  var updated = [];
  var errors = [];

  responses.forEach(function(response, index) {
    var item = MARKET_DASHBOARD_INSTRUMENTS[index];
    try {
      if (response.getResponseCode() !== 200) throw new Error('HTTP ' + response.getResponseCode());
      var json = JSON.parse(response.getContentText());
      var result = json.chart && json.chart.result && json.chart.result[0];
      if (!result) throw new Error('Yahoo Finance 回應無資料');

      var timestamps = result.timestamp || [];
      var quote = (((result.indicators || {}).quote || [])[0] || {});
      var closes = quote.close || [];
      var points = [];
      closes.forEach(function(value, pointIndex) {
        if (value == null || isNaN(value)) return;
        points.push({ value: Number(value), timestamp: timestamps[pointIndex] || 0 });
      });
      if (points.length < 21) throw new Error('有效交易資料不足 21 筆');

      var price = points[points.length - 1].value;
      var previous = points[points.length - 2].value;
      var ma20 = marketAverage_(points.slice(-20).map(function(point) { return point.value; }));
      var ma20Prev = marketAverage_(points.slice(-21, -1).map(function(point) { return point.value; }));
      var maDirection = ma20 >= ma20Prev ? '20MA向上' : '20MA向下';
      var status = price >= ma20 ? '站上20MA' : '跌破20MA';
      var signal = price < ma20 ? '防守' : (ma20 >= ma20Prev ? '進攻' : '觀望');
      var meta = result.meta || {};
      var marketTime = Number(meta.regularMarketTime || points[points.length - 1].timestamp || 0);
      var updatedAt = marketTime
        ? Utilities.formatDate(new Date(marketTime * 1000), tz, 'yyyy/MM/dd HH:mm')
        : Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd HH:mm');

      sheet.getRange(item.row, 1, 1, 11).setValues([[
        item.code,
        item.name,
        roundMarketValue_(price),
        roundMarketValue_(previous),
        roundMarketValue_(ma20),
        roundMarketValue_(ma20Prev),
        maDirection,
        status,
        signal,
        updatedAt,
        item.note
      ]]);
      updated.push({ code: item.code, price: roundMarketValue_(price), updatedAt: updatedAt });
    } catch (error) {
      errors.push({ code: item.code, error: error && error.message ? error.message : String(error) });
    }
  });

  SpreadsheetApp.flush();
  if (!updated.length) throw new Error('市場儀表板更新失敗：' + JSON.stringify(errors));
  return { updated: updated, errors: errors, refreshedAt: Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd HH:mm') };
}

function getMarketDashboard(ss) {
  var sheet = ss.getSheetByName(MARKET_DASHBOARD_SHEET);
  var marginInfo = getLatestTWSEMarginSnapshot_(ss);
  if (!marginInfo && sheet) marginInfo = getMarketMarginBalance_(sheet);
  if (!marginInfo) marginInfo = fetchTWSEMarginBalance_();
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      rows: [],
      summary: {
        stance: '無資料',
        updatedAt: '',
        counts: {}
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
      marginBalance: code === '^TWII' && marginInfo ? marginInfo.value : parseSheetNumber_(row[11]),
      marginBalanceText: code === '^TWII' && marginInfo ? marginInfo.display : String(row[11] || '').trim(),
      marginBalanceUpdatedAt: code === '^TWII' && marginInfo ? marginInfo.updatedAt : '',
      marginBalanceSource: code === '^TWII' && marginInfo ? (marginInfo.source || '') : '',
      marginMaintenanceRatio: code === '^TWII' && marginInfo ? (marginInfo.maintenanceRatio || 0) : 0,
      marginMaintenanceText: code === '^TWII' && marginInfo ? (marginInfo.maintenanceText || '') : '',
      marginBalanceChange: code === '^TWII' && marginInfo && marginInfo.balanceChange != null ? marginInfo.balanceChange : null,
      marginBalanceChangeText: code === '^TWII' && marginInfo ? (marginInfo.balanceChangeText || '') : '',
      marginMaintenanceChange: code === '^TWII' && marginInfo && marginInfo.maintenanceChange != null ? marginInfo.maintenanceChange : null,
      marginMaintenanceChangeText: code === '^TWII' && marginInfo ? (marginInfo.maintenanceChangeText || '') : '',
      maGapPct:    maGapPct,
      isTWSE:      code === '^TWII'
    });
  });

  var stance = '觀望';
  if      ((signalCounts['警戒'] || 0) > 0)                                                stance = '警戒';
  else if ((signalCounts['防守'] || 0) > 0)                                                stance = '防守';
  else if ((signalCounts['進攻'] || 0) + (signalCounts['強力進攻'] || 0) >= Math.max(2, Math.ceil(rows.length / 2))) stance = '進攻';
  else if ((signalCounts['正常'] || 0) > 0)                                                stance = '正常';

  var updatedDate = marketUpdatedDate_(updatedAt);
  var staleHours = updatedDate ? Math.max(0, (new Date().getTime() - updatedDate.getTime()) / 3600000) : null;
  return {
    rows: rows,
    summary: {
      stance: stance,
      updatedAt: updatedAt,
      isStale: staleHours == null || staleHours > 96,
      staleHours: staleHours == null ? null : Math.round(staleHours),
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
    if (code === 'cpiMoM') return null;
    var enabledText = String(obj['啟用'] || 'TRUE').trim().toUpperCase();
    return normalizeMacroSetting_({
      code: code,
      name: String(obj['指標名稱'] || code).trim(),
      enabled: enabledText !== 'FALSE' && enabledText !== '否' && enabledText !== '0',
      yellow: String(obj['黃燈條件'] || '').trim(),
      red: String(obj['紅燈條件'] || '').trim(),
      note: String(obj['備註'] || '').trim()
    });
  }).filter(function(row) {
    return row && row.enabled;
  });

  return rows.length ? rows : defaults;
}

function normalizeMacroSetting_(setting) {
  if (!setting) return setting;
  if (setting.code === 'creditSpread') {
    setting.name = '美國高收益債利差 HY OAS';
    setting.yellow = '4～5';
    setting.red = '>=5';
    setting.note = 'FRED BAMLH0A0HYM2；垃圾債相對美債補償，<3過度舒服、3～4穩定、4～5壓力升高、>5轉弱、>=7高度風險';
  }
  return setting;
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
    cpiMoM: macroNumber_(body.cpiMoM),
    ppi: macroNumber_(body.ppi),
    unemployment: macroNumber_(body.unemployment),
    joltsOpenings: macroNumber_(body.joltsOpenings),
    adpEmploymentChange: macroNumber_(body.adpEmploymentChange),
    nfpPayrollChange: macroNumber_(body.nfpPayrollChange),
    vix: macroNumber_(body.vix),
    dxy: macroNumber_(body.dxy),
    yield2y: macroNumber_(body.yield2y),
    fedBalance: macroNumber_(body.fedBalance),
    rrp: macroNumber_(body.rrp),
    m2: macroNumber_(body.m2),
    liquidityScore: macroNumber_(body.liquidityScore),
    sofrIorbSpread: macroNumber_(body.sofrIorbSpread),
    bankReserves: macroNumber_(body.bankReserves),
    bankReservesChange: macroNumber_(body.bankReservesChange),
    creditSpread: macroNumber_(body.creditSpread),
    consumerSentiment: macroNumber_(body.consumerSentiment),
    source: String(body.source || 'macroWebhook').trim(),
    updatedAt: String(body.updatedAt || timeText).trim()
  };

  var required = ['yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'joltsOpenings', 'adpEmploymentChange', 'nfpPayrollChange', 'vix', 'dxy', 'creditSpread', 'consumerSentiment'];
  var missing = required.filter(function(key) {
    return macroData[key] == null || isNaN(macroData[key]);
  });
  if (missing.length) throw new Error('總經 webhook 缺少數值：' + missing.join(', '));

  var judgment = normalizeMacroJudgment_(body, macroData);
  if (!judgment.scenario || !judgment.signal || !judgment.summary) {
    judgment = askDeepSeekMacro_(macroData);
  }

  var existingTwse = getTWSEMarginRecordForDate_(sheets.data, dateText);
  if (existingTwse) {
    macroData.twseMarginDataDate = existingTwse.dataDate;
    macroData.twseMarginBalance = existingTwse.balance;
    macroData.twseMarginBalanceChange = existingTwse.balanceChange;
    macroData.twseMarginMaintenanceRatio = existingTwse.maintenanceRatio;
    macroData.twseMarginMaintenanceChange = existingTwse.maintenanceChange;
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
  var marketResult = null;
  var marketError = '';
  try {
    marketResult = refreshMarketDashboard();
  } catch (marketEx) {
    marketError = marketEx && marketEx.message ? marketEx.message : String(marketEx);
  }
  var payload = fetchDailyMacroPayload_(ss);
  var result = writeMacroWebhook(ss, payload);
  result.marketDashboard = marketResult;
  if (marketError) result.marketDashboardError = marketError;

  try {
    result.assetSnapshot = recordDailyAssetSnapshot();
  } catch (ex) {
    result.assetSnapshotError = ex && ex.message ? ex.message : String(ex);
  }

  return result;
}

function fetchDailyMacroPayload_(ss) {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var dateText = Utilities.formatDate(now, tz, 'yyyy/MM/dd');
  var timeText = Utilities.formatDate(now, tz, 'HH:mm');
  var cpi = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('CPIAUCSL', 18); });
  var cpiYoY = safeMacroFetch_(function() {
    var latestCpi = latestSeriesPoint_(cpi);
    var cpi12 = cpi.length >= 13 ? cpi[cpi.length - 13] : null;
    return latestCpi && cpi12 && cpi12.value ? (latestCpi.value / cpi12.value - 1) * 100 : null;
  });
  var cpiMoM = safeMacroFetch_(function() {
    var latestCpi = latestSeriesPoint_(cpi);
    var previousCpi = cpi.length >= 2 ? cpi[cpi.length - 2] : null;
    return latestCpi && previousCpi && previousCpi.value ? (latestCpi.value / previousCpi.value - 1) * 100 : null;
  });
  var ppiYoY = safeMacroFetch_(function() {
    var ppi = fetchFredSeriesValues_('PPIFID', 18);
    var latestPpi = latestSeriesPoint_(ppi);
    var ppi12 = ppi.length >= 13 ? ppi[ppi.length - 13] : null;
    return latestPpi && ppi12 && ppi12.value ? (latestPpi.value / ppi12.value - 1) * 100 : null;
  });
  var dxySeries = safeMacroFetchSeries_(function() { return fetchYahooRecentCloses_('DX-Y.NYB', 2); });
  var yield2ySeries = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('DGS2', 6); });
  var fedBalanceSeries = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('WALCL', 6); });
  var rrpSeries = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('RRPONTSYD', 6); });
  var m2Series = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('M2SL', 6); });
  var sofrSeries = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('SOFR', 10); });
  var iorbSeries = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('IORB', 10); });
  var bankReservesSeries = safeMacroFetchSeries_(function() { return fetchFredSeriesValues_('WRESBAL', 12); });
  var liquidityScore = macroLiquidityScore_([
    macroSeriesMoves_(dxySeries, 'down'),
    macroSeriesMoves_(yield2ySeries, 'down'),
    macroSeriesMoves_(rrpSeries, 'down'),
    macroSeriesMoves_(fedBalanceSeries, 'up'),
    macroSeriesMoves_(m2Series, 'up')
  ]);

  var payload = {
    date: dateText,
    yield10y: safeMacroFetch_(function() { return normalizeYield10y_(fetchYahooLastPrice_('%5ETNX')); }),
    oil: safeMacroFetch_(function() { return fetchYahooLastPrice_('CL%3DF'); }),
    cpi: cpiYoY,
    cpiMoM: cpiMoM,
    ppi: ppiYoY,
    unemployment: safeMacroFetch_(function() { return latestSeriesValue_(fetchFredSeriesValues_('UNRATE', 6)); }),
    joltsOpenings: safeMacroFetch_(function() { return latestSeriesValue_(fetchFredSeriesValues_('JTSJOL', 6)); }),
    adpEmploymentChange: safeMacroFetch_(function() { return latestSeriesChange_(fetchFredSeriesValues_('ADPMNUSNERSA', 6), 1000); }),
    nfpPayrollChange: safeMacroFetch_(function() { return latestSeriesChange_(fetchFredSeriesValues_('PAYEMS', 6), 1); }),
    vix: safeMacroFetch_(function() { return fetchYahooLastPrice_('%5EVIX'); }),
    dxy: latestMacroSeriesValue_(dxySeries),
    yield2y: latestSeriesValue_(yield2ySeries),
    fedBalance: latestSeriesValue_(fedBalanceSeries),
    rrp: latestSeriesValue_(rrpSeries),
    m2: latestSeriesValue_(m2Series),
    liquidityScore: liquidityScore,
    sofrIorbSpread: macroLatestSpread_(sofrSeries, iorbSeries),
    bankReserves: latestSeriesValue_(bankReservesSeries),
    bankReservesChange: latestSeriesChange_(bankReservesSeries, 1),
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
    cpiMoM: 0.4,
    ppi: 6.0,
    unemployment: 4.1,
    joltsOpenings: 6866,
    adpEmploymentChange: 122,
    nfpPayrollChange: 115,
    vix: 19.8,
    dxy: 105.2,
    yield2y: 4.25,
    fedBalance: 6600000,
    rrp: 75,
    m2: 22000,
    liquidityScore: 3,
    sofrIorbSpread: -0.03,
    bankReserves: 3098911,
    bankReservesChange: 132014,
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
  if (!sheet) return;
  MACRO_DECIMAL_INDICATORS.forEach(function(code) {
    var col = MACRO_DATA_HEADERS.indexOf(code) + 1;
    if (col > 0) {
      sheet.getRange(2, col, Math.max(1, sheet.getMaxRows() - 1), 1)
        .setNumberFormat('0.00');
    }
  });
  MACRO_INTEGER_INDICATORS.forEach(function(code) {
    var col = MACRO_DATA_HEADERS.indexOf(code) + 1;
    if (col > 0) {
      sheet.getRange(2, col, Math.max(1, sheet.getMaxRows() - 1), 1)
        .setNumberFormat('#,##0');
    }
  });
}

function macroDataRowValues_(macroData) {
  var valuesByHeader = {
    '日期': macroData.date,
    yield10y: macroData.yield10y,
    oil: macroData.oil,
    cpi: macroData.cpi,
    cpiMoM: macroData.cpiMoM,
    ppi: macroData.ppi,
    unemployment: macroData.unemployment,
    vix: macroData.vix,
    dxy: macroData.dxy,
    creditSpread: macroData.creditSpread,
    consumerSentiment: macroData.consumerSentiment,
    '資料來源': macroData.source,
    '更新時間': macroData.updatedAt,
    joltsOpenings: macroData.joltsOpenings,
    adpEmploymentChange: macroData.adpEmploymentChange,
    nfpPayrollChange: macroData.nfpPayrollChange,
    yield2y: macroData.yield2y,
    fedBalance: macroData.fedBalance,
    rrp: macroData.rrp,
    m2: macroData.m2,
    liquidityScore: macroData.liquidityScore,
    sofrIorbSpread: macroData.sofrIorbSpread,
    bankReserves: macroData.bankReserves,
    bankReservesChange: macroData.bankReservesChange,
    '台股融資資料日': macroData.twseMarginDataDate,
    '台股融資餘額': macroData.twseMarginBalance,
    '台股融資餘額增減': macroData.twseMarginBalanceChange,
    '台股維持率': macroData.twseMarginMaintenanceRatio,
    '台股維持率增減': macroData.twseMarginMaintenanceChange
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
    cpiMoM: macroNumber_(row['cpiMoM']),
    ppi: macroNumber_(row['ppi']),
    unemployment: macroNumber_(row['unemployment']),
    joltsOpenings: macroNumber_(row['joltsOpenings']),
    adpEmploymentChange: macroNumber_(row['adpEmploymentChange']),
    nfpPayrollChange: macroNumber_(row['nfpPayrollChange']),
    vix: macroNumber_(row['vix']),
    dxy: macroNumber_(row['dxy']),
    yield2y: macroNumber_(row['yield2y']),
    fedBalance: macroNumber_(row['fedBalance']),
    rrp: macroNumber_(row['rrp']),
    m2: macroNumber_(row['m2']),
    liquidityScore: macroNumber_(row['liquidityScore']),
    sofrIorbSpread: macroNumber_(row['sofrIorbSpread']),
    bankReserves: macroNumber_(row['bankReserves']),
    bankReservesChange: macroNumber_(row['bankReservesChange']),
    creditSpread: macroNumber_(row['creditSpread']),
    consumerSentiment: macroNumber_(row['consumerSentiment']),
    twseMarginBalance: macroNumber_(row['台股融資餘額']),
    twseMarginBalanceChange: macroNumber_(row['台股融資餘額增減']),
    twseMarginMaintenanceRatio: macroNumber_(row['台股維持率']),
    twseMarginMaintenanceChange: macroNumber_(row['台股維持率增減'])
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
    adpEmploymentChange: macroData.adpEmploymentChange,
    nfpPayrollChange: macroData.nfpPayrollChange,
    vix: macroData.vix,
    dxy: macroData.dxy,
    yield2y: macroData.yield2y,
    fedBalance: macroData.fedBalance,
    rrp: macroData.rrp,
    m2: macroData.m2,
    liquidityScore: macroData.liquidityScore,
    sofrIorbSpread: macroData.sofrIorbSpread,
    bankReserves: macroData.bankReserves,
    bankReservesChange: macroData.bankReservesChange,
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
          content: '你是總經市場分析助手。請使用繁體中文，只能輸出 JSON，不要輸出 Markdown。劇本只能是：軟著陸、滯脹、衰退、金融壓力。燈號只能是：綠燈、黃燈、紅燈、黑燈。請輸出欄位：date, scenario, signal, score, summary, mainRisk, suggestion。score 是 0 到 100 的總經壓力分數。yield2y 是美國 2 年債殖利率；fedBalance 是 Fed 資產負債表；rrp 是隔夜逆回購；m2 是 M2 貨幣供給；liquidityScore 是 0 到 5 的帝國流動性分數，越高代表流動性環境越有利。sofrIorbSpread 是 SOFR 減 IORB 的百分點利差，負值或接近 0 通常平穩，持續轉正代表短端資金開始變緊，突然大幅升高代表銀行或 Repo 市場可能搶錢。bankReserves 是銀行準備金水位，bankReservesChange 是週變化；不要只死盯 2.8 兆美元，重點是準備金下降速度是否與 SOFR-IORB 轉正或 SRF 使用同時出現。creditSpread 是美國高收益債利差 HY OAS；低於 3% 代表市場非常樂觀甚至過度舒服，3～4% 正常偏穩定，4～5% 壓力開始升高，高於 5% 信用市場明顯轉弱，快速逼近 7% 以上是高度風險環境。ppi 是 PPI final demand 年增率，consumerSentiment 是密歇根消費者信心指數，請納入景氣與市場風險判斷。'
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

function fetchYahooRecentCloses_(symbol, limit) {
  var url = 'https://query2.finance.yahoo.com/v8/finance/chart/' + symbol + '?interval=1d&range=10d';
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
  var closes = (((result.indicators || {}).quote || [])[0] || {}).close || [];
  var validCloses = closes.filter(function(value) {
    return value != null && !isNaN(value);
  }).map(Number);
  if (!validCloses.length) throw new Error('Yahoo Finance 無有效價格：' + decodeURIComponent(symbol));
  return limit ? validCloses.slice(-limit) : validCloses;
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

function safeMacroFetchSeries_(fn) {
  try {
    return fn() || [];
  } catch (e) {
    Logger.log('safeMacroFetchSeries_ error: ' + e.message);
    return [];
  }
}

function fillMissingMacroPayload_(ss, payload) {
  var previous = getLatestMacroData_(ss);
  var prevValues = previous && previous.values ? previous.values : {};
  var keys = ['yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'joltsOpenings', 'adpEmploymentChange', 'nfpPayrollChange', 'vix', 'dxy', 'creditSpread'];
  var optionalKeys = ['yield2y', 'fedBalance', 'rrp', 'm2', 'liquidityScore', 'sofrIorbSpread', 'bankReserves', 'bankReservesChange'];
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

function latestMacroSeriesValue_(rows) {
  if (!rows || !rows.length) return null;
  var latest = rows[rows.length - 1];
  return typeof latest === 'number' ? latest : latest.value;
}

function macroLatestSpread_(primaryRows, baseRows) {
  var primary = latestMacroSeriesValue_(primaryRows);
  var base = latestMacroSeriesValue_(baseRows);
  if (primary == null || base == null || isNaN(primary) || isNaN(base)) return null;
  return primary - base;
}

function macroSeriesMoves_(rows, direction) {
  if (!rows || rows.length < 2) return null;
  var latest = latestMacroSeriesValue_(rows);
  var previousRows = rows.slice(0, -1);
  var previous = latestMacroSeriesValue_(previousRows);
  if (latest == null || previous == null || isNaN(latest) || isNaN(previous)) return null;
  return direction === 'down' ? latest < previous : latest > previous;
}

function macroLiquidityScore_(signals) {
  if (!signals || signals.length !== 5 || signals.some(function(signal) { return signal == null; })) return null;
  return signals.filter(function(signal) { return signal === true; }).length;
}

function latestSeriesChange_(rows, divisor) {
  if (!rows || rows.length < 2) return null;
  var latest = rows[rows.length - 1];
  var previous = rows[rows.length - 2];
  if (!latest || !previous || latest.value == null || previous.value == null) return null;
  var change = latest.value - previous.value;
  return change / (divisor || 1);
}

function normalizeYield10y_(value) {
  value = Number(value);
  if (isNaN(value)) return null;
  return value > 20 ? value / 10 : value;
}

function macroDefaultSettings_() {
  return [
    { code: 'liquidityScore', name: '帝國流動性分數', enabled: true, yellow: '2～3', red: '0～1', note: 'DXY↓、2年債↓、RRP↓、Fed資產↑、M2↑' },
    { code: 'sofrIorbSpread', name: 'SOFR－IORB利差', enabled: true, yellow: '>0', red: '>=0.25', note: 'FRED SOFR－IORB；短端資金壓力計，轉正代表變緊' },
    { code: 'bankReserves', name: '銀行準備金', enabled: true, yellow: '週降逾500億', red: '週降逾1000億且SOFR轉正', note: 'FRED WRESBAL；看準備金下降速度，搭配 SOFR－IORB 與 SRF 使用觀察' },
    { code: 'yield2y', name: '美國2年債殖利率', enabled: true, yellow: '>=4.5', red: '>=5.0', note: 'FRED DGS2；觀察降息預期與風險偏好' },
    { code: 'fedBalance', name: 'Fed資產負債表', enabled: true, yellow: '', red: '', note: 'FRED WALCL；觀察 Fed 放水或抽水' },
    { code: 'rrp', name: 'RRP逆回購', enabled: true, yellow: '', red: '', note: 'FRED RRPONTSYD；觀察停車資金是否流出' },
    { code: 'm2', name: 'M2貨幣供給', enabled: true, yellow: '', red: '', note: 'FRED M2SL；觀察總水庫水位' },
    { code: 'yield10y', name: '美國10年債殖利率', enabled: true, yellow: '>=4.5', red: '>=5.0', note: '利率壓力' },
    { code: 'oil', name: '原油價格', enabled: true, yellow: '>=85', red: '>=100', note: '通膨壓力' },
    { code: 'cpi', name: 'CPI年增率', enabled: true, yellow: '>=3.0', red: '>=4.0', note: '通膨' },
    { code: 'ppi', name: 'PPI年增率', enabled: true, yellow: '>=3.0', red: '>=5.0', note: '上游通膨' },
    { code: 'unemployment', name: '失業率', enabled: true, yellow: '>=4.3', red: '>=5.0', note: '就業惡化' },
    { code: 'adpEmploymentChange', name: '小非農 ADP 就業新增', enabled: true, yellow: '<=50', red: '<=0', note: '民間就業月增，單位：千人' },
    { code: 'nfpPayrollChange', name: '非農就業新增 (NFP)', enabled: true, yellow: '<=100', red: '<=0', note: '非農就業月增，單位：千人' },
    { code: 'joltsOpenings', name: '職位空缺與勞動力流動調查 (JOLTS)', enabled: true, yellow: '<=7000', red: '<=6500', note: '職缺降溫，單位：千人' },
    { code: 'vix', name: 'VIX恐慌指數', enabled: true, yellow: '>=20', red: '>=30', note: '市場恐慌' },
    { code: 'dxy', name: '美元指數', enabled: true, yellow: '>=105', red: '>=110', note: '美元壓力' },
    { code: 'creditSpread', name: '美國高收益債利差 HY OAS', enabled: true, yellow: '4～5', red: '>=5', note: 'FRED BAMLH0A0HYM2；垃圾債相對美債補償，<3過度舒服、3～4穩定、4～5壓力升高、>5轉弱、>=7高度風險' },
    { code: 'consumerSentiment', name: '密歇根消費者信心', enabled: true, yellow: '<=70', red: '<=60', note: '消費信心轉弱' }
  ];
}

function buildMacroIndicators_(dataRow, settings) {
  var values = dataRow ? dataRow.values : {};
  var liquidityOrder = {
    liquidityScore: 0,
    sofrIorbSpread: 1,
    bankReserves: 2,
    dxy: 3,
    yield2y: 4,
    fedBalance: 5,
    rrp: 6,
    m2: 7
  };
  var orderedSettings = settings.slice().sort(function(a, b) {
    var aRank = Object.prototype.hasOwnProperty.call(liquidityOrder, a.code) ? liquidityOrder[a.code] : 99;
    var bRank = Object.prototype.hasOwnProperty.call(liquidityOrder, b.code) ? liquidityOrder[b.code] : 99;
    if (aRank !== bRank) return aRank - bRank;
    return 0;
  });
  return orderedSettings.map(function(setting) {
    var value = values && values[setting.code] != null ? values[setting.code] : null;
    var status = macroIndicatorStatus_(value, setting, values);
    return {
      code: setting.code,
      name: macroIndicatorName_(setting),
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

function macroIndicatorName_(setting) {
  if (setting.code === 'dxy') return '美元指數 DXY';
  if (setting.code === 'creditSpread') return '美國高收益債利差 HY OAS';
  return setting.name;
}

function macroIndicatorStatus_(value, setting, values) {
  if (value == null || isNaN(value)) return { status: '無資料', tone: 'watch' };
  if (setting.code === 'liquidityScore') {
    if (value >= 4) return { status: '🟢 放水進攻期', tone: 'attack' };
    if (value >= 2) return { status: '🟡 觀察整軍期', tone: 'watch' };
    return { status: '🔴 抽水防守期', tone: 'defense' };
  }
  if (setting.code === 'sofrIorbSpread') {
    if (value >= 0.25) return { status: '搶錢警訊', tone: 'defense' };
    if (value > 0) return { status: '資金轉緊', tone: 'watch' };
    return { status: '短端平穩', tone: 'attack' };
  }
  if (setting.code === 'creditSpread') {
    if (value >= 7) return { status: '高度風險環境', tone: 'defense' };
    if (value > 5) return { status: '信用市場轉弱', tone: 'defense' };
    if (value >= 4) return { status: '壓力開始升高', tone: 'watch' };
    if (value >= 3) return { status: '正常偏穩定', tone: 'attack' };
    return { status: '非常樂觀', tone: 'attack' };
  }
  if (setting.code === 'bankReserves') {
    var change = values ? macroNumber_(values.bankReservesChange) : null;
    var sofrSpread = values ? macroNumber_(values.sofrIorbSpread) : null;
    var fastDrop = change != null && change <= -100000;
    var moderateDrop = change != null && change <= -50000;
    var sofrPositive = sofrSpread != null && sofrSpread > 0;
    if (fastDrop && sofrPositive) return { status: '快降＋SOFR轉正', tone: 'defense' };
    if (fastDrop) return { status: '準備金快速下降', tone: 'watch' };
    if (moderateDrop) return { status: '準備金下降加速', tone: 'watch' };
    if (change != null && change > 0) return { status: '準備金回升', tone: 'attack' };
    return { status: '準備金穩定觀察', tone: 'watch' };
  }
  if (setting.code === 'fedBalance' || setting.code === 'rrp' || setting.code === 'm2') {
    return { status: '趨勢追蹤', tone: 'watch' };
  }
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
  if (code === 'liquidityScore') return value.toFixed(0) + ' / 5';
  if (code === 'yield10y' || code === 'yield2y' || code === 'cpi' || code === 'cpiMoM' || code === 'ppi' || code === 'unemployment' || code === 'creditSpread' || code === 'sofrIorbSpread') {
    return value.toFixed(2) + '%';
  }
  if (code === 'fedBalance') return '$' + (value / 1000000).toFixed(2) + ' 兆美元';
  if (code === 'bankReserves') return '$' + (value / 1000000).toFixed(2) + ' 兆美元';
  if (code === 'bankReservesChange') return (value >= 0 ? '+' : '') + '$' + (value / 1000).toFixed(0) + ' 十億美元';
  if (code === 'rrp') return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' 十億美元';
  if (code === 'm2') return '$' + (value / 1000).toFixed(2) + ' 兆美元';
  if (code === 'consumerSentiment') return value.toFixed(1);
  if (code === 'joltsOpenings' || code === 'adpEmploymentChange' || code === 'nfpPayrollChange') {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' 千人';
  }
  if (code === 'oil' || code === 'vix' || code === 'dxy') return value.toFixed(2);
  return String(value);
}

function macroObjectFromRow_(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) {
    if (h) obj[h] = row[i] == null ? '' : row[i];
  });
  return obj;
}

function macroNumber_(value) {
  var text = String(value == null ? '' : value).replace(/[$,\s]/g, '').replace('%', '');
  if (!text) return null;
  var n = parseFloat(text);
  return isNaN(n) ? null : n;
}

function getTodayAdvisorReminder(ss) {
  ss = ss || getExternalDbSpreadsheet_();
  var tz = Session.getScriptTimeZone();
  var todayText = Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd');
  var sheet = ensureDailyAdvisorReminderSheet_(ss);
  var existing = findDailyAdvisorReminder_(sheet, todayText);
  if (existing) return existing;

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    existing = findDailyAdvisorReminder_(sheet, todayText);
    if (existing) return existing;

    var generated = generateDailyAdvisorReminder_(todayText);
    sheet.appendRow([
      todayText,
      generated.message,
      advisorReminderLength_(generated.message),
      generated.source,
      new Date()
    ]);
    SpreadsheetApp.flush();
    return {
      date: todayText,
      displayDate: formatAdvisorReminderDisplayDate_(todayText),
      message: generated.message,
      source: generated.source
    };
  } finally {
    lock.releaseLock();
  }
}

function ensureDailyAdvisorReminderSheet_(ss) {
  var sheet = ss.getSheetByName(DAILY_ADVISOR_REMINDER_SHEET);
  if (!sheet) sheet = ss.insertSheet(DAILY_ADVISOR_REMINDER_SHEET);
  ensureSheetHeaders_(sheet, DAILY_ADVISOR_REMINDER_HEADERS);
  return sheet;
}

function findDailyAdvisorReminder_(sheet, todayText) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var values = sheet.getRange(2, 1, lastRow - 1, DAILY_ADVISOR_REMINDER_HEADERS.length).getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    var dateText = normalizeAdvisorReminderDate_(values[i][0]);
    var message = String(values[i][1] || '').trim();
    if (dateText === todayText && message) {
      return {
        date: todayText,
        displayDate: formatAdvisorReminderDisplayDate_(todayText),
        message: message,
        source: String(values[i][3] || 'sheet').trim() || 'sheet'
      };
    }
  }
  return null;
}

function normalizeAdvisorReminderDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  }
  var text = String(value || '').trim().replace(/-/g, '/');
  var m = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return text;
  return m[1] + '/' + ('0' + m[2]).slice(-2) + '/' + ('0' + m[3]).slice(-2);
}

function formatAdvisorReminderDisplayDate_(dateText) {
  var parts = String(dateText || '').split('/');
  if (parts.length < 3) return dateText || '';
  return parts[0] + '/' + String(parseInt(parts[1], 10)) + '/' + String(parseInt(parts[2], 10));
}

function generateDailyAdvisorReminder_(todayText) {
  try {
    return {
      message: normalizeDailyAdvisorReminder_(askDeepSeekAdvisorReminder_(todayText)),
      source: 'DeepSeek'
    };
  } catch (ex) {
    return {
      message: fallbackDailyAdvisorReminder_(todayText),
      source: 'fallback: ' + (ex && ex.message ? ex.message : 'AI unavailable')
    };
  }
}

function askDeepSeekAdvisorReminder_(todayText) {
  var key = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');
  if (!key) throw new Error('尚未設定 DEEPSEEK_API_KEY');

  var prompt = [
    '日期：' + todayText,
    '請生成一段今日軍師提醒。',
    '規則：50 到 120 個中文字；繁體中文；像老朋友提醒；溫暖、幽默、有智慧；不說教、不製造焦慮、不使用負面恐嚇。',
    '背景：主公正在建立投資帝國，重視長期投資與資產配置；喜歡城池、糧倉、將軍、士兵、出兵等比喻；曾在教育環境受挫，現在學習用更穩定健康的方式生活。',
    '內容可偶爾加入帝國、投資、休息與自我照顧概念。',
    '只輸出提醒正文，不要標題、不要 Markdown、不要 JSON。'
  ].join('\n');

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
          content: '你是「帝國軍師」。你的任務不是提供雞湯，而是協助主公穩定前進。請使用繁體中文，語氣溫暖、幽默、有智慧。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      thinking: { type: 'disabled' },
      max_tokens: 320,
      temperature: 0.85,
      stream: false
    }),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var data = JSON.parse(text);
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : 'DeepSeek 今日軍師提醒失敗');
  }
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('DeepSeek 今日軍師提醒格式異常');
  }
  return data.choices[0].message.content || '';
}

function normalizeDailyAdvisorReminder_(text) {
  var message = String(text || '')
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .replace(/^[-#*\s]*(?:⚔️\s*)?軍師提醒[:：]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!message) throw new Error('DeepSeek 今日軍師提醒為空');
  if (advisorReminderLength_(message) > 140) {
    message = message.slice(0, 120).replace(/[，、；：。！？][^，、；：。！？]*$/, '。');
  }
  return message;
}

function advisorReminderLength_(message) {
  return String(message || '').replace(/\s/g, '').length;
}

function fallbackDailyAdvisorReminder_(todayText) {
  var pool = [
    '主公，今日不必急著攻下每一座城。先巡糧倉、整軍心，能穩穩前進一小步，帝國就仍在長大。',
    '主公，市場若像城門緊閉，就先不硬闖。喝口茶、看好糧草，等待風向清楚，也是將軍的本事。',
    '主公，今日若精神只夠守城，也算勝利。長期投資靠的不是天天衝鋒，而是糧倉、睡眠與耐心同時在線。',
    '主公，帝國不是一日築成，帳本也不用一眼看完。今日先照顧好自己，士兵吃飽了，明日自然能出兵。',
    '主公，若今日進度慢些，請別急著責備將軍。城池在打底，資產在累積，穩住心神也是重要軍功。'
  ];
  var digits = String(todayText || '').replace(/\D/g, '');
  var seed = digits ? parseInt(digits.slice(-6), 10) : 0;
  return pool[seed % pool.length];
}

function parseAdvisorAICommandWithDeepSeek_(raw) {
  raw = String(raw || '').trim();
  if (!raw) throw new Error('請輸入軍師AI指令');
  var cache = CacheService.getScriptCache();
  var cacheKey = 'advisor_ai_parse_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw)
  ).slice(0, 40);
  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  var key = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');
  if (!key) throw new Error('後端尚未設定 DEEPSEEK_API_KEY，無法啟用軍師AI V2');
  var model = String(PropertiesService.getScriptProperties().getProperty('DEEPSEEK_MODEL') || '').trim() || 'deepseek-v4-flash';
  if (['deepseek-v4-pro', 'deepseek-v4-flash'].indexOf(model) < 0) model = 'deepseek-v4-flash';

  var response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + key
    },
    payload: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: [
            '你是帝國指揮所的軍師AI V2，只能把使用者短指令解析成 JSON，不要 Markdown。',
            '只允許輸出一個 JSON object。',
            '可用 intent: expense, transfer, dividend, advisorDividendMemo, stockSell, open, maintenance, copyCarrier, showCarrier, member, unknown。',
            'expense 欄位: category, account, amount, note。',
            'transfer 欄位: from, to, amount, note。',
            'dividend 欄位: symbol, amount。這是已入帳金額，不是每股配息。',
            'advisorDividendMemo 欄位: market, symbol, dividendPerShare。用途是新增持股備忘錄待入帳配息；例如「台灣5G 0.12」或「AIPI 0.234」。market 可省略；美股只有 QQQI, AIPI, PLTY, CHPY, GDXW, GLDW；其餘為台股；施羅德收益成長A2 是美股但免先扣 30%。',
            'stockSell 欄位: symbol, shares, amount。',
            'open 欄位: panel, tab, label。panel 只可用 finance, foodhouse, market, domestic, council, stars, medical。',
            'member 欄位: type，7-11 用 seven，全家用 family。',
            '常見帳戶與代稱：國泰s/國泰stock=國泰Stock，現金/cash=Cash，中國/中信=中國信託，將來=將來銀行，玉山=玉山銀行，永豐=永豐銀行，國泰m=國泰Money，cube/CUBE=Cube。',
            '常見標的代稱：AIPI, IAU, QQQI, MLPI, SPYI, PLTY, CHPY, GDXW, GLDW, 985B, 997A, 台灣5g, 施羅德。',
            '不確定或金額缺失時，輸出 {"intent":"unknown"}。'
          ].join('\n')
        },
        {
          role: 'user',
          content: raw
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 180,
      stream: false
    }),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var data = JSON.parse(text);
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : 'DeepSeek V2 回應失敗');
  }
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('DeepSeek V2 回應格式異常');
  }
  var parsed = parseAdvisorJson_(data.choices[0].message.content || '{"intent":"unknown"}');
  if (parsed && parsed.intent && parsed.intent !== 'unknown') {
    cache.put(cacheKey, JSON.stringify(parsed), 6 * 60 * 60);
  }
  return parsed;
}

function parseAdvisorJson_(text) {
  var raw = String(text || '').trim();
  raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  var start = raw.indexOf('{');
  var end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  return JSON.parse(raw);
}

function normalizeEtfTaxSymbol_(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, '');
}

function getEtfTaxLookup(p) {
  var symbol = normalizeEtfTaxSymbol_(p.symbol || p.q || p.query);
  if (!symbol) throw new Error('請輸入 ETF 代號');
  var cache = CacheService.getScriptCache();
  var cacheKey = 'ETF_TAX_LOOKUP_V1_' + symbol;
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var taxSs = getEtfTaxSpreadsheet_();
  var result = {
    symbol: symbol,
    found: false,
    sources: []
  };

  appendCathayEtfTax_(taxSs, symbol, result);
  appendBrokerEtfTax_(taxSs, symbol, result, {
    sheetName: '2025富邦退稅',
    source: '2025富邦退稅',
    headerRow: 1,
    dataStartRow: 2,
    symbolCol: 3,
    dateCol: 1,
    marketCol: 2,
    nameCol: 4,
    refundCol: 6,
    bankCol: 7,
    poolCol: 8
  });
  appendBrokerEtfTax_(taxSs, symbol, result, {
    sheetName: '2024退稅',
    source: '2024退稅',
    headerRow: 2,
    dataStartRow: 3,
    symbolCol: 3,
    dateCol: 1,
    marketCol: 2,
    nameCol: 4,
    refundCol: 6,
    bankCol: 7,
    poolCol: 0
  });

  result.found = result.sources.length > 0;
  cache.put(cacheKey, JSON.stringify(result), 21600);
  return result;
}

function appendCathayEtfTax_(taxSs, symbol, result) {
  var sheet = taxSs.getSheetByName('2025國泰退稅');
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return;
  var matches = sheet.getRange(5, 1, lastRow - 4, 1)
    .createTextFinder(symbol)
    .matchEntireCell(true)
    .findAll();
  if (!matches || !matches.length) return;
  var row = sheet.getRange(matches[0].getRow(), 1, 1, 5).getDisplayValues()[0];
  result.sources.push({
    source: '2025國泰退稅',
    type: 'experience',
    symbol: row[0] || symbol,
    rows: [
      {
        year: '2025',
        taxRate: row[1] || '',
        refundRate: row[2] || ''
      },
      {
        year: '2024',
        taxRate: row[3] || '',
        refundRate: row[4] || ''
      }
    ]
  });
}

function appendBrokerEtfTax_(taxSs, symbol, result, spec) {
  var sheet = taxSs.getSheetByName(spec.sheetName);
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow < spec.dataStartRow) return;
  var matches = sheet.getRange(spec.dataStartRow, spec.symbolCol, lastRow - spec.dataStartRow + 1, 1)
    .createTextFinder(symbol)
    .matchEntireCell(true)
    .findAll();
  if (!matches || !matches.length) return;

  var grouped = {};
  matches.forEach(function(cell) {
    var row = sheet.getRange(cell.getRow(), 1, 1, Math.max(8, spec.poolCol || 0)).getDisplayValues()[0];
    var refundRate = row[spec.refundCol - 1] || '';
    var key = [
      refundRate,
      row[spec.bankCol - 1] || '',
      spec.poolCol ? (row[spec.poolCol - 1] || '') : '',
      row[spec.marketCol - 1] || '',
      row[spec.nameCol - 1] || ''
    ].join('\u0001');
    if (!grouped[key]) {
      grouped[key] = {
        refundRate: refundRate,
        bank: row[spec.bankCol - 1] || '',
        taxPool: spec.poolCol ? (row[spec.poolCol - 1] || '') : '',
        market: row[spec.marketCol - 1] || '',
        name: row[spec.nameCol - 1] || '',
        firstDate: row[spec.dateCol - 1] || '',
        latestDate: row[spec.dateCol - 1] || '',
        count: 0
      };
    }
    grouped[key].count++;
    var dateText = row[spec.dateCol - 1] || '';
    if (dateText) {
      if (!grouped[key].firstDate || dateText < grouped[key].firstDate) grouped[key].firstDate = dateText;
      if (!grouped[key].latestDate || dateText > grouped[key].latestDate) grouped[key].latestDate = dateText;
    }
  });

  var rows = Object.keys(grouped).map(function(key) { return grouped[key]; });
  rows.sort(function(a, b) {
    return String(b.latestDate || '').localeCompare(String(a.latestDate || '')) ||
      String(a.refundRate || '').localeCompare(String(b.refundRate || ''));
  });
  result.sources.push({
    source: spec.source,
    type: 'broker',
    symbol: symbol,
    rows: rows
  });
}

function normalizeAdvisorExecutionPack_(obj) {
  obj = obj || {};
  return {
    summary: String(obj.summary || '').trim(),
    targetType: normalizeAdvisorChoice_(obj.targetType, ['網頁端', 'Apps Script', '試算表', '自動化', '資料修正', '複合'], '複合'),
    targetFiles: normalizeStringArray_(obj.targetFiles),
    targetSheets: normalizeStringArray_(obj.targetSheets),
    searchKeywords: normalizeStringArray_(obj.searchKeywords),
    changeType: normalizeAdvisorChoice_(obj.changeType, ['label-only', 'layout', 'data-pipeline', 'formula-baseline', 'automation', 'bugfix', 'unknown'], 'unknown'),
    riskLevel: normalizeAdvisorChoice_(obj.riskLevel, ['low', 'medium', 'high'], 'medium'),
    acceptanceCriteria: normalizeStringArray_(obj.acceptanceCriteria),
    verification: normalizeStringArray_(obj.verification),
    questions: normalizeStringArray_(obj.questions)
  };
}

function normalizeAdvisorChoice_(value, allowed, fallback) {
  var text = String(value || '').trim();
  return allowed.indexOf(text) >= 0 ? text : fallback;
}

function normalizeStringArray_(value) {
  if (value == null || value === '') return [];
  var arr = Array.isArray(value) ? value : [value];
  return arr.map(function(item) {
    return String(item || '').trim();
  }).filter(function(item) {
    return item;
  });
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
  var s = String(value || '').trim();
  if (!s) return 0;
  s = s.replace(/[$,\s]/g, '').replace(/\uFF0C/g, '').replace(/[％%]/g, '');
  var multiplier = 1;
  if (s.indexOf('\u5104') >= 0) multiplier *= 100000000;
  if (s.indexOf('\u842C') >= 0) multiplier *= 10000;
  s = s.replace(/[\u5104\u842C]/g, '');
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n * multiplier;
}

function hasSheetValue_(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
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
      var loanAmt   = parseSheetNumber_(row[6]);
      var price     = parseSheetNumber_(row[7]);
      var lots      = parseSheetNumber_(row[2]);
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
      var maint     = parseSheetNumber_(row[8]);
      var interest  = parseSheetNumber_(row[5]);
      var elapsed   = parseSheetNumber_(row[4]);
      pledges.push({
        target:              String(row[0]).trim(),
        rate:                rate,
        lots:                lots,
        pledgeDate:          sheetDateText_(row[3]),
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
      var termMonths    = parseSheetNumber_(lrow[2]);
      var loanDate      = sheetDateText_(lrow[3]);
      var elapsedM      = parseSheetNumber_(lrow[4]);
      var monthly       = parseSheetNumber_(lrow[5]);
      var loanTotal     = parseSheetNumber_(lrow[6]);
      var paidInterest  = parseSheetNumber_(lrow[7]);  // H17
      var principalPaid = parseSheetNumber_(lrow[8]);  // I17
      var remainingAmount = hasSheetValue_(lrow[8]) ? Math.max(0, loanTotal - principalPaid) : loanTotal;
      loans.push({
        bank:           bank,
        loanAmount:     Math.round(loanTotal),
        rate:           loanRate,
        loanDate:       loanDate,
        termMonths:     termMonths,
        monthlyPayment: Math.round(monthly),
        elapsedMonths:  elapsedM,
        repaidTotal:    Math.round(monthly * elapsedM),
        remainingAmount:Math.round(remainingAmount),
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
        var incomeDivSymbol = normalizeInvestmentSymbol_(row[5]) || normalizeInvestmentSymbol_(row[8]) || '';
        var incomeTxn = {
          date: formatTxnDate(row[0]),
          type: '收入',
          cat: String(row[7] || '').trim(),
          account: ledgerIncomeAccount_(row),
          amount: Math.round(ledgerIncomeAmount_(row)),
          note: String(row[5] || '').trim(),
          divRate: row[10] === '' || row[10] == null ? '' : row[10],
          divSymbol: incomeDivSymbol,
          divDisplaySymbol: incomeDivSymbol ? getDividendDisplayLabel_(incomeDivSymbol) : '',
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
    var incomeAccount = ledgerIncomeAccount_(row);
    var incomeAmount = parseFloat(row[6]) || 0;
    if (incomeAccount && incomeAmount) {
      changes.push(adjustBalanceAPI(moon, incomeAccount, accountBalanceDelta_(incomeAccount, -incomeAmount)));
    }
  } else if (type === '轉帳') {
    var to = ledgerTransferTo_(row);
    var from = ledgerTransferFrom_(row);
    var transferAmount = parseFloat(row[14]) || parseFloat(row[2]) || 0;
    if (from && transferAmount && !isInvestmentLedgerAccount_(from)) {
      changes.push(adjustBalanceAPI(moon, from, accountBalanceDelta_(from, +transferAmount)));
    }
    if (to && transferAmount && !isInvestmentLedgerAccount_(to)) {
      changes.push(adjustBalanceAPI(moon, to, accountBalanceDelta_(to, -transferAmount)));
    }
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

  note = divSymbol ? getDividendDisplayLabel_(incomeStockSymbol) : formatIncomeStockNote_(note, incomeStockSymbol);

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
  if (s.indexOf('高股息') >= 0) return '國泰高股息B';
  if (s.indexOf('00988A') >= 0) return 'GDXW';
  if (s.indexOf('985B') >= 0) return '00985B';
  if (s.indexOf('997A') >= 0) return '00997A';
  var symbols = ['AIPI', 'CHPY', 'PLTY', 'QQQI', 'SPYI', 'MLPI', 'IAU', 'GDXW', 'GLDW', '00985B', '00997A'];
  for (var i = 0; i < symbols.length; i++) {
    if (s.indexOf(symbols[i]) >= 0) return symbols[i];
  }
  if (s.indexOf('路博邁') >= 0 || s.indexOf('5G') >= 0) return '路博邁台灣5G';
  if (s.indexOf('施羅德') >= 0) return '施羅德收益成長A2';
  return '';
}

function isInvestmentLedgerAccount_(accountName) {
  return !!normalizeInvestmentSymbol_(accountName);
}

function getDividendDisplayLabel_(symbol) {
  var displayMap = {
    '國泰高股息B': '🌐國泰高股息B',
    '00985B': '🎟️00985B',
    '00997A': '🪄00997A',
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
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return 32.5;
  var fx = parseFloat(moon.getRange('H1').getValue()) || 0;
  return fx > 0 ? Math.round(fx * 100) / 100 : 32.5;
}

function getDividendHoldingOptions_(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return [];
  var holdingStart = getMoonHoldingStartRow_(moon);
  var maxRows = Math.max(0, Math.min(moon.getLastRow() - holdingStart + 1, MOON_HOLDING_ROWS));
  if (maxRows <= 0) return [];
  var values = moon.getRange(holdingStart, MOON_HOLDING_COL, maxRows, MOON_HOLDING_COLS).getValues();
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
  if (s.indexOf('00997A') >= 0 || s.indexOf('997A') >= 0) return false;
  if (s.indexOf('路博邁') >= 0 || s.indexOf('5G') >= 0) return false;
  if (s.indexOf('施羅德') >= 0) return false;
  return true;
}

function isUsDividendMemoSymbol_(symbol) {
  var normalized = normalizeInvestmentSymbol_(symbol) || String(symbol || '').trim();
  var key = String(normalized || '').toUpperCase();
  if (String(normalized || '').indexOf('施羅德') >= 0) return true;
  var usSymbols = ['QQQI', 'AIPI', 'PLTY', 'CHPY', 'GDXW', 'GLDW'];
  for (var i = 0; i < usSymbols.length; i++) {
    if (key.indexOf(usSymbols[i]) >= 0) return true;
  }
  return false;
}

function markDividendPaid_(ss, options) {
  var sheet = ensureDividendDbSheet_(getExternalDbSpreadsheet_());
  var rowId = parseInt(options.rowId, 10) || 0;
  var symbol = normalizeInvestmentSymbol_(options.symbol);
  var actualAmount = parseFloat(options.actualAmount) || 0;

  if (rowId && !isDividendRowMatch_(sheet, rowId, symbol)) rowId = 0;

  if (!rowId && symbol) {
    rowId = findMatchingUnpaidDividendRow_(sheet, options) || findLatestUnpaidDividendRow_(sheet, symbol);
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
    dividendUsd: body.dividendUsd,
    announceDate: body.announceDate,
    estimatedPayDate: body.estimatedPayDate,
    estimatedTwd: body.estimatedTwd,
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

function findAdvisorDividendHolding_(ss, value) {
  var raw = String(value || '').trim();
  var normalized = normalizeInvestmentSymbol_(raw) || raw.toUpperCase();
  var key = normalizeToken_(normalized).toUpperCase();
  var rawKey = normalizeToken_(raw).toUpperCase();
  var rows = getDividendHoldingOptions_(ss);
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i] || {};
    var symbol = String(row.symbol || '').trim();
    var display = String(row.displaySymbol || '').trim();
    var symbolKey = normalizeToken_(symbol).toUpperCase();
    var displayKey = normalizeToken_(display).toUpperCase();
    if (symbolKey === key || displayKey === key || symbolKey === rawKey || displayKey === rawKey) return row;
    if (rawKey && (displayKey.indexOf(rawKey) >= 0 || symbolKey.indexOf(rawKey) >= 0)) return row;
    if (key && (displayKey.indexOf(key) >= 0 || symbolKey.indexOf(key) >= 0)) return row;
  }
  return null;
}

function writeAdvisorDividendMemo(ss, body) {
  var rawSymbol = String(body.symbol || body.displaySymbol || '').trim();
  var perShare = parseFloat(body.dividendPerShare || body.perShare || body.amount) || 0;
  var market = String(body.market || '').trim().toLowerCase();
  var previewOnly = String(body.preview || '').trim() === '1' || String(body.preview || '').toLowerCase() === 'true';
  if (!rawSymbol) throw new Error('配息標的必填');
  if (perShare <= 0) throw new Error('每股配息必須大於 0');

  var holding = findAdvisorDividendHolding_(ss, rawSymbol);
  if (!holding) throw new Error('找不到持股標的：' + rawSymbol);
  var symbol = normalizeInvestmentSymbol_(holding.symbol || holding.displaySymbol || rawSymbol) || String(holding.symbol || rawSymbol).trim();
  var displaySymbol = holding.displaySymbol || getDividendDisplayLabel_(symbol) || symbol;
  var shares = parseFloat(body.shares || holding.shares) || 0;
  if (shares <= 0) throw new Error('找不到 ' + displaySymbol + ' 的持股數');

  if (!market) market = isUsDividendMemoSymbol_(symbol) ? 'us' : 'tw';
  var isTw = market === 'tw' || market === 'taiwan' || market === '台股';
  var fx = isTw ? 1 : (parseFloat(body.fx) || getDividendSettingFx_(ss));
  if (!isTw && fx <= 0) throw new Error('匯率必須大於 0');
  var taxFactor = isTw ? 1 : (shouldApplyDividendTaxFactor_(symbol) ? 0.7 : 1);
  var estimatedTwd = Math.round(perShare * shares * taxFactor * (isTw ? 1 : fx));
  if (estimatedTwd <= 0) throw new Error('配息金額計算結果必須大於 0');

  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  var date = String(body.date || '').trim().replace(/-/g, '/') || Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd');
  var note = String(body.note || '').trim() || ('軍師AI配息備忘｜' + (isTw ? '台股' : '美股'));
  var result = {
    message: previewOnly ? '配息備忘已試算' : '配息備忘已寫入',
    preview: previewOnly,
    market: isTw ? 'tw' : 'us',
    symbol: symbol,
    displaySymbol: displaySymbol,
    dividendPerShare: perShare,
    shares: shares,
    taxFactor: taxFactor,
    fx: fx,
    estimatedTwd: estimatedTwd,
    date: date,
    note: note
  };
  if (previewOnly) return result;

  var written = writeDividendEntry(ss, {
    symbol: symbol,
    dividendUsd: perShare,
    announceDate: date,
    estimatedPayDate: date,
    fx: isTw ? 1 : fx,
    shares: shares,
    estimatedTwd: estimatedTwd,
    note: note
  });
  result.rowId = written.rowId;
  return result;
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

function isDividendRowMatch_(sheet, rowId, symbol) {
  if (!rowId || rowId < 2 || rowId > sheet.getLastRow()) return false;
  var row = sheet.getRange(rowId, 1, 1, DIVIDEND_DB_HEADERS.length).getValues()[0];
  var paid = String(row[7] || '').trim() === '是';
  if (paid) return false;
  if (symbol && normalizeInvestmentSymbol_(row[0]) !== symbol) return false;
  return true;
}

function findMatchingUnpaidDividendRow_(sheet, options) {
  var symbol = normalizeInvestmentSymbol_(options.symbol);
  if (!symbol || sheet.getLastRow() < 2) return 0;

  var dividendUsd = parseFloat(options.dividendUsd) || 0;
  var estimatedTwd = parseFloat(options.estimatedTwd) || 0;
  var announceDate = normalizeDateKey_(options.announceDate);
  var estimatedPayDate = normalizeDateKey_(options.estimatedPayDate);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, DIVIDEND_DB_HEADERS.length).getValues();
  var best = null;

  values.forEach(function(row, idx) {
    if (normalizeInvestmentSymbol_(row[0]) !== symbol) return;
    if (String(row[7] || '').trim() === '是') return;

    var score = 0;
    if (dividendUsd && Math.abs(parseSheetNumber_(row[1]) - dividendUsd) < 0.00001) score += 4;
    if (announceDate && normalizeDateKey_(row[2]) === announceDate) score += 3;
    if (estimatedPayDate && normalizeDateKey_(row[3]) === estimatedPayDate) score += 3;
    if (estimatedTwd && Math.abs(parseSheetNumber_(row[6]) - estimatedTwd) <= 1) score += 2;
    if (!best || score > best.score) {
      best = { rowId: idx + 2, score: score, payDate: row[3], announceDate: row[2] };
    }
  });

  return best && best.score > 0 ? best.rowId : 0;
}

function normalizeDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'Asia/Taipei', 'yyyy/MM/dd');
  }
  return String(value || '').trim().replace(/-/g, '/');
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

// ── 醫館資料（合併進主 Web App API）───────────────────────────
var MEDICAL_RECORD_SHEET_NAME = '情緒倉庫';
var MEDICAL_SETTING_SHEET_NAME = '設定';
var MEDICAL_CARD_STATS_SHEET_NAME = '牌卡統計';
var MEDICAL_OSHO_STATS_SHEET_NAME = '奧修禪卡統計';
var MEDICAL_RECORD_COLUMNS = [
  '紀錄時間',
  '當下情緒',
  '情緒起因',
  '使用藥物',
  '服用藥量',
  '疼痛部位',
  '疼痛程度',
  '緩解時間',
  '備註／觀察'
];
var MEDICAL_CARD_STATS_COLUMNS = [
  '月份',
  '紀錄時間',
  '抽牌日期',
  '抽牌組ID',
  '牌陣類型',
  '牌序',
  '牌位名稱',
  '牌組',
  '牌卡編號',
  '牌卡名稱',
  '正逆位',
  '顯示牌名',
  '提問/主題',
  '解讀/備註'
];
var MEDICAL_OSHO_STATS_COLUMNS = [
  '月份',
  '紀錄時間',
  '抽牌日期',
  '抽牌組ID',
  '牌卡編號',
  '牌卡名稱',
  '顯示牌名',
  '提問/主題',
  '解讀/備註'
];

function getMedicalOptions_() {
  return {
    status: 'success',
    options: getMedicalSettingOptions_(getMedicalSpreadsheet_())
  };
}

function getMedicalRecords_() {
  var ss = getMedicalSpreadsheet_();
  var sheet = ss.getSheetByName(MEDICAL_RECORD_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return { status: 'success', records: [] };
  var data = sheet.getDataRange().getValues();
  var records = data.slice(1).map(function(row) {
    return {
      recordTime: formatMedicalRecordTime_(row[0]),
      emotion: String(row[1] || ''),
      causes: String(row[2] || ''),
      meds: String(row[3] || ''),
      medDose: String(row[4] || ''),
      painAreas: String(row[5] || ''),
      painLevel: row[6] !== '' ? Number(row[6]) : '',
      notes: String(row[8] || '')
    };
  }).filter(function(record) {
    return record.recordTime;
  });
  return { status: 'success', records: records };
}

function getMedicalCardStats_(p) {
  var ss = getMedicalSpreadsheet_();
  var monthsLimit = getMedicalStatsMonthsLimit_(p);
  return {
    status: 'success',
    cardStats: {
      tarot: readMedicalStatsSheet_(ss.getSheetByName(MEDICAL_CARD_STATS_SHEET_NAME), MEDICAL_CARD_STATS_COLUMNS, { monthsLimit: monthsLimit }),
      osho: readMedicalStatsSheet_(ss.getSheetByName(MEDICAL_OSHO_STATS_SHEET_NAME), MEDICAL_OSHO_STATS_COLUMNS, { monthsLimit: monthsLimit })
    }
  };
}

function writeMedicalQuickRecord_(body) {
  var ss = getMedicalSpreadsheet_();
  var sheet = ss.getSheetByName(MEDICAL_RECORD_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(MEDICAL_RECORD_SHEET_NAME);
    sheet.appendRow(MEDICAL_RECORD_COLUMNS);
    sheet.getRange(1, 1, 1, MEDICAL_RECORD_COLUMNS.length)
      .setBackground('#1e4a3a')
      .setFontColor('#d4f0e4')
      .setFontWeight('bold')
      .setFontSize(11)
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  syncMedicalRecordHeader_(sheet);

  var dateKey = String(body.date || '').trim();
  var shouldMerge = body._mergeSameDate === true;
  var existingRow = shouldMerge ? findMedicalRowByDate_(sheet, dateKey) : -1;
  var rowData = buildMedicalRecordRow_(body);
  if (existingRow > 0) {
    var oldRow = sheet.getRange(existingRow, 1, 1, MEDICAL_RECORD_COLUMNS.length).getValues()[0];
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([mergeMedicalRow_(oldRow, rowData)]);
  } else {
    sheet.appendRow(rowData);
    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) sheet.getRange(lastRow, 1, 1, MEDICAL_RECORD_COLUMNS.length).setBackground('#f0f8f4');
  }

  return {
    status: 'success',
    message: existingRow > 0 ? '紀錄已更新' : '紀錄已新增',
    date: dateKey,
    row: existingRow > 0 ? existingRow : sheet.getLastRow(),
    cardRows: 0,
    oshoRows: 0
  };
}

function writeMedicalTarotRecord_(body) {
  var ss = getMedicalSpreadsheet_();
  var cardRowsWritten = appendMedicalCardStats_(ss, body);
  var oshoRowsWritten = appendMedicalOshoStats_(ss, body);
  return {
    status: 'success',
    message: '抽牌紀錄已新增',
    date: body.date || '',
    row: '',
    cardRows: cardRowsWritten,
    oshoRows: oshoRowsWritten
  };
}

function writeEmilyCardRecord_(body) {
  var ss = getEmilyCardSpreadsheet_();
  var mode = String(body.drawType || '').trim();
  var isOsho = mode === 'osho' || String(body.spreadType || '').indexOf('奧修') >= 0;
  var rows = isOsho ? buildEmilyOshoCardRows_(body) : buildEmilyTarotCardRows_(body);
  if (!rows.length) {
    return {
      status: 'success',
      message: '沒有可寫入的卡牌資料',
      sheet: isOsho ? '奧修禪卡記錄' : '牌卡統計',
      rows: 0
    };
  }

  var sheetName = isOsho ? '奧修禪卡記錄' : '牌卡統計';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  syncEmilyCardRecordHeader_(sheet);
  var startRow = getNextMedicalAppendRowByColumn_(sheet, 1);
  sheet.getRange(startRow, 1, rows.length, MEDICAL_CARD_STATS_COLUMNS.length).setValues(rows);
  sheet.getRange(startRow, 1, rows.length, MEDICAL_CARD_STATS_COLUMNS.length).setVerticalAlignment('middle').setWrap(true);
  return {
    status: 'success',
    message: 'Emily 卡牌紀錄已同步',
    sheet: sheetName,
    rows: rows.length,
    startRow: startRow
  };
}

function getEmilyCardDecks_() {
  var sheet = getEmilyCardSpreadsheet_().getSheetByName('卡片圖案連結');
  if (!sheet) throw new Error('找不到卡片圖案連結分頁');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      spreadsheetId: EMILY_CARD_SPREADSHEET_ID,
      sourceSheet: '卡片圖案連結',
      cards: [],
      oshoCards: []
    };
  }
  var values = sheet.getRange(2, 1, lastRow - 1, 4).getDisplayValues();
  var tarotCards = [];
  var oshoCards = [];
  values.forEach(function(row, index) {
    var tarotName = String(row[0] || '').trim();
    var tarotImage = String(row[1] || '').trim();
    var oshoName = String(row[2] || '').trim();
    var oshoImage = String(row[3] || '').trim();
    if (tarotName && tarotName !== '❌') {
      tarotCards.push({
        id: tarotName.replace(/^(\d+)\..*$/, '$1') || String(index + 1),
        name: tarotName,
        cardName: tarotName,
        cardLabel: tarotName,
        deck: '塔羅',
        imageUrl: tarotImage
      });
    }
    if (oshoName && oshoName !== '❌') {
      oshoCards.push({
        id: oshoName.replace(/^(\d+)\..*$/, '$1') || String(index + 1),
        name: oshoName,
        cardName: oshoName,
        cardLabel: oshoName,
        deck: '奧修禪卡',
        type: 'osho',
        imageUrl: oshoImage
      });
    }
  });
  return {
    spreadsheetId: EMILY_CARD_SPREADSHEET_ID,
    sourceSheet: '卡片圖案連結',
    tarotNameColumn: 'A',
    tarotImageColumn: 'B',
    oshoNameColumn: 'C',
    oshoImageColumn: 'D',
    cards: tarotCards,
    oshoCards: oshoCards
  };
}

var EMILY_BODY_RECORD_SHEET_NAME = '身體記錄';
var EMILY_BODY_SETTING_SHEET_NAME = '身體記錄設定';
var EMILY_JOURNAL_PASSWORD_SHEET_NAME = '心情日記密碼';
var EMILY_BODY_RECORD_COLUMNS = [
  '月份',
  '紀錄時間',
  '日期',
  '類型',
  '程度',
  '流量',
  '疼痛程度',
  '氣喘誘因',
  '是否用藥',
  '備註',
  '記錄ID',
  '來源'
];
var EMILY_BODY_SETTING_COLUMNS = ['項目', '值', '備註'];
var EMILY_JOURNAL_PASSWORD_COLUMNS = ['文章ID', '日期', '時間', '標題', '權限', '解鎖密碼', '備註', '更新時間'];

function getEmilyBodyRecordSheet_() {
  var ss = getEmilyCardSpreadsheet_();
  var sheet = ss.getSheetByName(EMILY_BODY_RECORD_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(EMILY_BODY_RECORD_SHEET_NAME);
  syncEmilyBodyRecordHeader_(sheet);
  return sheet;
}

function getEmilyBodySettingSheet_() {
  var ss = getEmilyCardSpreadsheet_();
  var sheet = ss.getSheetByName(EMILY_BODY_SETTING_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(EMILY_BODY_SETTING_SHEET_NAME);
  syncEmilyBodySettingSheet_(sheet);
  return sheet;
}

function syncEmilyBodySettingSheet_(sheet) {
  sheet.getRange(1, 1, 1, EMILY_BODY_SETTING_COLUMNS.length).setValues([EMILY_BODY_SETTING_COLUMNS]);
  sheet.getRange(1, 1, 1, EMILY_BODY_SETTING_COLUMNS.length)
    .setBackground('#67516f')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);
  if (!String(sheet.getRange(2, 1).getDisplayValue() || '').trim()) {
    sheet.getRange(2, 1, 1, 3).setValues([[
      'lockPassword',
      '',
      '身體記錄檢視密碼。可直接在這格更改；留空代表不上鎖。'
    ]]);
  }
}

function getEmilyBodyLockPassword_() {
  var sheet = getEmilyBodySettingSheet_();
  return normalizeToken_(sheet.getRange(2, 2).getDisplayValue());
}

function getEmilyBodyLockStatus_() {
  return {
    sheet: EMILY_BODY_SETTING_SHEET_NAME,
    locked: !!getEmilyBodyLockPassword_(),
    passwordSet: !!getEmilyBodyLockPassword_()
  };
}

function assertEmilyBodyUnlocked_(p) {
  var expected = getEmilyBodyLockPassword_();
  if (!expected) return { locked: false, unlocked: true };
  var supplied = normalizeToken_(p.bodyPassword || p.lockPassword || p.viewPassword);
  if (supplied !== expected) throw new Error('身體記錄已上鎖，請輸入正確的身體記錄密碼');
  return { locked: true, unlocked: true };
}

function setEmilyBodyLockPassword_(p) {
  var password = normalizeToken_(p.bodyPassword || p.lockPassword || p.viewPassword);
  if (!password) throw new Error('請輸入要設定的身體記錄密碼');
  var sheet = getEmilyBodySettingSheet_();
  sheet.getRange(2, 2).setValue(password);
  return {
    status: 'success',
    message: '身體記錄密碼已設定',
    sheet: EMILY_BODY_SETTING_SHEET_NAME,
    locked: true
  };
}

function unlockEmilyBodyRecords_(p) {
  assertEmilyBodyUnlocked_(p);
  return {
    status: 'success',
    message: '身體記錄已解鎖',
    locked: true,
    unlocked: true
  };
}

function getEmilyJournalPasswordSheet_() {
  var ss = getEmilyCardSpreadsheet_();
  var sheet = ss.getSheetByName(EMILY_JOURNAL_PASSWORD_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(EMILY_JOURNAL_PASSWORD_SHEET_NAME);
  syncEmilyJournalPasswordHeader_(sheet);
  return sheet;
}

function syncEmilyJournalPasswordHeader_(sheet) {
  sheet.getRange(1, 1, 1, EMILY_JOURNAL_PASSWORD_COLUMNS.length).setValues([EMILY_JOURNAL_PASSWORD_COLUMNS]);
  sheet.getRange(1, 1, 1, EMILY_JOURNAL_PASSWORD_COLUMNS.length)
    .setBackground('#b95074')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);
}

function saveEmilyJournalPassword_(p) {
  var entryId = String(p.entryId || p.id || '').trim();
  if (!entryId) throw new Error('缺少心情日記文章ID，無法記錄密碼');
  var visibility = String(p.visibility || 'normal').trim() === 'password' ? '上鎖' : '不上鎖';
  var password = normalizeToken_(p.password || p.entryPassword || p.unlockPassword);
  var sheet = getEmilyJournalPasswordSheet_();
  var lastRow = sheet.getLastRow();
  var targetRow = 0;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0] || '').trim() === entryId) {
        targetRow = i + 2;
        break;
      }
    }
  }
  if (!targetRow) targetRow = Math.max(lastRow + 1, 2);
  var existingPassword = targetRow <= lastRow ? normalizeToken_(sheet.getRange(targetRow, 6).getDisplayValue()) : '';
  var nextPassword = visibility === '上鎖' ? (password || existingPassword) : '';
  if (visibility === '上鎖' && !nextPassword) throw new Error('上鎖文章需要解鎖密碼，才能寫入心情日記密碼分頁');
  sheet.getRange(targetRow, 1, 1, EMILY_JOURNAL_PASSWORD_COLUMNS.length).setValues([[
    entryId,
    String(p.date || '').trim(),
    String(p.time || '').trim(),
    String(p.title || '').trim(),
    visibility,
    nextPassword,
    visibility === '上鎖' ? '可在這裡找回或直接更改解鎖密碼。' : '不上鎖文章不需要密碼。',
    new Date()
  ]]);
  return {
    status: 'success',
    message: '心情日記密碼已同步',
    sheet: EMILY_JOURNAL_PASSWORD_SHEET_NAME,
    entryId: entryId,
    visibility: visibility
  };
}

function syncEmilyBodyRecordHeader_(sheet) {
  sheet.getRange(1, 1, 1, EMILY_BODY_RECORD_COLUMNS.length).setValues([EMILY_BODY_RECORD_COLUMNS]);
  sheet.getRange(1, 1, 1, EMILY_BODY_RECORD_COLUMNS.length)
    .setBackground('#a45c73')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);
  sheet.getRange(2, 4, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['月經', '氣喘'], true).build()
  );
  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['輕微', '中等', '嚴重'], true).build()
  );
  sheet.getRange(2, 6, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['少', '中', '多'], true).build()
  );
  sheet.getRange(2, 8, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['天氣', '灰塵', '自律神經', '腸胃', '嗆到', '運動', '不確定'], true).build()
  );
  sheet.getRange(2, 9, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['是', '否'], true).build()
  );
}

function normalizeEmilyBodyType_(value) {
  var raw = String(value || '').trim();
  if (raw === 'period') return '月經';
  if (raw === 'asthma') return '氣喘';
  return raw === '氣喘' ? '氣喘' : '月經';
}

function getEmilyBodyRecords_(p) {
  var lock = assertEmilyBodyUnlocked_(p);
  var sheet = getEmilyBodyRecordSheet_();
  var year = String(p.year || '').trim();
  var month = String(p.month || '').trim().padStart(2, '0');
  var ym = String(p.ym || (year && month ? year + '-' + month : '')).trim();
  if (!ym) ym = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  var lastRow = sheet.getLastRow();
  var records = [];
  if (lastRow >= 2) {
    var values = sheet.getRange(2, 1, lastRow - 1, EMILY_BODY_RECORD_COLUMNS.length).getDisplayValues();
    values.forEach(function(row) {
      if (!row[10] || row[0] !== ym) return;
      records.push({
        month: row[0],
        recordedAt: row[1],
        date: row[2],
        type: row[3],
        severity: row[4],
        flow: row[5],
        painLevel: row[6],
        asthmaTrigger: row[7],
        medicineUsed: row[8],
        notes: row[9],
        id: row[10],
        source: row[11]
      });
    });
  }
  records.sort(function(a, b) {
    return String(a.date).localeCompare(String(b.date)) || String(a.recordedAt).localeCompare(String(b.recordedAt));
  });
  return {
    spreadsheetId: EMILY_CARD_SPREADSHEET_ID,
    sheet: EMILY_BODY_RECORD_SHEET_NAME,
    locked: lock.locked,
    unlocked: lock.unlocked,
    ym: ym,
    records: records
  };
}

function writeEmilyBodyRecord_(p) {
  var sheet = getEmilyBodyRecordSheet_();
  var date = String(p.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('日期格式不正確');
  var now = new Date();
  var time = String(p.time || '').trim() || Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm');
  var id = String(p.id || '').trim() || ('body-' + date.replace(/-/g, '') + '-' + Utilities.getUuid().slice(0, 8));
  var row = [
    date.slice(0, 7),
    date + ' ' + time,
    date,
    normalizeEmilyBodyType_(p.type),
    String(p.severity || '').trim(),
    String(p.flow || '').trim(),
    String(p.painLevel || '').trim(),
    String(p.asthmaTrigger || '').trim(),
    String(p.medicineUsed || '').trim(),
    String(p.notes || '').trim(),
    id,
    String(p.source || 'EmilyHome').trim()
  ];
  var startRow = getNextMedicalAppendRowByColumn_(sheet, 1);
  sheet.getRange(startRow, 1, 1, EMILY_BODY_RECORD_COLUMNS.length).setValues([row]);
  sheet.getRange(startRow, 1, 1, EMILY_BODY_RECORD_COLUMNS.length).setVerticalAlignment('middle').setWrap(true);
  return {
    status: 'success',
    message: '身體記錄已新增',
    sheet: EMILY_BODY_RECORD_SHEET_NAME,
    row: startRow,
    record: {
      id: id,
      month: row[0],
      recordedAt: row[1],
      date: row[2],
      type: row[3],
      severity: row[4],
      flow: row[5],
      painLevel: row[6],
      asthmaTrigger: row[7],
      medicineUsed: row[8],
      notes: row[9],
      source: row[11]
    }
  };
}

function deleteEmilyBodyRecord_(p) {
  var id = String(p.id || '').trim();
  if (!id) throw new Error('缺少記錄ID');
  var sheet = getEmilyBodyRecordSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('找不到身體記錄');
  var ids = sheet.getRange(2, 11, lastRow - 1, 1).getDisplayValues();
  for (var index = 0; index < ids.length; index += 1) {
    if (String(ids[index][0] || '').trim() === id) {
      sheet.deleteRow(index + 2);
      syncEmilyBodyRecordHeader_(sheet);
      return {
        status: 'success',
        message: '身體記錄已刪除',
        deletedId: id
      };
    }
  }
  throw new Error('找不到身體記錄：' + id);
}

function syncEmilyCardRecordHeader_(sheet) {
  var isOsho = sheet.getName() === '奧修禪卡記錄';
  var spreadOptions = isOsho ? ['奧修單張'] : ['塔羅單張', '塔羅三張'];
  var positionOptions = isOsho ? ['奧修單張'] : ['塔羅單張', '過去', '現在', '未來'];
  var deckOptions = isOsho ? ['奧修禪卡'] : ['塔羅'];
  var orientationOptions = isOsho ? ['❌'] : ['正位', '逆位', '❌'];
  sheet.getRange(1, 1, 1, MEDICAL_CARD_STATS_COLUMNS.length).setValues([MEDICAL_CARD_STATS_COLUMNS]);
  sheet.getRange(1, 1, 1, MEDICAL_CARD_STATS_COLUMNS.length)
    .setBackground(isOsho ? '#63518c' : '#285f7a')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);
  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(spreadOptions, true).build()
  );
  sheet.getRange(2, 7, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(positionOptions, true).build()
  );
  sheet.getRange(2, 8, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(deckOptions, true).build()
  );
  sheet.getRange(2, 11, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(orientationOptions, true).build()
  );
}

function buildEmilyTarotCardRows_(body) {
  var date = String(body.date || '').trim();
  if (!date) return [];
  var time = String(body.time || '').trim();
  var recordTime = (date + ' ' + time).trim();
  var month = date.slice(0, 7);
  var spreadType = String(body.spreadType || (body.drawType === 'three' ? '塔羅三張' : '塔羅單張')).trim() || '塔羅單張';
  var drawGroupId = String(body.drawGroupId || body.draw_group_id || makeMedicalDrawGroupId_(date, time)).trim();
  var topic = String(body.cardQuestion || body.question || body.keywords || '').trim();
  var notes = String(body.cardReading || body.reading || body.notes || '').trim();
  var rows = [];
  normalizeMedicalCards_(body).forEach(function(card) {
    if (!isRealMedicalCard_(card.cardName) && !isRealMedicalCard_(card.cardLabel) && !isRealMedicalCard_(card.displayName)) return;
    rows.push([
      month,
      recordTime,
      date,
      drawGroupId,
      spreadType,
      card.positionIndex || rows.length + 1,
      card.positionName || (spreadType === '塔羅三張' ? '第' + (rows.length + 1) + '張' : '塔羅單張'),
      '塔羅',
      card.cardId || '',
      card.cardName || splitMedicalCardLabel_(card.cardLabel || card.displayName).name,
      card.orientation || '❌',
      card.displayName || formatMedicalCardDisplay_(card.cardName || card.cardLabel, card.orientation),
      topic,
      notes
    ]);
  });
  return rows;
}

function buildEmilyOshoCardRows_(body) {
  var date = String(body.date || '').trim();
  if (!date) return [];
  var time = String(body.time || '').trim();
  var recordTime = (date + ' ' + time).trim();
  var month = date.slice(0, 7);
  var drawGroupId = String(body.drawGroupId || body.draw_group_id || makeMedicalDrawGroupId_(date, time)).trim();
  var topic = String(body.cardQuestion || body.question || body.keywords || '').trim();
  var notes = String(body.cardReading || body.reading || body.notes || '').trim();
  var cards = normalizeMedicalCards_(body);
  var card = cards[0] || {};
  var name = card.cardName || splitMedicalCardLabel_(card.cardLabel || card.displayName).name;
  if (!isRealMedicalCard_(name)) return [];
  return [[
    month,
    recordTime,
    date,
    drawGroupId,
    '奧修單張',
    1,
    '奧修單張',
    '奧修禪卡',
    card.cardId || '',
    name,
    '❌',
    card.displayName || name,
    topic,
    notes
  ]];
}

function formatMedicalRecordTime_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  }
  return String(value || '').trim();
}

function syncMedicalRecordHeader_(sheet) {
  sheet.getRange(1, 1, 1, MEDICAL_RECORD_COLUMNS.length).setValues([MEDICAL_RECORD_COLUMNS]);
}

function getMedicalSettingOptions_(ss) {
  var empty = { emotions: [], causes: [], meds: [], painAreas: [], tarots: [], positions: [], oracles: [], keywords: [], cardImages: {}, oracleImages: {} };
  var sheet = ss.getSheetByName(MEDICAL_SETTING_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return empty;

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).getDisplayValues();
  var values = [[], [], [], [], [], [], [], []];
  var seen = [{}, {}, {}, {}, {}, {}, {}, {}];
  var indexes = [0, 1, 2, 3, 7, 8, 9, 10];
  rows.forEach(function(row) {
    indexes.forEach(function(sourceIndex, targetIndex) {
      var value = cleanMedicalOption_(row[sourceIndex]);
      if (!value || seen[targetIndex][value]) return;
      seen[targetIndex][value] = true;
      values[targetIndex].push(value);
    });
  });

  var cardImages = {};
  var oracleImages = {};
  var imgSheet = ss.getSheetByName('卡片圖案連結');
  if (imgSheet && imgSheet.getLastRow() >= 2) {
    imgSheet.getRange(2, 1, imgSheet.getLastRow() - 1, 4).getDisplayValues().forEach(function(row) {
      var tarotName = cleanMedicalOption_(row[0]);
      var tarotUrl = String(row[1] || '').trim();
      var oracleName = cleanMedicalOption_(row[2]);
      var oracleUrl = String(row[3] || '').trim();
      if (tarotName && tarotUrl) cardImages[tarotName] = tarotUrl;
      if (oracleName && oracleUrl) oracleImages[oracleName] = oracleUrl;
    });
  }

  return {
    emotions: values[0],
    causes: values[1],
    meds: values[2],
    painAreas: values[3],
    tarots: values[4],
    positions: values[5],
    oracles: values[6],
    keywords: values[7],
    cardImages: cardImages,
    oracleImages: oracleImages
  };
}

function getMedicalStatsMonthsLimit_(p) {
  var raw = p && (p.monthsLimit || p.monthLimit || p.limitMonths);
  var limit = Number(raw || 12);
  if (!isFinite(limit) || limit <= 0) limit = 12;
  return Math.max(1, Math.min(60, Math.floor(limit)));
}

function mapMedicalStatsRows_(rows, columns) {
  return rows.map(function(row) {
    var item = {};
    var values = Array.isArray(row) ? row : row.values;
    columns.forEach(function(key, index) {
      item[key] = String(values[index] || '').trim();
    });
    if (!Array.isArray(row) && row.rowNumber) item._row = row.rowNumber;
    return item;
  });
}

function readMedicalStatsSheet_(sheet, columns, options) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var monthsLimit = Number(options && options.monthsLimit || 0);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  if (monthsLimit > 0) {
    var rows = [];
    var months = {};
    var monthCount = 0;
    var cursor = lastRow;
    var batchSize = 200;
    while (cursor >= 2) {
      var rowCount = Math.min(batchSize, cursor - 1);
      var firstRow = cursor - rowCount + 1;
      var batch = sheet.getRange(firstRow, 1, rowCount, columns.length).getDisplayValues();
      for (var i = batch.length - 1; i >= 0; i--) {
        var row = batch[i];
        var month = String(row[0] || '').trim();
        if (!month) continue;
        if (!months[month]) {
          if (monthCount >= monthsLimit) return mapMedicalStatsRows_(rows, columns);
          months[month] = true;
          monthCount++;
        }
        rows.unshift({ values: row, rowNumber: firstRow + i + 1 });
      }
      cursor = firstRow - 1;
    }
    return mapMedicalStatsRows_(rows, columns);
  }
  var allRows = sheet.getRange(2, 1, lastRow - 1, columns.length).getDisplayValues()
    .map(function(row, index) { return { values: row, rowNumber: index + 2 }; })
    .filter(function(row) { return String(row.values[0] || '').trim(); });
  return mapMedicalStatsRows_(allRows, columns);
}

function updateMedicalCardStats_(p) {
  var sheetName = String(p && p.sheet || '').trim();
  var columns = sheetName === MEDICAL_OSHO_STATS_SHEET_NAME
    ? MEDICAL_OSHO_STATS_COLUMNS
    : (sheetName === MEDICAL_CARD_STATS_SHEET_NAME ? MEDICAL_CARD_STATS_COLUMNS : null);
  if (!columns) throw new Error('不允許更新此牌卡分頁');
  var entries = Array.isArray(p.rows) ? p.rows : [];
  if (!entries.length) throw new Error('缺少要更新的牌卡記錄');
  var sheet = getMedicalSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('找不到牌卡分頁：' + sheetName);
  var width = columns.length;
  entries.forEach(function(entry) {
    var rowNumber = Number(entry && entry.row);
    if (!isFinite(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) throw new Error('牌卡記錄列號不正確');
    var old = sheet.getRange(rowNumber, 1, 1, width).getDisplayValues()[0];
    var date = String(entry.date || old[2] || '').trim();
    var time = String(entry.time || '').trim();
    if (!time) time = String(old[1] || '').trim().slice(11);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('日期格式不正確');
    old[0] = date.slice(0, 7);
    old[1] = (date + ' ' + time).trim();
    old[2] = date;
    if (sheetName === MEDICAL_CARD_STATS_SHEET_NAME) {
      if (entry.spreadType !== undefined) old[4] = String(entry.spreadType || '').trim();
      if (entry.positionIndex !== undefined) old[5] = String(entry.positionIndex || '').trim();
      if (entry.positionName !== undefined) old[6] = String(entry.positionName || '').trim();
      if (entry.cardId !== undefined) old[8] = String(entry.cardId || '').trim();
      if (entry.cardName !== undefined) old[9] = String(entry.cardName || '').trim();
      if (entry.orientation !== undefined) old[10] = String(entry.orientation || '').trim() || '❌';
      if (entry.displayName !== undefined) old[11] = String(entry.displayName || '').trim();
      if (entry.topic !== undefined) old[12] = String(entry.topic || '').trim();
      if (entry.notes !== undefined) old[13] = String(entry.notes || '').trim();
    } else {
      if (entry.cardId !== undefined) old[4] = String(entry.cardId || '').trim();
      if (entry.cardName !== undefined) old[5] = String(entry.cardName || '').trim();
      if (entry.displayName !== undefined) old[6] = String(entry.displayName || '').trim();
      if (entry.topic !== undefined) old[7] = String(entry.topic || '').trim();
      if (entry.notes !== undefined) old[8] = String(entry.notes || '').trim();
    }
    sheet.getRange(rowNumber, 1, 1, width).setValues([old]);
  });
  return { status: 'success', message: '牌卡記錄已更新', sheet: sheetName, rows: entries.length };
}

function getLastMedicalDataRowByColumn_(sheet, column) {
  var values = sheet.getRange(1, column, sheet.getMaxRows(), 1).getDisplayValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0] || '').trim()) return i + 1;
  }
  return 1;
}

function getNextMedicalAppendRowByColumn_(sheet, column) {
  return Math.max(2, getLastMedicalDataRowByColumn_(sheet, column) + 1);
}

function cleanMedicalOption_(value) {
  return String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/彩虹之么/g, '彩虹之1')
    .trim();
}

function findMedicalRowByDate_(sheet, dateKey) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (formatMedicalRecordTime_(data[i][0]).slice(0, 10) === dateKey) return i + 1;
  }
  return -1;
}

function buildMedicalRecordRow_(body) {
  var recordTime = (String(body.date || '').trim() + ' ' + String(body.time || '').trim()).trim();
  var painLevel = (body.painLevel !== undefined && body.painLevel !== null && body.painLevel !== '') ? body.painLevel : '';
  return [
    recordTime,
    body.emotion || '',
    normalizeMedicalList_(body.causes),
    normalizeMedicalList_(body.meds),
    body.medDose || '',
    normalizeMedicalList_(body.painAreas),
    painLevel,
    '',
    body.notes || ''
  ];
}

function appendMedicalCardStats_(ss, body) {
  var rows = buildMedicalCardStatsRows_(body);
  if (!rows.length) return 0;
  var sheet = ss.getSheetByName(MEDICAL_CARD_STATS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(MEDICAL_CARD_STATS_SHEET_NAME);
  syncMedicalCardStatsHeader_(sheet);
  var startRow = getNextMedicalAppendRowByColumn_(sheet, 1);
  sheet.getRange(startRow, 1, rows.length, MEDICAL_CARD_STATS_COLUMNS.length).setValues(rows);
  sheet.getRange(startRow, 1, rows.length, MEDICAL_CARD_STATS_COLUMNS.length).setVerticalAlignment('middle').setWrap(true);
  return rows.length;
}

function appendMedicalOshoStats_(ss, body) {
  var rows = buildMedicalOshoStatsRows_(body);
  if (!rows.length) return 0;
  var sheet = ss.getSheetByName(MEDICAL_OSHO_STATS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(MEDICAL_OSHO_STATS_SHEET_NAME);
  syncMedicalOshoStatsHeader_(sheet);
  var startRow = getNextMedicalAppendRowByColumn_(sheet, 1);
  sheet.getRange(startRow, 1, rows.length, MEDICAL_OSHO_STATS_COLUMNS.length).setValues(rows);
  sheet.getRange(startRow, 1, rows.length, MEDICAL_OSHO_STATS_COLUMNS.length).setVerticalAlignment('middle').setWrap(true);
  return rows.length;
}

function syncMedicalCardStatsHeader_(sheet) {
  sheet.getRange(1, 1, 1, MEDICAL_CARD_STATS_COLUMNS.length).setValues([MEDICAL_CARD_STATS_COLUMNS]);
  sheet.getRange(1, 1, 1, MEDICAL_CARD_STATS_COLUMNS.length)
    .setBackground('#285f7a')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);
}

function syncMedicalOshoStatsHeader_(sheet) {
  sheet.getRange(1, 1, 1, MEDICAL_OSHO_STATS_COLUMNS.length).setValues([MEDICAL_OSHO_STATS_COLUMNS]);
  sheet.getRange(1, 1, 1, MEDICAL_OSHO_STATS_COLUMNS.length)
    .setBackground('#5f4c86')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setFrozenRows(1);
}

function buildMedicalCardStatsRows_(body) {
  var date = String(body.date || '').trim();
  if (!date) return [];
  var time = String(body.time || '').trim();
  var recordTime = (date + ' ' + time).trim();
  var month = date.slice(0, 7);
  var spreadType = String(body.spreadType || (body.drawType === 'three' ? '三張' : '單張')).trim() || '單張';
  var drawGroupId = String(body.drawGroupId || body.draw_group_id || makeMedicalDrawGroupId_(date, time)).trim();
  var topic = normalizeMedicalList_(body.keywords);
  var notes = String(body.tarotNotes || body.notes || '').trim();
  var rows = [];
  normalizeMedicalCards_(body).forEach(function(card) {
    if (!isRealMedicalCard_(card.cardName) && !isRealMedicalCard_(card.cardLabel) && !isRealMedicalCard_(card.displayName)) return;
    rows.push([
      month,
      recordTime,
      date,
      drawGroupId,
      spreadType,
      card.positionIndex || rows.length + 1,
      card.positionName || (spreadType === '三張' ? '第' + (rows.length + 1) + '張' : '單張'),
      card.deck || '塔羅',
      card.cardId || '',
      card.cardName || splitMedicalCardLabel_(card.cardLabel || card.displayName).name,
      card.orientation || '❌',
      card.displayName || formatMedicalCardDisplay_(card.cardName || card.cardLabel, card.orientation),
      topic,
      notes
    ]);
  });
  return rows;
}

function buildMedicalOshoStatsRows_(body) {
  var date = String(body.date || '').trim();
  var oracle = cleanMedicalOption_(body.oracle);
  if (!date || !isRealMedicalCard_(oracle)) return [];
  var time = String(body.time || '').trim();
  var recordTime = (date + ' ' + time).trim();
  var month = date.slice(0, 7);
  var drawGroupId = String(body.drawGroupId || body.draw_group_id || makeMedicalDrawGroupId_(date, time)).trim();
  var topic = normalizeMedicalList_(body.keywords);
  var notes = String(body.tarotNotes || body.notes || '').trim();
  var oracleInfo = splitMedicalCardLabel_(oracle);
  return [[
    month,
    recordTime,
    date,
    drawGroupId,
    oracleInfo.id,
    oracleInfo.name,
    oracleInfo.name,
    topic,
    notes
  ]];
}

function normalizeMedicalCards_(body) {
  if (Array.isArray(body.cards)) {
    return body.cards.map(function(card, index) {
      var label = card.cardLabel || card.cardName || card.displayName || '';
      var info = splitMedicalCardLabel_(label);
      var orientation = String(card.orientation || card.position || '❌').trim() || '❌';
      var name = cleanMedicalOption_(card.cardName || info.name);
      return {
        positionIndex: Number(card.positionIndex || index + 1),
        positionName: String(card.positionName || '').trim(),
        deck: String(card.deck || '塔羅').trim(),
        cardId: String(card.cardId || info.id || '').trim(),
        cardName: name,
        cardLabel: cleanMedicalOption_(label),
        orientation: orientation,
        displayName: cleanMedicalOption_(card.displayName || formatMedicalCardDisplay_(name, orientation))
      };
    });
  }
  var tarot = cleanMedicalOption_(body.tarot);
  if (!isRealMedicalCard_(tarot)) return [];
  var info = splitMedicalCardLabel_(tarot);
  var orientation = String(body.tarotPosition || body.position || '❌').trim() || '❌';
  return [{
    positionIndex: 1,
    positionName: '單張',
    deck: '塔羅',
    cardId: info.id,
    cardName: info.name,
    cardLabel: tarot,
    orientation: orientation,
    displayName: formatMedicalCardDisplay_(info.name, orientation)
  }];
}

function splitMedicalCardLabel_(label) {
  var cleaned = cleanMedicalOption_(label);
  var match = cleaned.match(/^(\d+)\.(.+)$/);
  return {
    id: match ? match[1] : '',
    name: match ? match[2].trim() : cleaned
  };
}

function formatMedicalCardDisplay_(cardName, orientation) {
  var name = splitMedicalCardLabel_(cardName).name;
  var pos = String(orientation || '❌').trim();
  if (!isRealMedicalCard_(name)) return '未抽取';
  return pos && pos !== '❌' && pos !== '三張' ? name + pos : name;
}

function isRealMedicalCard_(value) {
  var text = cleanMedicalOption_(value);
  return !!text && text !== '未抽取' && text !== '❌';
}

function makeMedicalDrawGroupId_(date, time) {
  var stamp = (date + '-' + (time || '0000')).replace(/[^0-9]/g, '');
  return 'DRAW-' + stamp + '-' + Utilities.getUuid().slice(0, 8);
}

function normalizeMedicalList_(value) {
  if (Array.isArray(value)) return value.filter(String).join('、');
  return String(value || '').trim();
}

function mergeMedicalRow_(oldRow, newRow) {
  return newRow.map(function(value, index) {
    var isBlank = value === '' || value === null || value === undefined;
    return isBlank ? (oldRow[index] || '') : value;
  });
}
