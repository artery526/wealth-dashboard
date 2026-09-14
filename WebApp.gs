// ============================================================
//  糧草大本營 — Web App API  (WebApp.gs)
//  部署為 Apps Script Web App 後供前端呼叫
//  ⚠️ 執行身分：「我」  存取權：「所有人」
// ============================================================

// ── ★ 記帳密鑰設定 ★ ───────────────────────────────────────
// WRITE_TOKEN 只允許存放於 Apps Script 的 Script Properties。
// 不在原始碼保留備援值，避免設定遺漏時誤用硬編碼密鑰。
var COMMAND_SPREADSHEET_ID = '1MTPLhPA9j4kb2pllDDL1z7xaCD1UmIZutT0eVOHZd30';
var EXTERNAL_DB_SPREADSHEET_ID = '1BPnjwZKlBmxMkHmLDk6MSV28kfcAtQhGuZdufv5T7FY';
var LEGACY_FINANCE_SPREADSHEET_ID = '1xtqOgRRTR6y-KWLjLHk7TFT7EKZpNLU2HSYTr-HhWcc';
var LEGACY_FINANCE_LEDGER_SHEET = '交易流水_標準化';
var ETF_TAX_SPREADSHEET_ID = '1LQ2ZiWftOOXhv58t06E5qNEXRb20o-Zu8hXQ3zff-Hk';
var ZIWEI_SPREADSHEET_ID = '1Z8cW96qqk5J7LL0mGg12GxmdZc_5elwDe4rEcGq-P-M';
var MEDICAL_SPREADSHEET_ID = '1Z8cW96qqk5J7LL0mGg12GxmdZc_5elwDe4rEcGq-P-M';
var EMILY_CARD_SPREADSHEET_ID = '1GQBYT2jcNa9D6G39tntT5UfetXpgwfKYZ2h5fSy3bV8';
var STORE_SPREADSHEET_ID = '1rWZeSuGDaKkV9A1pICABErN2wYGvh4KjnFEgawzNhJA';
var STORE_SHEET_NAME = 'Store';
var STORE_HEADERS = ['物品名稱', '所在地點', '編號', '說明', '記錄時間'];
var STORE_RECORDS_CACHE_KEY = 'store_records_v1';
var STORE_RECORDS_CACHE_SECONDS = 300;
var ZIWEI_SHEET_NAME = '紫微星盤';
var ZIWEI_HEADERS = ['啟用', '名稱', '出生年月日', '出生時辰', '性別', '雲端硬碟檔案ID', '圖片連結', '備註', '更新時間'];
var ARKOS_ASTROLOGY_API_BASE = 'https://api.ark-os26.cc';
var ARKOS_FINANCE_SNAPSHOT_PATH = '/api/finance/battle-brief-snapshots';
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
var MOON_BILLS_START_ROW   = 5;  // B5:E8
var MOON_BILLS_RESERVE_COL = 2;  // B
var MOON_BILLS_AMOUNT_COL  = 5;  // E
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
var RECENT_TRANSACTION_RETENTION_DAYS = 14;
var DAILY_ASSET_SNAPSHOT_SHEET = '每日資產快照';
var DAILY_ASSET_SNAPSHOT_HEADERS = ['日期', '投資市值', '總投資成本', '含息報酬', '月總配息', '備註', '市場曝險', '負債／淨資產比（歷史欄位）', '總資產'];
var DAILY_ASSET_SNAPSHOT_MARKET_CELL = 'I2';
var DAILY_ASSET_SNAPSHOT_TOTAL_ASSET_CELL = 'H2';
var DAILY_ASSET_SNAPSHOT_EXPOSURE_CELL = 'H2';
var DAILY_ASSET_SNAPSHOT_CASH_CELL = 'H5';
var DAILY_ASSET_SNAPSHOT_DEBT_DASHBOARD_CELL = 'J19';
var DAILY_ADVISOR_REMINDER_SHEET = '每日軍師提醒';
var DAILY_ADVISOR_REMINDER_HEADERS = ['日期', '提醒內容', '字數', '產生方式', '建立時間'];
var MACRO_LONG_REPORT_SHEET = '總經長期報告';
var MACRO_LONG_REPORT_HEADERS = ['報告ID', '開始日期', '結束日期', '天數', '結論', '燈號', '分數', '摘要', '主要趨勢', '風險項目', '有利項目', '投資策略', '下期觀察', '資料筆數', '重要變化次數', '產生方式', '建立時間'];
var TAIWAN_STOCK_REVIEW_SHEET = '台股總經月評';
var TAIWAN_STOCK_REVIEW_HEADERS = ['報告ID', '月份', '資料月份', '產生時間', '模型', '判斷信心', '景氣方向', '目前實體經濟', '金融環境', '交叉驗證', '景氣階段', '階段理由', '台股總經環境', 'GPT軍師月評', '下月觀察', '資料尚未公布', '資料快照'];
var TAIWAN_MACRO_SHEET = '台灣總體經濟';
var TAIWAN_MACRO_TRIGGER_MIGRATION_PROPERTY = 'TAIWAN_MACRO_MONTHLY_TRIGGER_V2';
var TAIWAN_MACRO_INITIAL_REFRESH_PROPERTY = 'TAIWAN_MACRO_INITIAL_REFRESH_V4';
var TAIWAN_MACRO_HEADERS = [
  'month', 'business_cycle_score', 'business_cycle_light',
  'leading_index', 'leading_index_without_trend',
  'exports_value', 'exports_yoy', 'export_orders_value', 'export_orders_yoy',
  'industrial_production_index', 'industrial_production_yoy',
  'usdtwd', 'usdtwd_3m_change', 'usdtwd_trend', 'm2_yoy',
  'overall_state', 'updated_at',
  'source_ndc', 'source_customs', 'source_moea_orders',
  'source_moea_industrial', 'source_cbc_fx', 'source_cbc_m2',
  'pmi', 'source_pmi'
];
var TAIWAN_MACRO_NDC_DATASET_ID = 6099;
var TAIWAN_MACRO_CUSTOMS_DATASET_ID = 6053;
var TAIWAN_MACRO_INDUSTRIAL_DATASET_ID = 6607;
var TAIWAN_MACRO_MOEA_ORDER_URL = 'https://service.moea.gov.tw/EE520/opendata/b.csv';
var TAIWAN_MACRO_MOEA_INDUSTRIAL_URL = 'https://service.moea.gov.tw/EE521/common/Common.aspx?code=D&no=1';
var TAIWAN_MACRO_CBC_FX_INDEX_URL = 'https://www.cbc.gov.tw/tw/lp-863-1.html';
var TAIWAN_MACRO_CBC_M2_URL = 'https://www.cbc.gov.tw/tw/lp-643-1.html';
var TAIWAN_MACRO_PMI_SOURCE_URL = 'https://index.ndc.gov.tw/n/zh_tw/PMI';
var TAIWAN_MACRO_PMI_PAGE_URL = 'https://www.cier.edu.tw/en/eco_cat/pmi-en/';
var TAIWAN_MACRO_PMI_XLSX_FALLBACK_URL = 'https://www.cier.edu.tw/wp-content/uploads/2026/08/PMI-Historical-Data-Seasonally-Adjusted.xlsx';
// Keep cpiMoM in its legacy column so existing rows do not shift.
var MACRO_DATA_HEADERS = ['日期', 'yield10y', 'oil', 'cpi', 'ppi', 'unemployment', 'vix', 'dxy', 'creditSpread', 'consumerSentiment', '資料來源', '更新時間', 'joltsOpenings', 'adpEmploymentChange', 'nfpPayrollChange', 'cpiMoM', 'yield2y', 'fedBalance', 'rrp', 'm2', 'liquidityScore', 'sofrIorbSpread', 'bankReserves', 'bankReservesChange', '台股融資資料日', '台股融資餘額', '台股融資餘額增減', '台股維持率', '台股維持率增減', 'importance_score', 'importance_level', 'important_changes', '外資台指期淨空單'];
var MACRO_JOLTS_OPENINGS_COL = MACRO_DATA_HEADERS.indexOf('joltsOpenings') + 1;
var MACRO_INTEGER_INDICATORS = ['joltsOpenings', 'adpEmploymentChange', 'nfpPayrollChange', 'liquidityScore', '台股融資餘額', '台股融資餘額增減', 'importance_score', '外資台指期淨空單'];
var MACRO_DECIMAL_INDICATORS = ['yield10y', 'yield2y', 'oil', 'cpi', 'cpiMoM', 'ppi', 'unemployment', 'vix', 'dxy', 'creditSpread', 'consumerSentiment', 'fedBalance', 'rrp', 'm2', 'sofrIorbSpread', 'bankReserves', 'bankReservesChange', '台股維持率', '台股維持率增減'];
var MACRO_IMPORTANCE_MIN_SCORE = 70;
var MARKET_DASHBOARD_SHEET = '市場儀表板';
var BATTLE_BRIEF_SHEET = '戰情總匯報';
var BATTLE_BRIEF_HEADERS = ['日期', '類別', '代號', '名稱', '今日值', '昨日值', '增減', '增減%', '資料時間', '資料來源', '備註', '建立時間'];
// 持股股價改由 Yahoo Finance 歷史資料提供 3M／6M／12M 比較，不再寫入每日快照。
var BATTLE_BRIEF_SNAPSHOT_EXCLUDED_CATEGORIES = ['持股股價'];
// 戰情總匯報不再累積 Google Sheet 快照；基金只保留最新一筆比較基準。
var BATTLE_BRIEF_LATEST_STATE_PROPERTY = 'BATTLE_BRIEF_LATEST_STATE_V1';
var BATTLE_BRIEF_RETENTION_DAYS = 0;
  var TWSE_MARGIN_LIVE_CACHE_KEY = 'twse_margin_live_v2';
  var TWSE_MARGIN_LIVE_CACHE_SECONDS = 300;
  var BATTLE_BRIEF_PREVIOUS_CLOSE_CACHE_PREFIX = 'battle_brief_previous_close_v1_';
  var BATTLE_BRIEF_PREVIOUS_CLOSE_CACHE_SECONDS = 300;
