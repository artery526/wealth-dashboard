const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('compound calculator shows inflation-adjusted purchasing power', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    document.getElementById('compound-interest-principal').value = '100000';
    document.getElementById('compound-interest-inflation').value = '2';
    document.getElementById('compound-interest-years').value = '1';
    renderCompoundInterest();
    document.querySelector('.compound-interest-rate-input').value = '0';
    renderCompoundInterest();
    return {
      realValue: document.getElementById('compound-interest-real-value-1').textContent,
      summary: document.getElementById('compound-interest-summary').textContent
    };
  });

  expect(result.realValue).toContain('NT$98,039');
  expect(result.summary).toContain('購買力約 NT$98,039');
});
