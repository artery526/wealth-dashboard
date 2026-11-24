var WAR_ROOM_US_CLOSE_REPORT_PROPERTY_ = 'WAR_ROOM_US_CLOSE_REPORT_V1';
var WAR_ROOM_US_CLOSE_MARKET_CACHE_KEY_ = 'WAR_ROOM_US_CLOSE_MARKET_V1';

function getWarRoomUsCloseReport_() {
  var raw = PropertiesService.getScriptProperties().getProperty(WAR_ROOM_US_CLOSE_REPORT_PROPERTY_);
  if (!raw) return { report: null, status: 'pending', stale: true };
  try {
    var report = JSON.parse(raw);
    return { report: report, status: report.status || 'published', stale: false };
  } catch (error) {
    return { report: null, status: 'invalid_cache', stale: true };
  }
}

function generateWarRoomUsCloseReport_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    var waiting = getWarRoomUsCloseReport_();
    waiting.stale = true;
    waiting.attempt = { status: 'in_progress', message: '另一個更新程序正在整理，請稍後重新整理。' };
    return waiting;
  }
  try {
    var market = getWarRoomUsCloseMarketData_();
    var existing = getWarRoomUsCloseReport_();
    if (existing.report && String(existing.report.marketDate || '') >= market.marketDate) {
      existing.marketDate = market.marketDate;
      existing.stale = false;
      existing.updated = false;
      return existing;
    }

    var summary = '';
    var parsed = null;
    var aiMessage = '';
    var properties = PropertiesService.getScriptProperties();
    var key = String(properties.getProperty('OPENAI_API_KEY') || '').trim();
    var model = String(properties.getProperty('OPENAI_MODEL') || '').trim() || 'gpt-4o-mini';
    if (key) {
      try {
        var requestBody = {
          model: model,
          instructions: '你是美股盤後資料編輯，只能根據輸入的 FRED 官方日收盤資料與程式計算的短中長期技術數值寫繁體中文報告。不得自行搜尋或補入行情、新聞、日期、產業表現或漲跌原因。區分單日變化與較長期狀態，不做價格預測、不提供買賣建議。輸出簡潔 JSON，欄位為 headline、summary（2 至 3 句）、observations（最多 3 項）、mainRisk。若資料不足，明確寫資料不足。',
          input: JSON.stringify({ marketDate: market.marketDate, indices: market.indices, sources: market.sources }),
          max_output_tokens: 420,
          store: false
        };
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
        var responseData = JSON.parse(response.getContentText() || '{}');
        if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || responseData.error) throw new Error('OpenAI 摘要服務回應異常');
        var outputText = String(responseData.output_text || '').trim();
        if (!outputText && Array.isArray(responseData.output)) {
          responseData.output.forEach(function(item) {
            (item.content || []).forEach(function(part) {
              if ((part.type === 'output_text' || part.type === 'text') && part.text) outputText += String(part.text);
            });
          });
        }
        parsed = parseWarRoomUsCloseReportJson_(outputText);
      } catch (aiError) {
        aiMessage = 'OpenAI 摘要暫不可用，先顯示依已核對收盤資料整理的摘要。';
      }
    } else {
      aiMessage = '尚未設定 OpenAI API，先顯示依已核對收盤資料整理的摘要。';
    }

    var fallback = buildWarRoomUsCloseFallback_(market);
    var report = {
      status: 'published',
      marketDate: market.marketDate,
      indices: market.indices,
      headline: parsed ? (warRoomUsCloseText_(parsed.headline, 120) || fallback.headline) : fallback.headline,
      summary: parsed ? (warRoomUsCloseText_(parsed.summary, 1000) || fallback.summary) : fallback.summary,
      observations: parsed && Array.isArray(parsed.observations) ? parsed.observations.map(function(item) { return warRoomUsCloseText_(item, 240); }).filter(Boolean).slice(0, 3) : fallback.observations,
      mainRisk: warRoomUsCloseText_(parsed && parsed.mainRisk, '本報僅整理已公布指數收盤與歷史技術資料，不代表未來走勢或投資建議。'),
      sources: market.sources,
      generatedAt: new Date().toISOString(),
      source: parsed ? 'FRED 官方日收盤資料；OpenAI Responses API 摘要' : 'FRED 官方日收盤資料；規則摘要',
      aiNote: aiMessage
    };
    var serialized = JSON.stringify(report);
    if (serialized.length > 7800) throw new Error('美股報告超過安全儲存長度，未覆蓋上次資料');
    PropertiesService.getScriptProperties().setProperty(WAR_ROOM_US_CLOSE_REPORT_PROPERTY_, serialized);
    return { report: report, status: report.status, stale: false, updated: true, attempt: { status: 'published', message: aiMessage } };
  } catch (error) {
    var previous = getWarRoomUsCloseReport_();
    previous.stale = true;
    previous.attempt = { status: 'error', message: '最新美股資料暫時無法整理，保留上次成功報告。' };
    return previous;
  } finally {
    lock.releaseLock();
  }
}

