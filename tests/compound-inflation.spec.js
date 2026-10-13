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

test('compound calculator text is enlarged and remains usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(dashboardUrl);
  await page.evaluate(() => document.getElementById('compound-interest-overlay').classList.add('open'));
  await page.waitForTimeout(250);
  const result = await page.evaluate(() => {
    const dialog = document.querySelector('.compound-interest-dialog').getBoundingClientRect();
    return {
      labelSize: getComputedStyle(document.querySelector('.compound-interest-inputs label')).fontSize,
      inputSize: getComputedStyle(document.getElementById('compound-interest-principal')).fontSize,
      summarySize: getComputedStyle(document.getElementById('compound-interest-summary')).fontSize,
      dialogBottom: dialog.bottom,
      viewportHeight: window.innerHeight
    };
  });

  expect(result.labelSize).toBe('13px');
  expect(result.inputSize).toBe('16px');
  expect(result.summarySize).toBe('14px');
  expect(result.dialogBottom).toBeLessThanOrEqual(result.viewportHeight);
});
