const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('dividend quick estimate remains available immediately after recording', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wealth_api_url', 'https://example.test/exec');
    localStorage.setItem('wealth_write_token', 'test-write-token');
    localStorage.setItem('wealth_web_verify_status', 'ok');
    localStorage.setItem('wealth_web_verify_checked_at', String(Date.now()));
    sessionStorage.setItem('wealth_empire_unlocked_v1', 'ok');
  });
  await page.goto(dashboardUrl);

  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', `
      <select id="advisor-ai-dividend-select"><option value="AIPI">AIPI</option><option value="AVGW">AVGW</option></select>
      <input id="advisor-ai-dividend-quick-rate" value="0.204">
      <input id="advisor-ai-dividend-quick-estimate">
      <div id="advisor-ai-dividend-quick-status"></div>
      <button id="advisor-ai-dividend-quick-btn">📝</button>
    `);
    window.apiPost = async () => ({ ok: true });
    // Keep the post-record refresh pending to exercise selecting the next symbol before it finishes.
    window.apiGet = () => new Promise(() => {});
    window.dividendCenterCache = {
      settingFx: 32.5,
      dividendHoldings: [
        { symbol: 'AIPI', displaySymbol: 'AIPI', shares: 1000 },
        { symbol: 'AVGW', displaySymbol: 'AVGW', shares: 800 }
      ],
      pending: []
    };
    window.dividendCenterFetchedAt = Date.now();
    window.advisorDividendQuickPromise = null;
    window.advisorDividendQuickHolding = window.advisorAIQuickDividendHolding('AIPI', window.dividendCenterCache);
  });

  await page.evaluate(async () => {
    await window.advisorAIRecordQuickDividend(document.getElementById('advisor-ai-dividend-quick-btn'));
    const select = document.getElementById('advisor-ai-dividend-select');
    select.value = 'AVGW';
    window.advisorAISelectQuickDividend(select);
    const rate = document.getElementById('advisor-ai-dividend-quick-rate');
    rate.value = '0.204';
    window.advisorAIUpdateQuickDividendEstimate();
  });

  await expect(page.locator('#advisor-ai-dividend-quick-estimate')).toHaveValue(/^NT\$/);
  await expect(page.locator('#advisor-ai-dividend-quick-status')).toContainText('AVGW');
});