function getWarRoomUsCloseMarketData_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(WAR_ROOM_US_CLOSE_MARKET_CACHE_KEY_);
  if (cached) {
    try { return JSON.parse(cached); } catch (ignore) {}
  }
  var series = [
    { key: 'nasdaq100', id: 'NASDAQ100', name: 'NASDAQ-100', sourceTitle: 'FRED（來源：Nasdaq）', sourceUrl: 'https://fred.stlouisfed.org/data/NASDAQ100' },
    { key: 'sp500', id: 'SP500', name: 'S&P 500', sourceTitle: 'FRED（來源：S&P Dow Jones Indices）', sourceUrl: 'https://fred.stlouisfed.org/data/SP500' }
  ];
  var startDate = fredStartDate_(24);
  var requests = series.map(function(item) {
    return { url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + encodeURIComponent(item.id) + '&cosd=' + encodeURIComponent(startDate), muteHttpExceptions: true, followRedirects: true };
  });
  var responses = UrlFetchApp.fetchAll(requests);
  var pointsByKey = {};
  responses.forEach(function(response, index) {
    var item = series[index];
    if (response.getResponseCode() !== 200) throw new Error('FRED 收盤資料暫時無法讀取');
    var rows = Utilities.parseCsv(String(response.getContentText() || ''));
    if (!rows.length || String(rows[0][0] || '').replace(/^\uFEFF/, '') !== 'observation_date' || String(rows[0][1] || '') !== item.id) throw new Error('FRED 收盤資料格式無法核對');
    var points = [];
    for (var i = 1; i < rows.length; i++) {
      var date = String(rows[i][0] || '').trim();
      var valueText = String(rows[i][1] || '').trim();
      if (valueText === '.') continue;
      var value = Number(valueText);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && isFinite(value) && value > 0) points.push({ date: date, close: value });
    }
    if (points.length < 2) throw new Error('FRED 收盤資料筆數不足');
    pointsByKey[item.key] = points;
  });
  var spDates = {};
  pointsByKey.sp500.forEach(function(point) { spDates[point.date] = true; });
  var common = pointsByKey.nasdaq100.filter(function(point) { return spDates[point.date]; });
  if (common.length < 2) throw new Error('NASDAQ-100 與 S&P 500 缺少共同收盤日期');
  var marketDate = common[common.length - 1].date;
  var indices = series.map(function(item) {
    var points = pointsByKey[item.key].filter(function(point) { return point.date <= marketDate && common.some(function(shared) { return shared.date === point.date; }); });
    var current = points[points.length - 1];
    var previous = points[points.length - 2];
    if (!current || !previous || current.date !== marketDate) throw new Error('指數收盤資料日期無法對齊');
    return {
      key: item.key, name: item.name, close: current.close,
      change: current.close - previous.close,
      changePercent: (current.close / previous.close - 1) * 100,
      dataDate: current.date,
      technical: warRoomUsCloseTechnical_(points),
      sourceName: item.sourceTitle, sourceUrl: item.sourceUrl
    };
  });
  var payload = { marketDate: marketDate, indices: indices, sources: series.map(function(item) { return { title: item.sourceTitle, url: item.sourceUrl }; }) };
  cache.put(WAR_ROOM_US_CLOSE_MARKET_CACHE_KEY_, JSON.stringify(payload), 900);
  return payload;
}