var BATTLE_PRICE_HISTORY_CACHE_PREFIX = 'battle_price_history_v4_';
var BATTLE_PRICE_HISTORY_CACHE_SECONDS = 21600;
var BATTLE_BRIEF_FUND_SYMBOLS = ['路博邁台灣5G', '國泰高股息B', '施羅德收益成長A2'];
var LEDGER_REQUEST_ID_COLUMN = 17;
var LEDGER_REQUEST_ID_HEADER = '請求ID';
var ETF_HOLDINGS_SPREADSHEET_ID = '1WMlDoVJlcPkrl8QKpRr7u0RGPPB5GxQiPjBmLfnqSWU';
var ETF_HOLDING_TARGET_CODE = '00997A';
var ETF_HOLDING_TARGET_NAME = '主動群益美國增長';
var ETF_HOLDING_OFFICIAL_URL = 'https://www.capitalfund.com.tw/etf/product/detail/502/portfolio';
var ETF_HOLDING_TRACKER_URL = 'https://lighto-tracker.onrender.com/popostock/api/tracker';
var ETF_HOLDING_SNAPSHOT_SHEET = '00997A持股快照';
var ETF_HOLDING_CHANGE_SHEET = '00997A每日異動';
var ETF_HOLDING_SNAPSHOT_HEADERS = ['資料日', '抓取時間', '標的代號', '標的名稱', '股票代號', '股票名稱', '股數', '權重%', '資料來源', '來源URL'];
var ETF_HOLDING_CHANGE_HEADERS = ['日期', '標的代號', '本次資料日', '比較資料日', '新增標的', '移除標的', '加碼前五', '減碼前五', '主要類股/主題', 'DeepSeek評論', '股票持股合計%', '建立時間', '來源URL'];
var MARKET_DASHBOARD_INSTRUMENTS = [
  { row: 2, code: 'NASDAQ:QQQ', symbol: 'QQQ', name: '納斯達克100 ETF', note: '核心科技風向；20MA向上且站上均線偏多' },
  { row: 3, code: 'NYSEARCA:SPY', symbol: 'SPY', name: '標普500 ETF', note: '大盤廣度參考；用來確認 QQQ 訊號' },
  { row: 4, code: 'NYSEARCA:GLD', symbol: 'GLD', name: '黃金指數代理 ETF', note: '黃金風向參考；GLD 追蹤黃金現貨價格，適合作為市場避險情緒觀察' },
  { row: 5, code: 'CURRENCY:BTCUSD', symbol: 'BTC-USD', name: '比特幣指數', note: 'BTC/USD 風險胃納參考；站上20MA且20MA向上偏多，跌破20MA偏防守' },
  { row: 6, code: 'NASDAQ:PLTR', symbol: 'PLTR', name: 'Palantir Technologies', note: '高波動成長股觀察；搭配 QQQ/SOXX 判斷科技風險胃納' },
  { row: 7, code: 'NASDAQ:SOXX', symbol: 'SOXX', name: '半導體 ETF', note: '半導體景氣風向；用來觀察 AI/晶片族群強弱' },
  { row: 11, code: '^TWII', symbol: '^TWII', name: '🇹🇼 台灣加權指數', note: 'Yahoo Finance 台股加權指數；融資餘額與維持率由 TWSE 補充' }
];
// 產業輪動雷達：FMP 提供產業日變化，Yahoo 提供各產業 ETF 的歷史 OHLCV 備援與多週期計算。
var MARKET_SECTOR_INSTRUMENTS = [
  { code: 'SOXX', symbol: 'SOXX', name: '半導體', fmpSector: '' },
  { code: 'IGV', symbol: 'IGV', name: '軟體／AI應用', fmpSector: '' },
  { code: 'XLK', symbol: 'XLK', name: '科技', fmpSector: 'technology' },
  { code: 'XLF', symbol: 'XLF', name: '金融', fmpSector: 'financial services' },
  { code: 'XLV', symbol: 'XLV', name: '醫療', fmpSector: 'healthcare' },
  { code: 'XLI', symbol: 'XLI', name: '工業', fmpSector: 'industrials' },
  { code: 'XLE', symbol: 'XLE', name: '能源', fmpSector: 'energy' },
  { code: 'XLB', symbol: 'XLB', name: '原物料', fmpSector: 'basic materials' },
  { code: 'XLU', symbol: 'XLU', name: '公用事業', fmpSector: 'utilities' },
  { code: 'XLP', symbol: 'XLP', name: '必需消費', fmpSector: 'consumer defensive' },
  { code: 'XLY', symbol: 'XLY', name: '非必需消費', fmpSector: 'consumer cyclical' },
  { code: 'XLRE', symbol: 'XLRE', name: '房地產 REIT', fmpSector: 'real estate' },
  { code: 'GLD', symbol: 'GLD', name: '黃金', fmpSector: '' }
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
  return normalizeToken_(propToken);
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

function getStoreSpreadsheet_() {
  return SpreadsheetApp.openById(STORE_SPREADSHEET_ID);
}

function getEtfTaxSpreadsheet_() {
  return SpreadsheetApp.openById(ETF_TAX_SPREADSHEET_ID);
}

function getEtfHoldingsSpreadsheet_() {
  return SpreadsheetApp.openById(ETF_HOLDINGS_SPREADSHEET_ID);
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
// 讀取：?action=config / monthly / yearly / legacyMonthDetails / history / accounts / holdingsOverview / councilPantry / topStatusBar / tradeOptions / marketDashboard / macroOverview / battleBrief / transactions / accountChanges / dividendCenter / goldPrice
// 寫入：?action=expense|income|transfer&token=xxx&date=...（其餘參數同下）
function doGet(e) {
  try {
    var p      = e.parameter;
    var action = (p.action || '').trim();

    // 驗證連線只需要比對 Script Properties 中的密鑰，不必先開啟試算表。
    // Apps Script 冷啟動時，開表可能是整個驗證流程最慢的一段；先驗證
    // 可讓龐統立即取得成功／失敗結果，也避免未授權請求觸碰試算表。
    if (action === 'verifyWriteToken') {
      verifyWriteToken(p);
      return handleAuthorizedAction_(null, action, p, p.callback);
    }

    var ss     = SpreadsheetApp.getActiveSpreadsheet();

    // ── 讀取路由：敏感資料同樣需要通過 WRITE_TOKEN ──
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
  if (handler && action !== 'config') verifyWriteToken(p);
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
  monthlyBattleValue: function(ss) { return getMonthlyBattleValue_(ss); },
  holdingsOverview: function(ss) { return getHoldingsOverview(ss); },
  heroes: function(ss) { return getHeroes_(ss); },
  monthlyDividendProjection: function(ss) { return getMonthlyDividendProjection_(ss); },
  councilPantry: function(ss) { return getCouncilPantry(ss); },
  topStatusBar: function(ss) { return getTopStatusBar(ss); },
  financeStatus: function(ss) { return getFinanceStatus(ss); },
  tradeOptions: function(ss) { return getTradeOptions(ss); },
  marketDashboard: function() { return getMarketDashboard(getExternalDbSpreadsheet_()); },
  marketSectorRotation: function() { return getMarketSectorRotationFromNas_(); },
  goldPrice: function() { return getGoldPriceQuote_(); },
  macroOverview: function() { return getMacroOverview(getExternalDbSpreadsheet_()); },
  macroLongReport: function(ss, p) { return getMacroLongReport(getExternalDbSpreadsheet_(), p); },
  taiwanStockReview: function(ss, p) { return getTaiwanStockReview(getExternalDbSpreadsheet_(), p); },
  taiwanMacroOverview: function() {
    ensureTaiwanMacroInitialRefresh_();
    ensureTaiwanMacroMonthlyTrigger_();
    return getTaiwanMacroOverview(getExternalDbSpreadsheet_());
  },
  taiwanMacroHistory: function(ss, p) { return getTaiwanMacroHistory(getExternalDbSpreadsheet_(), p); },
  taiwanMacroUpdateStatus: function() {
    ensureTaiwanMacroMonthlyTrigger_();
    return getTaiwanMacroUpdateStatus(getExternalDbSpreadsheet_());
  },
  battleBrief: function(ss) { return getBattleBrief(ss); },
  holdingPriceHistory: function(ss, p) { return getBattleBriefPriceHistory_(ss, p); },
  etfHoldingChange: function() { return get00997AHoldingChange(); },
  pledgeLoans: function() { return getPledgeLoans(getExternalDbSpreadsheet_()); },
  assetSnapshot: function() { return getDailyAssetSnapshot(getExternalDbSpreadsheet_()); },
  transactions: function(ss, p) { return getTransactions(ss, p.ym, p.recentDays); },
  ledgerRequestStatus: function(ss, p) {
    var key = String(p.requestId || '').trim();
    if (!key || key.length > 160) throw new Error('無效的記帳編號');
    var db = ss.getSheetByName('資料庫');
    if (!db) throw new Error('找不到資料庫');
    var row = 0;
    if (db.getLastRow() > 1 && db.getMaxColumns() >= LEDGER_REQUEST_ID_COLUMN) {
      var match = db.getRange(2, LEDGER_REQUEST_ID_COLUMN, db.getLastRow()-1, 1).createTextFinder(key).matchEntireCell(true).useRegularExpression(false).findNext();
      if (match) row = match.getRow();
    }
    return {requestId:key, recorded:row > 0, row:row};
  },
  accountChanges: function(ss, p) { return getAccountChanges(ss, p.ym); },
  stockTrades: function(ss, p) { return getStockTrades(ss, p.ym); },
  dividendCenter: function(ss) { return getDividendCenter(ss); },
  databasePosition: function(ss) { return getDatabasePosition(ss); },
  etfTaxLookup: function(ss, p) { return getEtfTaxLookup(p); },
  bills: function(ss) { return getBills(ss); },
  todayCalendar: function(ss, p) { return getTodayCalendar(p); },
  todayTasks: function() { return getTodayTasks(); },
  ziweiCharts: function() { return getZiweiCharts(); },
  ziweiChartDetail: function(ss, p) { return getZiweiChartDetail_(p); },
  eventChronicle: function(ss) { return getEventChronicle(ss); },
  dailyUpdates: function(ss) { return getDailyUpdates_(ss); },
  todayAdvisorReminder: function() { return getTodayAdvisorReminder(getExternalDbSpreadsheet_()); },
  storeRecords: function() { return getStoreRecords_(); }
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
  advisorAiParse: true,
  advisorDividendMemo: true,
  expense: true,
  income: true,
  transfer: true,
  transactionUndo: true,
  stockTradeVoid: true,
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
  medicalCardStatsUpdate: true,
  macroLongReportGenerate: true,
  macroLongReportTriggerInstall: true,
  macroLongReportTriggerStatus: true,
  taiwanStockReviewGenerate: true,
  taiwanMacroUpdate: true,
  taiwanMacroTriggerInstall: true,
  taiwanMacroTriggerStatus: true,
  etfHoldingsRefresh: true,
  etfHoldingsTriggerInstall: true,
  etfHoldingsTriggerStatus: true,
  battleBriefFinanceSnapshotTriggerInstall: true,
  battleBriefFinanceSnapshotTriggerStatus: true,
  marketDashboardRefresh: true,
  marketDashboardTriggerInstall: true,
  marketDashboardTriggerStatus: true,
  twseMarginSnapshotRecord: true,
  twseMarginSnapshotTriggerInstall: true,
  twseMarginSnapshotTriggerStatus: true,
  assetSnapshotTriggerStatus: true,
  assetSnapshotTriggerInstall: true,
  assetSnapshotRecord: true,
  calendarCreate: true,
  calendarDelete: true,
  taskCreate: true,
  taskDelete: true,
  eventChronicleSave: true,
  eventChronicleEdit: true,
  eventChronicleDelete: true,
  storeRecordCreate: true,
  storeRecordUpdate: true,
  storeRecordDelete: true,
  verifyWriteToken: true,
  ziweiInterpretationSave: true,
  ziweiChartUpload: true,
  ziweiChartDelete: true
};

var AUTHORIZED_ACTION_HANDLERS_ = {
  verifyWriteToken: function() {
    return { message: 'WRITE_TOKEN 驗證成功' };
  },
  ziweiInterpretationSave: function(ss, p) {
    return saveZiweiInterpretation_(p);
  },
  ziweiChartUpload: function(ss, p) {
    return uploadZiweiChart_(p);
  },
  ziweiChartDelete: function(ss, p) {
    return deleteZiweiChart_(p);
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
  calendarCreate: function(ss, p) {
    return createGoogleCalendarEvent_(p);
  },
  calendarDelete: function(ss, p) {
    return deleteGoogleCalendarEvent_(p);
  },
  taskCreate: function(ss, p) {
    return createGoogleTask_(p);
  },
  taskDelete: function(ss, p) {
    return deleteGoogleTask_(p);
  },
  eventChronicleSave: function(ss, p) {
    return saveEventChronicle_(p);
  },
  eventChronicleEdit: function(ss, p) {
    return editEventChronicle_(p);
  },
  eventChronicleDelete: function(ss, p) {
    return deleteEventChronicle_(p);
  },
  storeRecordCreate: function(ss, p) {
    return writeStoreRecord_(p);
  },
  storeRecordUpdate: function(ss, p) {
    return updateStoreRecord_(p);
  },
  storeRecordDelete: function(ss, p) {
    return deleteStoreRecord_(p);
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
  macroLongReportGenerate: function(ss, p) {
    return generateMacroLongReport(getExternalDbSpreadsheet_(), p && p.days);
  },
  macroLongReportTriggerInstall: function() {
    return installMacroLongReportTrigger();
  },
  macroLongReportTriggerStatus: function() {
    return getMacroLongReportTriggerStatus();
  },
  taiwanStockReviewGenerate: function() {
    return generateTaiwanStockMonthlyReview(getExternalDbSpreadsheet_());
  },
  taiwanMacroUpdate: function() {
    return updateTaiwanMacroData(getExternalDbSpreadsheet_());
  },
  taiwanMacroTriggerInstall: function() {
    return installTaiwanMacroTrigger();
  },
  taiwanMacroTriggerStatus: function() {
    return getTaiwanMacroTriggerStatus();
  },
  etfHoldingsRefresh: function() {
    return record00997AHoldingSnapshot();
  },
  etfHoldingsTriggerInstall: function() {
    return install00997AHoldingSnapshotTrigger();
  },
  etfHoldingsTriggerStatus: function() {
    return get00997AHoldingSnapshotTriggerStatus();
  },
  battleBriefFinanceSnapshotTriggerInstall: function() {
    return installBattleBriefFinanceSnapshotTriggers_();
  },
  battleBriefFinanceSnapshotTriggerStatus: function() {
    return getBattleBriefFinanceSnapshotTriggerStatus_();
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
  medicalCardStats: function(ss, p) {
    return getMedicalCardStats_(p);
  },
  medicalQuickRecord: function(ss, p) {
    return writeMedicalQuickRecord_(p);
  },
  medicalTarotRecord: function(ss, p) {
    return writeMedicalTarotRecord_(p);
  },
  medicalCardStatsUpdate: function(ss, p) {
    return updateMedicalCardStats_(p);
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
// ── 固定支出可維持月數（月度戰情室 B5:B8 ÷ E5:E8）────────────
// B欄：固定支出可用餘額  E欄：每月支出金額
function getBills(ss) {
  var s = ss.getSheetByName('月度戰情室');
  if (!s) return { error: '找不到月度戰情室' };

  // 讀取 B5:E8，使用 B 欄餘額除以 E 欄月繳金額計算可維持月數
  var range = s.getRange(MOON_BILLS_START_ROW, MOON_BILLS_RESERVE_COL, 4, 4);
  var vals  = range.getValues();

  var labels = [
    { key: 'credit_chunghwa', name: '信貸＋中華電信', icon: '🔖' },
    { key: 'labor_health',    name: '勞健保',         icon: '🟡' },
    { key: 'ubear_utility',   name: '水電費＋YT訂閱', icon: '🏔️' }
  ];

  var bills = labels.map(function(l, i) {
    var reserveAmt = parseFloat(String(vals[i][0]).replace(/[$,\s]/g, '')) || 0;
    var monthlyAmt = parseFloat(String(vals[i][3]).replace(/[$,\s]/g, '')) || 0;
    var months = monthlyAmt > 0 ? reserveAmt / monthlyAmt : 0;
    return {
      key:    l.key,
      name:   l.name,
      icon:   l.icon,
      reserve: Math.round(reserveAmt),
      monthly: Math.round(monthlyAmt),
      months: Math.round(Math.max(0, months) * 10) / 10
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
  var catMap = {};
  data.forEach(function(row) {
    var rowYM = ledgerYm_(row);
    var type = ledgerType_(row);
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
  var dbYearly = isCurrentYear ? getYearlyFromDb_(ss, target) : null;
  var detail = isCurrentYear ? dbYearly.detail : getYearlyDetail_(ss, target);
  var months = isCurrentYear ? dbYearly.months : getYearlyMonthsFromArchive_(ss, target);
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

// Read the current year's database rows once and derive both the monthly
// summary and income/expense detail from that same in-memory pass.
function getYearlyFromDb_(ss, target) {
  var months = getBlankYearlyMonths_(target);
  var db = ss.getSheetByName('資料庫');
  if (!db || db.getLastRow() < 2) return { months: months, detail: null };

  var rows = db.getRange(2, 1, db.getLastRow() - 1, 16).getValues();
  var expenseMap = {};
  var incomeMap = {};
  var expense = 0;
  var income = 0;

  rows.forEach(function(row) {
    var ym = ledgerYm_(row);
    if (!ym.startsWith(target + '/')) return;

    var type = ledgerType_(row);
    var mo = parseInt(ym.split('/')[1], 10) - 1;
    if (mo < 0 || mo > 11) return;

    if (type === '支出') {
      months[mo].expense += ledgerExpenseAmount_(row);

      var expName = String(row[3] || '').trim();
      var expAmount = ledgerExpenseAmount_(row);
      if (!expName || expAmount <= 0) return;
      expenseMap[expName] = (expenseMap[expName] || 0) + expAmount;
      expense += expAmount;
    } else if (type === '收入') {
      months[mo].income += ledgerIncomeAmount_(row);

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

  var detail = null;
  if (expenses.length > 0 || incomes.length > 0) {
    var net = income - expense;
    detail = {
      year: target,
      total: {
        income: Math.round(income),
        expense: Math.round(expense),
        net: Math.round(net),
        savingRate: income > 0 ? (net / income * 100).toFixed(1) + '%' : '0%'
      },
      expenses: expenses,
      incomes: incomes
    };
  }

  return { months: months, detail: detail };
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

function accountChangeRowStamp_(row) {
  return txnDateStamp_((row || [])[1]) || txnDateStamp_((row || [])[0]);
}

function pruneOldAccountChangeRows_(ss, recentDays) {
  var cutoffStamp = recentTxnCutoffStamp_(recentDays);
  if (cutoffStamp == null) return;
  var sheet = ss.getSheetByName(ACCOUNT_CHANGE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, ACCOUNT_CHANGE_HEADERS.length).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    var stamp = accountChangeRowStamp_(rows[i]);
    if (stamp != null && stamp < cutoffStamp) sheet.deleteRow(i + 2);
  }
}

function readAccountChangesForYm_(ss, ym, recentDays) {
  var sheet = ss.getSheetByName(ACCOUNT_CHANGE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var cutoffStamp = recentTxnCutoffStamp_(recentDays);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, ACCOUNT_CHANGE_HEADERS.length).getValues();
  var changes = [];
  rows.forEach(function(row, i) {
    var rowYm = String(row[2] || '').trim();
    if (cutoffStamp == null && ym && rowYm !== ym) return;
    if (!isWithinRecentTxnWindow_(row[1], cutoffStamp)) return;
    changes.push({
      rowId: i + 2,
      createdAt: formatTxnDateTime_(row[0]),
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
  txn.createdAt = change.createdAt || '';
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
  return fetchFundRichFundQuote_(url).value;
}

function fetchFundRichFundQuote_(url) {
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

      return parseFundRichFundQuote_(response.getContentText(), url);
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
  return parseFundRichFundQuote_(text, url).value;
}

function parseFundRichFundQuote_(text, url) {
  var json = JSON.parse(text || '{}');
  if (json.status !== 0) {
    throw new Error(json.msg || ('基富通基金資料回應異常：' + url));
  }

  var raw = json.data && json.data.newPrice;
  var value = parseFloat(String(raw || '').replace(/,/g, ''));
  if (!isNaN(value)) {
    var data = json.data || {};
    var previous = fundRichNumberByKeys_(data, ['previousPrice', 'prevPrice', 'oldPrice', 'lastPrice', 'yesterdayPrice', 'prePrice', 'previousNav', 'prevNav', 'beforePrice', 'priorPrice']);
    var change = fundRichNumberByKeys_(data, ['priceChange', 'navChange', 'dailyChange', 'change', 'newPriceChange', 'changeValue', 'difference', 'dayChange']);
    if (previous == null && change != null) previous = value - change;
    var dataDate = fundRichTextByKeys_(data, ['newPriceDate', 'priceDate', 'navDate', 'date', 'dataDate']);
    return { value: value, previous: previous == null ? '' : previous, dataDate: dataDate || '' };
  }

  throw new Error('找不到基金淨值：' + url);
}

function fundRichNumberByKeys_(object, keys) {
  var wanted = keys.map(function(key) { return String(key).toLowerCase(); });
  var found = null;
  function visit(value) {
    if (found != null || value == null || typeof value !== 'object') return;
    Object.keys(value).forEach(function(key) {
      if (found != null) return;
      var child = value[key];
      if (wanted.indexOf(String(key).toLowerCase()) >= 0) {
        var number = parseFloat(String(child).replace(/,/g, ''));
        if (!isNaN(number)) found = number;
      } else if (child && typeof child === 'object') visit(child);
    });
  }
  visit(object);
  return found;
}

function fundRichTextByKeys_(object, keys) {
  var wanted = keys.map(function(key) { return String(key).toLowerCase(); });
  var found = '';
  function visit(value) {
    if (found || value == null || typeof value !== 'object') return;
    Object.keys(value).forEach(function(key) {
      if (found) return;
      var child = value[key];
      if (wanted.indexOf(String(key).toLowerCase()) >= 0 && child != null) found = String(child).trim();
      else if (child && typeof child === 'object') visit(child);
    });
  }
  visit(object);
  return found;
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

function getMonthlyBattleValue_(ss) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return { value: '', display: '' };
  var cell = moon.getRange('H4');
  return {
    value: cell.getValue(),
    display: String(cell.getDisplayValue() || '').trim()
  };
}

function getHoldingsOverview(ss, includeFundDataDate) {
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) return [];

  var holdingStart = getMoonHoldingStartRow_(moon);
  var maxRows = Math.max(0, Math.min(moon.getLastRow() - holdingStart + 1, MOON_HOLDING_ROWS));
  if (maxRows <= 0) return [];

  var range = moon.getRange(holdingStart, MOON_HOLDING_COL, maxRows, MOON_HOLDING_COLS); // A:N
  var rows = range.getValues();
  var displayRows = range.getDisplayValues();
  var formulas = includeFundDataDate ? range.getFormulas() : [];

  return rows.map(function(row, index) {
    var symbol = String(row[0] || '').trim();
    if (!symbol || symbol === '總資產/總計') return null;
    var displayRow = displayRows[index] || [];
    var formulaRow = formulas[index] || [];
    var formationDate = String(displayRow[11] || '').trim();
    var elapsedDays = String(displayRow[12] || '').trim();
    var monthlyDivDisplay = String(displayRow[3] || '').trim();
    var yuanPerDay = monthlyDivDisplay || String(displayRow[13] || '').trim();
    var formula = String(formulaRow[5] || '').trim();
    var fundNav = includeFundDataDate && isBattleBriefFund_(normalizeInvestmentSymbol_(symbol) || symbol)
      ? fetchFreshFundNavFromFormula_(formula)
      : null;
    var price = parseFloat(row[5]) || 0;
    var fundNavFetched = !!(fundNav && typeof fundNav.value === 'number' && isFinite(fundNav.value) && fundNav.value > 0);
    if (fundNavFetched) {
      price = fundNav.value;
    }

    return {
      symbol: symbol,
      name: symbol,
      cost: Math.round(parseFloat(row[1]) || 0),
      marketValue: Math.round(parseFloat(row[2]) || 0),
      monthlyDiv: Math.round(parseFloat(row[3]) || 0),
      monthlyDivDisplay: monthlyDivDisplay,
      shares: parseFloat(row[4]) || 0,
      price: price,
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
      yuanPerDay: yuanPerDay,
      dataDate: fundNav && fundNav.dataDate ? fundNav.dataDate : '',
      fundNavFetched: fundNavFetched,
      fundNavPrevious: fundNav && typeof fundNav.previous === 'number' && isFinite(fundNav.previous) ? fundNav.previous : ''
    };
  }).filter(function(row) {
    return row !== null;
  });
}

function getHeroes_(ss) {
  var sheet = ss.getSheetByName('武將資料');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) return [];
  var values = sheet.getRange(1, 1, sheet.getLastRow(), lastColumn).getValues();
  var displays = sheet.getRange(1, 1, sheet.getLastRow(), lastColumn).getDisplayValues();
  var headers = displays[0].map(function(value) { return String(value || '').trim(); });
  return values.slice(1).map(function(row, rowIndex) {
    var displayRow = displays[rowIndex + 1] || [];
    var item = {};
    headers.forEach(function(header, columnIndex) {
      if (!header) return;
      var displayValue = String(displayRow[columnIndex] == null ? '' : displayRow[columnIndex]).trim();
      item[header] = displayValue !== '' ? displayValue : (row[columnIndex] == null ? '' : row[columnIndex]);
    });
    return item;
  }).filter(function(item) {
    return Object.keys(item).some(function(key) { return String(item[key] || '').trim() !== ''; });
  });
}

function getMonthlyDividendProjection_(ss) {
  var sheet = ss.getSheetByName('月度戰情室');
  if (!sheet) return { value: 0, displayValue: '' };
  var cell = sheet.getRange('J2');
  return {
    value: cell.getValue(),
    displayValue: String(cell.getDisplayValue() || '').trim()
  };
}

function battleBriefDateText_(date) {
  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  return Utilities.formatDate(date || new Date(), tz, 'yyyy/MM/dd');
}

function battleBriefNowText_() {
  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  return Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd HH:mm');
}

function battleBriefSourceDateText_(value) {
  var text = String(value || '').trim();
  var match = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (!match) return '';
  return match[1] + '/' + ('0' + match[2]).slice(-2) + '/' + ('0' + match[3]).slice(-2);
}

function battleBriefPreviousSourceDate_(value) {
  return battleBriefSourceDateText_(String(value || '').split(/\s+/)[0]);
}

function fundNavSourceUrlFromFormula_(formula) {
  var match = String(formula || '').match(/https?:\/\/[^"\s]+/i);
  if (!match || !match[0]) return '';
  var url = match[0];
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyyMMdd');
  if (/[?&]refresh=$/i.test(url)) return url + today;
  return url.replace(/([?&]refresh=)\d+/i, '$1' + today);
}

// 戰情總匯報不能只依賴試算表自訂函式的計算結果；試算表可能仍保留前一個資料日。
// 每次建立戰情時直接抓來源，並沿用 refresh 參數讓玉山頁面避開來源端快取。
function fetchFreshFundNavFromFormula_(formula) {
  var url = fundNavSourceUrlFromFormula_(formula);
  if (!url) return null;

  try {
    if (/wealth\.esunbank\.com\.tw/i.test(url)) {
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
        }
      });
      var code = response.getResponseCode();
      if (code < 200 || code >= 300) throw new Error('基金來源讀取失敗：HTTP ' + code);
      var html = getEsunHtmlText_(response);
      var history = parseFundNavHistory_(html);
      return {
        value: history.length ? history[0].value : parseEsunFundNav_(html, url),
        previous: history.length > 1 ? history[1].value : '',
        dataDate: history.length ? history[0].date : parseEsunFundDataDate_(html, url)
      };
    }

    if (/fundrich\.com\.tw/i.test(url)) return fetchFundRichFundQuote_(url);
    return { value: fetchFundNav_(url), dataDate: '' };
  } catch (err) {
    Logger.log('fresh fund NAV failed: ' + url + ' ' + err.message);
    return null;
  }
}

function parseFundNavHistory_(html) {
  var rows = [];
  var pattern = /<td[^>]*>\s*(20\d{2}[\/-]\d{1,2}[\/-]\d{1,2})\s*<\/td>\s*<td[^>]*>\s*([0-9,.]+)\s*<\/td>/gi;
  var match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    var value = parseFloat(String(match[2]).replace(/,/g, ''));
    if (!isNaN(value)) rows.push({ date: match[1].replace(/-/g, '/'), value: value });
  }
  return rows;
}

function fundNavDateCacheKey_(url) {
  return 'FUND_NAV_DATA_DATE_' + String(url || '').replace(/[^A-Za-z0-9]/g, '_').slice(0, 180);
}

function parseEsunFundDataDate_(html, url) {
  var panelMatch = String(html || '').match(/<ul[^>]*class=["'][^"']*stockPanel[^"']*["'][\s\S]*?<\/ul>/i);
  var panel = panelMatch ? panelMatch[0] : String(html || '');
  var match = panel.match(/最新淨值\s*[（(]\s*(20\d{2})[\/-](\d{1,2})[\/-](\d{1,2})\s*[）)]/i);
  if (!match) return '';
  return match[1] + '/' + ('0' + match[2]).slice(-2) + '/' + ('0' + match[3]).slice(-2);
}

function getFundNavDataDateFromFormula_(formula) {
  var url = fundNavSourceUrlFromFormula_(formula);
  if (!url || !/wealth\.esunbank\.com\.tw/i.test(url)) return '';

  var cache = CacheService.getScriptCache();
  var cacheKey = fundNavDateCacheKey_(url);
  var cached = String(cache.get(cacheKey) || '').trim();
  if (cached) return cached;

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
    if (code < 200 || code >= 300) throw new Error('基金來源讀取失敗：HTTP ' + code);
    var dataDate = parseEsunFundDataDate_(getEsunHtmlText_(response), url);
    if (dataDate) cache.put(cacheKey, dataDate, 21600);
    return dataDate;
  } catch (err) {
    Logger.log('fund NAV data date failed: ' + url + ' ' + err.message);
    return '';
  }
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
      value: row[4] === '' || row[4] == null ? '' : parseSheetNumber_(row[4]),
      previous: row[5] === '' || row[5] == null ? '' : parseSheetNumber_(row[5]),
      change: row[6] === '' || row[6] == null ? '' : parseSheetNumber_(row[6]),
      changePct: row[7] === '' || row[7] == null ? '' : parseSheetNumber_(row[7]),
      updatedAt: battleBriefSheetDateTimeText_(row[8]),
      source: String(row[9] || '').trim(),
      note: String(row[10] || '').trim()
    };
  });
  return map;
}

function readBattleBriefOlderValue_(sheet, todayText, key) {
  if (!sheet || sheet.getLastRow() < 2) return '';
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, BATTLE_BRIEF_HEADERS.length).getValues();
  var byDate = {};
  values.forEach(function(row) {
    var dateText = battleBriefSheetDateText_(row[0]);
    if (!dateText || dateText >= todayText || battleBriefKey_(row[1], row[3]) !== key) return;
    var value = row[4] === '' || row[4] == null ? '' : parseSheetNumber_(row[4]);
    if (value === '' || isNaN(Number(value)) || Number(value) <= 0) return;
    byDate[dateText] = Number(value);
  });
  var dates = Object.keys(byDate).sort().reverse();
  return dates.length >= 2 ? byDate[dates[1]] : '';
}

function readBattleBriefLatestState_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(BATTLE_BRIEF_LATEST_STATE_PROPERTY);
    if (!raw) return {};
    var state = JSON.parse(raw);
    var map = {};
    (state && state.items || []).forEach(function(item) {
      if (!item || !item.category || !item.name) return;
      map[battleBriefKey_(item.category, item.name)] = item;
    });
    return map;
  } catch (e) {
    Logger.log('battleBrief latest state read failed: ' + e.message);
    return {};
  }
}

function writeBattleBriefLatestState_(todayText, items) {
  try {
    var stateItems = (items || []).filter(function(item) {
      return item && item.category === '基金淨值' && item.name && item.current !== '' && item.current != null && isFinite(Number(item.current));
    }).map(function(item) {
      return {
        category: item.category,
        code: item.code || '',
        name: item.name,
        value: Number(item.current),
        previous: item.previous === '' || item.previous == null ? '' : Number(item.previous),
        change: item.change === '' || item.change == null ? '' : Number(item.change),
        changePct: item.changePct === '' || item.changePct == null ? '' : Number(item.changePct),
        updatedAt: item.updatedAt || '',
        source: item.source || '',
        note: item.note || ''
      };
    });
    PropertiesService.getScriptProperties().setProperty(BATTLE_BRIEF_LATEST_STATE_PROPERTY, JSON.stringify({
      dateText: todayText,
      items: stateItems
    }));
  } catch (e) {
    Logger.log('battleBrief latest state write failed: ' + e.message);
  }
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

function battleBriefSheetDateTimeText_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
    return Utilities.formatDate(value, tz, 'yyyy/MM/dd HH:mm');
  }
  return String(value || '').trim();
}

function battleBriefDateStamp_(value) {
  var dateText = battleBriefSheetDateText_(value);
  var match = String(dateText || '').match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
}

function pruneBattleBriefRows_(sheet, todayText) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var todayStamp = battleBriefDateStamp_(todayText);
  if (todayStamp == null) return 0;

  var retentionDays = Math.max(1, Number(BATTLE_BRIEF_RETENTION_DAYS) || 7);
  var cutoffStamp = todayStamp - ((retentionDays - 1) * 24 * 60 * 60 * 1000);
  var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var deleteStart = null;
  var deleteEnd = null;
  var removed = 0;

  function flushDeleteRange_() {
    if (deleteStart == null || deleteEnd == null) return;
    var count = deleteEnd - deleteStart + 1;
    sheet.deleteRows(deleteStart, count);
    removed += count;
    deleteStart = null;
    deleteEnd = null;
  }

  for (var i = dates.length - 1; i >= 0; i--) {
    var rowIndex = i + 2;
    var stamp = battleBriefDateStamp_(dates[i][0]);
    if (stamp != null && stamp < cutoffStamp) {
      if (deleteStart != null && rowIndex === deleteStart - 1) {
        deleteStart = rowIndex;
      } else {
        flushDeleteRange_();
        deleteStart = rowIndex;
        deleteEnd = rowIndex;
      }
    } else {
      flushDeleteRange_();
    }
  }
  flushDeleteRange_();
  return removed;
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
  if (/^\d{4,5}[A-Z]?$/.test(key)) return key + '.TW';
  if (/^[A-Z]{1,6}$/.test(key)) return key;
  return '';
}

function readBattleBriefPreviousCloseCache_(cache, yahooSymbol) {
  var raw = cache.get(BATTLE_BRIEF_PREVIOUS_CLOSE_CACHE_PREFIX + yahooSymbol);
  if (raw == null || raw === '') return null;
  var value = Number(raw);
  return isFinite(value) ? value : null;
}

function writeBattleBriefPreviousCloseCache_(cache, yahooSymbol, value) {
  if (value == null || isNaN(Number(value)) || !isFinite(Number(value))) return;
  cache.put(
    BATTLE_BRIEF_PREVIOUS_CLOSE_CACHE_PREFIX + yahooSymbol,
    String(Number(value)),
    BATTLE_BRIEF_PREVIOUS_CLOSE_CACHE_SECONDS
  );
}

function parseBattleBriefPreviousCloseResponse_(response) {
  if (!response || response.getResponseCode() !== 200) return null;
  try {
    var json = JSON.parse(response.getContentText());
    var result = json.chart && json.chart.result && json.chart.result[0];
    if (!result) return null;
    var closes = (((result.indicators || {}).quote || [])[0] || {}).close || [];
    var validCloses = closes.filter(function(value) {
      return value != null && !isNaN(value);
    }).map(Number);
    return validCloses.length >= 2 ? validCloses[validCloses.length - 2] : null;
  } catch (e) {
    Logger.log('battleBrief previous close parse failed: ' + e.message);
    return null;
  }
}

function fetchBattleBriefPreviousCloses_(symbols) {
  var cache = CacheService.getScriptCache();
  var values = {};
  var primary = [];
  var seen = {};

  (symbols || []).forEach(function(symbol) {
    var normalized = normalizeInvestmentSymbol_(symbol) || String(symbol || '').trim();
    var yahooSymbol = battleBriefYahooSymbol_(normalized);
    if (!normalized || !yahooSymbol || seen[normalized]) return;
    seen[normalized] = true;
    var cached = readBattleBriefPreviousCloseCache_(cache, yahooSymbol);
    if (cached != null) {
      values[normalized] = cached;
      return;
    }
    primary.push({ symbol: normalized, yahooSymbol: yahooSymbol });
  });

  function fetchBatch_(items) {
    if (!items.length) return [];
    var requests = items.map(function(item) {
      return {
        url: 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(item.yahooSymbol) + '?interval=1d&range=10d',
        method: 'get',
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      };
    });
    var responses = UrlFetchApp.fetchAll(requests);
    return items.map(function(item, index) {
      var value = parseBattleBriefPreviousCloseResponse_(responses[index]);
      if (value != null) {
        values[item.symbol] = value;
        writeBattleBriefPreviousCloseCache_(cache, item.yahooSymbol, value);
      }
      return value == null ? item : null;
    }).filter(function(item) {
      return item;
    });
  }

  var missing = [];
  try {
    missing = fetchBatch_(primary);
  } catch (e) {
    Logger.log('battleBrief previous close batch failed: ' + e.message);
    missing = primary;
  }

  var fallback = missing.filter(function(item) {
    return /\.TW$/.test(item.yahooSymbol);
  }).map(function(item) {
    return {
      symbol: item.symbol,
      yahooSymbol: item.yahooSymbol.replace(/\.TW$/, '.TWO')
    };
  });
  if (fallback.length) {
    try {
      fetchBatch_(fallback);
    } catch (e2) {
      Logger.log('battleBrief previous close fallback batch failed: ' + e2.message);
    }
  }
  return values;
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

function buildBattleBriefRows_(ss, previousMap, legacySheet, todayText) {
  var nowText = battleBriefNowText_();
  var holdings = getHoldingsOverview(ss, true);
  var fundRows = [];
  var stockRows = [];
  var stockSymbols = holdings.filter(function(row) {
    var symbol = normalizeInvestmentSymbol_(row.symbol) || row.symbol;
    var name = symbol || row.name;
    var previous = previousMap[battleBriefKey_('持股股價', name)];
    var hasPrevious = previous && previous.value !== '' && previous.value != null && !isNaN(Number(previous.value));
    return symbol && !isBattleBriefFund_(symbol) && !hasPrevious;
  }).map(function(row) {
    return normalizeInvestmentSymbol_(row.symbol) || row.symbol;
  });
  var yahooPreviousBySymbol = fetchBattleBriefPreviousCloses_(stockSymbols);

  holdings.forEach(function(row) {
    var symbol = normalizeInvestmentSymbol_(row.symbol) || row.symbol;
    var name = symbol || row.name;
    var current = row.price === '' || row.price == null ? null : Number(row.price);
    var staleFund = isBattleBriefFund_(symbol) ? previousMap[battleBriefKey_('基金淨值', name)] : null;
    var delayedFundPrevious = name === '施羅德收益成長A2' && legacySheet
      ? readBattleBriefOlderValue_(legacySheet, todayText, battleBriefKey_('基金淨值', name))
      : '';
    var currentFundSourceDate = battleBriefSourceDateText_(row.dataDate);
    var previousFundSourceDate = staleFund ? battleBriefPreviousSourceDate_(staleFund.updatedAt) : '';
    var fundSourceUnchanged = staleFund && !row.fundNavFetched && (!currentFundSourceDate ||
      (previousFundSourceDate && currentFundSourceDate <= previousFundSourceDate));
    if (fundSourceUnchanged && delayedFundPrevious === '' && staleFund.value !== '' && staleFund.value != null && Number(staleFund.value) > 0) {
      fundRows.push({
        category: '基金淨值',
        code: symbol,
        name: name,
        current: Number(staleFund.value),
        previous: staleFund.previous,
        change: staleFund.change,
        changePct: staleFund.changePct,
        updatedAt: staleFund.updatedAt || nowText,
        source: staleFund.source || '月度戰情室',
        note: '沿用上一筆有效淨值，等待新資料'
      });
      return;
    }
    if (!name || current == null || isNaN(current) || !isFinite(current) || current <= 0) {
      // 基金淨值通常會在跨日後短暫等待來源更新；保留上一筆有效戰情，
      // 避免空值被誤當成 0，讓「昨日值／增減」整組消失。
      if (staleFund && staleFund.value !== '' && staleFund.value != null && Number(staleFund.value) > 0) {
        fundRows.push({
          category: '基金淨值',
          code: symbol,
          name: name,
          current: Number(staleFund.value),
          previous: staleFund.previous,
          change: staleFund.change,
          changePct: staleFund.changePct,
          updatedAt: staleFund.updatedAt || nowText,
          source: staleFund.source || '月度戰情室',
          note: '沿用上一筆有效淨值，等待新資料'
        });
      }
      return;
    }
    var category = isBattleBriefFund_(symbol) ? '基金淨值' : '持股股價';
    var yahooPrevious = category === '持股股價' && yahooPreviousBySymbol[symbol] != null
      ? yahooPreviousBySymbol[symbol]
      : '';
    var previous = category === '基金淨值' && row.fundNavPrevious !== ''
      ? Number(row.fundNavPrevious)
      : battleBriefPreviousValue_(previousMap, category, name, yahooPrevious);
    // 施羅德收益成長 A2 的來源有時會在今日先回傳昨日公布價；
    // 若今日值與上一筆戰情完全相同，應改用上一筆保存的前一日值計算，
    // 避免把「延遲公布」誤判成 0.00%。
    if (category === '基金淨值' && name === '施羅德收益成長A2' &&
      delayedFundPrevious !== '' && Number(delayedFundPrevious) > 0) {
      previous = Number(delayedFundPrevious);
    } else if (category === '基金淨值' && name === '施羅德收益成長A2' && staleFund &&
      Number(staleFund.value) === current && staleFund.previous !== '' &&
      Number(staleFund.previous) > 0) {
      previous = Number(staleFund.previous);
    }
    var delta = battleBriefDelta_(current, previous);
    var item = {
      category: category,
      code: symbol,
      name: name,
      current: current,
      previous: previous,
      change: delta.change,
      changePct: delta.changePct,
      updatedAt: category === '基金淨值' && row.dataDate
        ? row.dataDate + ' ' + nowText.slice(-5)
        : category === '基金淨值' ? '' : nowText,
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

  function pushMetric(category, code, name, current, explicitChange, source, note, metricUpdatedAt) {
    var hasExplicitChange = explicitChange != null && explicitChange !== '' && !isNaN(Number(explicitChange));
    var previousFallback = !hasExplicitChange
      ? ''
      : Number(current) - Number(explicitChange);
    // 官方來源已有增減值時，優先使用該值回推比較基準；
    // 避免昨日戰情快照的舊主數值把官方增減覆蓋成 0。
    var previous = hasExplicitChange
      ? previousFallback
      : battleBriefPreviousValue_(previousMap, category, name, previousFallback);
    var delta = battleBriefDelta_(current, previous);
    marketRows.push({
      category: category,
      code: code,
      name: name,
      current: current,
      previous: previous,
      change: delta.change,
      changePct: delta.changePct,
      updatedAt: metricUpdatedAt || updatedAt,
      source: source,
      note: note || ''
    });
  }

  if (twse.marginBalance) {
    pushMetric('台股融資', '^TWII', '台股融資餘額', twse.marginBalance, twse.marginBalanceChange, twse.marginBalanceSource || 'TWSE', twse.marginBalanceText || '', twse.marginBalanceUpdatedAt || updatedAt);
  }
  if (twse.marginMaintenanceRatio) {
    pushMetric('台股維持率', '^TWII', '台股維持率', twse.marginMaintenanceRatio, twse.marginMaintenanceChange, twse.marginBalanceSource || 'TWSE', twse.marginMaintenanceText || '', twse.marginBalanceUpdatedAt || updatedAt);
  }
  if (twse.foreignTxNetShort != null && twse.foreignTxNetShort !== '') {
    pushMetric('外資台指期', '^TX', '外資台指期淨空單', twse.foreignTxNetShort, twse.foreignTxNetShortChange, twse.foreignTxNetShortSource || 'TAIFEX', twse.foreignTxNetShortText || '', twse.foreignTxNetShortUpdatedAt || updatedAt);
  }
  return marketRows;
}

function upsertBattleBriefSnapshot_(sheet, todayText, items) {
  items = (items || []).filter(function(item) {
    return BATTLE_BRIEF_SNAPSHOT_EXCLUDED_CATEGORIES.indexOf(String(item && item.category || '').trim()) < 0;
  });
  if (!items.length) return;
  var lastRow = sheet.getLastRow();
  var rowByKey = {};
  var existingRows = [];
  if (lastRow >= 2) {
    existingRows = sheet.getRange(2, 1, lastRow - 1, BATTLE_BRIEF_HEADERS.length).getValues();
    existingRows.forEach(function(row, index) {
      var dateText = battleBriefSheetDateText_(row[0]);
      if (dateText !== todayText) return;
      rowByKey[battleBriefKey_(row[1], row[3])] = index + 2;
    });
  }

  var nowText = battleBriefNowText_();
  var appends = [];
  var changed = false;
  var semanticColumns = [1, 2, 3, 4, 5, 6, 7, 9, 10];
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
    if (rowIndex) {
      var previous = existingRows[rowIndex - 2] || [];
      var sameSemanticValues = semanticColumns.every(function(columnIndex) {
        return String(previous[columnIndex] == null ? '' : previous[columnIndex]) ===
          String(values[0][columnIndex] == null ? '' : values[0][columnIndex]);
      });
      if (!sameSemanticValues) {
        sheet.getRange(rowIndex, 1, 1, BATTLE_BRIEF_HEADERS.length).setValues(values);
        changed = true;
      }
    } else {
      appends.push(values[0]);
      changed = true;
    }
  });
  if (appends.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, BATTLE_BRIEF_HEADERS.length).setValues(appends);
  }
  if (changed) {
    var formatRows = Math.max(1, sheet.getLastRow() - 1);
    sheet.getRange(2, 5, formatRows, 3).setNumberFormat('#,##0.####');
    sheet.getRange(2, 8, formatRows, 1).setNumberFormat('0.00');
  }
}

function battleBriefFinanceSnapshotConfig_() {
  var props = PropertiesService.getScriptProperties();
  var baseUrl = String(props.getProperty('ARKOS_FINANCE_SNAPSHOT_URL') || ARKOS_ASTROLOGY_API_BASE).replace(/\/$/, '');
  var token = String(props.getProperty('ARKOS_FINANCE_SNAPSHOT_TOKEN') || props.getProperty('ARKOS_UPLOAD_TOKEN') || props.getProperty('ARKOS_ASTROLOGY_TOKEN') || '').trim();
  if (!token) throw new Error('尚未設定 ARKOS_FINANCE_SNAPSHOT_TOKEN（或 ARKOS_UPLOAD_TOKEN），無法寫入 NAS 快照。');
  return { url: baseUrl + ARKOS_FINANCE_SNAPSHOT_PATH, token: token };
}

function postBattleBriefFinanceSnapshotToNas_(snapshotType, items, sourceDate, metadata) {
  var config = battleBriefFinanceSnapshotConfig_();
  var payload = {
    snapshotType: snapshotType,
    capturedAt: new Date().toISOString(),
    sourceDate: String(sourceDate || '').trim(),
    items: items,
    metadata: metadata || {}
  };
  var response = UrlFetchApp.fetch(config.url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + config.token,
      'x-arkos-token': config.token
    }
  });
  var status = response.getResponseCode();
  var text = response.getContentText() || '';
  if (status < 200 || status >= 300) throw new Error('NAS 財務快照寫入失敗：HTTP ' + status + ' ' + text.slice(0, 300));
  return JSON.parse(text);
}

function marketSectorFmpKey_(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function fetchFmpSectorPerformance_() {
  var props = PropertiesService.getScriptProperties();
  var key = String(props.getProperty('FMP_API_KEY') || props.getProperty('FINANCIAL_MODELING_PREP_API_KEY') || '').trim();
  if (!key) return { rows: {}, source: '', error: '未設定 FMP_API_KEY，改用 Yahoo' };
  var date = Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd');
  var url = 'https://financialmodelingprep.com/stable/sector-performance-snapshot?date=' + encodeURIComponent(date) + '&apikey=' + encodeURIComponent(key);
  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    var status = response.getResponseCode();
    if (status < 200 || status >= 300) throw new Error('HTTP ' + status);
    var data = JSON.parse(response.getContentText() || '[]');
    var list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    var rows = {};
    list.forEach(function(item) {
      var sector = marketSectorFmpKey_(item.sector || item.sectorName || item.name);
      var change = item.changesPercentage != null ? item.changesPercentage : (item.changePercentage != null ? item.changePercentage : item.change);
      if (!sector || change == null || isNaN(Number(String(change).replace('%', '')))) return;
      rows[sector] = Number(String(change).replace('%', ''));
    });
    return { rows: rows, source: 'FMP 產業快照', sourceDate: date, error: '' };
  } catch (error) {
    return { rows: {}, source: '', sourceDate: date, error: error && error.message ? error.message : String(error) };
  }
}

function fetchYahooMarketSectorSeries_() {
  var items = MARKET_SECTOR_INSTRUMENTS.concat([{ code: 'SPY', symbol: 'SPY', name: 'S&P 500', fmpSector: '' }]);
  var requests = items.map(function(item) {
    return { url: 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(item.symbol) + '?interval=1d&range=4mo&events=history&includePrePost=false', muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } };
  });
  var responses = UrlFetchApp.fetchAll(requests);
  var result = {};
  responses.forEach(function(response, index) {
    var item = items[index];
    try {
      if (response.getResponseCode() !== 200) throw new Error('HTTP ' + response.getResponseCode());
      var json = JSON.parse(response.getContentText() || '{}');
      var chart = json.chart && json.chart.result && json.chart.result[0];
      if (!chart) throw new Error('Yahoo 回應無資料');
      var timestamps = chart.timestamp || [];
      var quote = (((chart.indicators || {}).quote || [])[0] || {});
      var closes = quote.close || [];
      var volumes = quote.volume || [];
      var points = [];
      closes.forEach(function(value, pointIndex) {
        if (value == null || isNaN(Number(value))) return;
        points.push({ close: Number(value), volume: volumes[pointIndex] == null ? null : Number(volumes[pointIndex]), timestamp: timestamps[pointIndex] || 0 });
      });
      if (points.length < 61) throw new Error('有效交易資料不足 61 筆');
      result[item.code] = { points: points, sourceDate: Utilities.formatDate(new Date((points[points.length - 1].timestamp || 0) * 1000), 'America/New_York', 'yyyy-MM-dd') };
    } catch (error) {
      result[item.code] = { points: [], error: error && error.message ? error.message : String(error) };
    }
  });
  return result;
}

function marketSectorReturn_(points, days) {
  if (!points || points.length <= days) return null;
  var latest = points[points.length - 1].close;
  var base = points[points.length - 1 - days].close;
  return base ? (latest / base - 1) * 100 : null;
}

function marketSectorAverage_(points, start, end) {
  var values = (points || []).slice(start, end).map(function(point) { return point.volume; }).filter(function(value) { return value != null && isFinite(value); });
  return values.length ? values.reduce(function(sum, value) { return sum + value; }, 0) / values.length : null;
}

function marketSectorClamp_(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }

function buildMarketSectorRotation_() {
  var fmp = fetchFmpSectorPerformance_();
  var series = fetchYahooMarketSectorSeries_();
  var spy = series.SPY && series.SPY.points || [];
  var spyReturns = { r5: marketSectorReturn_(spy, 5), r20: marketSectorReturn_(spy, 20), r60: marketSectorReturn_(spy, 60) };
  var rows = MARKET_SECTOR_INSTRUMENTS.map(function(item) {
    var data = series[item.code] || { points: [] };
    var points = data.points || [];
    var price = points.length ? points[points.length - 1].close : null;
    var returns = { r1: marketSectorReturn_(points, 1), r5: marketSectorReturn_(points, 5), r20: marketSectorReturn_(points, 20), r60: marketSectorReturn_(points, 60) };
    var fmpChange = item.fmpSector ? fmp.rows[marketSectorFmpKey_(item.fmpSector)] : null;
    if (fmpChange != null) returns.r1 = fmpChange;
    var rel5 = returns.r5 != null && spyReturns.r5 != null ? returns.r5 - spyReturns.r5 : null;
    var rel20 = returns.r20 != null && spyReturns.r20 != null ? returns.r20 - spyReturns.r20 : null;
    var rel60 = returns.r60 != null && spyReturns.r60 != null ? returns.r60 - spyReturns.r60 : null;
    var sma20 = points.length >= 20 ? points.slice(-20).reduce(function(sum, point) { return sum + point.close; }, 0) / 20 : null;
    var sma60 = points.length >= 60 ? points.slice(-60).reduce(function(sum, point) { return sum + point.close; }, 0) / 60 : null;
    var avg5 = marketSectorAverage_(points, Math.max(0, points.length - 5), points.length);
    var avg20 = marketSectorAverage_(points, Math.max(0, points.length - 25), Math.max(0, points.length - 5));
    var volumeChangePct = avg5 != null && avg20 ? (avg5 / avg20 - 1) * 100 : null;
    var trendScore = price != null && sma20 != null ? (price >= sma20 ? 7 : -7) : 0;
    if (sma20 != null && sma60 != null) trendScore += sma20 >= sma60 ? 8 : -8;
    var score = 50 + marketSectorClamp_(rel5 == null ? 0 : rel5 * 4, -20, 20) + marketSectorClamp_(rel20 == null ? 0 : rel20 * 2, -20, 20) + marketSectorClamp_(rel60 == null ? 0 : rel60 * 1.5, -15, 15) + trendScore + marketSectorClamp_(volumeChangePct == null ? 0 : volumeChangePct * .15, -7.5, 7.5);
    var status = '資料不足';
    if (rel5 != null && rel20 != null && rel60 != null) {
      if (rel5 > 0 && rel20 > 0 && rel60 > 0) status = '持續強勢';
      else if (rel20 < 0 && rel5 > 0) status = '輪動初期';
      else if (rel20 > 0 && rel5 < 0) status = '動能降溫';
      else if (rel5 < 0 && rel20 < 0 && rel60 < 0) status = '資金弱勢';
      else status = '中性';
    }
    var momentum = rel5 != null && rel20 != null ? rel5 - rel20 : null;
    var quadrant = rel20 == null || momentum == null ? '資料不足' : (rel20 >= 0 ? (momentum >= 0 ? 'Leading' : 'Weakening') : (momentum >= 0 ? 'Improving' : 'Lagging'));
    return { code: item.code, name: item.name, price: price, return1d: returns.r1, return5d: returns.r5, return20d: returns.r20, return60d: returns.r60, relative5d: rel5, relative20d: rel20, relative60d: rel60, momentum: momentum, ma20: sma20, ma60: sma60, volumeChangePct: volumeChangePct, rotationScore: Math.round(marketSectorClamp_(score, 0, 100) * 10) / 10, status: status, quadrant: quadrant, sourceDate: data.sourceDate || '', source: fmp.source ? 'FMP產業快照 + Yahoo ETF OHLCV' : 'Yahoo ETF OHLCV', error: data.error || '' };
  });
  return { rows: rows, source: fmp.source ? 'FMP 產業快照；Yahoo ETF OHLCV' : 'Yahoo Finance ETF OHLCV（FMP 未設定或不可用）', fmpError: fmp.error || '', updatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd HH:mm') };
}

function askDeepSeekMarketRotation_(rotation) {
  var key = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');
  if (!key) throw new Error('尚未設定 DEEPSEEK_API_KEY');
  var payload = { updatedAt: rotation.updatedAt, source: rotation.source, rows: (rotation.rows || []).map(function(row) { return { name: row.name, code: row.code, return5d: row.return5d, return20d: row.return20d, return60d: row.return60d, relative5d: row.relative5d, relative20d: row.relative20d, relative60d: row.relative60d, rotationScore: row.rotationScore, status: row.status, quadrant: row.quadrant }; }) };
  var response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', { method: 'post', contentType: 'application/json', headers: { Authorization: 'Bearer ' + key }, payload: JSON.stringify({ model: String(PropertiesService.getScriptProperties().getProperty('DEEPSEEK_MODEL') || 'deepseek-v4-flash'), messages: [{ role: 'system', content: '你是美股產業輪動分析助手。只能根據輸入 JSON，以繁體中文輸出 JSON，不要 Markdown。不要預測股價、不要給買賣建議、不要根據單日變化下結論。請輸出欄位：summary（150到250字）、strongest（最多3項陣列）、improving（最多3項陣列）、weakening（最多3項陣列）、rotation（是否存在明顯輪動及理由）、ai（AI資金偏硬體、基建、軟體或應用，資料不足要明說）。' }, { role: 'user', content: JSON.stringify(payload) }], thinking: { type: 'enabled' }, reasoning_effort: 'medium', stream: false }), muteHttpExceptions: true });
  var data = JSON.parse(response.getContentText() || '{}');
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) throw new Error(data.error && data.error.message ? data.error.message : 'DeepSeek 產業輪動短評失敗');
  return parseDeepSeekJsonObject_(data.choices[0].message.content || '');
}

function recordMarketSectorSnapshotScheduled() {
  var rotation = buildMarketSectorRotation_();
  var commentary = null;
  var commentaryError = '';
  try { commentary = askDeepSeekMarketRotation_(rotation); } catch (error) { commentaryError = error && error.message ? error.message : String(error); }
  var items = (rotation.rows || []).filter(function(row) { return row.code && row.price != null; }).map(function(row) { return { code: row.code, name: row.name, value: row.price, change: row.return1d, changePct: row.return1d, sourceDate: row.sourceDate, source: row.source }; });
  if (!items.length) throw new Error('產業輪動沒有可保存的有效資料。');
  return postBattleBriefFinanceSnapshotToNas_('market-sectors', items, rotation.rows.map(function(row) { return row.sourceDate; }).filter(Boolean).sort().pop() || '', { rotation: rotation, commentary: commentary, commentaryError: commentaryError, commentarySource: commentary ? 'DeepSeek' : '' });
}

function getMarketSectorRotationFromNas_() {
  var config = battleBriefFinanceSnapshotConfig_();
  var response = UrlFetchApp.fetch(config.url + '?range=3m&snapshotType=market-sectors', { muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + config.token, 'x-arkos-token': config.token } });
  var status = response.getResponseCode();
  var body = JSON.parse(response.getContentText() || '{}');
  if (status < 200 || status >= 300) throw new Error(body.error || ('NAS 產業輪動快照讀取失敗：HTTP ' + status));
  var records = body.records || [];
  var latest = records.length ? records[records.length - 1] : null;
  if (!latest) return { rows: [], commentary: null, source: 'NAS', status: '尚未有產業輪動快照' };
  var metadata = latest.metadata || {};
  var rotation = metadata.rotation || {};
  return { rows: rotation.rows || [], commentary: metadata.commentary || null, commentaryError: metadata.commentaryError || '', source: rotation.source || 'NAS', updatedAt: rotation.updatedAt || latest.capturedAt || '', sourceDate: latest.sourceDate || '' };
}

function battleBriefSnapshotSourceDate_(value) {
  var match = String(value || '').match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  return match ? match[1] + '-' + String(match[2]).padStart(2, '0') + '-' + String(match[3]).padStart(2, '0') : '';
}

function recordFundNavNasSnapshotScheduled() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var battle = getBattleBrief(ss);
  var items = (battle.funds || []).filter(function(item) {
    return item && item.name && item.current !== '' && item.current != null && isFinite(Number(item.current));
  }).map(function(item) {
    return {
      code: item.code || item.name,
      name: item.name,
      value: Number(item.current),
      change: item.change,
      changePct: item.changePct,
      sourceDate: battleBriefSnapshotSourceDate_(item.updatedAt),
      source: item.source || '基金淨值來源'
    };
  });
  if (!items.length) throw new Error('基金淨值沒有可保存的有效資料。');
  return postBattleBriefFinanceSnapshotToNas_('fund-nav', items, items.map(function(item) { return item.sourceDate; }).filter(Boolean).sort().pop() || '');
}

function recordTwseMarginNasSnapshotScheduled() {
  var ss = getExternalDbSpreadsheet_();
  var margin = getCurrentTWSEMarginSnapshot_(ss);
  if (!margin || margin.value == null) throw new Error('台股融資資料沒有可保存的有效資料。');
  var sourceDate = battleBriefSnapshotSourceDate_(margin.snapshotDate || margin.updatedAt);
  var items = [
    { code: '^TWII', name: '台股融資餘額', value: Number(margin.value), change: margin.balanceChange, changePct: '', sourceDate: sourceDate, source: margin.source || 'TWSE' },
    { code: '^TWII', name: '台股維持率', value: Number(margin.maintenanceRatio), change: margin.maintenanceChange, changePct: '', sourceDate: sourceDate, source: margin.source || 'TWSE' },
    { code: '^TX', name: '外資台指期淨空單', value: Number(margin.foreignTxNetShort), change: margin.foreignTxNetShortChange, changePct: '', sourceDate: battleBriefSnapshotSourceDate_(margin.foreignTxNetShortUpdatedAt || margin.updatedAt), source: margin.foreignTxNetShortSource || 'TAIFEX' }
  ].filter(function(item) { return isFinite(item.value); });
  return postBattleBriefFinanceSnapshotToNas_('twse-margin', items, sourceDate);
}

function recordBattleHoldingsNasSnapshotScheduled() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var battle = getBattleBrief(ss);
  var items = (battle.holdings || []).filter(function(item) {
    return item && item.name && item.current !== '' && item.current != null && isFinite(Number(item.current));
  }).map(function(item) {
    return {
      code: item.code || item.name,
      name: item.name,
      value: Number(item.current),
      change: item.change,
      changePct: item.changePct,
      sourceDate: battleBriefSnapshotSourceDate_(item.updatedAt),
      source: item.source || '持股價格來源',
      note: item.note || ''
    };
  });
  if (!items.length) throw new Error('持股標的沒有可保存的有效價格資料。');
  return postBattleBriefFinanceSnapshotToNas_('holdings', items, items.map(function(item) { return item.sourceDate; }).filter(Boolean).sort().pop() || '');
}

function deleteBattleBriefFinanceSnapshotTriggers_() {
  var handlers = ['recordFundNavNasSnapshotScheduled', 'recordTwseMarginNasSnapshotScheduled', 'recordBattleHoldingsNasSnapshotScheduled', 'recordMarketSectorSnapshotScheduled'];
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (handlers.indexOf(trigger.getHandlerFunction()) >= 0) {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
}

function installBattleBriefFinanceSnapshotTriggers_() {
  var deleted = deleteBattleBriefFinanceSnapshotTriggers_();
  ScriptApp.newTrigger('recordFundNavNasSnapshotScheduled').timeBased().everyDays(1).atHour(19).nearMinute(0).create();
  ScriptApp.newTrigger('recordTwseMarginNasSnapshotScheduled').timeBased().everyDays(1).atHour(21).nearMinute(30).create();
  ScriptApp.newTrigger('recordBattleHoldingsNasSnapshotScheduled').timeBased().everyDays(1).atHour(5).nearMinute(30).create();
  ScriptApp.newTrigger('recordBattleHoldingsNasSnapshotScheduled').timeBased().everyDays(1).atHour(13).nearMinute(30).create();
  ScriptApp.newTrigger('recordMarketSectorSnapshotScheduled').timeBased().everyDays(1).atHour(7).nearMinute(30).create();
  return { message: '已建立基金 19:00、台股融資與維持率 21:30、持股 05:30／13:30、產業輪動 07:30 左右 NAS 快照觸發器', deleted: deleted, status: getBattleBriefFinanceSnapshotTriggerStatus_() };
}

// Apps Script 介面與 clasp 可直接執行的公開入口；正式排程仍由上方私有 helper 建立。
function installBattleBriefFinanceSnapshotTriggers() {
  return installBattleBriefFinanceSnapshotTriggers_();
}

function getBattleBriefFinanceSnapshotTriggerStatus() {
  return getBattleBriefFinanceSnapshotTriggerStatus_();
}

function getBattleBriefFinanceSnapshotTriggerStatus_() {
  var handlers = ['recordFundNavNasSnapshotScheduled', 'recordTwseMarginNasSnapshotScheduled', 'recordBattleHoldingsNasSnapshotScheduled', 'recordMarketSectorSnapshotScheduled'];
  var triggers = ScriptApp.getProjectTriggers().filter(function(trigger) { return handlers.indexOf(trigger.getHandlerFunction()) >= 0; }).map(function(trigger) {
    return { handler: trigger.getHandlerFunction(), eventType: String(trigger.getEventType()), source: String(trigger.getTriggerSource()), uid: trigger.getUniqueId ? trigger.getUniqueId() : '' };
  });
  return { installed: triggers.length === 5, count: triggers.length, triggers: triggers };
}

function getBattleBrief(ss) {
  var legacySheet = ss.getSheetByName(BATTLE_BRIEF_SHEET);
  var todayText = battleBriefDateText_(new Date());
  var previousMap = readBattleBriefLatestState_();
  // 僅作停用快照後的第一次過渡讀取；後續只使用最新比較基準，不再依賴歷史快照。
  if (legacySheet) {
    var legacyPreviousMap = readBattleBriefPreviousMap_(legacySheet, todayText);
    if (!Object.keys(previousMap).length) {
      previousMap = legacyPreviousMap;
    } else {
      // 舊版最新狀態只保存今日值；補回基金的前一日基準，
      // 讓施羅德延遲公布價的特殊比較規則能立即生效。
      Object.keys(legacyPreviousMap).forEach(function(key) {
        if (!previousMap[key]) return;
        if (previousMap[key].previous === '' || previousMap[key].previous == null) {
          previousMap[key].previous = legacyPreviousMap[key].previous;
        }
      });
    }
  }
  var marketDashboard = getMarketDashboard(getExternalDbSpreadsheet_());
  var grouped = buildBattleBriefRows_(ss, previousMap, legacySheet, todayText);
  var marketRows = buildBattleBriefMarketRows_(marketDashboard, previousMap);
  var etfHoldingChange = get00997AHoldingChange();
  var allRows = grouped.rows.concat(marketRows);
  writeBattleBriefLatestState_(todayText, grouped.funds);

  return {
    date: todayText,
    updatedAt: battleBriefNowText_(),
    funds: grouped.funds,
    holdings: grouped.holdings,
    market: marketRows,
    etfHoldingChange: etfHoldingChange,
    summary: {
      totalItems: allRows.length,
      upCount: allRows.filter(function(row) { return Number(row.change) > 0; }).length,
      downCount: allRows.filter(function(row) { return Number(row.change) < 0; }).length,
      flatCount: allRows.filter(function(row) { return row.change === 0; }).length,
      sheetName: '',
      storageMode: '只保留基金最新比較基準，不建立歷史快照',
      retentionDays: BATTLE_BRIEF_RETENTION_DAYS,
      prunedRows: 0,
      marketStance: marketDashboard && marketDashboard.summary ? marketDashboard.summary.stance : ''
    }
  };
}

function ensure00997AHoldingSheet_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  var current = headerRange.getValues()[0].map(function(value) { return String(value || '').trim(); });
  var needsHeader = headers.some(function(header, index) { return current[index] !== header; });
  if (needsHeader) {
    headerRange.setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function normalize00997ADateText_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd');
  }
  var text = String(value || '').trim();
  var match = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (!match) return text;
  return match[1] + '/' + ('0' + match[2]).slice(-2) + '/' + ('0' + match[3]).slice(-2);
}

function parse00997ANumber_(value) {
  if (value === '' || value == null) return 0;
  if (typeof value === 'number') return value;
  var normalized = String(value).replace(/,/g, '').replace(/%/g, '').trim();
  var number = Number(normalized);
  return isNaN(number) ? 0 : number;
}

function fetch00997AHoldingPayload_() {
  var response = UrlFetchApp.fetch(ETF_HOLDING_TRACKER_URL, {
    method: 'get',
    headers: { Accept: 'application/json' },
    muteHttpExceptions: true
  });
  var text = response.getContentText();
  var data = JSON.parse(text);
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : '00997A 持股資料抓取失敗');
  }
  var item = (data.items || []).filter(function(row) {
    return String(row && row.code || '').toUpperCase() === ETF_HOLDING_TARGET_CODE;
  })[0];
  if (!item || !item.holdings || !item.holdings.length) {
    throw new Error('00997A tracker payload 未包含持股資料');
  }
  var sourceDate = normalize00997ADateText_(item.holdings[0].sourceDate || item.aumDate);
  var holdings = item.holdings.map(function(row) {
    return {
      code: String(row.stockCode || '').trim(),
      name: String(row.stockName || '').trim(),
      shares: parse00997ANumber_(row.shares),
      weight: parse00997ANumber_(row.weight),
      sourceDate: normalize00997ADateText_(row.sourceDate || sourceDate),
      sourceTitle: row.sourceTitle || 'PoPoStock tracker / 群益官方持股'
    };
  }).filter(function(row) {
    return row.code || row.name;
  });
  return {
    code: ETF_HOLDING_TARGET_CODE,
    name: item.name || ETF_HOLDING_TARGET_NAME,
    sourceDate: sourceDate,
    fetchedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd HH:mm'),
    sourceTitle: 'PoPoStock tracker / 群益官方持股',
    sourceUrl: ETF_HOLDING_OFFICIAL_URL,
    holdings: holdings,
    totalWeight: holdings.reduce(function(sum, row) { return sum + (Number(row.weight) || 0); }, 0)
  };
}

function remove00997ASnapshotRowsForDate_(sheet, sourceDate, code) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var removed = 0;
  for (var i = values.length - 1; i >= 0; i--) {
    if (normalize00997ADateText_(values[i][0]) === sourceDate && String(values[i][2] || '').trim() === code) {
      sheet.deleteRow(i + 2);
      removed++;
    }
  }
  return removed;
}

function read00997ASnapshots_(sheet, code) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, ETF_HOLDING_SNAPSHOT_HEADERS.length).getValues().map(function(row) {
    return {
      sourceDate: normalize00997ADateText_(row[0]),
      fetchedAt: row[1],
      targetCode: String(row[2] || '').trim(),
      targetName: String(row[3] || '').trim(),
      code: String(row[4] || '').trim(),
      name: String(row[5] || '').trim(),
      shares: parse00997ANumber_(row[6]),
      weight: parse00997ANumber_(row[7]),
      source: String(row[8] || '').trim(),
      sourceUrl: String(row[9] || '').trim()
    };
  }).filter(function(row) {
    return row.targetCode === code && row.code;
  });
}

