const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('pledge panel replaces the previous zero cache with refreshed loan principal, interest, and elapsed term', async ({ page }) => {
  await page.goto(dashboardUrl);
  await page.evaluate(() => {
    API_URL = 'https://example.invalid';
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-pledge-freshness"></div><div id="pledge-collapse-meta"></div><div id="pledge-content">loading</div>');
    localStorage.setItem('wealth_finance_pledge_v3', JSON.stringify({ savedAt: Date.now(), data: { pledges: [], loans: [{ bank: 'old', principalPaid: 0, interestPaid: 0, elapsedMonths: 0 }] } }));
    let resolveRefresh;
    financePledgePromise = new Promise(resolve => { resolveRefresh = resolve; });
    financePledgeLastFetchAt = Date.now();
    window.resolvePledgeRefresh = resolveRefresh;
  });

  const result = await page.evaluate(async () => {
    const loading = loadPledgePanel();
    const beforeRefresh = document.getElementById('pledge-content').textContent;
    resolvePledgeRefresh({
      pledges: [],
      loans: [{ loanAmount: 1200, remainingAmount: 855, monthlyPayment: 90, principalPaid: 345, interestPaid: 27, elapsedMonths: 5, termMonths: 24 }]
    });
    await loading;
    return {
      beforeRefresh,
      text: document.getElementById('pledge-content').textContent,
      cacheKey: FINANCE_PLEDGE_CACHE_KEY
    };
  });

  expect(result.beforeRefresh).toBe('loading');
  expect(result.cacheKey).toBe('wealth_finance_pledge_v4');
  expect(result.text).toContain('本345');
  expect(result.text).toContain('利27');
  expect(result.text).toContain('📅1🔛2');
});

test('pledge cache and service worker shell versions are advanced', async () => {
  const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
  const serviceWorker = fs.readFileSync(path.resolve(__dirname, '..', 'sw.js'), 'utf8');
  expect(html).toContain("var FINANCE_PLEDGE_CACHE_KEY='wealth_finance_pledge_v4'");
  expect(html).toContain('sw.js?v=20261025-pledge-cache-refresh1');
  expect(serviceWorker).toContain("const CACHE_NAME = 'empire-shell-v50'");
});
