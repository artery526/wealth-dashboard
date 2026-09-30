const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const context = {
  esc: value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])),
};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function advisorWorldNum('), html.indexOf('function advisorWorldTaiwanStockReviewRequest(')), context);
const now = Date.parse('2026-10-01T00:00:00Z');
// Regression fixture from the verified September 30 macro snapshot, not a live feed.
const baseline = {
  trailingPE: 26.24882332486199, pb: 4.182116664249056,
  historicalPEMedian: { tenYear: 16.66289098291525 },
  historicalPBMedian: { tenYear: 1.9112577889757896 },
  source: 'MoneyDJ河流圖反算；TWSE同日指數核對；已完成月份月度樣本',
  dataDate: '2026/09/30', status: '已更新',
};
const calculate = data => context.advisorWorldTaiwanValuation({ valuations: { taiex: data } }, now);
const qqq = {
  price: 744.1, forwardPE: 22.37, forwardEarnings: 33.26329906124273,
  historicalMedian: { tenYear: 23.39 }, source: 'History of Market',
  dataDate: '2026/09/30', priceDate: '2026/09/30', status: '已更新',
};
const calculateQqq = data => context.advisorWorldQqqValuation({ valuations: { qqq: data } }, now);
test('PE/PB comparison preserves ratios and monthly historical grain', () => {
  const result = calculate(baseline);
  assert.equal(result.section.status, '雙指標溢價');
  assert.match(result.section.oneLine, /57\.5%/);
  assert.match(result.section.oneLine, /118\.8%/);
  assert.equal(result.section.lines[0].value, '26.25×');
  assert.equal(result.section.lines[1].value, '4.18×');
  assert.match(result.section.lines[2].label, /月度/);
});
test('missing, failed, stale and future values never become cheap signals', () => {
  for (const data of [ {}, { ...baseline, trailingPE: null }, { ...baseline, pb: 0 },
    { ...baseline, pb: '' }, { ...baseline, pb: 'NaN' },
    { ...baseline, historicalPBMedian: {} }, { ...baseline, source: '' },
    { ...baseline, dataDate: '2026/09/01' }, { ...baseline, dataDate: '2026/10/02' },
    { ...baseline, dataDate: '2026/02/31' }, { ...baseline, status: '更新失敗' } ]) {
    assert.equal(calculate(data).comparable, false);
    assert.equal(calculate(data).premium, false);
    assert.equal(calculate(data).section.tone, 'watch');
  }
  assert.equal(calculate({ ...baseline, dataDate: '2026/09/21' }).comparable, true);
  assert.equal(calculate({ ...baseline, dataDate: '2026/09/20' }).comparable, false);
});
test('divergent and discounted comparisons remain descriptive', () => {
  assert.equal(calculate({ ...baseline, trailingPE: 15, pb: 3 }).section.status, '估值指標分歧');
  assert.equal(calculate({ ...baseline, trailingPE: 15, pb: 1 }).section.status, '雙指標未高於中位數');
});
test('QQQ valuation compares Forward P/E with its 10Y median', () => {
  const result = calculateQqq(qqq);
  assert.equal(result.section.status, 'Forward P/E 低於10Y中位數');
  assert.equal(result.section.lines[0].value, '$744.10');
  assert.equal(result.section.lines[1].value, '22.37×');
  assert.equal(result.section.lines[2].value, '33.26');
  assert.match(result.section.oneLine, /4\.4%/);
});
test('QQQ missing or stale values never become valuation signals', () => {
  for (const data of [ {}, { ...qqq, forwardPE: null }, { ...qqq, forwardEarnings: 0 },
    { ...qqq, historicalMedian: {} }, { ...qqq, source: '' },
    { ...qqq, dataDate: '2026/09/01' }, { ...qqq, dataDate: '2026/10/02' },
    { ...qqq, status: '更新失敗' } ]) {
    assert.equal(calculateQqq(data).comparable, false);
    assert.equal(calculateQqq(data).premium, false);
  }
});
test('brief integrates valuation without making premium a systemic crisis', () => {
  const current = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
  const indicators = [ ['liquidityScore', 4], ['nfpPayrollChange', 162], ['adpEmploymentChange', 38], ['joltsOpenings', 7079], ['vix', 16] ].map(([code, value]) => ({ code, value }));
  const view = context.advisorWorldBuild({}, { indicators, valuations: { taiex: { ...baseline, dataDate: current } } });
  assert.equal(view.sections.length, 6);
  assert.equal(view.empireTone, 'watch');
  assert.match(view.todayLine, /QQQ估值/);
  assert.match(view.todayLine, /雙指標溢價/);
  const defense = context.advisorWorldBuild({}, { indicators: [...indicators.filter(row => row.code !== 'vix'), { code: 'vix', value: 35 }], valuations: { taiex: { ...baseline, dataDate: current } } });
  assert.equal(defense.empireTone, 'defense');
});
test('valuation is full width and source text is escaped', () => {
  const section = calculate({ ...baseline, source: '<img onerror=bad>' }).section;
  const rendered = context.advisorWorldSectionHtml(section);
  assert.match(rendered, /advisor-brief-section valuation/);
  assert.match(rendered, /&lt;img onerror=bad&gt;/);
  assert.doesNotMatch(rendered, /<img onerror/);
});