function previous00997AHoldings_(rows, sourceDate) {
  var previousDate = '';
  rows.forEach(function(row) {
    if (row.sourceDate && row.sourceDate < sourceDate && (!previousDate || row.sourceDate > previousDate)) {
      previousDate = row.sourceDate;
    }
  });
  if (!previousDate) return { date: '', holdings: [] };
  return {
    date: previousDate,
    holdings: rows.filter(function(row) { return row.sourceDate === previousDate; })
  };
}

function map00997AHoldings_(holdings) {
  var map = {};
  (holdings || []).forEach(function(row) {
    if (row.code) map[row.code] = row;
  });
  return map;
}

function classify00997ATheme_(holding) {
  var code = String(holding && holding.code || '').toUpperCase();
  var name = String(holding && holding.name || '');
  if (/AMD|NVDA|AVGO|AMAT|LRCX|KLAC|MPWR|CDNS|TXN|4062 JP|009150 KS|2330|2345|2383|3037/.test(code + ' ' + name)) return '半導體/AI硬體';
  if (/MU|WDC|STX|SNDK|285A JP|INTC/.test(code + ' ' + name)) return '記憶體/儲存';
  if (/CRWD|FTNT|PANW|OKTA|IOT|SNOW|DT|PLTR|ADBE|MSFT/.test(code + ' ' + name)) return '雲端/資安/軟體';
  if (/GOOGL|AAPL|META|AMZN/.test(code + ' ' + name)) return '大型科技平台';
  if (/RTX|GE |GEV|HWM/.test(code + ' ' + name)) return '航太/工業';
  if (/LITE|CIEN|COHR|KEYS|ALAB|APH|MRVL|CRDO/.test(code + ' ' + name)) return '網通/光通訊';
  return '其他';
}

function top00997AChanges_(changes, sign, limit) {
  return changes.filter(function(row) {
    return sign > 0 ? row.weightDelta > 0 : row.weightDelta < 0;
  }).sort(function(a, b) {
    return Math.abs(b.weightDelta) - Math.abs(a.weightDelta);
  }).slice(0, limit);
}

function summarize00997AChangeList_(rows) {
  return (rows || []).map(function(row) {
    var weightSign = row.weightDelta > 0 ? '+' : '';
    var sharesSign = row.sharesDelta > 0 ? '+' : '';
    return row.code + ' ' + row.name + ' ' + weightSign + row.weightDelta.toFixed(4) + 'pct / ' + sharesSign + Math.round(row.sharesDelta).toLocaleString('zh-TW') + '股';
  }).join('；');
}

function summarize00997AThemes_(changes) {
  var map = {};
  changes.forEach(function(row) {
    var theme = classify00997ATheme_(row);
    if (!map[theme]) map[theme] = { theme: theme, weightDelta: 0, count: 0 };
    map[theme].weightDelta += row.weightDelta || 0;
    map[theme].count++;
  });
  return Object.keys(map).map(function(key) {
    var item = map[key];
    item.weightDelta = Math.round(item.weightDelta * 10000) / 10000;
    return item;
  }).sort(function(a, b) {
    return Math.abs(b.weightDelta) - Math.abs(a.weightDelta);
  });
}

function countTrailing00997A_(values, predicate) {
  var count = 0;
  for (var i = values.length - 1; i >= 0; i--) {
    if (!predicate(values[i])) break;
    count++;
  }
  return count;
}

function build00997ARecentTrend_(rows, payload) {
  var byDate = {};
  (rows || []).forEach(function(row) {
    var date = normalize00997ADateText_(row.sourceDate);
    if (!date || date >= payload.sourceDate || !row.code) return;
    if (!byDate[date]) byDate[date] = {};
    byDate[date][row.code] = row;
  });

  var priorDates = Object.keys(byDate).sort().slice(-4);
  var snapshots = priorDates.map(function(date) {
    return { date: date, holdings: Object.keys(byDate[date]).map(function(code) { return byDate[date][code]; }) };
  });
  snapshots.push({ date: payload.sourceDate, holdings: payload.holdings });
  if (snapshots.length < 2) return { dates: snapshots.map(function(item) { return item.date; }), themes: [] };

  var themeMaps = snapshots.map(function(snapshot) {
    var map = {};
    snapshot.holdings.forEach(function(row) {
      var theme = classify00997ATheme_(row);
      map[theme] = (map[theme] || 0) + (Number(row.weight) || 0);
    });
    Object.keys(map).forEach(function(theme) {
      map[theme] = Math.round(map[theme] * 10000) / 10000;
    });
    return map;
  });
  var themes = {};
  themeMaps.forEach(function(map) {
    Object.keys(map).forEach(function(theme) { themes[theme] = true; });
  });

  return {
    dates: snapshots.map(function(item) { return item.date; }),
    themes: Object.keys(themes).map(function(theme) {
      var deltas = [];
      for (var i = 1; i < themeMaps.length; i++) {
        deltas.push(Math.round(((themeMaps[i][theme] || 0) - (themeMaps[i - 1][theme] || 0)) * 10000) / 10000);
      }
      return {
        theme: theme,
        currentWeight: themeMaps[themeMaps.length - 1][theme] || 0,
        dailyWeightDeltas: deltas,
        consecutiveIncreaseDays: countTrailing00997A_(deltas, function(delta) { return delta > 0.0001; }),
        consecutiveDecreaseDays: countTrailing00997A_(deltas, function(delta) { return delta < -0.0001; })
      };
    }).filter(function(item) {
      return item.dailyWeightDeltas.some(function(delta) { return Math.abs(delta) >= 0.0001; });
    }).sort(function(a, b) {
      return Math.abs((b.dailyWeightDeltas[b.dailyWeightDeltas.length - 1] || 0)) - Math.abs((a.dailyWeightDeltas[a.dailyWeightDeltas.length - 1] || 0));
    }).slice(0, 8)
  };
}

function build00997AChangeSummary_(payload, previous) {
  var currentMap = map00997AHoldings_(payload.holdings);
  var previousMap = map00997AHoldings_(previous.holdings);
  var changes = [];
  var added = [];
  var removed = [];

  payload.holdings.forEach(function(current) {
    var prior = previousMap[current.code];
    var item = {
      code: current.code,
      name: current.name,
      shares: current.shares,
      weight: current.weight,
      previousShares: prior ? prior.shares : '',
      previousWeight: prior ? prior.weight : '',
      sharesDelta: prior ? current.shares - prior.shares : current.shares,
      weightDelta: prior ? current.weight - prior.weight : current.weight,
      theme: classify00997ATheme_(current)
    };
    if (!prior) added.push(item);
    if (prior && (Math.abs(item.weightDelta) >= 0.0001 || Math.abs(item.sharesDelta) >= 1)) changes.push(item);
  });

  previous.holdings.forEach(function(prior) {
    if (!currentMap[prior.code]) {
      removed.push({
        code: prior.code,
        name: prior.name,
        shares: 0,
        weight: 0,
        previousShares: prior.shares,
        previousWeight: prior.weight,
        sharesDelta: -prior.shares,
        weightDelta: -prior.weight,
        theme: classify00997ATheme_(prior)
      });
    }
  });

  changes = changes.concat(added).concat(removed);
  var topAdds = top00997AChanges_(changes, 1, 5);
  var topReduces = top00997AChanges_(changes, -1, 5);
  var themes = summarize00997AThemes_(changes).slice(0, 4);
  return {
    code: ETF_HOLDING_TARGET_CODE,
    name: ETF_HOLDING_TARGET_NAME,
    sourceDate: payload.sourceDate,
    previousDate: previous.date || '',
    fetchedAt: payload.fetchedAt,
    sourceUrl: ETF_HOLDING_OFFICIAL_URL,
    sourceTitle: payload.sourceTitle,
    holdingsCount: payload.holdings.length,
    totalWeight: Math.round(payload.totalWeight * 10000) / 10000,
    added: added,
    removed: removed,
    changes: changes,
    topAdds: topAdds,
    topReduces: topReduces,
    themes: themes,
    addedText: summarize00997AChangeList_(added.slice(0, 8)),
    removedText: summarize00997AChangeList_(removed.slice(0, 8)),
    topAddsText: summarize00997AChangeList_(topAdds),
    topReducesText: summarize00997AChangeList_(topReduces),
    themesText: themes.map(function(item) {
      return item.theme + ' ' + (item.weightDelta > 0 ? '+' : '') + item.weightDelta.toFixed(4) + 'pct';
    }).join('；'),
    recentTrend: null
  };
}

