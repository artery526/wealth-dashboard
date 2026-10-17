const { test, expect } = require('@playwright/test');
const path = require('node:path');

const dashboardUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test('finance monthly calendar groups daily income and expenses with totals', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-month-calendar"></div>');
    const current = new Date();
    const date = String(current.getMonth() + 1).padStart(2, '0') + '/' + String(current.getDate()).padStart(2, '0');
    const previousMonth = current.getMonth() === 0 ? 12 : current.getMonth();
    renderFinanceMonthlyCalendar([
      { type: '支出', date, amount: 120 },
      { type: '支出', date, amount: 380 },
      { type: '收入', date, amount: 900 },
      { type: '轉帳', date, amount: 5000 },
      { type: '支出', date: String(previousMonth).padStart(2, '0') + '/01', amount: 9999 }
    ], false);
    const key = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
    const cell = document.getElementById('finance-calendar-day-' + key);
    return {
      text: cell.textContent,
      countText: cell.querySelector('.finance-month-calendar-counts').textContent,
      expenseColor: getComputedStyle(cell.querySelector('.finance-month-calendar-expense')).color,
      incomeColor: getComputedStyle(cell.querySelector('.finance-month-calendar-income')).color,
      title: document.querySelector('.finance-month-calendar-title').textContent
    };
  });

  expect(result.title).toContain('本月收支');
  expect(result.countText).toBe('21');
  expect(result.countText).not.toMatch(/[支收]/);
  expect(result.text).toContain('$500');
  expect(result.text).toContain('$900');
  expect(result.text).not.toContain('$5,000');
  expect(result.expenseColor).toBe('rgb(93, 225, 162)');
  expect(result.incomeColor).toBe('rgb(255, 139, 139)');
});

test('finance calendar requests the month cache while preserving the recent ten-item list', async ({ page }) => {
  await page.goto(dashboardUrl);
  const result = await page.evaluate(async () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-month-calendar"></div><div id="recent-content"></div>');
    API_URL = 'https://example.test/web-app';
    localStorage.removeItem(bookingRecentCacheKey());
    let request = null;
    apiGet = params => {
      request = params;
      const current = new Date();
      const date = String(current.getMonth() + 1).padStart(2, '0') + '/' + String(current.getDate()).padStart(2, '0');
      return Promise.resolve(Array.from({ length: 50 }, (_, index) => ({
        type: '支出', date, amount: index + 1, cat: '測試', source: 'NAS', rowId: index + 1, undoable: false
      })));
    };
    setEmpireCardStatus = () => {};
    await loadRecentBooking();
    const cache = JSON.parse(localStorage.getItem(bookingRecentCacheKey()));
    return {
      request,
      cachedRows: cache.rows.length,
      recentItems: document.querySelectorAll('#recent-content .txn-item').length,
      warning: document.querySelector('.finance-month-calendar-warning')?.textContent || ''
    };
  });

  expect(result.request).toMatchObject({ action: 'transactions', recentDays: 31, recentLimit: 50 });
  expect(result.cachedRows).toBe(50);
  expect(result.recentItems).toBe(10);
  expect(result.warning).toContain('統計可能不完整');
});

test('finance month calendar fits a narrow phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(dashboardUrl);
  const result = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="finance-month-calendar"></div>');
    renderFinanceMonthlyCalendar([], false);
    const host = document.getElementById('finance-month-calendar');
    const grid = host.querySelector('.finance-month-calendar-grid');
    return { hostWidth: host.clientWidth, gridWidth: grid.clientWidth, gridScrollWidth: grid.scrollWidth, dayCount: host.querySelectorAll('.finance-month-calendar-day:not(.empty)').length };
  });

  expect(result.gridScrollWidth).toBeLessThanOrEqual(result.gridWidth);
  expect(result.gridWidth).toBeLessThanOrEqual(result.hostWidth);
  expect(result.dayCount).toBeGreaterThanOrEqual(28);
});
