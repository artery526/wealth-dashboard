var PUBLIC_ETF_TAX_SHEET_ID_ = '1LQ2ZiWftOOXhv58t06E5qNEXRb20o-Zu8hXQ3zff-Hk';
var PUBLIC_ETF_TAX_CACHE_SECONDS_ = 21600;
var PUBLIC_ETF_TAX_DAILY_LIMIT_ = 1200;
var PUBLIC_ETF_TAX_MINUTE_LIMIT_ = 120;

function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    if (params.action !== 'etfTaxLookup') return json_({ ok: false, error: '未知的查詢功能。' });
    if (!allowPublicRequest_()) return json_({ ok: false, error: '目前查詢人數較多，請稍後再試。' });

    var symbol = normalizeSymbol_(params.symbol || params.q || params.query);
    if (!symbol) return json_({ ok: false, error: '請輸入有效的 ETF 代號。' });

    var cache = CacheService.getScriptCache();
    var cacheKey = 'public_etf_tax_v2_' + symbol;
    var cached = cache.get(cacheKey);
    if (cached) return json_({ ok: true, data: JSON.parse(cached) });

    var data = lookupPublicTax_(symbol);
    cache.put(cacheKey, JSON.stringify(data), PUBLIC_ETF_TAX_CACHE_SECONDS_);
    return json_({ ok: true, data: data });
  } catch (error) {
    console.error('Public ETF tax lookup failed: ' + error);
    return json_({ ok: false, error: '查詢暫時無法完成，請稍後再試。' });
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeSymbol_(value) {
  var symbol = String(value || '').trim().toUpperCase();
  if (symbol.length < 2 || symbol.length > 12 || !/^[A-Z0-9.-]+$/.test(symbol)) return '';
  return symbol;
}

function allowPublicRequest_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1500)) return false;
  try {
    var now = new Date();
    var minute = Utilities.formatDate(now, 'Asia/Taipei', 'yyyyMMddHHmm');
    var day = Utilities.formatDate(now, 'Asia/Taipei', 'yyyyMMdd');
    var props = PropertiesService.getScriptProperties();
    var minuteKey = 'public_tax_minute_' + minute;
    var dayKey = 'public_tax_day_' + day;
    var minuteCount = Number(props.getProperty(minuteKey) || 0);
    var dayCount = Number(props.getProperty(dayKey) || 0);
    if (minuteCount >= PUBLIC_ETF_TAX_MINUTE_LIMIT_ || dayCount >= PUBLIC_ETF_TAX_DAILY_LIMIT_) return false;
    props.setProperties({
      [minuteKey]: String(minuteCount + 1),
      [dayKey]: String(dayCount + 1)
    });
    return true;
  } finally {
    lock.releaseLock();
  }
}

function lookupPublicTax_(symbol) {
  var sources = [];
  appendExperienceRates_(symbol, sources);
  appendBrokerRates_(symbol, sources, '2025富邦退稅', 2, 3, 6, '2025券商彙整');
  appendBrokerRates_(symbol, sources, '2024退稅', 3, 3, 6, '2024券商彙整');
  return { symbol: symbol, found: sources.length > 0, sources: sources };
}

function readSheetRange_(range) {
  var result = Sheets.Spreadsheets.Values.get(PUBLIC_ETF_TAX_SHEET_ID_, range, {
    valueRenderOption: 'FORMATTED_VALUE'
  });
  return result.values || [];
}

function appendExperienceRates_(symbol, sources) {
  var rows = readSheetRange_("'2025國泰退稅'!A5:E");
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0] || '').trim().toUpperCase() !== symbol) continue;
    sources.push({
      source: '國泰歷史資料',
      type: 'experience',
      rows: [
        { year: '2025', taxRate: publicPercent_(rows[i][1]), refundRate: publicPercent_(rows[i][2]) },
        { year: '2024', taxRate: publicPercent_(rows[i][3]), refundRate: publicPercent_(rows[i][4]) }
      ]
    });
    return;
  }
}

function appendBrokerRates_(symbol, sources, sheetName, dataStartRow, symbolCol, refundCol, source) {
  var rows = readSheetRange_("'" + sheetName + "'!A" + dataStartRow + ':F');
  var rates = {};
  rows.forEach(function(row) {
    if (String(row[symbolCol - 1] || '').trim().toUpperCase() !== symbol) return;
    var rate = publicPercent_(row[refundCol - 1]);
    if (rate) rates[rate] = true;
  });
  var values = Object.keys(rates).sort(function(a, b) { return parseFloat(a) - parseFloat(b); });
  if (!values.length) return;
  sources.push({
    source: source,
    type: 'broker',
    rows: values.map(function(refundRate) { return { refundRate: refundRate }; })
  });
}

function publicPercent_(value) {
  var numeric = Number(String(value || '').trim().replace(/[％%\s,]/g, ''));
  if (!isFinite(numeric)) return '';
  return (Math.round(numeric * 10) / 10).toFixed(1) + '%';
}