function askOpenAI00997ACommentary_(summary) {
  if (!summary.previousDate || !summary.changes.length) {
    return '首筆或同資料日快照已建立，待下一個資料日後再判讀持股異動。';
  }
  // Apps Script 沒有 process.env；以 Script Properties 作為部署環境變數保存設定。
  var properties = PropertiesService.getScriptProperties();
  var key = String(properties.getProperty('OPENAI_API_KEY') || '').trim();
  if (!key) throw new Error('尚未設定 OPENAI_API_KEY，無法產生00997A持股評論');
  var model = String(properties.getProperty('OPENAI_MODEL') || '').trim() || 'gpt-4o-mini';

  var payload = {
    fund: { code: summary.code, name: summary.name },
    dates: { previousTradingDate: summary.previousDate, tradingDate: summary.sourceDate },
    added: summary.added.map(function(row) {
      return { code: row.code, name: row.name, weight: row.weight, theme: row.theme };
    }).slice(0, 8),
    removed: summary.removed.map(function(row) {
      return { code: row.code, name: row.name, previousWeight: row.previousWeight, theme: row.theme };
    }).slice(0, 8),
    increased: summary.topAdds.map(function(row) {
      return {
        code: row.code,
        name: row.name,
        previousWeight: row.previousWeight,
        currentWeight: row.weight,
        weightDelta: row.weightDelta,
        sharesDelta: row.sharesDelta,
        theme: row.theme
      };
    }),
    decreased: summary.topReduces.map(function(row) {
      return {
        code: row.code,
        name: row.name,
        previousWeight: row.previousWeight,
        currentWeight: row.weight,
        weightDelta: row.weightDelta,
        sharesDelta: row.sharesDelta,
        theme: row.theme
      };
    }),
    themeChanges: summary.themes.map(function(row) {
      return { theme: row.theme, weightDelta: row.weightDelta, changedCount: row.count };
    }),
    recentThemeTrend: summary.recentTrend || { dates: [], themes: [] }
  };

  var systemPrompt = '你是一名「基金持股與資產配置分析師」，負責根據每日基金持股異動，判讀基金經理人的可能配置方向。' +
    '目標不是羅列持股，而是判讀經理人今天最可能在做什麼；先比較多檔持股與主題權重是否一致，再下結論。' +
    '請嚴格區分已知異動與推測意圖，不可把單日變化直接宣稱為確定意圖。若同一板塊只單日增加，寫「今日增持」；連續2日才寫「短線持續增持」；連續3日以上才寫「形成較明確加碼趨勢」，減碼同理。若只是成長股內部由一板塊轉向另一板塊，明確寫「內部輪動」，不要寫成轉防禦。證據不足時直接寫「目前不足以確認」，不要堆疊假設。' +
    '最終固定輸出以下四個純文字區塊，不要 Markdown 標題、JSON、分析過程或額外說明：' +
    '今日訊號：用一句極短標籤，從偏進攻、中性偏進攻、中性／結構調整、中性偏防禦、明顯降風險中選一個，後接6到15字核心主題。' +
    '核心判讀：用1到2句直接回答經理人今天最可能在做什麼，優先判斷全面提高風險曝險、全面降低風險曝險、成長股內部換股、產業／主題輪動、獲利了結、防禦性調整、單日再平衡或尚無明確方向。' +
    '主要證據：只列2到4個最重要證據，優先寫板塊之間的資金流向、多檔同類股同步變化與產業淨權重，不要逐檔念股票。' +
    '後續驗證：只寫1到2個最值得追蹤的具體訊號，不要寫空泛的市場觀察。' +
    '全文繁體中文約120到220字，不預測股價漲跌、不提供買賣建議、不把單日變化過度解讀為長期趨勢，避免重複與過度保守措辭。';

  var requestBody = {
    model: model,
    instructions: systemPrompt,
    input: JSON.stringify(payload),
    max_output_tokens: 320,
    store: false
  };
  // Reasoning models also consume the output budget while thinking. Keep the
  // reasoning effort low for this short daily commentary and leave enough
  // budget for the requested Chinese text.
  if (/^gpt-5\.6-luna$/i.test(model)) {
    requestBody.reasoning = { effort: 'none' };
    requestBody.max_output_tokens = 640;
  } else if (/^(gpt-5|o[134](?:-|$))/i.test(model)) {
    requestBody.reasoning = { effort: 'minimal' };
    requestBody.max_output_tokens = 640;
  }

  var response = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var data = JSON.parse(text);
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : 'OpenAI 00997A評論失敗');
  }
  var commentary = String(data.output_text || '').trim();
  if (!commentary && data.output && data.output.length) {
    data.output.forEach(function(item) {
      (item.content || []).forEach(function(content) {
        if ((content.type === 'output_text' || content.type === 'text') && content.text) {
          commentary += String(content.text);
        }
      });
    });
  }
  commentary = commentary.replace(/\s+/g, ' ').trim();
  if (!commentary) {
    var incompleteReason = data.incomplete_details && data.incomplete_details.reason;
    var responseStatus = data.status ? '，status=' + data.status : '';
    throw new Error('OpenAI 00997A評論沒有文字輸出' + (incompleteReason ? '，原因：' + incompleteReason : responseStatus));
  }
  return commentary;
}

function fallback00997ACommentary_(summary, error) {
  if (!summary.previousDate) return '首筆快照已建立，待下一個資料日後再判讀持股異動。';
  var theme = summary.themes && summary.themes[0] ? summary.themes[0] : null;
  var lead = theme ? (theme.theme + (theme.weightDelta >= 0 ? '權重增加' : '權重下降')) : '持股變化不大';
  return lead + '；本次先以規則摘要顯示，OpenAI評論暫不可用：' + String(error && error.message ? error.message : 'unknown');
}

function upsert00997AChangeRow_(sheet, summary, commentary) {
  var row = [[
    summary.sourceDate,
    summary.code,
    summary.sourceDate,
    summary.previousDate || '',
    summary.addedText || '',
    summary.removedText || '',
    summary.topAddsText || '',
    summary.topReducesText || '',
    summary.themesText || '',
    commentary || '',
    summary.totalWeight,
    summary.fetchedAt,
    summary.sourceUrl
  ]];
  var lastRow = sheet.getLastRow();
  var targetRow = 0;
  if (lastRow >= 2) {
    var values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    values.forEach(function(existing, index) {
      if (normalize00997ADateText_(existing[0]) === summary.sourceDate && String(existing[1] || '').trim() === summary.code) {
        targetRow = index + 2;
      }
    });
  }
  if (targetRow) sheet.getRange(targetRow, 1, 1, ETF_HOLDING_CHANGE_HEADERS.length).setValues(row);
  else sheet.getRange(sheet.getLastRow() + 1, 1, 1, ETF_HOLDING_CHANGE_HEADERS.length).setValues(row);
  sheet.getRange(2, 11, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('0.0000');
}

function latest00997AChangeFromSheet_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var values = sheet.getRange(2, 1, lastRow - 1, ETF_HOLDING_CHANGE_HEADERS.length).getValues();
  var latest = null;
  values.forEach(function(row) {
    var dateText = normalize00997ADateText_(row[0]);
    if (!dateText || (latest && latest.date >= dateText)) return;
    latest = {
      date: dateText,
      code: String(row[1] || '').trim(),
      sourceDate: normalize00997ADateText_(row[2]),
      previousDate: normalize00997ADateText_(row[3]),
      addedText: String(row[4] || '').trim(),
      removedText: String(row[5] || '').trim(),
      topAddsText: String(row[6] || '').trim(),
      topReducesText: String(row[7] || '').trim(),
      themesText: String(row[8] || '').trim(),
      commentary: String(row[9] || '').trim(),
      totalWeight: parse00997ANumber_(row[10]),
      createdAt: row[11] ? String(row[11]) : '',
      sourceUrl: String(row[12] || ETF_HOLDING_OFFICIAL_URL).trim()
    };
  });
  return latest;
}

function get00997AHoldingChange() {
  var ss = getEtfHoldingsSpreadsheet_();
  var changeSheet = ensure00997AHoldingSheet_(ss, ETF_HOLDING_CHANGE_SHEET, ETF_HOLDING_CHANGE_HEADERS);
  var latest = latest00997AChangeFromSheet_(changeSheet);
  var status = get00997AHoldingSnapshotTriggerStatus();
  return {
    hasData: !!latest,
    latest: latest,
    officialUrl: ETF_HOLDING_OFFICIAL_URL,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + ETF_HOLDINGS_SPREADSHEET_ID + '/edit',
    trigger: status
  };
}

function record00997AHoldingSnapshot() {
  var ss = getEtfHoldingsSpreadsheet_();
  var snapshotSheet = ensure00997AHoldingSheet_(ss, ETF_HOLDING_SNAPSHOT_SHEET, ETF_HOLDING_SNAPSHOT_HEADERS);
  var changeSheet = ensure00997AHoldingSheet_(ss, ETF_HOLDING_CHANGE_SHEET, ETF_HOLDING_CHANGE_HEADERS);
  var existingRows = read00997ASnapshots_(snapshotSheet, ETF_HOLDING_TARGET_CODE);
  var payload = fetch00997AHoldingPayload_();
  var previous = previous00997AHoldings_(existingRows, payload.sourceDate);
  var removedRows = remove00997ASnapshotRowsForDate_(snapshotSheet, payload.sourceDate, payload.code);
  var rows = payload.holdings.map(function(row) {
    return [
      payload.sourceDate,
      payload.fetchedAt,
      payload.code,
      payload.name,
      row.code,
      row.name,
      row.shares,
      row.weight,
      row.sourceTitle || payload.sourceTitle,
      payload.sourceUrl
    ];
  });
  if (rows.length) {
    snapshotSheet.getRange(snapshotSheet.getLastRow() + 1, 1, rows.length, ETF_HOLDING_SNAPSHOT_HEADERS.length).setValues(rows);
  }
  snapshotSheet.getRange(2, 7, Math.max(1, snapshotSheet.getMaxRows() - 1), 1).setNumberFormat('#,##0');
  snapshotSheet.getRange(2, 8, Math.max(1, snapshotSheet.getMaxRows() - 1), 1).setNumberFormat('0.0000');

  var summary = build00997AChangeSummary_(payload, previous);
  summary.recentTrend = build00997ARecentTrend_(existingRows, payload);
  var commentary = '';
  try {
    commentary = askOpenAI00997ACommentary_(summary);
  } catch (ex) {
    commentary = fallback00997ACommentary_(summary, ex);
  }
  upsert00997AChangeRow_(changeSheet, summary, commentary);
  SpreadsheetApp.flush();
  return {
    message: '00997A持股快照已更新',
    sourceDate: payload.sourceDate,
    previousDate: previous.date || '',
    holdingsCount: payload.holdings.length,
    totalWeight: summary.totalWeight,
    removedRows: removedRows,
    topAddsText: summary.topAddsText,
    topReducesText: summary.topReducesText,
    themesText: summary.themesText,
    commentary: commentary,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + ETF_HOLDINGS_SPREADSHEET_ID + '/edit'
  };
}

function record00997AHoldingSnapshotScheduled() {
  return record00997AHoldingSnapshot();
}

function delete00997AHoldingSnapshotTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'record00997AHoldingSnapshotScheduled') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
}

function install00997AHoldingSnapshotTrigger() {
  var deleted = delete00997AHoldingSnapshotTriggers_();
  ScriptApp.newTrigger('record00997AHoldingSnapshotScheduled')
    .timeBased()
    .everyDays(1)
    .atHour(19)
    .nearMinute(0)
    .create();
  return {
    message: '已建立 record00997AHoldingSnapshotScheduled 每日 19:00 左右觸發器',
    deleted: deleted,
    status: get00997AHoldingSnapshotTriggerStatus()
  };
}

function get00997AHoldingSnapshotTriggerStatus() {
  var triggers = ScriptApp.getProjectTriggers()
    .filter(function(trigger) {
      return trigger.getHandlerFunction() === 'record00997AHoldingSnapshotScheduled';
    })
    .map(function(trigger) {
      return {
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType()),
        triggerSource: String(trigger.getTriggerSource())
      };
    });
  return {
    installed: triggers.length > 0,
    count: triggers.length,
    triggers: triggers,
    schedule: '每日 19:00 左右（Apps Script time-based trigger 近似時間）'
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
    marketExposure: exposureAsset > 0 && netAsset > 0 ? exposureAsset / netAsset : null
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
  if (!(summary.marketValue > 0) && !(summary.totalAssetValue > 0)) {
    throw new Error('每日資產快照來源 I2/H2 尚未就緒，略過零值寫入');
  }
  var targetRow = findDailyAssetSnapshotDateRow_(sheet, dateText, tz) || sheet.getLastRow() + 1;
  var note = '09:10：市值' + DAILY_ASSET_SNAPSHOT_MARKET_CELL + '，資產' + DAILY_ASSET_SNAPSHOT_TOTAL_ASSET_CELL + '，曝險' + DAILY_ASSET_SNAPSHOT_EXPOSURE_CELL + '，負債：質押／信貸資料';

  sheet.getRange(targetRow, 1, 1, DAILY_ASSET_SNAPSHOT_HEADERS.length).setValues([[
    dateText,
    summary.marketValue,
    summary.totalCost,
    summary.totalReturn,
    summary.monthlyDiv,
    note,
    summary.marketExposure,
    null,
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
      dailyChangePct: null,
      totalAssetTrend30d: null
    };
  }

  var tz = ss.getSpreadsheetTimeZone ? ss.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var values = sheet.getRange(2, 1, lastRow - 1, DAILY_ASSET_SNAPSHOT_HEADERS.length).getValues();
  var rows = [];
  values.forEach(function(row, index) {
    var hasDate = String(row[0] || '').trim() !== '' || row[0] instanceof Date;
    var hasMarketValue = row[1] !== '' && row[1] !== null && row[1] !== undefined;
    var hasTotalAssetValue = row[8] !== '' && row[8] !== null && row[8] !== undefined;
    if (!hasDate && !hasMarketValue && !hasTotalAssetValue) return;
    if (!hasMarketValue && !hasTotalAssetValue) return;
    // 不把排程執行時尚未完成重算的 I2/H2 零值當成最新快照，避免前端把空白 H 欄誤顯示為 0%。
    var snapshotMarketValue = parseSheetNumber_(row[1]);
    var snapshotTotalAssetValue = parseSheetNumber_(row[8]);
    if (!(snapshotMarketValue > 0) && !(snapshotTotalAssetValue > 0)) return;
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
  var totalAssetTrend30d = null;
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
  if (latest && latest.totalAssetValue !== null) {
    var trendCutoff = latest.dateValue - 30 * 24 * 60 * 60 * 1000;
    var trendBase = null;
    for (var trendIndex = 0; trendIndex < rows.length; trendIndex++) {
      var candidate = rows[trendIndex];
      if (candidate.dateValue >= latest.dateValue) break;
      if (candidate.dateValue >= trendCutoff && candidate.totalAssetValue !== null) {
        trendBase = candidate;
        break;
      }
    }
    if (!trendBase) {
      for (var fallbackIndex = rows.length - 1; fallbackIndex >= 0; fallbackIndex--) {
        var fallbackCandidate = rows[fallbackIndex];
        if (fallbackCandidate.dateValue < latest.dateValue && fallbackCandidate.totalAssetValue !== null) {
          trendBase = fallbackCandidate;
          break;
        }
      }
    }
    if (trendBase) {
      var trendChangeAmount = latest.totalAssetValue - trendBase.totalAssetValue;
      var trendChangePct = trendBase.totalAssetValue ? trendChangeAmount / trendBase.totalAssetValue * 100 : null;
      totalAssetTrend30d = {
        fromDate: trendBase.date,
        toDate: latest.date,
        days: Math.max(0, Math.round((latest.dateValue - trendBase.dateValue) / (24 * 60 * 60 * 1000))),
        baseValue: trendBase.totalAssetValue,
        latestValue: latest.totalAssetValue,
        changeAmount: trendChangeAmount,
        changePct: trendChangePct
      };
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
    totalAssetChangePct: totalAssetChangePct,
    totalAssetTrend30d: totalAssetTrend30d
  };
}

function getEventChronicle(ss) {
  var sheet = ss.getSheetByName(EVENT_CHRONICLE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      sheetName: EVENT_CHRONICLE_SHEET_NAME,
      fields: ['name', 'date', 'days', 'months', 'price', 'dailyCost', 'mode', 'durationDays', 'note'],
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
    totalCost: headerCol_(headers, ['總花費', '價格', '總成本'], 4),
    dailyCost: headerCol_(headers, ['換算每日花費', '每日花費', '每日成本'], 5),
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
      price: chronicleCell_(row, idx.totalCost),
      dailyCost: chronicleCell_(row, idx.dailyCost),
      mode: chronicleCell_(row, idx.mode),
      durationDays: chronicleCell_(row, idx.days),
      note: chronicleCell_(row, idx.note)
    });
  });

  var result = {
    sheetName: EVENT_CHRONICLE_SHEET_NAME,
    fields: ['name', 'date', 'days', 'months', 'price', 'dailyCost', 'mode', 'durationDays', 'note'],
    rows: rows
  };
  return result;
}

function normalizeEventChronicleInput_(p) {
  var name = String(p.name || '').trim();
  var dateText = String(p.date || '').trim().replace(/-/g, '/');
  var price = Number(p.price);
  var mode = String(p.mode || '').trim();
  var durationDays = Number(p.durationDays || 0);
  if (!name) throw new Error('請輸入主要記錄名稱');
  if (!dateText || !/^\d{4}\/\d{2}\/\d{2}$/.test(dateText)) throw new Error('請選擇有效日期');
  var date = parseCalendarDate_(dateText.replace(/\//g, '-'));
  if (!date || isNaN(date.getTime())) throw new Error('日期格式無效');
  if (!isFinite(price) || price <= 0) throw new Error('價格必須大於 0');
  if (mode !== '長期成本' && mode !== '單一事件耗時') throw new Error('請選擇成本模式');
  if (mode === '單一事件耗時' && (!isFinite(durationDays) || durationDays <= 0 || Math.floor(durationDays) !== durationDays)) {
    throw new Error('單一事件請輸入大於 0 的耗時日數');
  }
  return { name: name, dateText: dateText, date: date, price: price, mode: mode, durationDays: durationDays };
}

function saveEventChronicle_(p) {
  var input = normalizeEventChronicleInput_(p);

  var sheet = getCommandSpreadsheet_().getSheetByName(EVENT_CHRONICLE_SHEET_NAME);
  if (!sheet) throw new Error('找不到試算表分頁：' + EVENT_CHRONICLE_SHEET_NAME);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var rowNumber = Math.max(sheet.getLastRow() + 1, 2);
    var row = [input.name, input.date, input.mode === '單一事件耗時' ? input.durationDays : '', '', input.price, '', input.mode, ''];
    sheet.getRange(rowNumber, 1, 1, 8).setValues([row]);
    sheet.getRange(rowNumber, 2).setNumberFormat('yyyy/mm/dd');
    sheet.getRange(rowNumber, 3).setFormula(input.mode === '長期成本'
      ? '=IF(B' + rowNumber + '="","",TODAY()-B' + rowNumber + '+1)'
      : '=IF(C' + rowNumber + '<=0,"",C' + rowNumber + ')');
    sheet.getRange(rowNumber, 4).setFormula('=IF(C' + rowNumber + '<=0,"",ROUND(C' + rowNumber + '/30.6,2))');
    sheet.getRange(rowNumber, 6).setFormula('=IF(OR(C' + rowNumber + '<=0,E' + rowNumber + '<=0),"",E' + rowNumber + '/C' + rowNumber + ')');
    sheet.getRange(rowNumber, 3, 1, 2).setNumberFormat('0.00');
    sheet.getRange(rowNumber, 5, 1, 2).setNumberFormat('#,##0.##');
    var validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(['長期成本', '單一事件耗時'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(rowNumber, 7).setDataValidation(validation);
    SpreadsheetApp.flush();
    var days = input.mode === '單一事件耗時' ? input.durationDays : Math.max(1, Math.floor((new Date().getTime() - input.date.getTime()) / 86400000) + 1);
    return {
      rowNumber: rowNumber,
      name: input.name,
      date: input.dateText,
      price: input.price,
      mode: input.mode,
      days: days,
      months: Math.round(days / 30.6 * 100) / 100,
      dailyCost: Math.round(input.price / days * 100) / 100
    };
  } finally {
    lock.releaseLock();
  }
}

function editEventChronicle_(p) {
  var input = normalizeEventChronicleInput_(p);
  var rowNumber = Number(p.rowNumber);
  if (!isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber || rowNumber < 2) throw new Error('事件列號無效');
  var sheet = getCommandSpreadsheet_().getSheetByName(EVENT_CHRONICLE_SHEET_NAME);
  if (!sheet || rowNumber > sheet.getLastRow()) throw new Error('找不到要編輯的事件');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var existingNote = sheet.getRange(rowNumber, 8).getValue();
    sheet.getRange(rowNumber, 1, 1, 8).setValues([[input.name, input.date, input.mode === '單一事件耗時' ? input.durationDays : '', '', input.price, '', input.mode, existingNote]]);
    sheet.getRange(rowNumber, 2).setNumberFormat('yyyy/mm/dd');
    sheet.getRange(rowNumber, 3).setFormula(input.mode === '長期成本'
      ? '=IF(B' + rowNumber + '="","",TODAY()-B' + rowNumber + '+1)'
      : '=IF(C' + rowNumber + '<=0,"",C' + rowNumber + ')');
    sheet.getRange(rowNumber, 4).setFormula('=IF(C' + rowNumber + '<=0,"",ROUND(C' + rowNumber + '/30.6,2))');
    sheet.getRange(rowNumber, 6).setFormula('=IF(OR(C' + rowNumber + '<=0,E' + rowNumber + '<=0),"",E' + rowNumber + '/C' + rowNumber + ')');
    sheet.getRange(rowNumber, 3, 1, 2).setNumberFormat('0.00');
    sheet.getRange(rowNumber, 5, 1, 2).setNumberFormat('#,##0.##');
    sheet.getRange(rowNumber, 7).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['長期成本', '單一事件耗時'], true).setAllowInvalid(false).build());
    SpreadsheetApp.flush();
    return { rowNumber: rowNumber, name: input.name, message: '事件已更新' };
  } finally {
    lock.releaseLock();
  }
}

function deleteEventChronicle_(p) {
  var rowNumber = Number(p.rowNumber);
  if (!isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber || rowNumber < 2) throw new Error('事件列號無效');
  var sheet = getCommandSpreadsheet_().getSheetByName(EVENT_CHRONICLE_SHEET_NAME);
  if (!sheet || rowNumber > sheet.getLastRow()) throw new Error('找不到要移除的事件');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.deleteRow(rowNumber);
    return { rowNumber: rowNumber, message: '事件已移除' };
  } finally {
    lock.releaseLock();
  }
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
    updatedAt: headerCol_(headers, ['更新時間'], 8),
    personKey: headerCol_(headers, ['NAS資料鍵', '命盤資料鍵', '人員識別碼'], -1)
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
      updatedAt: ziweiCell_(row, idx.updatedAt),
      personKey: ziweiCell_(row, idx.personKey) || ziweiDefaultPersonKey_(name, i + 2)
    });
  });

  return {
    sheetName: ZIWEI_SHEET_NAME,
    spreadsheetId: ZIWEI_SPREADSHEET_ID,
    rows: rows
  };
}

function ziweiDefaultPersonKey_(name, rowNumber) {
  var normalized = String(name || '').trim().toLowerCase();
  if (normalized === 'sis') return 'sis';
  if (normalized === 'me') return 'me';
  var key = normalized.replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 56);
  return key || ('person-' + String(rowNumber || 'unknown'));
}

function getArkOsAstrologyToken_() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('ARKOS_ASTROLOGY_TOKEN') || props.getProperty('ARKOS_UPLOAD_TOKEN');
  token = normalizeToken_(token);
  if (!token) throw new Error('尚未設定 ARKOS_ASTROLOGY_TOKEN，無法連線 NAS 命盤資料。');
  return token;
}

function fetchArkOsAstrology_(path, options) {
  options = options || {};
  var url = ARKOS_ASTROLOGY_API_BASE.replace(/\/$/, '') + path;
  var params = {
    method: options.method || 'get',
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + getArkOsAstrologyToken_(),
      Accept: 'application/json'
    }
  };
  if (options.payload !== undefined) {
    params.contentType = 'application/json';
    params.payload = JSON.stringify(options.payload);
  }
  var response = UrlFetchApp.fetch(url, params);
  var status = response.getResponseCode();
  var text = response.getContentText();
  var body;
  try {
    body = JSON.parse(text);
  } catch (ex) {
    throw new Error('NAS 命盤 API 回應不是 JSON（HTTP ' + status + '）。');
  }
  if (status < 200 || status >= 300) {
    throw new Error(body.error || ('NAS 命盤 API 失敗（HTTP ' + status + '）。'));
  }
  if (body.imageUrl && /^\//.test(body.imageUrl)) {
    body.imageUrl = ARKOS_ASTROLOGY_API_BASE.replace(/\/$/, '') + body.imageUrl;
  }
  return body;
}

function fetchArkOsAstrologyImageDataUrl_(path) {
  var url = ARKOS_ASTROLOGY_API_BASE.replace(/\/$/, '') + path;
  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + getArkOsAstrologyToken_(),
      Accept: 'image/*'
    }
  });
  var status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    var text = response.getContentText();
    var body = {};
    try { body = JSON.parse(text); } catch (ex) {}
    throw new Error(body.error || ('NAS 命盤圖片 API 失敗（HTTP ' + status + '）。'));
  }
  var blob = response.getBlob();
  var mime = String(blob.getContentType() || 'image/png').split(';')[0];
  return 'data:' + mime + ';base64,' + Utilities.base64Encode(blob.getBytes());
}

function fetchArkOsAstrologyChartUpload_(personKey, chartKey, fileName, mimeType, base64) {
  var safePersonKey = String(personKey || '').trim();
  var safeChartKey = String(chartKey || 'ziwei').trim();
  var safeFileName = String(fileName || 'chart.png').trim().replace(/[^A-Za-z0-9._-]/g, '_');
  var safeMimeType = String(mimeType || 'image/png').trim().toLowerCase();
  var safeBase64 = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(safePersonKey)) throw new Error('命盤人員識別碼格式錯誤');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(safeChartKey)) throw new Error('命盤類型格式錯誤');
  if (!/^image\/(png|jpe?g|webp)$/i.test(safeMimeType)) throw new Error('只接受 PNG、JPG 或 WebP 命盤圖片');
  if (!safeBase64) throw new Error('尚未選擇命盤圖片');
  var bytes = Utilities.base64Decode(safeBase64);
  if (bytes.length > 12 * 1024 * 1024) throw new Error('命盤圖片不可超過 12 MB');
  var blob = Utilities.newBlob(bytes, safeMimeType, safeFileName);
  var url = ARKOS_ASTROLOGY_API_BASE.replace(/\/$/, '') + '/api/astrology/persons/' + encodeURIComponent(safePersonKey) + '/charts/' + encodeURIComponent(safeChartKey) + '/image';
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + getArkOsAstrologyToken_(), Accept: 'application/json' },
    payload: { image: blob }
  });
  var status = response.getResponseCode();
  var text = response.getContentText();
  var body = {};
  try { body = JSON.parse(text); } catch (ex) { throw new Error('NAS 命盤上傳回應不是 JSON（HTTP ' + status + '）。'); }
  if (status < 200 || status >= 300) throw new Error(body.error || ('NAS 命盤上傳失敗（HTTP ' + status + '）。'));
  return body;
}

function uploadZiweiChart_(p) {
  var result = fetchArkOsAstrologyChartUpload_(p.personKey, p.chartKey || 'ziwei', p.fileName, p.mimeType, p.base64);
  if (result.imageFile) result.imageDataUrl = fetchArkOsAstrologyImageDataUrl_('/media/astrology/' + encodeURIComponent(p.personKey) + '/' + encodeURIComponent(p.chartKey || 'ziwei') + '/' + encodeURIComponent(result.imageFile));
  return result;
}

function deleteZiweiChart_(p) {
  var personKey = String(p.personKey || '').trim();
  var chartKey = String(p.chartKey || 'ziwei').trim();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(personKey)) throw new Error('命盤人員識別碼格式錯誤');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(chartKey)) throw new Error('命盤類型格式錯誤');
  return fetchArkOsAstrology_('/api/astrology/persons/' + encodeURIComponent(personKey) + '/charts/' + encodeURIComponent(chartKey), { method: 'delete' });
}

function getZiweiChartDetail_(p) {
  var personKey = String(p.personKey || '').trim();
  var chartKey = String(p.chartKey || 'ziwei').trim();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(personKey)) throw new Error('命盤人員識別碼格式錯誤');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(chartKey)) throw new Error('命盤類型格式錯誤');
  var detail = fetchArkOsAstrology_('/api/astrology/persons/' + encodeURIComponent(personKey) + '/charts/' + encodeURIComponent(chartKey));
  if (detail.imageFile) {
    detail.imageDataUrl = fetchArkOsAstrologyImageDataUrl_('/media/astrology/' + encodeURIComponent(personKey) + '/' + encodeURIComponent(chartKey) + '/' + encodeURIComponent(detail.imageFile));
  }
  return detail;
}