function warRoomUsCloseTechnical_(points) {
  var close = points[points.length - 1].close;
  function returnOver(sessions) {
    var index = points.length - sessions - 1;
    return index < 0 ? null : (close / points[index].close - 1) * 100;
  }
  function average(count) {
    if (points.length < count) return null;
    return points.slice(-count).reduce(function(total, point) { return total + point.close; }, 0) / count;
  }
  var ma20 = average(20), ma60 = average(60), gains = 0, losses = 0;
  if (points.length < 15) return { fiveSessionReturn: returnOver(5), twentySessionReturn: returnOver(20), sixtySessionReturn: returnOver(60), movingAverages: { twenty: ma20, sixty: ma60 }, closeVsMovingAveragePercent: { twenty: ma20 == null ? null : (close / ma20 - 1) * 100, sixty: ma60 == null ? null : (close / ma60 - 1) * 100 }, rsi14: null, sessions: points.length, dataDate: points[points.length - 1].date };
  for (var i = points.length - 14; i < points.length; i++) {
    var delta = points[i].close - points[i - 1].close;
    if (delta > 0) gains += delta; else losses -= delta;
  }
  var rsi14 = losses === 0 ? (gains === 0 ? 50 : 100) : 100 - (100 / (1 + gains / losses));
  return { fiveSessionReturn: returnOver(5), twentySessionReturn: returnOver(20), sixtySessionReturn: returnOver(60), movingAverages: { twenty: ma20, sixty: ma60 }, closeVsMovingAveragePercent: { twenty: ma20 == null ? null : (close / ma20 - 1) * 100, sixty: ma60 == null ? null : (close / ma60 - 1) * 100 }, rsi14: rsi14, sessions: points.length, dataDate: points[points.length - 1].date };
}

function buildWarRoomUsCloseFallback_(market) {
  var indices = market.indices || [];
  var names = { nasdaq100: 'NASDAQ-100', sp500: 'S&P 500' };
  var summary = indices.map(function(item) {
    var sign = Number(item.change) > 0 ? '+' : '';
    return names[item.key] + ' 收於 ' + Number(item.close).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '，單日 ' + sign + Number(item.changePercent).toFixed(2) + '%';
  }).join('；');
  return { headline: '美股主要指數收盤與趨勢整理', summary: market.marketDate + '：' + summary + '。技術指標僅描述歷史日收盤變化。', observations: indices.map(function(item) { var tech = item.technical || {}; return item.name + '：近 5／20／60 個交易日 ' + (tech.fiveSessionReturn == null ? '資料不足' : tech.fiveSessionReturn.toFixed(2) + '%') + '／' + (tech.twentySessionReturn == null ? '資料不足' : tech.twentySessionReturn.toFixed(2) + '%') + '／' + (tech.sixtySessionReturn == null ? '資料不足' : tech.sixtySessionReturn.toFixed(2) + '%') + '。'; }) };
}

function parseWarRoomUsCloseReportJson_(text) {
  var raw = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  var start = raw.indexOf('{'), end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('OpenAI 沒有回傳有效美股報告');
  var parsed = JSON.parse(raw.slice(start, end + 1));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('OpenAI 美股報告格式無效');
  return parsed;
}

function warRoomUsCloseText_(value, limit) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit || 600);
}

function installWarRoomUsCloseReportSchedule_() {
  var handler = 'runWarRoomUsCloseReportScheduled';
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === handler) ScriptApp.deleteTrigger(trigger);
  });

  [
    ScriptApp.WeekDay.TUESDAY,
    ScriptApp.WeekDay.WEDNESDAY,
    ScriptApp.WeekDay.THURSDAY,
    ScriptApp.WeekDay.FRIDAY,
    ScriptApp.WeekDay.SATURDAY
  ].forEach(function(day) {
    ScriptApp.newTrigger(handler).timeBased().onWeekDay(day).atHour(8).everyWeeks(1).create();
  });

  return { installed: true, days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], hour: 8, timeZone: Session.getScriptTimeZone() };
}

function installWarRoomUsCloseReportSchedule() {
  return installWarRoomUsCloseReportSchedule_();
}

function runWarRoomUsCloseReportScheduled() {
  var dayOfWeek = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'u');
  if (dayOfWeek === '1' || dayOfWeek === '7') {
    console.log('War Room US close report skipped on Sunday or Monday.');
    return { skipped: true, reason: 'not_scheduled_day' };
  }
  var result = generateWarRoomUsCloseReport_();
  console.log('War Room US close report schedule finished: ' + String(result.status || 'unknown'));
  return result;
}