function saveZiweiInterpretation_(p) {
  var personKey = String(p.personKey || '').trim();
  var chartKey = String(p.chartKey || 'ziwei').trim();
  var content = String(p.content || '');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(personKey)) throw new Error('命盤人員識別碼格式錯誤');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(chartKey)) throw new Error('命盤類型格式錯誤');
  if (content.length > 1000000) throw new Error('命盤解說超過 1 MB 上限');
  return fetchArkOsAstrology_('/api/astrology/persons/' + encodeURIComponent(personKey) + '/charts/' + encodeURIComponent(chartKey) + '/interpretation', {
    method: 'put',
    payload: { content: content, expectedUpdatedAt: String(p.expectedUpdatedAt || '') }
  });
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
  var requestedDate = String(options.date || '').trim();
  var includeAllCalendars = String(options.allCalendars || '').trim() === '1';
  var dayOffset = 0;
  var dayCount = 1;
  var start;
  if (requestedDate) {
    start = parseCalendarDate_(requestedDate);
    mode = 'date';
  } else {
    if (mode !== 'tomorrow' && mode !== 'week') mode = 'today';
    dayOffset = mode === 'today' ? 0 : 1;
    dayCount = mode === 'week' ? 7 : 1;
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
  }
  var end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset + dayCount);
  if (requestedDate) {
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  }
  var calendars = includeAllCalendars ? CalendarApp.getAllCalendars() : [CalendarApp.getDefaultCalendar()];
  var events = [];
  var warnings = [];

  calendars.forEach(function(calendar) {
    try {
      calendar.getEvents(start, end).forEach(function(event) {
        var eventStart = event.getStartTime();
        var displayStart = eventStart.getTime() < start.getTime() ? start : eventStart;
        events.push({
          eventId: event.getId(),
          calendarId: calendar.getId(),
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
    } catch (ex) {
      warnings.push((calendar && calendar.getName ? calendar.getName() : 'Calendar') + ': ' + (ex && ex.message ? ex.message : ex));
    }
  });

  events.sort(function(a, b) {
    return a.startMs - b.startMs || String(a.title).localeCompare(String(b.title));
  });

  return {
    mode: mode,
    date: Utilities.formatDate(start, tz, 'yyyy/MM/dd'),
    startDate: Utilities.formatDate(start, tz, 'yyyy/MM/dd'),
    endDate: Utilities.formatDate(new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1), tz, 'yyyy/MM/dd'),
    calendarScope: includeAllCalendars ? 'all' : 'default',
    warnings: warnings,
    events: events.map(function(event) {
      return {
        eventId: event.eventId,
        calendarId: event.calendarId,
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

function parseCalendarDate_(dateText) {
  var match = String(dateText || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error('行程日期格式不正確');
  var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (isNaN(date.getTime()) || date.getFullYear() !== Number(match[1]) ||
      date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) {
    throw new Error('行程日期格式不正確');
  }
  return date;
}

function parseCalendarDateTime_(dateText, timeText) {
  var date = parseCalendarDate_(dateText);
  var match = String(timeText || '').trim().match(/^(\d{2}):(\d{2})$/);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new Error('行程時間格式不正確');
  }
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

function getWritableCalendar_(calendarId) {
  var id = String(calendarId || '').trim();
  var calendar = id ? CalendarApp.getCalendarById(id) : CalendarApp.getDefaultCalendar();
  if (!calendar) throw new Error('找不到指定的 Google Calendar');
  return calendar;
}

function createGoogleCalendarEvent_(p) {
  var title = String(p.title || '').trim();
  if (!title) throw new Error('行程標題不可空白');
  if (title.length > 200) throw new Error('行程標題不可超過 200 字');
  var dateText = String(p.date || '').trim();
  var calendar = getWritableCalendar_(p.calendarId);
  var allDay = String(p.allDay || '').toLowerCase() === '1' ||
    String(p.allDay || '').toLowerCase() === 'true';
  var location = String(p.location || '').trim().slice(0, 300);
  var description = String(p.description || '').trim().slice(0, 2000);
  var event;

  if (allDay) {
    event = calendar.createAllDayEvent(title, parseCalendarDate_(dateText), {
      location: location,
      description: description
    });
  } else {
    var start = parseCalendarDateTime_(dateText, p.startTime);
    var end = parseCalendarDateTime_(dateText, p.endTime);
    if (end.getTime() <= start.getTime()) throw new Error('結束時間必須晚於開始時間');
    event = calendar.createEvent(title, start, end, {
      location: location,
      description: description
    });
  }
  return {
    eventId: event.getId(),
    calendarId: calendar.getId(),
    title: event.getTitle()
  };
}

function deleteGoogleCalendarEvent_(p) {
  var eventId = String(p.eventId || '').trim();
  if (!eventId) throw new Error('缺少行程識別碼');
  var calendar = getWritableCalendar_(p.calendarId);
  var event = calendar.getEventById(eventId);
  if (!event) throw new Error('找不到要刪除的 Google Calendar 行程');
  event.deleteEvent();
  return {
    eventId: eventId,
    calendarId: calendar.getId(),
    deleted: true
  };
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
        id: task.id,
        taskListId: task.taskListId,
        title: task.title,
        notes: task.notes,
        dueText: formatTaskDue_(task.due),
        taskListName: task.taskListName
      };
    })
  };
}

function createGoogleTask_(p) {
  if (typeof Tasks === 'undefined') {
    throw new Error('Google Tasks API 尚未啟用或尚未重新授權');
  }
  var taskListId = String(p.taskListId || '@default').trim();
  var title = String(p.title || '').trim();
  if (!title) throw new Error('待辦事項標題不可空白');
  if (title.length > 200) throw new Error('待辦事項標題不可超過 200 字');
  var task = { title: title };
  var notes = String(p.notes || '').trim();
  if (notes) task.notes = notes.slice(0, 1000);
  var due = String(p.due || '').trim();
  if (due) {
    var dueDate = new Date(due + 'T23:59:00');
    if (isNaN(dueDate.getTime())) throw new Error('待辦日期格式不正確');
    task.due = dueDate.toISOString();
  }
  var created = Tasks.Tasks.insert(task, taskListId);
  return { id: created.id, taskListId: taskListId, title: created.title || title };
}

function deleteGoogleTask_(p) {
  if (typeof Tasks === 'undefined') {
    throw new Error('Google Tasks API 尚未啟用或尚未重新授權');
  }
  var taskListId = String(p.taskListId || '').trim();
  var taskId = String(p.taskId || '').trim();
  if (!taskListId || !taskId) throw new Error('缺少待辦事項識別碼');
  Tasks.Tasks.remove(taskListId, taskId);
  return { id: taskId, taskListId: taskListId, deleted: true };
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

function fetchTaifexForeignTxNetShort_() {
  var url = 'https://www.taifex.com.tw/cht/3/futContractsDateExcel';
  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (response.getResponseCode() !== 200) throw new Error('TAIFEX HTTP ' + response.getResponseCode());
  var html = response.getContentText('UTF-8');
  var rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  var txIndex = -1;
  for (var i = 0; i < rows.length; i++) {
    if (/臺股期貨|台股期貨/.test(stripTaifexHtml_(rows[i]))) {
      txIndex = i;
      break;
    }
  }
  if (txIndex < 0) throw new Error('TAIFEX 找不到臺股期貨列');
  for (var j = txIndex; j < Math.min(rows.length, txIndex + 4); j++) {
    var rowText = stripTaifexHtml_(rows[j]);
    if (rowText.indexOf('外資') < 0) continue;
    var cells = rows[j].match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    var numbers = cells.slice(1).map(function(cell) {
      return parseSheetNumber_(stripTaifexHtml_(cell));
    });
    if (numbers.length < 2) continue;
    var netPosition = numbers[numbers.length - 2];
    var dateMatch = html.match(/(20\d{2}\/\d{2}\/\d{2})/);
    return {
      value: Math.max(0, -netPosition),
      netPosition: netPosition,
      dataDate: dateMatch ? dateMatch[1] : '',
      source: 'TAIFEX'
    };
  }
  throw new Error('TAIFEX 找不到臺股期貨外資未平倉資料');
}

function stripTaifexHtml_(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
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
  var taifexInfo = null;
  try {
    taifexInfo = fetchTaifexForeignTxNetShort_();
  } catch (taifexError) {
    Logger.log('fetchTaifexForeignTxNetShort_ error: ' + taifexError.message);
  }

  var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
  var now = new Date();
  var dateText = Utilities.formatDate(now, tz, 'yyyy/MM/dd');
  var timeText = Utilities.formatDate(now, tz, 'HH:mm');
  var previous = getPreviousTWSEMarginRecord_(sheet, dateText);
  var balanceChange = previous && previous.balance != null ? info.value - previous.balance : '';
  var maintenanceChange = previous && previous.maintenanceRatio != null && info.maintenanceRatio
    ? info.maintenanceRatio - previous.maintenanceRatio
    : '';
  var foreignTxNetShortChange = taifexInfo && previous && previous.foreignTxNetShort != null
    ? taifexInfo.value - previous.foreignTxNetShort
    : '';
  var targetRow = upsertTWSEMarginRecord_(sheet, dateText, {
    updatedAt: timeText,
    dataDate: info.updatedAt || dateText,
    balance: info.value,
    balanceChange: balanceChange,
    maintenanceRatio: info.maintenanceRatio || '',
    maintenanceChange: maintenanceChange,
    foreignTxNetShort: taifexInfo ? taifexInfo.value : '',
    foreignTxNetShortChange: foreignTxNetShortChange
  });
  formatMacroDataSheet_(sheet);
  SpreadsheetApp.flush();

  return buildTWSEMarginSnapshotResult_(info, {
    row: targetRow,
    snapshotDate: dateText,
    updatedAt: timeText,
    previous: previous,
    balanceChange: balanceChange,
    maintenanceChange: maintenanceChange,
    foreignTxNetShort: taifexInfo ? taifexInfo.value : '',
    foreignTxNetShortChange: foreignTxNetShortChange
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
    '台股維持率增減': data.maintenanceChange,
    '外資台指期淨空單': data.foreignTxNetShort
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
  var previous = records[1] || null;
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
    maintenanceChange: latest.maintenanceChange,
    previous: previous,
    foreignTxNetShort: latest.foreignTxNetShort,
    foreignTxNetShortChange: latest.foreignTxNetShort != null && previous && previous.foreignTxNetShort != null
      ? latest.foreignTxNetShort - previous.foreignTxNetShort
      : null
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
      maintenanceChange: maintenanceChangeRaw ? parseSheetNumber_(maintenanceChangeRaw) : null,
      foreignTxNetShort: row[indexByHeader['外資台指期淨空單']] === '' || row[indexByHeader['外資台指期淨空單']] == null
        ? null
        : parseSheetNumber_(row[indexByHeader['外資台指期淨空單']])
    };
  }).filter(function(record) {
    return record && record.date;
  });
}

function buildTWSEMarginSnapshotResult_(info, meta) {
  meta = meta || {};
  var balanceChange = meta.balanceChange === '' || meta.balanceChange == null ? null : Number(meta.balanceChange);
  var maintenanceChange = meta.maintenanceChange === '' || meta.maintenanceChange == null ? null : Number(meta.maintenanceChange);
  var foreignTxNetShort = meta.foreignTxNetShort === '' || meta.foreignTxNetShort == null
    ? null
    : Number(meta.foreignTxNetShort);
  var foreignTxNetShortChange = meta.foreignTxNetShortChange === '' || meta.foreignTxNetShortChange == null
    ? null
    : Number(meta.foreignTxNetShortChange);
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
    foreignTxNetShort: foreignTxNetShort,
    foreignTxNetShortText: foreignTxNetShort == null ? '' : formatMarketNumber_(foreignTxNetShort, 0) + ' 口',
    foreignTxNetShortChange: foreignTxNetShortChange,
    foreignTxNetShortChangeText: foreignTxNetShortChange == null ? '' : formatSignedMarketNumber_(foreignTxNetShortChange, 0) + ' 口',
    foreignTxNetShortSource: meta.foreignTxNetShortSource || 'TAIFEX',
    foreignTxNetShortUpdatedAt: meta.foreignTxNetShortUpdatedAt || info.updatedAt || '',
    previousDate: meta.previous ? meta.previous.date : '',
    fetchedAt: meta.fetchedAt || '',
    isLive: meta.isLive !== false
  };
}

function formatSignedMarketAmount_(value) {
  var n = Number(value || 0);
  var sign = n > 0 ? '+' : (n < 0 ? '-' : '');
  return sign + formatMarketNumber_(Math.abs(n) / 100000000, 2) + ' 億';
}

function formatSignedMarketNumber_(value, digits) {
  var n = Number(value || 0);
  var sign = n > 0 ? '+' : (n < 0 ? '-' : '');
  return sign + formatMarketNumber_(Math.abs(n), digits == null ? 0 : digits);
}

function formatSignedMarketPct_(value) {
  var n = Number(value || 0);
  var sign = n > 0 ? '+' : (n < 0 ? '-' : '');
  return sign + Math.abs(n).toFixed(2) + 'pt';
}

function getCurrentTWSEMarginSnapshot_(ss) {
  var cache = CacheService.getScriptCache();
  var cachedText = cache.get(TWSE_MARGIN_LIVE_CACHE_KEY);
  if (cachedText) {
    try {
      var cached = JSON.parse(cachedText);
      if (cached && cached.value != null && cached.updatedAt) return cached;
    } catch (cacheError) {
      Logger.log('getCurrentTWSEMarginSnapshot_ cache parse error: ' + cacheError.message);
    }
  }

  try {
    var info = fetchTWSEMarginBalance_();
    if (info && info.value) {
      var taifexInfo = null;
      try {
        taifexInfo = fetchTaifexForeignTxNetShort_();
      } catch (taifexError) {
        Logger.log('getCurrentTWSEMarginSnapshot_ TAIFEX error: ' + taifexError.message);
      }

      var sheet = ss && ss.getSheetByName('總經資料庫');
      var storedForSourceDate = sheet ? getTWSEMarginRecordForDate_(sheet, info.updatedAt) : null;
      var previous = sheet ? getPreviousTWSEMarginRecord_(sheet, info.updatedAt) : null;
      var hasStoredSourceSnapshot = storedForSourceDate && storedForSourceDate.balance != null;
      // 跨日初期官方來源可能仍回傳上一個資料日；同一資料日沿用資料庫既有快照，
      // 避免把已存在的融資／維持率／淨空單增減誤重算成 0。
      var effectiveInfo = hasStoredSourceSnapshot
        ? {
            display: formatMarketNumber_(storedForSourceDate.balance / 100000000, 2) + ' 億',
            value: storedForSourceDate.balance,
            updatedAt: storedForSourceDate.dataDate || info.updatedAt,
            source: '總經資料庫',
            maintenanceRatio: storedForSourceDate.maintenanceRatio || 0,
            maintenanceText: storedForSourceDate.maintenanceRatio
              ? storedForSourceDate.maintenanceRatio.toFixed(2) + '%'
              : ''
          }
        : info;
      var balanceChange = hasStoredSourceSnapshot && storedForSourceDate.balanceChange != null
        ? storedForSourceDate.balanceChange
        : previous && previous.balance != null ? effectiveInfo.value - previous.balance : null;
      var maintenanceChange = hasStoredSourceSnapshot && storedForSourceDate.maintenanceChange != null
        ? storedForSourceDate.maintenanceChange
        : previous && previous.maintenanceRatio != null && effectiveInfo.maintenanceRatio
          ? effectiveInfo.maintenanceRatio - previous.maintenanceRatio
          : null;
      var storedMarginSourceDate = battleBriefSourceDateText_(storedForSourceDate && storedForSourceDate.dataDate);
      var taifexSourceDate = battleBriefSourceDateText_(taifexInfo && taifexInfo.dataDate);
      var useStoredForeignTxNetShort = hasStoredSourceSnapshot &&
        (!taifexSourceDate || !storedMarginSourceDate || taifexSourceDate <= storedMarginSourceDate);
      var effectiveForeignTxNetShort = useStoredForeignTxNetShort
        ? storedForSourceDate.foreignTxNetShort
        : taifexInfo ? taifexInfo.value : null;
      var foreignTxNetShortChange = effectiveForeignTxNetShort != null && previous && previous.foreignTxNetShort != null
        ? effectiveForeignTxNetShort - previous.foreignTxNetShort
        : null;
      var tz = Session.getScriptTimeZone() || 'Asia/Taipei';
      var fetchedAt = Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd HH:mm');
      var live = buildTWSEMarginSnapshotResult_(effectiveInfo, {
        snapshotDate: effectiveInfo.updatedAt,
        previous: previous,
        balanceChange: balanceChange,
        maintenanceChange: maintenanceChange,
        foreignTxNetShort: effectiveForeignTxNetShort,
        foreignTxNetShortChange: foreignTxNetShortChange,
        foreignTxNetShortSource: useStoredForeignTxNetShort
          ? '總經資料庫'
          : taifexInfo ? (taifexInfo.source || 'TAIFEX') : 'TAIFEX',
        foreignTxNetShortUpdatedAt: useStoredForeignTxNetShort
          ? (storedForSourceDate.dataDate || effectiveInfo.updatedAt)
          : taifexInfo && taifexInfo.dataDate
          ? taifexInfo.dataDate
          : effectiveInfo.updatedAt,
        fetchedAt: fetchedAt,
        isLive: true
      });
      live.freshnessNote = hasStoredSourceSnapshot
        ? '來源資料日未更新，沿用既有快照'
        : taifexInfo ? '即時來源' : 'TWSE 即時；TAIFEX 暫無資料';
      cache.put(TWSE_MARGIN_LIVE_CACHE_KEY, JSON.stringify(live), TWSE_MARGIN_LIVE_CACHE_SECONDS);
      return live;
    }
  } catch (liveError) {
    Logger.log('getCurrentTWSEMarginSnapshot_ live error: ' + liveError.message);
  }

  var fallback = getLatestTWSEMarginSnapshot_(ss);
  if (fallback) {
    fallback.isLive = false;
    fallback.freshnessNote = '即時來源暫時無法連線，顯示最後快照';
  }
  return fallback;
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
  // 戰情讀取優先使用短時間快取的即時官方來源；每日快照只作歷史與備援，
  // 避免「總經資料庫」尚未寫入今日快照時，畫面長時間沿用舊數值。
  var marginInfo = getCurrentTWSEMarginSnapshot_(ss);
  if (!marginInfo && sheet) marginInfo = getMarketMarginBalance_(sheet);
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
      foreignTxNetShort: code === '^TWII' && marginInfo ? marginInfo.foreignTxNetShort : null,
      foreignTxNetShortText: code === '^TWII' && marginInfo ? (marginInfo.foreignTxNetShortText || '') : '',
      foreignTxNetShortChange: code === '^TWII' && marginInfo && marginInfo.foreignTxNetShortChange != null ? marginInfo.foreignTxNetShortChange : null,
      foreignTxNetShortChangeText: code === '^TWII' && marginInfo ? (marginInfo.foreignTxNetShortChangeText || '') : '',
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

// ── 台灣總體經濟（月資料）────────────────────────────────────
function ensureTaiwanMacroSheet_(ss) {
  var sheet = ss.getSheetByName(TAIWAN_MACRO_SHEET);
  if (!sheet) sheet = ss.insertSheet(TAIWAN_MACRO_SHEET);
  ensureSheetHeaders_(sheet, TAIWAN_MACRO_HEADERS);
  if (sheet.getLastColumn() >= TAIWAN_MACRO_HEADERS.length) {
    sheet.getRange(2, 1, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('@');
    sheet.getRange(2, 2, Math.max(1, sheet.getMaxRows() - 1), 14).setNumberFormat('0.00');
    sheet.getRange(2, 16, Math.max(1, sheet.getMaxRows() - 1), 9).setNumberFormat('@');
    sheet.getRange(2, 25, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('0.00');
    sheet.getRange(2, 26, Math.max(1, sheet.getMaxRows() - 1), 1).setNumberFormat('@');
  }
  return sheet;
}

function taiwanMacroNumber_(value) {
  var text = String(value == null ? '' : value).replace(/[,$%\s]/g, '');
  if (!text || text === '-' || text === '—' || text === 'N/A' || /^#(?:NUM|N\/A|VALUE|DIV\/0|REF)!?$/i.test(text)) return null;
  var n = parseFloat(text);
  return isNaN(n) ? null : n;
}

function taiwanMacroMonth_(value) {
  var text = String(value == null ? '' : value).trim();
  var m = text.match(/^(\d{4})[\/-](\d{1,2})/) || text.match(/^(\d{4})(\d{2})$/);
  if (!m) return '';
  return m[1] + '-' + String(Number(m[2])).padStart(2, '0');
}

function taiwanMacroRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var width = Math.max(TAIWAN_MACRO_HEADERS.length, sheet.getLastColumn());
  var values = sheet.getRange(1, 1, sheet.getLastRow(), width).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var byMonth = {};
  values.slice(1).map(function(row, index) {
    var item = { row: index + 2 };
    headers.forEach(function(header, col) { if (header) item[header] = row[col]; });
    item.month = taiwanMacroMonth_(item.month);
    return item;
    return item;
  }).filter(function(item) { return !!item.month; }).forEach(function(item) {
    var previous = byMonth[item.month];
    if (!previous) {
      byMonth[item.month] = item;
      return;
    }
    TAIWAN_MACRO_HEADERS.forEach(function(key) {
      var oldValue = previous[key], newValue = item[key];
      var oldEmpty = oldValue == null || oldValue === '' || taiwanMacroNumber_(oldValue) == null && /^#/.test(String(oldValue));
      var newEmpty = newValue == null || newValue === '' || taiwanMacroNumber_(newValue) == null && /^#/.test(String(newValue));
      if (!newEmpty && (oldEmpty || key === 'overall_state' || key === 'updated_at')) previous[key] = newValue;
    });
    if (item.row > previous.row) previous.row = item.row;
  });
  return Object.keys(byMonth).map(function(month) { return byMonth[month]; }).sort(function(a, b) {
    return String(a.month).localeCompare(String(b.month));
  });
}

function taiwanMacroValue_(row, key) {
  var value = taiwanMacroNumber_(row && row[key]);
  return value == null ? null : value;
}

function taiwanMacroDirection_(current, previous, threshold) {
  if (current == null || previous == null) return { key: 'unknown', label: '尚未更新' };
  var delta = current - previous;
  if (delta > threshold) return { key: 'improve', label: '改善' };
  if (delta < -threshold) return { key: 'cool', label: '降溫' };
  return { key: 'flat', label: '持平' };
}

function taiwanMacroOverallState_(row, previous) {
  var directions = [
    taiwanMacroDirection_(taiwanMacroValue_(row, 'business_cycle_score'), taiwanMacroValue_(previous, 'business_cycle_score'), 2),
    taiwanMacroDirection_(taiwanMacroValue_(row, 'leading_index_without_trend'), taiwanMacroValue_(previous, 'leading_index_without_trend'), 0.3),
    taiwanMacroDirection_(taiwanMacroValue_(row, 'exports_yoy'), taiwanMacroValue_(previous, 'exports_yoy'), 3),
    taiwanMacroDirection_(taiwanMacroValue_(row, 'export_orders_yoy'), taiwanMacroValue_(previous, 'export_orders_yoy'), 3),
    taiwanMacroDirection_(taiwanMacroValue_(row, 'industrial_production_yoy'), taiwanMacroValue_(previous, 'industrial_production_yoy'), 3),
    taiwanMacroDirection_(taiwanMacroValue_(row, 'pmi'), taiwanMacroValue_(previous, 'pmi'), 0.5)
  ];
  var improve = directions.filter(function(d) { return d.key === 'improve'; }).length;
  var cool = directions.filter(function(d) { return d.key === 'cool'; }).length;
  var leading = directions[1].key;
  if (improve >= 3 && leading !== 'cool' && /紅燈|黃紅燈/.test(String(row.business_cycle_light || ''))) return '景氣擴張';
  if (improve >= 3 && leading !== 'cool') return '景氣改善';
  if (cool >= 3 && leading === 'cool') return '景氣明顯轉弱';
  if (cool > improve || (leading === 'cool' && cool >= 2)) return '景氣降溫';
  if (improve + cool < 3) return '資料不足';
  return '景氣中性';
}

function taiwanMacroDisplayRow_(row, previous) {
  row = row || {};
  previous = previous || {};
  var fx = taiwanMacroValue_(row, 'usdtwd');
  var prevFx = taiwanMacroValue_(previous, 'usdtwd');
  var fxChange = fx != null && prevFx != null && prevFx !== 0 ? (fx / prevFx - 1) * 100 : null;
  var fxTrend = fxChange == null ? { key: 'unknown', label: '尚未更新' } : (fxChange <= -1 ? { key: 'improve', label: '台幣升值' } : fxChange >= 1 ? { key: 'cool', label: '台幣貶值' } : { key: 'flat', label: '震盪' });
  var result = {};
  TAIWAN_MACRO_HEADERS.forEach(function(key) { result[key] = row[key] == null ? '' : row[key]; });
  result.month = row.month || '';
  result.directions = {
    score: taiwanMacroDirection_(taiwanMacroValue_(row, 'business_cycle_score'), taiwanMacroValue_(previous, 'business_cycle_score'), 2),
    leading: taiwanMacroDirection_(taiwanMacroValue_(row, 'leading_index_without_trend'), taiwanMacroValue_(previous, 'leading_index_without_trend'), 0.3),
    exports: taiwanMacroDirection_(taiwanMacroValue_(row, 'exports_yoy'), taiwanMacroValue_(previous, 'exports_yoy'), 3),
    orders: taiwanMacroDirection_(taiwanMacroValue_(row, 'export_orders_yoy'), taiwanMacroValue_(previous, 'export_orders_yoy'), 3),
    industrial: taiwanMacroDirection_(taiwanMacroValue_(row, 'industrial_production_yoy'), taiwanMacroValue_(previous, 'industrial_production_yoy'), 3),
    m2: taiwanMacroDirection_(taiwanMacroValue_(row, 'm2_yoy'), taiwanMacroValue_(previous, 'm2_yoy'), 0.5),
    pmi: taiwanMacroDirection_(taiwanMacroValue_(row, 'pmi'), taiwanMacroValue_(previous, 'pmi'), 0.5)
  };
  result.usdtwd_3m_change = fxChange == null ? result.usdtwd_3m_change : fxChange;
  result.usdtwd_trend = result.usdtwd_trend || fxTrend.label;
  result.overall_state = row.overall_state || taiwanMacroOverallState_(row, previous);
  return result;
}

function getTaiwanMacroOverview(ss) {
  var rows = taiwanMacroRows_(ss.getSheetByName(TAIWAN_MACRO_SHEET));
  var coreRows = rows.filter(function(row) {
    return taiwanMacroValue_(row, 'business_cycle_score') != null || taiwanMacroValue_(row, 'leading_index_without_trend') != null || taiwanMacroValue_(row, 'exports_yoy') != null || taiwanMacroValue_(row, 'export_orders_yoy') != null || taiwanMacroValue_(row, 'industrial_production_yoy') != null;
  });
  var latest = coreRows.length ? coreRows[coreRows.length - 1] : (rows.length ? rows[rows.length - 1] : null);
  var previous = coreRows.length > 1 ? coreRows[coreRows.length - 2] : null;
  return {
    hasData: !!latest,
    sheetName: TAIWAN_MACRO_SHEET,
    latest: taiwanMacroDisplayRow_(latest, previous),
    previousMonth: previous ? previous.month : '',
    availableMonths: rows.length,
    updatedAt: latest ? latest.updated_at : '',
    sourceStatus: getTaiwanMacroUpdateStatus(ss)
  };
}

function taiwanStockReviewCoreRows_(ss) {
  var sheet = ss && ss.getSheetByName(TAIWAN_MACRO_SHEET);
  var rows = taiwanMacroRows_(sheet);
  return rows.filter(function(row) {
    return taiwanMacroValue_(row, 'business_cycle_score') != null ||
      taiwanMacroValue_(row, 'leading_index_without_trend') != null ||
      taiwanMacroValue_(row, 'exports_yoy') != null ||
      taiwanMacroValue_(row, 'export_orders_yoy') != null ||
      taiwanMacroValue_(row, 'industrial_production_yoy') != null;
  });
}

function taiwanStockReviewTrend_(rows, key, threshold) {
  var points = (rows || []).map(function(row) {
    var value = taiwanMacroValue_(row, key);
    return value == null ? null : { month: row.month, value: value };
  }).filter(function(point) { return !!point; });
  if (!points.length) return { direction: '資料不足', points: [] };
  var first = points[0].value, last = points[points.length - 1].value;
  var delta = last - first;
  return {
    direction: delta > threshold ? '上升' : delta < -threshold ? '下降' : '持平',
    first: first,
    last: last,
    delta: delta,
    points: points
  };
}

function taiwanStockReviewMetric_(rows, latest, previous, key, name, unit, threshold) {
  var current = taiwanMacroValue_(latest, key), prior = taiwanMacroValue_(previous, key);
  return {
    key: key,
    name: name,
    unit: unit || '',
    current: current,
    previous: prior,
    month: latest.month,
    trend3to6m: taiwanStockReviewTrend_(rows, key, threshold || 0.5)
  };
}

function getTaiwanStockReviewPayload_(ss) {
  var rows = taiwanStockReviewCoreRows_(ss);
  if (rows.length < 2) throw new Error('台灣總體經濟資料不足，至少需要兩個月份才能產生月評');
  var latest = rows[rows.length - 1];
  var previous = rows.length > 1 ? rows[rows.length - 2] : {};
  var windowRows = rows.slice(Math.max(0, rows.length - 6));
  var missing = [];
  var required = [
    { key: 'business_cycle_light', name: '景氣燈號' },
    { key: 'business_cycle_score', name: '景氣綜合判斷分數' },
    { key: 'leading_index_without_trend', name: '景氣領先指標' },
    { key: 'pmi', name: '製造業 PMI' },
    { key: 'export_orders_yoy', name: '外銷訂單年增率' },
    { key: 'exports_yoy', name: '出口年增率' },
    { key: 'industrial_production_yoy', name: '工業生產年增率' },
    { key: 'm2_yoy', name: '廣義貨幣供給 M2 年增率' },
    { key: 'usdtwd', name: 'USD/TWD' }
  ];
  required.forEach(function(item) {
    var value = item.key === 'business_cycle_light' ? String(latest[item.key] || '').trim() : taiwanMacroValue_(latest, item.key);
    if (value === '' || value == null) missing.push(item.name);
  });
  var sourceKeys = ['source_ndc', 'source_customs', 'source_moea_orders', 'source_moea_industrial', 'source_cbc_fx', 'source_cbc_m2', 'source_pmi'];
  var sources = {};
  sourceKeys.forEach(function(key) {
    var value = String(latest[key] || '').trim();
    if (value) sources[key] = value;
  });
  return {
    reportMonth: latest.month,
    latestMonth: latest.month,
    previousMonth: previous.month || '',
    windowMonths: windowRows.map(function(row) { return row.month; }),
    metrics: {
      businessCycle: {
        light: String(latest.business_cycle_light || '').trim(),
        score: taiwanMacroValue_(latest, 'business_cycle_score'),
        previousScore: taiwanMacroValue_(previous, 'business_cycle_score'),
        previousLight: String(previous.business_cycle_light || '').trim(),
        month: latest.month
      },
      leading: taiwanStockReviewMetric_(windowRows, latest, previous, 'leading_index_without_trend', '景氣領先指標（不含趨勢指數）', '指數', 0.3),
      leadingComposite: taiwanStockReviewMetric_(windowRows, latest, previous, 'leading_index', '景氣領先指標綜合指數', '指數', 0.3),
      pmi: taiwanStockReviewMetric_(windowRows, latest, previous, 'pmi', '製造業 PMI（季節調整）', '指數', 0.5),
      exportOrders: taiwanStockReviewMetric_(windowRows, latest, previous, 'export_orders_yoy', '外銷訂單年增率', '%', 3),
      exports: taiwanStockReviewMetric_(windowRows, latest, previous, 'exports_yoy', '出口年增率', '%', 3),
      industrial: taiwanStockReviewMetric_(windowRows, latest, previous, 'industrial_production_yoy', '工業生產年增率', '%', 3),
      money: taiwanStockReviewMetric_(windowRows, latest, previous, 'm2_yoy', '廣義貨幣供給 M2 年增率', '%', 0.5),
      fx: {
        key: 'usdtwd',
        name: 'USD/TWD',
        current: taiwanMacroValue_(latest, 'usdtwd'),
        previous: taiwanMacroValue_(previous, 'usdtwd'),
        threeMonthChange: taiwanMacroValue_(latest, 'usdtwd_3m_change'),
        trend: String(latest.usdtwd_trend || '').trim(),
        month: latest.month,
        trend3to6m: taiwanStockReviewTrend_(windowRows, 'usdtwd', 0.2)
      }
    },
    missingFields: missing,
    sources: sources,
    ruleState: String(latest.overall_state || '').trim()
  };
}

function taiwanStockReviewAllowed_(value, allowed, fallback) {
  var text = String(value || '').trim();
  if (allowed.indexOf(text) >= 0) return text;
  for (var i = 0; i < allowed.length; i++) {
    if (text.indexOf(allowed[i].replace(/^[^\u4e00-\u9fffA-Za-z]+/, '')) >= 0) return allowed[i];
  }
  return fallback;
}

function taiwanStockReviewList_(value) {
  if (Array.isArray(value)) return value.map(function(item) { return String(item || '').trim(); }).filter(function(item) { return item; }).slice(0, 3);
  return String(value || '').split(/[；;\n]/).map(function(item) { return item.trim(); }).filter(function(item) { return item; }).slice(0, 3);
}

function parseTaiwanStockReviewJson_(text) {
  var raw = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  var start = raw.indexOf('{'), end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  return JSON.parse(raw);
}

function askOpenAITaiwanStockReview_(payload) {
  var properties = PropertiesService.getScriptProperties();
  var key = String(properties.getProperty('OPENAI_API_KEY') || '').trim();
  if (!key) throw new Error('尚未設定 OPENAI_API_KEY，無法產生台股總經月評');
  var model = String(properties.getProperty('OPENAI_MODEL') || '').trim() || 'gpt-5.6-luna';
  var instructions = [
    '你是「GPT 軍師」，負責每月根據使用者提供的台灣總體經濟結構化資料，判斷景氣階段、未來方向與台股中期總體經濟環境。',
    '只能使用 input JSON 內的資料，不可查網、補充新聞、猜測缺失數值或創造不存在的數據。',
    '請比較本月、前月與近3到6個月趨勢；不要單純逐項念數字，必須說明指標互相驗證或背離。',
    'PMI 必須注意 50 榮枯線；若資料缺失，明確標示資料尚未公布並降低 confidence。匯率不可簡化為升值等於台股上漲或貶值等於台股下跌。',
    '這是總體經濟環境評估，不是台股點位預測，也不是買賣建議；禁止使用「一定上漲」「即將大跌」等確定性語言。',
    '只輸出 JSON，不要 Markdown、不要分析過程。欄位必須為：confidence、leading_direction、current_economy、financial_environment、cross_validation、stage、stage_reason、stock_environment、monthly_review、watchlist。',
    'confidence 只能是：高、 中、 低。leading_direction 只能是：明顯改善、溫和改善、持平、溫和轉弱、明顯轉弱。current_economy 只能是：強勁擴張、溫和擴張、中性、放緩、收縮。financial_environment 只能是：寬鬆、中性、收緊。',
    'stage 只能是：🟢 復甦初期、🟢 景氣擴張、🟡 高檔放緩、🟡 景氣中性、🟠 景氣轉弱、🔴 景氣收縮、🔵 低檔築底。',
    'stock_environment 只能是：🟢 偏多、🟢 中性偏多、🟡 中性、🟠 中性偏空、🔴 偏空。',
    'stage_reason 請用1到2句；monthly_review 請寫100到180字繁體中文，重視趨勢與風險管理。watchlist 最多3項，列出下月最可能改變判斷的指標。'
  ].join('\n');
  var requestBody = {
    model: model,
    instructions: instructions,
    input: JSON.stringify(payload),
    max_output_tokens: 1200,
    store: false,
    reasoning: { effort: 'low' }
  };
  var response = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  });
  var data = JSON.parse(response.getContentText());
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || data.error) {
    throw new Error(data.error && data.error.message ? data.error.message : 'OpenAI 台股總經月評失敗');
  }
  var outputText = String(data.output_text || '').trim();
  if (!outputText && data.output && data.output.length) {
    data.output.forEach(function(item) {
      (item.content || []).forEach(function(content) {
        if ((content.type === 'output_text' || content.type === 'text') && content.text) outputText += String(content.text);
      });
    });
  }
  if (!outputText) throw new Error('OpenAI 台股總經月評沒有文字輸出');
  return { report: parseTaiwanStockReviewJson_(outputText), model: model };
}

function normalizeTaiwanStockReview_(report, payload, model) {
  report = report || {};
  var stageOptions = ['🟢 復甦初期', '🟢 景氣擴張', '🟡 高檔放緩', '🟡 景氣中性', '🟠 景氣轉弱', '🔴 景氣收縮', '🔵 低檔築底'];
  var stockOptions = ['🟢 偏多', '🟢 中性偏多', '🟡 中性', '🟠 中性偏空', '🔴 偏空'];
  var directionOptions = ['明顯改善', '溫和改善', '持平', '溫和轉弱', '明顯轉弱'];
  var economyOptions = ['強勁擴張', '溫和擴張', '中性', '放緩', '收縮'];
  var financeOptions = ['寬鬆', '中性', '收緊'];
  return {
    reportId: 'taiwan-stock-' + payload.latestMonth,
    month: payload.latestMonth,
    dataMonth: payload.latestMonth,
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss'),
    model: model || 'gpt-5.6-luna',
    confidence: taiwanStockReviewAllowed_(report.confidence, ['高', '中', '低'], payload.missingFields.length ? '低' : '中'),
    leadingDirection: taiwanStockReviewAllowed_(report.leading_direction || report.leadingDirection, directionOptions, '持平'),
    currentEconomy: taiwanStockReviewAllowed_(report.current_economy || report.currentEconomy, economyOptions, '中性'),
    financialEnvironment: taiwanStockReviewAllowed_(report.financial_environment || report.financialEnvironment, financeOptions, '中性'),
    crossValidation: String(report.cross_validation || report.crossValidation || '訊號分歧，請觀察後續資料是否延續。').trim(),
    stage: taiwanStockReviewAllowed_(report.stage, stageOptions, '🟡 景氣中性'),
    stageReason: String(report.stage_reason || report.stageReason || '').trim(),
    stockEnvironment: taiwanStockReviewAllowed_(report.stock_environment || report.stockEnvironment, stockOptions, '🟡 中性'),
    monthlyReview: String(report.monthly_review || report.monthlyReview || '').trim(),
    watchlist: taiwanStockReviewList_(report.watchlist),
    missingFields: payload.missingFields.join('、'),
    dataSnapshot: JSON.stringify(payload),
    source: 'OpenAI Responses API / ' + (model || 'gpt-5.6-luna')
  };
}

function ensureTaiwanStockReviewSheet_(ss) {
  var sheet = ss.getSheetByName(TAIWAN_STOCK_REVIEW_SHEET);
  if (!sheet) sheet = ss.insertSheet(TAIWAN_STOCK_REVIEW_SHEET);
  ensureSheetHeaders_(sheet, TAIWAN_STOCK_REVIEW_HEADERS);
  if (sheet.getLastColumn() >= TAIWAN_STOCK_REVIEW_HEADERS.length) {
    sheet.getRange(2, 1, Math.max(1, sheet.getMaxRows() - 1), TAIWAN_STOCK_REVIEW_HEADERS.length).setNumberFormat('@');
  }
  return sheet;
}

function writeTaiwanStockReview_(sheet, report) {
  var row = [report.reportId, report.month, report.dataMonth, report.generatedAt, report.model, report.confidence, report.leadingDirection, report.currentEconomy, report.financialEnvironment, report.crossValidation, report.stage, report.stageReason, report.stockEnvironment, report.monthlyReview, report.watchlist.join('；'), report.missingFields, report.dataSnapshot];
  return upsertMacroRow_(sheet, 1, report.reportId, row);
}

function normalizeTaiwanStockReviewRow_(row) {
  if (!row) return null;
  return {
    reportId: String(row['報告ID'] || '').trim(),
    month: String(row['月份'] || '').trim(),
    dataMonth: String(row['資料月份'] || '').trim(),
    generatedAt: String(row['產生時間'] || '').trim(),
    model: String(row['模型'] || '').trim(),
    confidence: String(row['判斷信心'] || '').trim(),
    leadingDirection: String(row['景氣方向'] || '').trim(),
    currentEconomy: String(row['目前實體經濟'] || '').trim(),
    financialEnvironment: String(row['金融環境'] || '').trim(),
    crossValidation: String(row['交叉驗證'] || '').trim(),
    stage: String(row['景氣階段'] || '').trim(),
    stageReason: String(row['階段理由'] || '').trim(),
    stockEnvironment: String(row['台股總經環境'] || '').trim(),
    monthlyReview: String(row['GPT軍師月評'] || '').trim(),
    watchlist: taiwanStockReviewList_(row['下月觀察']),
    missingFields: String(row['資料尚未公布'] || '').trim(),
    source: String(row['產生方式'] || '').trim(),
    dataSnapshot: String(row['資料快照'] || '').trim()
  };
}

function getTaiwanStockReview(ss, p) {
  ss = ss || getExternalDbSpreadsheet_();
  var sheet = ss.getSheetByName(TAIWAN_STOCK_REVIEW_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { hasReport: false, latest: null, reports: [], message: '尚未建立台股總經月評' };
  ensureSheetHeaders_(sheet, TAIWAN_STOCK_REVIEW_HEADERS);
  var limit = Math.max(1, Math.min(12, Number(p && p.limit) || 6));
  var values = sheet.getRange(1, 1, sheet.getLastRow(), TAIWAN_STOCK_REVIEW_HEADERS.length).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var reports = values.slice(1).map(function(row) { return normalizeTaiwanStockReviewRow_(macroObjectFromRow_(headers, row)); }).filter(function(row) { return row && row.reportId; }).sort(function(a, b) {
    return String(b.dataMonth || '').localeCompare(String(a.dataMonth || '')) || String(b.generatedAt || '').localeCompare(String(a.generatedAt || ''));
  }).slice(0, limit);
  return { hasReport: reports.length > 0, latest: reports[0] || null, reports: reports };
}

function generateTaiwanStockMonthlyReview(ss) {
  ss = ss || getExternalDbSpreadsheet_();
  var payload = getTaiwanStockReviewPayload_(ss);
  var ai = askOpenAITaiwanStockReview_(payload);
  var report = normalizeTaiwanStockReview_(ai.report, payload, ai.model);
  var sheet = ensureTaiwanStockReviewSheet_(ss);
  var row = writeTaiwanStockReview_(sheet, report);
  SpreadsheetApp.flush();
  return { message: '台股總經月評已產出', row: row, report: report, payload: payload };
}

function generateTaiwanStockMonthlyReviewIfNeeded_(ss) {
  var payload = getTaiwanStockReviewPayload_(ss);
  var current = getTaiwanStockReview(ss, { limit: 1 });
  if (current.latest && current.latest.dataMonth === payload.latestMonth) {
    return { skipped: true, dataMonth: payload.latestMonth, message: '本月台股總經月評已存在' };
  }
  return generateTaiwanStockMonthlyReview(ss);
}

function getTaiwanMacroHistory(ss, p) {
  var rows = taiwanMacroRows_(ss.getSheetByName(TAIWAN_MACRO_SHEET));
  var range = String(p && p.range || '1Y').toUpperCase();
  var count = range === '6M' ? 6 : range === '5Y' ? 60 : range === '3Y' ? 36 : 12;
  return { range: range, rows: rows.slice(Math.max(0, rows.length - count)).map(function(row, index, list) {
    var previous = index > 0 ? list[index - 1] : null;
    return taiwanMacroDisplayRow_(row, previous);
  }) };
}

function getTaiwanMacroUpdateStatus(ss) {
  var sheet = ss.getSheetByName(TAIWAN_MACRO_SHEET);
  var rows = taiwanMacroRows_(sheet);
  var latest = rows.length ? rows[rows.length - 1] : null;
  return {
    sheetName: TAIWAN_MACRO_SHEET,
    exists: !!sheet,
    rowCount: rows.length,
    latestMonth: latest ? latest.month : '',
    lastUpdatedAt: latest ? latest.updated_at : '',
    note: '官方來源同步採欄位級更新；來源失敗不清除既有資料。'
  };
}

function taiwanMacroCsvRows_(text) {
  var rows = [], row = [], cell = '', quoted = false;
  text = String(text || '').replace(/^\uFEFF/, '');
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    if (ch === '"') {
      if (quoted && text.charAt(i + 1) === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text.charAt(i + 1) === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(function(value) { return String(value || '').trim() !== ''; })) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function taiwanMacroDataset_(datasetId) {
  var response = UrlFetchApp.fetch('https://data.gov.tw/api/v2/rest/dataset/' + datasetId, { muteHttpExceptions: true });
  if (response.getResponseCode() >= 400) throw new Error('政府資料平台 metadata HTTP ' + response.getResponseCode());
  var json = JSON.parse(response.getContentText('UTF-8'));
  var distribution = json && json.result && json.result.distribution && json.result.distribution[0];
  if (!distribution || !distribution.resourceDownloadUrl) throw new Error('找不到 dataset ' + datasetId + ' 下載網址');
  return { url: distribution.resourceDownloadUrl, format: String(distribution.resourceFormat || '').toUpperCase() };
}

function taiwanMacroNdcRows_() {
  var meta = taiwanMacroDataset_(TAIWAN_MACRO_NDC_DATASET_ID);
  var response = UrlFetchApp.fetch(meta.url, { muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/zip,application/octet-stream,*/*' } });
  if (response.getResponseCode() >= 400) throw new Error('NDC ZIP HTTP ' + response.getResponseCode());
  var blob = response.getBlob();
  if (blob.getBytes().length < 4) throw new Error('NDC ZIP 回傳內容為空');
  var files = Utilities.unzip(blob);
  var target = files.filter(function(file) { return file.getName() === '景氣指標與燈號.csv'; })[0] ||
    files.filter(function(file) { return file.getName().indexOf('景氣指標與燈號.csv') >= 0 && file.getName().indexOf('schema-') !== 0; })[0];
  if (!target) throw new Error('NDC ZIP 找不到景氣指標與燈號.csv');
  var rows = taiwanMacroCsvRows_(target.getDataAsString('UTF-8'));
  var headers = rows.shift() || [];
  var byDate = {};
  rows.forEach(function(row) {
    var item = {};
    headers.forEach(function(header, index) { item[String(header || '').trim()] = row[index]; });
    if (item.Date) byDate[String(item.Date).trim()] = item;
  });
  var component = files.filter(function(file) { return file.getName() === '景氣對策信號構成項目.csv'; })[0] ||
    files.filter(function(file) { return file.getName().indexOf('景氣對策信號構成項目.csv') >= 0 && file.getName().indexOf('schema-') !== 0; })[0];
  if (component) {
    var componentRows = taiwanMacroCsvRows_(component.getDataAsString('UTF-8'));
    var componentHeaders = componentRows.shift() || [];
    componentRows.forEach(function(row) {
      var date = String(row[0] || '').trim();
      if (!date) return;
      var item = byDate[date] || { Date: date };
      componentHeaders.forEach(function(header, index) { item[String(header || '').trim()] = row[index]; });
      byDate[date] = item;
    });
  }
  return Object.keys(byDate).map(function(date) { return byDate[date]; });
}

function taiwanMacroCustomsRows_() {
  var meta = taiwanMacroDataset_(TAIWAN_MACRO_CUSTOMS_DATASET_ID);
  var text = UrlFetchApp.fetch(meta.url, { muteHttpExceptions: true }).getContentText('UTF-8');
  var rows = taiwanMacroCsvRows_(text), headers = rows.shift() || [];
  return rows.map(function(row) {
    var item = {};
    headers.forEach(function(header, index) { item[String(header || '').trim()] = row[index]; });
    return item;
  });
}

function taiwanMacroHtmlCellText_(html) {
  return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}

function taiwanMacroHtmlRows_(url) {
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (response.getResponseCode() >= 400) throw new Error('官方統計頁 HTTP ' + response.getResponseCode());
  var html = response.getContentText('UTF-8'), matches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  return matches.map(function(rowHtml) {
    var cells = rowHtml.match(/<(?:td|th)[^>]*>[\s\S]*?<\/(?:td|th)>/gi) || [];
    return cells.map(taiwanMacroHtmlCellText_).filter(function(cell) { return cell !== ''; });
  }).filter(function(row) { return row.length >= 2; });
}

function taiwanMacroMoeaRows_(url, valueMode) {
  var rows = taiwanMacroHtmlRows_(url), currentYear = '';
  return rows.map(function(cells) {
    var text = cells.join(' '), yearMatch = text.match(/(\d{3,4})年/);
    if (yearMatch) {
      currentYear = Number(yearMatch[1]) < 1911 ? String(Number(yearMatch[1]) + 1911) : yearMatch[1];
    }
    var monthMatch = text.match(/(\d{1,2})月/);
    if (!currentYear || !monthMatch) return null;
    var numbers = cells.map(function(cell) { return taiwanMacroNumber_(cell.replace(/年|月/g, '')); }).filter(function(value) { return value != null; });
    if (!numbers.length) return null;
    return { month: currentYear + '-' + String(Number(monthMatch[1])).padStart(2, '0'), value: numbers[0], yoy: numbers.length > 1 ? numbers[1] : null, mode: valueMode };
  }).filter(function(item) { return !!item; });
}

function taiwanMacroMoeaOrderRows_() {
  var response = UrlFetchApp.fetch(TAIWAN_MACRO_MOEA_ORDER_URL, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (response.getResponseCode() >= 400) throw new Error('經濟部外銷訂單 CSV HTTP ' + response.getResponseCode());
  var rows = taiwanMacroCsvRows_(response.getContentText('UTF-8')), headers = rows.shift() || [];
  return rows.map(function(row) {
    var item = {};
    headers.forEach(function(header, index) { item[String(header || '').trim()] = row[index]; });
    var roc = String(item['資料期(民國年)'] || '').replace(/[^0-9]/g, '');
    if (roc.length < 5) return null;
    var year = Number(roc.slice(0, 3)) + 1911, month = Number(roc.slice(-2));
    if (!year || month < 1 || month > 12) return null;
    return { month: year + '-' + String(month).padStart(2, '0'), value: taiwanMacroNumber_(item['統計值(美元)']), mode: 'orders' };
  }).filter(function(item) { return !!item; });
}

function taiwanMacroIndustrialRows_() {
  var meta = taiwanMacroDataset_(TAIWAN_MACRO_INDUSTRIAL_DATASET_ID);
  var response = UrlFetchApp.fetch(meta.url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (response.getResponseCode() >= 400) throw new Error('經濟部工業生產 CSV HTTP ' + response.getResponseCode());
  var rows = taiwanMacroCsvRows_(response.getContentText('UTF-8')), headers = rows.shift() || [];
  return rows.map(function(row) {
    var item = {};
    headers.forEach(function(header, index) { item[String(header || '').trim()] = row[index]; });
    if (String(item['行業別'] || '').trim() !== '工業') return null;
    var roc = String(item['資料期(民國年)'] || '').replace(/[^0-9]/g, '');
    if (roc.length < 5) return null;
    var year = Number(roc.slice(0, 3)) + 1911, month = Number(roc.slice(-2));
    if (!year || month < 1 || month > 12) return null;
    return { month: year + '-' + String(month).padStart(2, '0'), value: taiwanMacroNumber_(item['統計值(指數)']), mode: 'industrial' };
  }).filter(function(item) { return !!item; });
}

function taiwanMacroPmiXlsxUrl_() {
  try {
    var page = UrlFetchApp.fetch(TAIWAN_MACRO_PMI_PAGE_URL, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (page.getResponseCode() < 400) {
      var match = page.getContentText('UTF-8').match(/href=["']([^"']*PMI-Historical-Data-Seasonally-Adjusted\.xlsx)["']/i);
      if (match && match[1]) return match[1].indexOf('http') === 0 ? match[1] : 'https://www.cier.edu.tw' + (match[1].charAt(0) === '/' ? '' : '/') + match[1];
    }
  } catch (ignore) {}
  return TAIWAN_MACRO_PMI_XLSX_FALLBACK_URL;
}

function taiwanMacroPmiRows_() {
  var response = UrlFetchApp.fetch(taiwanMacroPmiXlsxUrl_(), { muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*' } });
  if (response.getResponseCode() >= 400) throw new Error('PMI XLSX HTTP ' + response.getResponseCode());
  var files = Utilities.unzip(response.getBlob()), sheetFile = files.filter(function(file) { return file.getName() === 'xl/worksheets/sheet1.xml'; })[0];
  if (!sheetFile) throw new Error('PMI XLSX 找不到工作表');
  var sharedFile = files.filter(function(file) { return file.getName() === 'xl/sharedStrings.xml'; })[0];
  var sharedStrings = [];
  if (sharedFile) {
    var sharedXml = sharedFile.getDataAsString('UTF-8');
    (sharedXml.match(/<si\b[\s\S]*?<\/si>/g) || []).forEach(function(si) {
      sharedStrings.push((si.match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || []).map(function(text) {
        return text.replace(/^<t\b[^>]*>|<\/t>$/g, '');
      }).join(''));
    });
  }
  var xml = sheetFile.getDataAsString('UTF-8'), rowBlocks = xml.match(/<row\b[\s\S]*?<\/row>/g) || [], result = [], pmiColumn = 'B';
  function cellValue_(cell) {
    var valueMatch = cell.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
    if (!valueMatch) return '';
    var value = valueMatch[1];
    return /\bt=["']s["']/.test(cell) ? (sharedStrings[Number(value)] || '') : value;
  }
  rowBlocks.forEach(function(rowBlock) {
    var rowNumberMatch = rowBlock.match(/<row\b[^>]*\br=["'](\d+)["']/);
    if (!rowNumberMatch || Number(rowNumberMatch[1]) !== 2) return;
    var headerCells = rowBlock.match(/<c\b[^>]*\br=["']([A-Z]+)\d+["'][^>]*>[\s\S]*?<\/c>/g) || [];
    headerCells.forEach(function(cell) {
      if (/manufacturing\s*pmi/i.test(cellValue_(cell))) {
        var ref = cell.match(/\br=["']([A-Z]+)\d+["']/);
        if (ref) pmiColumn = ref[1];
      }
    });
  });
  rowBlocks.forEach(function(rowBlock) {
    var rowNumberMatch = rowBlock.match(/<row\b[^>]*\br=["'](\d+)["']/);
    if (!rowNumberMatch || Number(rowNumberMatch[1]) < 4) return;
    var cells = {}, cellMatch, cellRe = /<c\b[^>]*\br=["']([A-Z]+\d+)["'][^>]*>[\s\S]*?<\/c>/g;
    while ((cellMatch = cellRe.exec(rowBlock))) {
      cells[cellMatch[1].replace(/\d+/g, '')] = cellValue_(cellMatch[0]);
    }
    var month = taiwanMacroExcelMonth_(cells.A), value = taiwanMacroNumber_(cells[pmiColumn]);
    if (month && value != null) result.push({ month: month, value: value });
  });
  if (result.length) return result;

  // CIER occasionally publishes the table before the downloadable workbook is
  // refreshed. Keep the public table as a safe fallback for the same series.
  var htmlRows = taiwanMacroHtmlRows_('https://www.cier.edu.tw/en/pmi-trend-en/');
  return htmlRows.map(function(cells) {
    var match = cells.join(' ').match(/(20\d{2})\/(\d{1,2})\s+([0-9.,]+)\s*[％%]?/);
    if (!match) return null;
    var value = taiwanMacroNumber_(match[3]);
    return value == null ? null : { month: match[1] + '-' + String(Number(match[2])).padStart(2, '0'), value: value };
  }).filter(function(item) { return !!item; });
}

function taiwanMacroPmiHtmlRows_() {
  var rows = taiwanMacroHtmlRows_('https://www.cier.edu.tw/en/pmi-trend-en/');
  return rows.map(function(cells) {
    var match = cells.join(' ').match(/(20\d{2})\/(\d{1,2})\s+([0-9.,]+)\s*[％%]?/);
    if (!match) return null;
    var value = taiwanMacroNumber_(match[3]);
    return value == null ? null : { month: match[1] + '-' + String(Number(match[2])).padStart(2, '0'), value: value };
  }).filter(function(item) { return !!item; });
}

function taiwanMacroExcelMonth_(value) {
  var serial = taiwanMacroNumber_(value);
  if (serial == null) return '';
  var date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy-MM');
}

function taiwanMacroCbcM2Rows_() {
  var rows = taiwanMacroHtmlRows_(TAIWAN_MACRO_CBC_M2_URL);
  return rows.map(function(cells) {
    var match = cells.join(' ').match(/(\d{4})[.\/-](\d{1,2})/), numbers = cells.map(taiwanMacroNumber_).filter(function(value) { return value != null; });
    return match && numbers.length ? { month: match[1] + '-' + String(Number(match[2])).padStart(2, '0'), value: numbers[numbers.length - 1] } : null;
  }).filter(function(item) { return !!item; });
}

function taiwanMacroCbcFxRows_() {
  var indexResponse = UrlFetchApp.fetch(TAIWAN_MACRO_CBC_FX_INDEX_URL, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (indexResponse.getResponseCode() >= 400) throw new Error('中央銀行匯率索引 HTTP ' + indexResponse.getResponseCode());
  var html = indexResponse.getContentText('UTF-8'), links = [], seen = {};
  var re = /href=["']([^"']*cp-863-[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, match;
  while ((match = re.exec(html)) && links.length < 12) {
    var year = (match[2] || '').match(/20\d{2}/);
    if (!year) continue;
    var url = match[1].indexOf('http') === 0 ? match[1] : 'https://www.cbc.gov.tw' + (match[1].charAt(0) === '/' ? '' : '/') + match[1];
    if (!seen[url]) { seen[url] = true; links.push(url); }
  }
  var result = [];
  links.forEach(function(url) {
    try {
      taiwanMacroHtmlRows_(url).forEach(function(cells) {
        var match = cells.join(' ').match(/(20\d{2})\/(\d{1,2})/), numbers = cells.map(taiwanMacroNumber_).filter(function(value) { return value != null; });
        if (match && numbers.length) result.push({ month: match[1] + '-' + String(Number(match[2])).padStart(2, '0'), value: numbers[numbers.length - 1] });
      });
    } catch (ignore) {}
  });
  return result;
}

function taiwanMacroSyncCoreSources_(sheet) {
  var byMonth = {};
  taiwanMacroRows_(sheet).forEach(function(row) { byMonth[row.month] = row; });
  var sourceStatus = { ndc: { ok: false }, customs: { ok: false }, moeaOrders: { ok: false }, moeaIndustrial: { ok: false }, cbcFx: { ok: false }, cbcM2: { ok: false }, pmi: { ok: false } };
  try {
    taiwanMacroNdcRows_().forEach(function(item) {
      var month = taiwanMacroMonth_(String(item.Date || ''));
      if (!month) return;
      byMonth[month] = byMonth[month] || { month: month };
      byMonth[month].business_cycle_score = taiwanMacroNumber_(item['景氣對策信號綜合分數']);
      byMonth[month].business_cycle_light = item['景氣對策信號'] || '';
      byMonth[month].leading_index = taiwanMacroNumber_(item['領先指標綜合指數']);
      byMonth[month].leading_index_without_trend = taiwanMacroNumber_(item['領先指標不含趨勢指數']);
      byMonth[month].industrial_production_index = taiwanMacroNumber_(item['工業生產指數(Index2021=100)']);
      var ndcExports = taiwanMacroNumber_(item['海關出口值(十億元)']);
      if ((byMonth[month].exports_value == null || byMonth[month].exports_value === '') && ndcExports != null) byMonth[month].exports_value = ndcExports * 1000000;
      byMonth[month].source_ndc = 'NDC dataset 6099';
    });
    sourceStatus.ndc = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) { sourceStatus.ndc.reason = error.message; }
  try {
    taiwanMacroCustomsRows_().forEach(function(item) {
      var year = String(item['年度'] || '').replace(/[^0-9]/g, '');
      var monthNumber = String(item['月份'] || '').replace(/[^0-9]/g, '');
      if (year.length === 3) year = String(Number(year) + 1911);
      if (year.length !== 4 || !monthNumber) return;
      var month = year + '-' + String(Number(monthNumber)).padStart(2, '0');
      byMonth[month] = byMonth[month] || { month: month };
      var customsExports = taiwanMacroNumber_(item['出口總值(新臺幣千元)'] || item['出口(新臺幣千元)']);
      if (customsExports != null) byMonth[month].exports_value = customsExports;
      byMonth[month].source_customs = 'Customs dataset 6053';
    });
    sourceStatus.customs = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) { sourceStatus.customs.reason = error.message; }
  try {
    taiwanMacroMoeaOrderRows_().forEach(function(item) {
      byMonth[item.month] = byMonth[item.month] || { month: item.month };
      byMonth[item.month].export_orders_value = item.value;
      byMonth[item.month].source_moea_orders = TAIWAN_MACRO_MOEA_ORDER_URL;
    });
    sourceStatus.moeaOrders = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) { sourceStatus.moeaOrders.reason = error.message; }
  try {
    taiwanMacroIndustrialRows_().forEach(function(item) {
      byMonth[item.month] = byMonth[item.month] || { month: item.month };
      byMonth[item.month].industrial_production_index = item.value;
      byMonth[item.month].source_moea_industrial = 'https://data.gov.tw/dataset/6607';
    });
    sourceStatus.moeaIndustrial = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) { sourceStatus.moeaIndustrial.reason = error.message; }
  try {
    taiwanMacroPmiRows_().forEach(function(item) {
      byMonth[item.month] = byMonth[item.month] || { month: item.month };
      byMonth[item.month].pmi = item.value;
      byMonth[item.month].source_pmi = TAIWAN_MACRO_PMI_SOURCE_URL;
    });
    sourceStatus.pmi = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) {
    try {
      taiwanMacroPmiHtmlRows_().forEach(function(item) {
        byMonth[item.month] = byMonth[item.month] || { month: item.month };
        byMonth[item.month].pmi = item.value;
        byMonth[item.month].source_pmi = TAIWAN_MACRO_PMI_SOURCE_URL + '；CIER HTML 備援';
      });
      sourceStatus.pmi = { ok: true, fallback: true, reason: error.message };
    } catch (fallbackError) { sourceStatus.pmi = { ok: false, reason: error.message + '；備援：' + fallbackError.message }; }
  }
  try {
    taiwanMacroCbcM2Rows_().forEach(function(item) {
      byMonth[item.month] = byMonth[item.month] || { month: item.month };
      byMonth[item.month].m2_yoy = item.value;
      byMonth[item.month].source_cbc_m2 = TAIWAN_MACRO_CBC_M2_URL;
    });
    sourceStatus.cbcM2 = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) { sourceStatus.cbcM2.reason = error.message; }
  try {
    taiwanMacroCbcFxRows_().forEach(function(item) {
      byMonth[item.month] = byMonth[item.month] || { month: item.month };
      byMonth[item.month].usdtwd = item.value;
      byMonth[item.month].source_cbc_fx = TAIWAN_MACRO_CBC_FX_INDEX_URL;
    });
    sourceStatus.cbcFx = { ok: true, count: Object.keys(byMonth).length };
  } catch (error) { sourceStatus.cbcFx.reason = error.message; }
  var months = Object.keys(byMonth).sort();
  // 若本月 PMI 尚未公布，沿用最近一筆有效值，避免發布時差造成卡片空白。
  // 月份仍維持實際資料月份，絕不把舊值標成新月份。
  var lastPmi = null, lastPmiMonth = '';
  months.forEach(function(month) {
    var row = byMonth[month];
    if (row.pmi != null && taiwanMacroNumber_(row.pmi) != null) {
      lastPmi = row.pmi;
      lastPmiMonth = month;
    } else if (lastPmi != null) {
      row.pmi = lastPmi;
      row.source_pmi = (row.source_pmi || TAIWAN_MACRO_PMI_SOURCE_URL) + '；沿用 ' + lastPmiMonth;
    }
  });
  months.forEach(function(month, index) {
    var row = byMonth[month], previousYear = byMonth[taiwanMacroPreviousYearMonth_(month)];
    if (row.exports_value != null && row.exports_value > 0 && previousYear && previousYear.exports_value != null && previousYear.exports_value > 0) row.exports_yoy = (row.exports_value / previousYear.exports_value - 1) * 100;
    if (row.export_orders_value != null && row.export_orders_value > 0 && previousYear && previousYear.export_orders_value != null && previousYear.export_orders_value > 0) row.export_orders_yoy = (row.export_orders_value / previousYear.export_orders_value - 1) * 100;
    if (row.industrial_production_index != null && row.industrial_production_index > 0 && previousYear && previousYear.industrial_production_index != null && previousYear.industrial_production_index > 0) row.industrial_production_yoy = (row.industrial_production_index / previousYear.industrial_production_index - 1) * 100;
    row.updated_at = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss');
    row.overall_state = taiwanMacroOverallState_(row, byMonth[taiwanMacroPreviousMonth_(month)] || {});
  });
  return { byMonth: byMonth, sourceStatus: sourceStatus };
}

function taiwanMacroPreviousMonth_(month) {
  var date = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 2, 1);
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy-MM');
}

function taiwanMacroPreviousYearMonth_(month) {
  return String(Number(month.slice(0, 4)) - 1) + month.slice(4);
}

function taiwanMacroWriteRows_(sheet, byMonth) {
  var months = Object.keys(byMonth).sort();
  if (!months.length) return 0;
  var existing = {};
  taiwanMacroRows_(sheet).forEach(function(row) { existing[row.month] = row.row; });
  months.forEach(function(month) {
    var item = byMonth[month], values = TAIWAN_MACRO_HEADERS.map(function(header) {
      var value = item[header];
      if (header === 'exports_yoy' && (item.exports_value == null || Number(item.exports_value) <= 0)) value = '';
      if (header === 'industrial_production_yoy' && (item.industrial_production_index == null || Number(item.industrial_production_index) <= 0)) value = '';
    if (['business_cycle_score','leading_index','leading_index_without_trend','exports_value','exports_yoy','export_orders_value','export_orders_yoy','industrial_production_index','industrial_production_yoy','usdtwd','usdtwd_3m_change','m2_yoy','pmi'].indexOf(header) >= 0 && taiwanMacroNumber_(value) == null) value = '';
      return value == null ? '' : value;
    });
    var rowNumber = existing[month] || sheet.getLastRow() + 1;
    sheet.getRange(rowNumber, 1, 1, TAIWAN_MACRO_HEADERS.length).setValues([values]);
  });
  return months.length;
}

function updateTaiwanMacroData(ss) {
  var sheet = ensureTaiwanMacroSheet_(ss);
  var sync = taiwanMacroSyncCoreSources_(sheet);
  var written = taiwanMacroWriteRows_(sheet, sync.byMonth);
  SpreadsheetApp.flush();
  return {
    ok: true,
    sheetName: sheet.getName(),
    headers: TAIWAN_MACRO_HEADERS,
    writtenMonths: written,
    status: getTaiwanMacroUpdateStatus(ss),
    sourceStatus: sync.sourceStatus,
    message: '已同步目前可取得的官方核心資料；尚未取得的來源欄位保留空白，不清除既有資料。'
  };
}

function ensureTaiwanMacroInitialRefresh_() {
  var properties = PropertiesService.getScriptProperties();
  if (properties.getProperty(TAIWAN_MACRO_INITIAL_REFRESH_PROPERTY) === '1') return;
  try {
    updateTaiwanMacroData(getExternalDbSpreadsheet_());
    properties.setProperty(TAIWAN_MACRO_INITIAL_REFRESH_PROPERTY, '1');
  } catch (error) {
    Logger.log('Taiwan macro initial refresh failed: ' + error.message);
  }
}

function taiwanMacroScheduled() {
  ensureTaiwanMacroMonthlyTrigger_();
  var ss = getExternalDbSpreadsheet_();
  var sync = updateTaiwanMacroData(ss);
  var review;
  try {
    review = generateTaiwanStockMonthlyReviewIfNeeded_(ss);
  } catch (error) {
    review = { ok: false, message: error.message };
  }
  return { sync: sync, review: review };
}

function installTaiwanMacroTrigger() {
  deleteTaiwanMacroTriggers_();
  ScriptApp.newTrigger('taiwanMacroScheduled').timeBased().onMonthDay(1).atHour(8).create();
  return getTaiwanMacroTriggerStatus();
}

function ensureTaiwanMacroMonthlyTrigger_() {
  var properties = PropertiesService.getScriptProperties();
  if (properties.getProperty(TAIWAN_MACRO_TRIGGER_MIGRATION_PROPERTY) === '1') return;
  try {
    installTaiwanMacroTrigger();
    properties.setProperty(TAIWAN_MACRO_TRIGGER_MIGRATION_PROPERTY, '1');
  } catch (error) {
    Logger.log('Taiwan macro monthly trigger migration failed: ' + error.message);
  }
}

function getTaiwanMacroTriggerStatus() {
  var triggers = ScriptApp.getProjectTriggers().filter(function(trigger) {
    return trigger.getHandlerFunction() === 'taiwanMacroScheduled';
  }).map(function(trigger) { return { handler: trigger.getHandlerFunction(), uid: trigger.getUniqueId ? trigger.getUniqueId() : '' }; });
  return { handler: 'taiwanMacroScheduled', count: triggers.length, installed: triggers.length > 0, schedule: '每月 1 日 08:00 左右（Apps Script 時間觸發器）', triggers: triggers };
}

function deleteTaiwanMacroTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'taiwanMacroScheduled') { ScriptApp.deleteTrigger(trigger); count++; }
  });
  return count;
}

function getMacroLongReport(ss, p) {
  ss = ss || getExternalDbSpreadsheet_();
  var sheet = ss.getSheetByName(MACRO_LONG_REPORT_SHEET);
  var status = getMacroLongReportTriggerStatus();
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      hasReport: false,
      latest: null,
      reports: [],
      trigger: status,
      message: '尚未建立總經長期報告'
    };
  }

  ensureSheetHeaders_(sheet, MACRO_LONG_REPORT_HEADERS);
  var limit = Math.max(1, Math.min(12, Number(p && p.limit) || 6));
  var values = sheet.getRange(1, 1, sheet.getLastRow(), MACRO_LONG_REPORT_HEADERS.length).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var reports = values.slice(1).map(function(row) {
    return normalizeMacroLongReportRow_(macroObjectFromRow_(headers, row));
  }).filter(function(row) {
    return row && row.reportId;
  }).sort(function(a, b) {
    return String(b.endDate || '').localeCompare(String(a.endDate || '')) ||
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  }).slice(0, limit);

  return {
    hasReport: reports.length > 0,
    latest: reports[0] || null,
    reports: reports,
    trigger: status
  };
}

function normalizeMacroLongReportRow_(row) {
  if (!row) return null;
  return {
    reportId: String(row['報告ID'] || '').trim(),
    startDate: String(row['開始日期'] || '').trim(),
    endDate: String(row['結束日期'] || '').trim(),
    days: macroNumber_(row['天數']),
    conclusion: String(row['結論'] || '').trim(),
    signal: String(row['燈號'] || '').trim(),
    score: String(row['分數'] || '').trim(),
    summary: String(row['摘要'] || '').trim(),
    keyTrends: splitMacroReportText_(row['主要趨勢']),
    risks: splitMacroReportText_(row['風險項目']),
    positives: splitMacroReportText_(row['有利項目']),
    strategy: String(row['投資策略'] || '').trim(),
    watchlist: splitMacroReportText_(row['下期觀察']),
    dataPoints: macroNumber_(row['資料筆數']) || 0,
    importantChangeCount: macroNumber_(row['重要變化次數']) || 0,
    source: String(row['產生方式'] || '').trim(),
    createdAt: String(row['建立時間'] || '').trim()
  };
}

function splitMacroReportText_(text) {
  text = String(text || '').trim();
  if (!text) return [];
  return text.split(/\s*[；;]\s*/).filter(function(item) { return item; });
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

function getPreviousMacroData_(ss, beforeDateText) {
  var sheet = ss.getSheetByName('總經資料庫');
  if (!sheet || sheet.getLastRow() < 2) return null;

  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(1, sheet.getLastColumn())).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var rows = values.slice(1).map(function(row) {
    return macroObjectFromRow_(headers, row);
  }).filter(function(obj) {
    var dateText = String(obj['日期'] || '').trim();
    return dateText && dateText < beforeDateText;
  });
  if (!rows.length) return null;

  rows.sort(function(a, b) {
    return String(b['日期'] || '').localeCompare(String(a['日期'] || '')) ||
      String(b['更新時間'] || '').localeCompare(String(a['更新時間'] || ''));
  });

  var previous = rows[0];
  return {
    date: previous['日期'] || '',
    updatedAt: previous['更新時間'] || '',
    values: normalizeMacroDataValues_(previous)
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

function buildMacroImportance_(macroData, previousData) {
  var previousValues = previousData && previousData.values ? previousData.values : {};
  var items = macroImportanceDefinitions_().map(function(def) {
    return scoreMacroImportanceItem_(def, macroData, previousValues);
  }).filter(function(item) {
    return item && item.score > 0;
  }).sort(function(a, b) {
    return b.score - a.score || Math.abs(b.changePct || 0) - Math.abs(a.changePct || 0);
  });

  var importantItems = items.filter(function(item) {
    return item.score >= MACRO_IMPORTANCE_MIN_SCORE;
  });
  var maxScore = items.length ? items[0].score : 0;
  return {
    score: maxScore,
    level: macroImportanceLevel_(maxScore),
    changes: items,
    importantChanges: importantItems,
    importantChangeText: importantItems.map(function(item) {
      return item.name + ' ' + item.changeText + '（' + item.level + '）';
    }).join('；')
  };
}

function macroImportanceDefinitions_() {
  return [
    { code: 'vix', name: 'VIX恐慌指數', mode: 'pct' },
    { code: 'oil', name: '原油價格', mode: 'pct' },
    { code: 'dxy', name: '美元指數 DXY', mode: 'pct' },
    { code: 'yield10y', name: '美國10年債殖利率', mode: 'bp' },
    { code: 'yield2y', name: '美國2年債殖利率', mode: 'bp' },
    { code: 'creditSpread', name: '美國高收益債利差 HY OAS', mode: 'bp' },
    { code: 'sofrIorbSpread', name: 'SOFR-IORB利差', mode: 'bp' },
    { code: 'cpi', name: 'CPI年增率', mode: 'point', thresholds: [0.10, 0.20, 0.40, 0.80] },
    { code: 'cpiMoM', name: 'CPI月增率', mode: 'point', thresholds: [0.05, 0.10, 0.20, 0.40] },
    { code: 'ppi', name: 'PPI年增率', mode: 'point', thresholds: [0.10, 0.20, 0.40, 0.80] },
    { code: 'unemployment', name: '失業率', mode: 'point', thresholds: [0.05, 0.10, 0.20, 0.40] },
    { code: 'joltsOpenings', name: 'JOLTS職位空缺', mode: 'pct' },
    { code: 'adpEmploymentChange', name: 'ADP就業新增', mode: 'pct' },
    { code: 'nfpPayrollChange', name: '非農就業新增 NFP', mode: 'pct' },
    { code: 'consumerSentiment', name: '密歇根消費者信心', mode: 'pct' },
    { code: 'fedBalance', name: 'Fed資產負債表', mode: 'pct' },
    { code: 'rrp', name: 'RRP逆回購', mode: 'pct' },
    { code: 'm2', name: 'M2貨幣供給', mode: 'pct' },
    { code: 'liquidityScore', name: '帝國流動性分數', mode: 'point', thresholds: [1, 1, 2, 3] },
    { code: 'bankReserves', name: '銀行準備金', mode: 'pct' },
    { code: 'bankReservesChange', name: '銀行準備金週變化', mode: 'abs', thresholds: [50000, 50000, 100000, 200000] },
    { code: 'twseMarginBalance', name: '台股融資餘額', mode: 'pct' },
    { code: 'twseMarginMaintenanceRatio', name: '台股維持率', mode: 'point', thresholds: [0.30, 0.50, 1.00, 2.00] }
  ];
}

function scoreMacroImportanceItem_(def, macroData, previousValues) {
  var current = macroNumber_(macroData[def.code]);
  var previous = previousValues ? macroNumber_(previousValues[def.code]) : null;
  if (current == null || previous == null || isNaN(current) || isNaN(previous)) return null;
  var change = current - previous;
  var magnitude = macroImportanceMagnitude_(def, current, previous, change);
  if (magnitude == null || isNaN(magnitude)) return null;

  var score = macroImportanceScore_(magnitude, def.thresholds);
  var level = macroImportanceLevel_(score);
  return {
    code: def.code,
    name: def.name,
    previous: previous,
    current: current,
    change: change,
    changePct: previous !== 0 ? (change / Math.abs(previous)) * 100 : null,
    magnitude: magnitude,
    score: score,
    level: level,
    shouldAnalyze: score >= MACRO_IMPORTANCE_MIN_SCORE,
    changeText: macroImportanceChangeText_(def, current, previous, change)
  };
}

function macroImportanceMagnitude_(def, current, previous, change) {
  if (def.mode === 'bp') return Math.abs(change * 100);
  if (def.mode === 'point' || def.mode === 'abs') return Math.abs(change);
  if (previous === 0) return null;
  return Math.abs(change / Math.abs(previous)) * 100;
}

function macroImportanceScore_(magnitude, thresholds) {
  var t = thresholds || [3, 5, 10, 20];
  if (magnitude >= t[3]) return 100;
  if (magnitude >= t[2]) return 70;
  if (magnitude >= t[1]) return 40;
  if (magnitude >= t[0]) return 10;
  return 0;
}

function macroImportanceLevel_(score) {
  if (score >= 100) return '重大事件';
  if (score >= 70) return '重要';
  if (score >= 40) return '普通';
  if (score > 0) return '輕微';
  return '不用分析';
}

function macroImportanceChangeText_(def, current, previous, change) {
  var direction = change >= 0 ? '上升' : '下降';
  if (def.mode === 'bp') return direction + Math.abs(change * 100).toFixed(0) + 'bp';
  if (def.mode === 'point') return direction + Math.abs(change).toFixed(2) + '百分點';
  if (def.mode === 'abs') return direction + Math.abs(change).toLocaleString('en-US', { maximumFractionDigits: 0 });
  var pct = previous !== 0 ? Math.abs(change / Math.abs(previous)) * 100 : null;
  return direction + (pct == null ? Math.abs(change).toFixed(2) : pct.toFixed(2) + '%');
}

function macroNoImportantChangeJudgment_(dateText, timeText, previousJudgment) {
  previousJudgment = previousJudgment || {};
  return {
    date: dateText,
    scenario: previousJudgment.scenario || '觀察',
    signal: previousJudgment.signal || '綠燈',
    score: previousJudgment.score != null ? previousJudgment.score : '',
    summary: '今日沒有達到「重要」以上的總經指標變化，AI 不重新分析整個市場。',
    mainRisk: '無新增重大變化；留意連續多日累積變化。',
    suggestion: '維持既有投資策略與風控設定，等待重要以上變化再調整。',
    updatedAt: timeText
  };
}

function generateMacroLongReport(ss, days) {
  ss = ss || getExternalDbSpreadsheet_();
  days = Math.max(7, Math.min(120, Number(days) || 30));
  var sheets = ensureMacroSheets_(ss);
  var sourceRows = getMacroHistoryRows_(sheets.data, days);
  if (sourceRows.length < 2) throw new Error('總經資料不足，至少需要 2 筆資料才能產出長期報告');

  var summary = buildMacroLongReportSummary_(sourceRows, days);
  var report;
  try {
    report = askDeepSeekMacroLongReport_(summary);
    report.source = 'DeepSeek / 30日總經摘要';
  } catch (ex) {
    report = fallbackMacroLongReport_(summary, ex);
  }
  report = normalizeMacroLongReport_(report, summary);

  var row = upsertMacroLongReport_(sheets.longReport, report);
  return {
    message: '總經長期報告已產出',
    row: row,
    report: report,
    summary: summary
  };
}

function getMacroHistoryRows_(sheet, days) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(1, sheet.getLastColumn())).getDisplayValues();
  var headers = values[0].map(function(h) { return String(h || '').trim(); });
  var rows = values.slice(1).map(function(row) {
    var obj = macroObjectFromRow_(headers, row);
    var dateText = String(obj['日期'] || '').trim();
    if (!dateText) return null;
    return {
      date: dateText,
      updatedAt: String(obj['更新時間'] || '').trim(),
      values: normalizeMacroDataValues_(obj),
      importanceScore: macroNumber_(obj.importance_score),
      importanceLevel: String(obj.importance_level || '').trim(),
      importantChanges: String(obj.important_changes || '').trim()
    };
  }).filter(function(row) {
    return row && row.date;
  }).sort(function(a, b) {
    return String(a.date || '').localeCompare(String(b.date || '')) ||
      String(a.updatedAt || '').localeCompare(String(b.updatedAt || ''));
  });
  return rows.slice(-days);
}

function buildMacroLongReportSummary_(rows, days) {
  var start = rows[0];
  var end = rows[rows.length - 1];
  var indicators = macroImportanceDefinitions_().map(function(def) {
    return summarizeMacroLongIndicator_(def, rows);
  }).filter(function(item) {
    return item && item.count >= 2;
  }).sort(function(a, b) {
    return b.score - a.score || Math.abs(b.changePct || 0) - Math.abs(a.changePct || 0);
  });
  var importantRows = rows.filter(function(row) {
    return row.importanceScore >= MACRO_IMPORTANCE_MIN_SCORE || row.importantChanges;
  });
  return {
    days: days,
    rowCount: rows.length,
    startDate: start.date,
    endDate: end.date,
    importantChangeCount: importantRows.length,
    indicators: indicators.slice(0, 14),
    importantEvents: importantRows.slice(-12).map(function(row) {
      return {
        date: row.date,
        score: row.importanceScore || 0,
        level: row.importanceLevel || '',
        changes: row.importantChanges || ''
      };
    })
  };
}

function summarizeMacroLongIndicator_(def, rows) {
  var points = rows.map(function(row) {
    var value = macroNumber_(row.values && row.values[def.code]);
    return value == null || isNaN(value) ? null : { date: row.date, value: value };
  }).filter(function(point) {
    return point;
  });
  if (points.length < 2) return null;
  var first = points[0];
  var last = points[points.length - 1];
  var values = points.map(function(point) { return point.value; });
  var change = last.value - first.value;
  var magnitude = macroImportanceMagnitude_(def, last.value, first.value, change);
  var score = macroImportanceScore_(magnitude || 0, def.thresholds);
  var avg = values.reduce(function(sum, value) { return sum + value; }, 0) / values.length;
  return {
    code: def.code,
    name: def.name,
    first: first.value,
    last: last.value,
    change: change,
    changePct: first.value !== 0 ? (change / Math.abs(first.value)) * 100 : null,
    changeText: macroImportanceChangeText_(def, last.value, first.value, change),
    score: score,
    level: macroImportanceLevel_(score),
    average: avg,
    min: Math.min.apply(null, values),
    max: Math.max.apply(null, values),
    count: points.length
  };
}

function askDeepSeekMacroLongReport_(summary) {
  var key = PropertiesService.getScriptProperties().getProperty('DEEPSEEK_API_KEY');
  if (!key) throw new Error('尚未設定 DEEPSEEK_API_KEY，無法請 DeepSeek 產出長期報告');

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
          content: '你是帝國總經戰略軍師。請使用繁體中文，只能輸出 JSON，不要 Markdown。你只能根據使用者提供的 30 日摘要判斷，不要自行補市場新聞。請輸出欄位：conclusion, signal, score, summary, keyTrends, risks, positives, strategy, watchlist。conclusion 只能是：進攻、觀望、防守、危機。signal 只能是：綠燈、黃燈、紅燈、黑燈。score 是 0 到 100 的長期總經壓力分數。keyTrends, risks, positives, watchlist 請輸出陣列，每項短句。strategy 要明確說明投資策略是否需要調整。'
        },
        {
          role: 'user',
          content: JSON.stringify(summary)
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
    throw new Error(data.error && data.error.message ? data.error.message : 'DeepSeek 長期報告失敗');
  }
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('DeepSeek 長期報告回應格式異常');
  }
  return parseDeepSeekJsonObject_(data.choices[0].message.content || '');
}

function parseDeepSeekJsonObject_(text) {
  var raw = String(text || '').trim();
  raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  var start = raw.indexOf('{');
  var end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  return JSON.parse(raw);
}

function fallbackMacroLongReport_(summary, ex) {
  var top = (summary.indicators || []).slice(0, 5);
  var defense = top.some(function(item) {
    return item.score >= 70 && /vix|creditSpread|yield|sofr|unemployment|bankReserves/.test(item.code);
  });
  return {
    conclusion: defense ? '防守' : '觀望',
    signal: defense ? '紅燈' : '黃燈',
    score: defense ? 70 : 50,
    summary: '依最近 ' + summary.rowCount + ' 筆總經資料，系統已整理出長期趨勢；AI 報告暫時不可用，先採規則版戰略結論。',
    keyTrends: top.map(function(item) { return item.name + item.changeText + '（' + item.level + '）'; }),
    risks: defense ? ['出現重要以上風險指標變化，暫緩積極加碼'] : ['尚未出現明確危機，但需觀察趨勢延續'],
    positives: ['長期資料已形成可追蹤基準'],
    strategy: defense ? '提高現金與防守權重，等待風險指標降溫再恢復進攻。' : '維持既有配置，僅在重要趨勢延續時調整部位。',
    watchlist: top.slice(0, 3).map(function(item) { return item.name; }),
    source: 'fallback: ' + (ex && ex.message ? ex.message : 'AI unavailable')
  };
}

function normalizeMacroLongReport_(report, summary) {
  report = report || {};
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var createdAt = Utilities.formatDate(now, tz, 'yyyy/MM/dd HH:mm');
  return {
    reportId: 'macro-' + String(summary.endDate || '').replace(/[^\d]/g, '') + '-' + summary.days + 'd',
    startDate: summary.startDate,
    endDate: summary.endDate,
    days: summary.days,
    conclusion: String(report.conclusion || '觀望').trim(),
    signal: String(report.signal || '黃燈').trim(),
    score: report.score == null || report.score === '' ? '' : Number(report.score),
    summary: String(report.summary || '').trim(),
    keyTrends: normalizeMacroReportList_(report.keyTrends),
    risks: normalizeMacroReportList_(report.risks),
    positives: normalizeMacroReportList_(report.positives),
    strategy: String(report.strategy || '').trim(),
    watchlist: normalizeMacroReportList_(report.watchlist),
    dataPoints: summary.rowCount,
    importantChangeCount: summary.importantChangeCount,
    source: String(report.source || 'DeepSeek / 30日總經摘要').trim(),
    createdAt: createdAt
  };
}

function normalizeMacroReportList_(value) {
  if (Array.isArray(value)) {
    return value.map(function(item) { return String(item || '').trim(); }).filter(function(item) { return item; });
  }
  return splitMacroReportText_(value);
}

function upsertMacroLongReport_(sheet, report) {
  ensureSheetHeaders_(sheet, MACRO_LONG_REPORT_HEADERS);
  var values = [
    report.reportId,
    report.startDate,
    report.endDate,
    report.days,
    report.conclusion,
    report.signal,
    report.score,
    report.summary,
    report.keyTrends.join('；'),
    report.risks.join('；'),
    report.positives.join('；'),
    report.strategy,
    report.watchlist.join('；'),
    report.dataPoints,
    report.importantChangeCount,
    report.source,
    report.createdAt
  ];
  return upsertMacroRow_(sheet, 1, report.reportId, values);
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
  var previousMacroData = getPreviousMacroData_(ss, dateText);
  var previousJudgment = getLatestMacroJudgment_(ss);

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

  var existingTwse = getTWSEMarginRecordForDate_(sheets.data, dateText);
  if (existingTwse) {
    macroData.twseMarginDataDate = existingTwse.dataDate;
    macroData.twseMarginBalance = existingTwse.balance;
    macroData.twseMarginBalanceChange = existingTwse.balanceChange;
    macroData.twseMarginMaintenanceRatio = existingTwse.maintenanceRatio;
    macroData.twseMarginMaintenanceChange = existingTwse.maintenanceChange;
  }

  var importance = buildMacroImportance_(macroData, previousMacroData);
  macroData.importanceScore = importance.score;
  macroData.importanceLevel = importance.level;
  macroData.importantChanges = importance.importantChanges;
  macroData.importantChangesText = importance.importantChangeText;

  var judgment = normalizeMacroJudgment_(body, macroData);
  if (!judgment.scenario || !judgment.signal || !judgment.summary) {
    judgment = importance.importantChanges.length
      ? askDeepSeekMacro_(macroData)
      : macroNoImportantChangeJudgment_(dateText, timeText, previousJudgment);
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
    importance: importance,
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

  try {
    result.longReport = maybeGenerateMacroLongReport_(ss, 30);
  } catch (reportEx) {
    result.longReportError = reportEx && reportEx.message ? reportEx.message : String(reportEx);
  }

  return result;
}

function maybeGenerateMacroLongReport_(ss, days) {
  ss = ss || getExternalDbSpreadsheet_();
  days = Math.max(7, Math.min(120, Number(days) || 30));
  var latest = getMacroLongReport(ss, { limit: 1 }).latest;
  var latestEnd = latest && latest.endDate ? latest.endDate : '';
  var currentData = getLatestMacroData_(ss);
  var currentDate = currentData && currentData.date ? currentData.date : '';
  if (latestEnd && currentDate && macroDaysBetween_(latestEnd, currentDate) < days) {
    return {
      skipped: true,
      reason: '距離上一份長期報告未滿 ' + days + ' 天',
      latestEndDate: latestEnd,
      currentDate: currentDate
    };
  }
  return generateMacroLongReport(ss, days);
}

function macroDaysBetween_(startText, endText) {
  var start = macroDateFromText_(startText);
  var end = macroDateFromText_(endText);
  if (!start || !end) return 0;
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function macroDateFromText_(text) {
  var m = String(text || '').trim().match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function macroLongReportScheduled() {
  return generateMacroLongReport(getExternalDbSpreadsheet_(), 30);
}

function installMacroLongReportTrigger() {
  var deleted = deleteMacroLongReportTriggers_();
  ScriptApp.newTrigger('macroLongReportScheduled')
    .timeBased()
    .everyDays(30)
    .atHour(9)
    .nearMinute(30)
    .create();
  return {
    message: '已建立 macroLongReportScheduled 每 30 天 09:30 觸發器',
    deleted: deleted,
    status: getMacroLongReportTriggerStatus()
  };
}

function getMacroLongReportTriggerStatus() {
  var triggers = ScriptApp.getProjectTriggers()
    .filter(function(trigger) {
      return trigger.getHandlerFunction() === 'macroLongReportScheduled';
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
    handler: 'macroLongReportScheduled',
    count: triggers.length,
    installed: triggers.length > 0,
    triggers: triggers
  };
}

function deleteMacroLongReportTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'macroLongReportScheduled') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
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

  var longReport = ss.getSheetByName(MACRO_LONG_REPORT_SHEET);
  if (!longReport) longReport = ss.insertSheet(MACRO_LONG_REPORT_SHEET);
  ensureSheetHeaders_(longReport, MACRO_LONG_REPORT_HEADERS);

  return { settings: settings, data: data, judgment: judgment, longReport: longReport };
}

function ensureSheetHeaders_(sheet, headers) {
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
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
    '台股維持率增減': macroData.twseMarginMaintenanceChange,
    importance_score: macroData.importanceScore,
    importance_level: macroData.importanceLevel,
    important_changes: macroData.importantChangesText
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
    importance_score: macroData.importanceScore,
    importance_level: macroData.importanceLevel,
    importantChanges: macroData.importantChanges || []
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
          content: '你是總經市場分析助手。請使用繁體中文，只能輸出 JSON，不要輸出 Markdown。你不可以重新分析整個市場，只能分析使用者提供的 importantChanges；若清單為空，回覆維持策略。劇本只能是：軟著陸、滯脹、衰退、金融壓力。燈號只能是：綠燈、黃燈、紅燈、黑燈。請輸出欄位：date, scenario, signal, score, summary, mainRisk, suggestion。score 是 0 到 100 的總經壓力分數，不是 importance_score。importance_score 是今天 vs 昨天的變化重要性分數；只有 score >= 70 的變化才值得分析。請判斷這些變化是否會影響投資策略，重點放在加碼、減碼、觀望、提高現金、防守或維持原策略。'
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

// 以 Yahoo Finance 的國際黃金與美元／台幣市場報價估算台灣台兩價格。
// 這是市場參考值，不等同銀樓牌價，也不含工費、買賣價差與稅費。
function getGoldPriceQuote_() {
  var gold = fetchYahooQuoteMeta_('GC=F', 'COMEX 黃金近月期貨');
  var fx = fetchYahooQuoteMetaAny_(['TWD=X', 'USDTWD=X'], '美元／新台幣');
  var gramsPerTael = 37.5;
  var troyOunceGrams = 31.1034768;
  var taels = 5;
  var grams = gramsPerTael * taels;
  var troyOunces = grams / troyOunceGrams;
  var fiveTaelTwd = gold.price * fx.price * troyOunces;
  var updatedAt = Math.max(gold.timestamp || 0, fx.timestamp || 0);
  return {
    gold: {
      symbol: gold.symbol,
      name: gold.name,
      usdPerTroyOunce: gold.price,
      quoteTime: formatGoldQuoteTime_(gold.timestamp)
    },
    fx: {
      symbol: fx.symbol,
      name: fx.name,
      usdTwd: fx.price,
      quoteTime: formatGoldQuoteTime_(fx.timestamp)
    },
    conversion: {
      taels: taels,
      gramsPerTael: gramsPerTael,
      grams: grams,
      troyOunces: troyOunces,
      fiveTaelTwd: Math.round(fiveTaelTwd)
    },
    updatedAt: formatGoldQuoteTime_(updatedAt),
    source: 'Yahoo Finance',
    note: '國際市場估算，未含銀樓工費、買賣價差與稅費'
  };
}

function fetchYahooQuoteMetaAny_(symbols, name) {
  var errors = [];
  for (var i = 0; i < symbols.length; i++) {
    try { return fetchYahooQuoteMeta_(symbols[i], name); }
    catch (error) { errors.push(error && error.message ? error.message : String(error)); }
  }
  throw new Error(name + '報價讀取失敗');
}

function fetchYahooQuoteMeta_(symbol, name) {
  var encoded = encodeURIComponent(symbol);
  var url = 'https://query2.finance.yahoo.com/v8/finance/chart/' + encoded + '?interval=1m&range=1d&includePrePost=true';
  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error(name + '報價讀取失敗');
  }
  var json = JSON.parse(response.getContentText());
  var result = json.chart && json.chart.result && json.chart.result[0];
  if (!result) throw new Error(name + '報價回應格式異常');
  var meta = result.meta || {};
  var closes = (((result.indicators || {}).quote || [])[0] || {}).close || [];
  var validCloses = closes.filter(function(value) { return value != null && !isNaN(value); });
  var price = meta.regularMarketPrice;
  if (price == null || isNaN(price)) price = validCloses.length ? validCloses[validCloses.length - 1] : null;
  if (price == null || isNaN(price) || Number(price) <= 0) throw new Error(name + '無有效價格');
  var timestamp = Number(meta.regularMarketTime || 0);
  if (!timestamp) {
    var timestamps = result.timestamp || [];
    timestamp = timestamps.length ? Number(timestamps[timestamps.length - 1]) : 0;
  }
  return { symbol: symbol, name: name, price: Number(price), timestamp: timestamp };
}

function formatGoldQuoteTime_(timestamp) {
  if (!timestamp) return '時間未知';
  return Utilities.formatDate(new Date(Number(timestamp) * 1000), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd HH:mm');
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

function battleBriefHistoryDateShiftMonths_(dateText, months) {
  var parts = String(dateText || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(function(value) { return !value; })) return '';
  var originalDay = parts[2];
  var date = new Date(Date.UTC(parts[0], parts[1] - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + Number(months || 0));
  var lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(originalDay, lastDay));
  return date.toISOString().slice(0, 10);
}

function parseBattleBriefYahooHistory_(response) {
  if (!response || response.getResponseCode() !== 200) return null;
  try {
    var json = JSON.parse(response.getContentText());
    var result = json.chart && json.chart.result && json.chart.result[0];
    if (!result) return null;
    var timestamps = result.timestamp || [];
    var quote = (((result.indicators || {}).quote || [])[0] || {});
    var opens = quote.open || [];
    var highs = quote.high || [];
    var lows = quote.low || [];
    var closes = quote.close || [];
    var volumes = quote.volume || [];
    var timezone = (result.meta || {}).exchangeTimezoneName || 'Asia/Taipei';
    var series = [];
    timestamps.forEach(function(timestamp, index) {
      var close = closes[index];
      if (timestamp == null || close == null || isNaN(close)) return;
      var open = opens[index];
      var high = highs[index];
      var low = lows[index];
      var volume = volumes[index];
      series.push({
        date: Utilities.formatDate(new Date(Number(timestamp) * 1000), timezone, 'yyyy-MM-dd'),
        open: open == null || isNaN(open) ? Number(close) : Number(open),
        high: high == null || isNaN(high) ? Number(close) : Number(high),
        low: low == null || isNaN(low) ? Number(close) : Number(low),
        close: Number(close),
        volume: volume == null || isNaN(volume) ? 0 : Number(volume)
      });
    });
    return series.length ? series : null;
  } catch (e) {
    Logger.log('battleBrief history parse failed: ' + e.message);
    return null;
  }
}

function findBattleBriefHistoryPoint_(series, targetDate) {
  for (var index = series.length - 1; index >= 0; index--) {
    if (series[index].date <= targetDate) return series[index];
  }
  return null;
}

function buildBattleBriefPricePeriods_(series) {
  if (!series || !series.length) return { latestDate: '', latestClose: '', periods: {} };
  var latest = series[series.length - 1];
  var periods = {};
  [3, 6, 12].forEach(function(months) {
    var key = months + 'M';
    var targetDate = battleBriefHistoryDateShiftMonths_(latest.date, -months);
    var start = findBattleBriefHistoryPoint_(series, targetDate);
    if (!start || !start.close || !latest.close) {
      periods[key] = {
        available: false,
        targetDate: targetDate,
        reason: '資料不足'
      };
      return;
    }
    periods[key] = {
      available: true,
      targetDate: targetDate,
      startDate: start.date,
      endDate: latest.date,
      startClose: start.close,
      endClose: latest.close,
      changePct: Math.round(((latest.close / start.close - 1) * 100) * 10000) / 10000
    };
  });
  return {
    latestDate: latest.date,
    latestClose: latest.close,
    periods: periods
  };
}

function readBattleBriefHistoryCache_(cache, yahooSymbol) {
  try {
    var raw = cache.get(BATTLE_PRICE_HISTORY_CACHE_PREFIX + yahooSymbol);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.series) ? parsed.series : null;
  } catch (e) {
    return null;
  }
}

function writeBattleBriefHistoryCache_(cache, yahooSymbol, series) {
  try {
    cache.put(
      BATTLE_PRICE_HISTORY_CACHE_PREFIX + yahooSymbol,
      JSON.stringify({ savedAt: new Date().toISOString(), series: series }),
      BATTLE_PRICE_HISTORY_CACHE_SECONDS
    );
  } catch (e) {
    Logger.log('battleBrief history cache write failed: ' + e.message);
  }
}

function fetchBattleBriefHistorySeries_(symbols) {
  var cache = CacheService.getScriptCache();
  var primary = [];
  var seriesBySymbol = {};
  var missing = [];

  symbols.forEach(function(symbol) {
    var yahooSymbol = battleBriefYahooSymbol_(symbol);
    if (!yahooSymbol) return;
    var cached = readBattleBriefHistoryCache_(cache, yahooSymbol);
    if (cached && cached.length) {
      seriesBySymbol[symbol] = { yahooSymbol: yahooSymbol, series: cached };
      return;
    }
    primary.push({ symbol: symbol, yahooSymbol: yahooSymbol });
  });

  if (primary.length) {
    var requests = primary.map(function(item) {
      return {
        url: 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(item.yahooSymbol) + '?interval=1d&range=2y&events=history&includePrePost=false',
        method: 'get',
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      };
    });
    var responses = UrlFetchApp.fetchAll(requests);
    primary.forEach(function(item, index) {
      var series = parseBattleBriefYahooHistory_(responses[index]);
      if (series && series.length) {
        seriesBySymbol[item.symbol] = { yahooSymbol: item.yahooSymbol, series: series };
        writeBattleBriefHistoryCache_(cache, item.yahooSymbol, series);
      } else {
        missing.push(item);
      }
    });
  }

  var fallback = missing.filter(function(item) { return /\.TW$/.test(item.yahooSymbol); });
  if (fallback.length) {
    var fallbackRequests = fallback.map(function(item) {
      var yahooSymbol = item.yahooSymbol.replace(/\.TW$/, '.TWO');
      return {
        url: 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(yahooSymbol) + '?interval=1d&range=2y&events=history&includePrePost=false',
        method: 'get',
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      };
    });
    var fallbackResponses = UrlFetchApp.fetchAll(fallbackRequests);
    fallback.forEach(function(item, index) {
      var series = parseBattleBriefYahooHistory_(fallbackResponses[index]);
      if (series && series.length) {
        var yahooSymbol = item.yahooSymbol.replace(/\.TW$/, '.TWO');
        seriesBySymbol[item.symbol] = { yahooSymbol: yahooSymbol, series: series };
        writeBattleBriefHistoryCache_(cache, yahooSymbol, series);
      }
    });
  }
  return seriesBySymbol;
}

function getBattleBriefPriceHistory_(ss, params) {
  var holdings = getHoldingsOverview(ss, true);
  var holdingSymbols = {};
  holdings.forEach(function(row) {
    var symbol = normalizeInvestmentSymbol_(row.symbol) || String(row.symbol || '').trim();
    if (symbol && !isBattleBriefFund_(symbol)) holdingSymbols[symbol] = true;
  });
  var requested = String((params && params.codes) || '').split(',').map(function(value) {
    return normalizeInvestmentSymbol_(value) || String(value || '').trim();
  }).filter(function(value, index, list) {
    return value && list.indexOf(value) === index && holdingSymbols[value];
  });
  var symbols = requested.length ? requested : Object.keys(holdingSymbols);
  var seriesBySymbol = fetchBattleBriefHistorySeries_(symbols);
  var items = symbols.map(function(symbol) {
    var entry = seriesBySymbol[symbol];
    if (!entry) return { code: symbol, available: false, error: '歷史收盤資料暫時無法取得' };
    var summary = buildBattleBriefPricePeriods_(entry.series);
    return {
      code: symbol,
      yahooSymbol: entry.yahooSymbol,
      available: true,
      latestDate: summary.latestDate,
      latestClose: summary.latestClose,
      periods: summary.periods,
      // 提供軍機處持股圖表所需的 OHLC，避免第三方 Widget 回退到錯誤標的。
      series: ['00997A', '00985B', 'QQQI', 'MLPI'].indexOf(symbol) >= 0 ? entry.series : []
    };
  });
  return {
    updatedAt: battleBriefNowText_(),
    source: 'Yahoo Finance 歷史收盤價',
    items: items
  };
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

// 龐統首頁用的今日摘要；只回傳各區塊的筆數與更新狀態，不回傳醫療明細。
function getDailyUpdates_(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  var todayText = battleBriefDateText_(new Date());
  var items = [];
  var errors = [];

  try {
    var transactions = getTransactions(ss, '', 1) || [];
    var incomeCount = transactions.filter(function(row) { return row.type === '收入'; }).length;
    var expenseCount = transactions.filter(function(row) { return row.type === '支出'; }).length;
    var transferCount = transactions.filter(function(row) { return row.type === '轉帳'; }).length;
    if (transactions.length) {
      var financeParts = ['今日記帳 ' + transactions.length + ' 筆'];
      if (incomeCount) financeParts.push('收入 ' + incomeCount + ' 筆');
      if (expenseCount) financeParts.push('支出 ' + expenseCount + ' 筆');
      if (transferCount) financeParts.push('轉帳 ' + transferCount + ' 筆');
      items.push({ module: 'finance', icon: '💰', title: '財政部', message: financeParts.join('，'), count: transactions.length, updated: true, target: 'finance', tab: 'booking-form' });
    }
  } catch (e) { errors.push({ module: 'finance', message: e.message || '財政資料讀取失敗' }); }

  try {
    var etfStatus = get00997AHoldingChange() || {};
    var etf = etfStatus.latest;
    if (etf && (normalize00997ADateText_(etf.sourceDate) === todayText || normalize00997ADateText_(etf.date) === todayText)) {
      items.push({ module: 'council', icon: '⚔️', title: '軍機處', message: '00997A 已完成軍師短評，請主公詳閱', count: 1, updated: true, target: 'council', tab: 'battle-brief' });
    }
    var battle = {};
    try { battle = getBattleBrief(ss) || {}; } catch (battleError) { errors.push({ module: 'council', message: battleError.message || '基金資料讀取失敗' }); }
    var freshFunds = (battle.funds || []).filter(function(row) {
      return battleBriefSourceDateText_(row.updatedAt) === todayText || battleBriefSourceDateText_(row.dataDate) === todayText;
    });
    if (freshFunds.length) {
      items.push({ module: 'council', icon: '⚔️', title: '軍機處', message: '基金淨值已更新，請主公查閱', count: 1, updated: true, target: 'council', tab: 'battle-brief' });
    }
  } catch (e) { errors.push({ module: 'council', message: e.message || '00997A 資料讀取失敗' }); }

  try {
    var store = getStoreRecords_() || {};
    var storeCount = (store.records || []).filter(function(record) {
      return normalizeStoreDate_(record.recordDate) === todayText;
    }).length;
    if (storeCount) {
      items.push({ module: 'store', icon: '🏛️', title: '太倉', message: '今日新增物品記錄 ' + storeCount + ' 筆', count: storeCount, updated: true, target: 'store', tab: 'store-list' });
    }
  } catch (e) { errors.push({ module: 'store', message: e.message || '太倉資料讀取失敗' }); }

  try {
    var medical = getMedicalRecords_() || {};
    var medicalCount = (medical.records || []).filter(function(record) {
      return String(record.recordTime || '').replace(/-/g, '/').slice(0, 10) === todayText;
    }).length;
    if (medicalCount) {
      items.push({ module: 'medical', icon: '🏥', title: '醫館', message: '今日記錄 ' + medicalCount + ' 筆疼痛資料', count: medicalCount, updated: true, target: 'medical', tab: 'medical-painmap' });
    }
  } catch (e) { errors.push({ module: 'medical', message: e.message || '醫館資料讀取失敗' }); }

  return { status: 'success', date: todayText, updatedAt: battleBriefNowText_(), items: items, errors: errors };
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
            '常見帳戶與代稱：國泰s/國泰stock=國泰Stock，現金/cash=Cash，中國/中信=中國信託，連線/LINE/將來=連線商業銀行，玉山=玉山銀行，國泰m=國泰Money，cube/CUBE=Cube。',
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

function ensureLedgerRequestIdColumn_(db) {
  var header = String(db.getRange(1, LEDGER_REQUEST_ID_COLUMN).getValue() || '').trim();
  if (header !== LEDGER_REQUEST_ID_HEADER) {
    db.getRange(1, LEDGER_REQUEST_ID_COLUMN).setValue(LEDGER_REQUEST_ID_HEADER);
    db.getRange(1, LEDGER_REQUEST_ID_COLUMN).setNumberFormat('@');
  }
}

function findLedgerRequestRow_(db, requestId) {
  var key = String(requestId || '').trim();
  if (!key || db.getLastRow() < 2) return 0;
  ensureLedgerRequestIdColumn_(db);
  var values = db.getRange(2, LEDGER_REQUEST_ID_COLUMN, db.getLastRow() - 1, 1).getDisplayValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === key) return i + 2;
  }
  return 0;
}

function appendLedgerRowOnce_(db, row, requestId) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    ensureLedgerRequestIdColumn_(db);
    var key = String(requestId || '').trim() || ('server-' + Utilities.getUuid());
    var existingRow = findLedgerRequestRow_(db, key);
    if (existingRow) return { duplicate: true, row: existingRow, requestId: key };
    var rowNumber = db.getLastRow() + 1;
    db.getRange(rowNumber, 1, 1, 16).setValues([row]);
    db.getRange(rowNumber, LEDGER_REQUEST_ID_COLUMN).setNumberFormat('@').setValue(key);
    // 先確認主交易列與請求 ID 都真的落盤，再允許後續餘額／帳戶變化紀錄流程繼續。
    // 若資料庫寫入不完整，直接拋錯；呼叫端不會進入 recordAccountChange_。
    var persisted = db.getRange(rowNumber, 1, 1, 16).getValues()[0];
    if (String(persisted[1] || '').trim() !== String(row[1] || '').trim() ||
        Number(persisted[2] || 0) !== Number(row[2] || 0) ||
        Number(persisted[6] || 0) !== Number(row[6] || 0) ||
        String(persisted[4] || '').trim() !== String(row[4] || '').trim() ||
        String(persisted[8] || '').trim() !== String(row[8] || '').trim() ||
        String(persisted[12] || '').trim() !== String(row[12] || '').trim() ||
        String(persisted[13] || '').trim() !== String(row[13] || '').trim() ||
        Number(persisted[14] || 0) !== Number(row[14] || 0)) {
      throw new Error('資料庫交易列寫入驗證失敗，已停止建立帳戶變化紀錄');
    }
    var persistedRequestId = String(db.getRange(rowNumber, LEDGER_REQUEST_ID_COLUMN).getDisplayValue() || '').trim();
    if (persistedRequestId !== key) {
      throw new Error('資料庫請求 ID 寫入驗證失敗，已停止建立帳戶變化紀錄');
    }
    return { duplicate: false, row: rowNumber, requestId: key, persisted: true };
  } finally {
    lock.releaseLock();
  }
}

function txnDateStamp_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  }
  var s = String(value || '').trim();
  var m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  return null;
}

function recentTxnRetentionDays_(days) {
  var n = Math.floor(Number(days) || 0);
  return n > 0 ? Math.min(RECENT_TRANSACTION_RETENTION_DAYS, n) : 0;
}

function recentTxnCutoffStamp_(days) {
  var retentionDays = recentTxnRetentionDays_(days);
  if (!retentionDays) return null;
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - retentionDays + 1).getTime();
}

function recentTxnTodayStamp_() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function isWithinRecentTxnWindow_(value, cutoffStamp) {
  if (cutoffStamp == null) return true;
  var stamp = txnDateStamp_(value);
  return stamp != null && stamp >= cutoffStamp && stamp <= recentTxnTodayStamp_();
}

function getTransactions(ss, ym, recentDays) {
  var cutoffStamp = recentTxnCutoffStamp_(recentDays);
  if (!ym && cutoffStamp == null) return [];
  var db = ss.getSheetByName('資料庫');
  var txns = [];
  pruneOldAccountChangeRows_(ss, recentDays);
  var accountChanges = readAccountChangesForYm_(ss, ym, recentDays);
  var usedAccountChanges = {};

  if (db && db.getLastRow() >= 2) {
    var data = db.getRange(2, 1, db.getLastRow() - 1, 16).getValues();
    data.forEach(function(row, i) {
      var rowYM = ledgerYm_(row);
      if (cutoffStamp == null && rowYM !== ym) return;
      if (!isWithinRecentTxnWindow_(row[0], cutoffStamp)) return;
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
          transferTxn.createdAt = transferChange.createdAt || '';
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
  if (!isWithinRecentTxnWindow_(row[0], recentTxnCutoffStamp_(RECENT_TRANSACTION_RETENTION_DAYS))) {
    throw new Error('只支援撤銷最近 ' + RECENT_TRANSACTION_RETENTION_DAYS + ' 天內的紀錄');
  }
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
  pruneOldAccountChangeRows_(ss, RECENT_TRANSACTION_RETENTION_DAYS);
  var sheet = ss.getSheetByName(ACCOUNT_CHANGE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var lastRow = sheet.getLastRow();
  var width = Math.max(ACCOUNT_CHANGE_HEADERS.length, sheet.getLastColumn());
  var rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var items = [];
  var cutoffStamp = recentTxnCutoffStamp_(RECENT_TRANSACTION_RETENTION_DAYS);

  rows.forEach(function(row, i) {
    var rowYM = String(row[2] || '').trim();
    if (ym && rowYM !== ym) return;
    if (!isWithinRecentTxnWindow_(row[1], cutoffStamp)) return;
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
  var appendResult = appendLedgerRowOnce_(db, [
    // 金額欄統一保存正數；收支方向由「記帳類型」決定。
    ds, '支出', amount, cat, account, note, '', '', '', ym, '', '', '', '', '', ''
  ], body.requestId);
  if (appendResult.duplicate) {
    return { message: '這筆支出已寫入，略過重複請求', duplicate: true, row: appendResult.row, requestId: appendResult.requestId };
  }
  var nr = appendResult.row;
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
  var divSymbol = String(body.divSymbol || '').trim();
  if (!divSymbol) divSymbol = normalizeInvestmentSymbol_(account);
  var dividendRowId = parseInt(body.dividendRowId, 10) || 0;
  var isDividendIncome = String(body.dividendIncome || '').trim() === '1' || dividendRowId > 0;
  var incomeStockSymbol = normalizeInvestmentSymbol_(divSymbol || note || account);
  var ledgerAccount = normalizeIncomeLedgerAccount_(account, incomeStockSymbol);

  if (!ds)      throw new Error('日期必填');
  if (!source)  throw new Error('收入來源必填');
  if (!account) throw new Error('帳戶必填');
  if (amount <= 0) throw new Error('金額必須大於 0');
  if (isDividendIncome && dividendRowId) {
    var dividendSheet = ensureDividendDbSheet_(getExternalDbSpreadsheet_());
    if (!isDividendRowMatch_(dividendSheet, dividendRowId, divSymbol || account)) {
      throw new Error('這筆配息已入帳或資料已更新，為避免重複記錄，請重新整理待入帳配息。');
    }
  }

  note = divSymbol ? getDividendDisplayLabel_(incomeStockSymbol) : formatIncomeStockNote_(note, incomeStockSymbol);

  var ym = ds.substring(0, 7);
  var appendResult = appendLedgerRowOnce_(db, [
    ds, '收入', '', '', '', note, amount, source, ledgerAccount, ym, '', '', '', '', '', ''
  ], body.requestId);
  if (appendResult.duplicate) {
    return { message: '這筆收入已寫入，略過重複請求', duplicate: true, row: appendResult.row, requestId: appendResult.requestId };
  }
  var nr = appendResult.row;
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
  var appendResult;
  if (stockMode) {
    var isSell = stockType === 'sell';
    var signedShares = isSell ? -stockShares : stockShares;
    appendResult = appendLedgerRowOnce_(db, [
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
    ], body.requestId);
    if (appendResult.duplicate) {
      return { message: '這筆股票交易已寫入，略過重複請求', duplicate: true, row: appendResult.row, requestId: appendResult.requestId };
    }
    var nr = appendResult.row;
    db.getRange(nr, 10, 1, 1).setNumberFormat('@');
    db.getRange(nr, 13, 1, 2).setNumberFormat('@');
    db.getRange(nr, 15, 1, 1).setNumberFormat('#,##0');
    db.getRange(nr, 16, 1, 1).setNumberFormat('#,##0.##');
  } else {
    appendResult = appendLedgerRowOnce_(db, [
      ds, '轉帳', '', '', '', note, '', label, '', ym, '', '', from, to, amount, ''
    ], body.requestId);
    if (appendResult.duplicate) {
      return { message: '這筆轉帳已寫入，略過重複請求', duplicate: true, row: appendResult.row, requestId: appendResult.requestId };
    }
    var nr = appendResult.row;
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
  var note = String(body.note || '').trim();
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
  pruneOldAccountChangeRows_(ss, RECENT_TRANSACTION_RETENTION_DAYS);
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

// ── Store 倉庫資料（獨立試算表）────────────────────────────
function ensureStoreSheet_() {
  var ss = getStoreSpreadsheet_();
  var sheet = ss.getSheetByName(STORE_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(STORE_SHEET_NAME);

  var current = sheet.getRange(4, 1, 1, STORE_HEADERS.length).getValues()[0];
  var needsHeader = current.join('') === '';
  if (!needsHeader) {
    for (var i = 0; i < STORE_HEADERS.length; i++) {
      if (String(current[i] || '').trim() !== STORE_HEADERS[i]) {
        needsHeader = true;
        break;
      }
    }
  }
  if (needsHeader) {
    sheet.getRange(4, 1, 1, STORE_HEADERS.length).setValues([STORE_HEADERS]);
    sheet.setFrozenRows(4);
  }
  return sheet;
}

function getStoreSheetForRead_() {
  return getStoreSpreadsheet_().getSheetByName(STORE_SHEET_NAME);
}

function clearStoreRecordsCache_() {
  CacheService.getScriptCache().remove(STORE_RECORDS_CACHE_KEY);
}

function putStoreRecordsCache_(value) {
  try {
    CacheService.getScriptCache().put(
      STORE_RECORDS_CACHE_KEY,
      JSON.stringify(value),
      STORE_RECORDS_CACHE_SECONDS
    );
  } catch (ignore) {
    // Cache is only an optimization; an oversized or unavailable cache must not break reads.
  }
}

function getStoreRecords_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(STORE_RECORDS_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (ignore) {
      cache.remove(STORE_RECORDS_CACHE_KEY);
    }
  }

  var sheet = getStoreSheetForRead_();
  if (!sheet) {
    var emptyResult = { status: 'success', records: [] };
    putStoreRecordsCache_(emptyResult);
    return emptyResult;
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) {
    var noRecordsResult = { status: 'success', records: [] };
    putStoreRecordsCache_(noRecordsResult);
    return noRecordsResult;
  }

  var rows = sheet.getRange(5, 1, lastRow - 4, STORE_HEADERS.length).getDisplayValues();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd');
  var records = rows.map(function(row, index) {
    var recordDate = String(row[4] || '').trim() || today;
    return {
      row: index + 5,
      itemName: String(row[0] || '').trim(),
      location: String(row[1] || '').trim(),
      code: String(row[2] || '').trim(),
      description: String(row[3] || '').trim(),
      recordDate: recordDate
    };
  }).filter(function(record) {
    return record.itemName || record.location || record.code || record.description;
  });

  var result = { status: 'success', records: records };
  putStoreRecordsCache_(result);
  return result;
}

function writeStoreRecord_(body) {
  body = body || {};
  var itemName = String(body.itemName || '').trim();
  var location = String(body.location || '').trim();
  var code = String(body.code || '').trim();
  var description = String(body.description || '').trim();
  var recordDate = normalizeStoreDate_(body.recordDate);
  if (String(body.recordDate || '').trim() && !recordDate) throw new Error('請輸入有效的記錄時間');
  recordDate = recordDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd');
  if (!itemName) throw new Error('請輸入物品名稱');

  var sheet = ensureStoreSheet_();
  var row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, STORE_HEADERS.length).setValues([[
    itemName, location, code, description, recordDate
  ]]);
  sheet.getRange(row, 1, 1, STORE_HEADERS.length).setNumberFormat('@');
  clearStoreRecordsCache_();
  return {
    status: 'success',
    message: '倉庫記錄已新增',
    row: row,
    record: {
      row: row,
      itemName: itemName,
      location: location,
      code: code,
      description: description,
      recordDate: recordDate
    }
  };
}

function getStoreRecordRow_(body, sheet) {
  var row = Number(body && body.row);
  if (!Number.isInteger(row) || row < 5 || row > sheet.getLastRow()) {
    throw new Error('找不到要操作的倉庫記錄');
  }
  return row;
}

function updateStoreRecord_(body) {
  body = body || {};
  var itemName = String(body.itemName || '').trim();
  if (!itemName) throw new Error('請輸入物品名稱');
  var sheet = ensureStoreSheet_();
  var row = getStoreRecordRow_(body, sheet);
  var oldRecordDate = String(sheet.getRange(row, 5).getDisplayValue() || '').trim();
  var recordDate = normalizeStoreDate_(body.recordDate);
  if (String(body.recordDate || '').trim() && !recordDate) throw new Error('請輸入有效的記錄時間');
  recordDate = recordDate || oldRecordDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd');
  var record = [
    itemName,
    String(body.location || '').trim(),
    String(body.code || '').trim(),
    String(body.description || '').trim(),
    recordDate
  ];
  sheet.getRange(row, 1, 1, STORE_HEADERS.length).setValues([record]);
  sheet.getRange(row, 1, 1, STORE_HEADERS.length).setNumberFormat('@');
  clearStoreRecordsCache_();
  return { status: 'success', message: '倉庫記錄已更新', row: row };
}

function normalizeStoreDate_(value) {
  var text = String(value || '').trim().replace(/-/g, '/');
  return /^\d{4}\/\d{2}\/\d{2}$/.test(text) ? text : '';
}

function deleteStoreRecord_(body) {
  var sheet = ensureStoreSheet_();
  var row = getStoreRecordRow_(body, sheet);
  sheet.deleteRow(row);
  clearStoreRecordsCache_();
  return { status: 'success', message: '倉庫記錄已移除', row: row };
}

// ── 醫館資料（合併進主 Web App API）───────────────────────────
var MEDICAL_RECORD_SHEET_NAME = '情緒倉庫';
var MEDICAL_SETTING_SHEET_NAME = '設定';
var MEDICAL_CARD_STATS_SHEET_NAME = '牌卡統計';
var MEDICAL_OSHO_STATS_SHEET_NAME = '奧修禪卡統計';
var MEDICAL_CARD_STATS_CACHE_KEY = 'medical_card_stats_v2_';
var MEDICAL_CARD_STATS_CACHE_SECONDS = 600;
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
      painLevel: row[6] !== '' ? String(row[6]).trim() : '',
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
      tarot: readMedicalStatsSheetCached_(ss.getSheetByName(MEDICAL_CARD_STATS_SHEET_NAME), MEDICAL_CARD_STATS_COLUMNS, monthsLimit, 'tarot'),
      osho: readMedicalStatsSheetCached_(ss.getSheetByName(MEDICAL_OSHO_STATS_SHEET_NAME), MEDICAL_OSHO_STATS_COLUMNS, monthsLimit, 'osho')
    }
  };
}

function readMedicalStatsSheetCached_(sheet, columns, monthsLimit, kind) {
  var cache = CacheService.getScriptCache();
  var key = MEDICAL_CARD_STATS_CACHE_KEY + kind + '_' + monthsLimit;
  var cached = cache.get(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (ignore) { cache.remove(key); }
  }
  var rows = readMedicalStatsSheet_(sheet, columns, { monthsLimit: monthsLimit });
  try { cache.put(key, JSON.stringify(rows), MEDICAL_CARD_STATS_CACHE_SECONDS); } catch (ignore) {}
  return rows;
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
  clearMedicalCardStatsCache_();
  return {
    status: 'success',
    message: '抽牌紀錄已新增',
    date: body.date || '',
    row: '',
    cardRows: cardRowsWritten,
    oshoRows: oshoRowsWritten
  };
}

function clearMedicalCardStatsCache_() {
  var cache = CacheService.getScriptCache();
  [1, 3, 6, 12, 24, 60].forEach(function(limit) {
    cache.remove(MEDICAL_CARD_STATS_CACHE_KEY + 'tarot_' + limit);
    cache.remove(MEDICAL_CARD_STATS_CACHE_KEY + 'osho_' + limit);
  });
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
  clearMedicalCardStatsCache_();
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
